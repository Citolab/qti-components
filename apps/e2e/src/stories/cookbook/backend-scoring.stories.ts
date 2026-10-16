import { html, render } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest, QtiTestState } from '@qti-components/test';

const meta: Meta = {
  title: 'Cookbook/Kennisnet/Scoring on a backend',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Kennisnet scores on a server, not in the browser. The host needs three things from the test:
which item is on screen, where it lives, what the candidate answered, and a way to hand the score back.

\`\`\`js
// Where each item lives: every item-ref announces itself when it connects.
test.addEventListener('cito-item-ref-connected', e => hrefs.set(e.detail.identifier, e.detail.href));

// What was answered, and which item is on screen: the state the test already emits.
test.addEventListener('cito-test-state-changed', e => (state = e.detail));
const current = () => state.session.navItemRefId;

// Hand the score back. It reaches \`state\`, so it is saved with everything else.
const { score } = await backend.score(hrefs.get(current()), answerOf(state, current()));
test.updateItemVariables(current(), [{ identifier: 'SCORE', type: 'outcome', value: String(score) }]);
\`\`\`

\`href\` is not part of the state: it is test structure, so read it from the item-ref. Answer the
item, press **Check**, and the score the fake backend returns shows up in the saved state.`
      }
    }
  }
};
export default meta;

/** A stand-in for the host's server. Takes a moment, like a real one. */
const backend = {
  score: async (_href: string, response: string | null) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { score: response === 'correct' ? 1 : 0 };
  }
};

/** Answer the item, check it on the "server", and the score lands in the test's state. */
export const ScoreOnABackend: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => {
    const root = document.createElement('div');
    const status = document.createElement('p');
    status.dataset.testid = 'status';
    status.textContent = 'Not checked yet.';
    const check = document.createElement('button');
    check.type = 'button';
    check.textContent = 'Check';
    const stage = document.createElement('div');

    render(
      html`<qti-test navigate="item">
        <test-navigation>
          <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        </test-navigation>
      </qti-test>`,
      stage
    );
    const test = stage.querySelector<QtiTest>('qti-test')!;

    const hrefs = new Map<string, string>();
    let state: QtiTestState | undefined;
    test.addEventListener('cito-item-ref-connected', e => hrefs.set(e.detail.identifier, e.detail.href));
    test.addEventListener('cito-test-state-changed', e => (state = e.detail));

    check.addEventListener('click', async () => {
      const identifier = state?.session.navItemRefId;
      if (!identifier) return;
      const href = hrefs.get(identifier)!;
      const answer = state.test.items
        .find(item => item.identifier === identifier)
        ?.variables.find(variable => variable.identifier === 'RESPONSE')?.value;
      const { score } = await backend.score(href, typeof answer === 'string' ? answer : null);
      test.updateItemVariables(identifier, [{ identifier: 'SCORE', type: 'outcome', value: String(score) }]);
      status.textContent = `Server scored ${identifier} (${href}): ${score}`;
    });

    root.append(stage, check, status);
    return root;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const test = canvasElement.querySelector<QtiTest>('qti-test')!;

    const choice = await waitFor(
      () => {
        const found = canvasElement
          .querySelector('test-container')
          ?.shadowRoot?.querySelector('qti-simple-choice[identifier="correct"]');
        if (!found) throw new Error('item is not loaded yet');
        return found as HTMLElement;
      },
      { timeout: 15000 }
    );
    choice.click();
    await waitFor(() => expect(choice.matches(':state(checked)')).toBe(true));
    await waitFor(() =>
      expect(
        test.state.test.items
          .find(i => i.identifier === 't1-test-entry-item1')
          ?.variables.find(v => v.identifier === 'RESPONSE')?.value
      ).toBe('correct')
    );

    canvas.getByText('Check').click();

    await waitFor(() => expect(canvas.getByTestId('status')).toHaveTextContent('t1-test-entry-item1'));
    expect(canvas.getByTestId('status')).toHaveTextContent(': 1');
    expect(test.state.test.items.find(i => i.identifier === 't1-test-entry-item1')?.variables).toContainEqual(
      expect.objectContaining({ identifier: 'SCORE', value: '1' })
    );
  }
};
