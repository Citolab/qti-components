import { html, nothing } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, userEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiEndAttemptInteraction } from './qti-end-attempt-interaction';

const { events, args, argTypes } = getStorybookHelpers('qti-end-attempt-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiEndAttemptInteraction & typeof args>;

/**
 *
 * ### [3.2.21 End Attempt Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.b3g8rgbtuwqp)
 * is a special interaction which immediately ends the current attempt on an assessment item.  It may be used, for example, to allow the candidate to request a hint or model solution, or in an adaptive item to let the candidate display feedback or to move to the next in a series of interactions in the item.
 *
 */
const meta: Meta<QtiEndAttemptInteraction> = {
  component: 'qti-end-attempt-interaction',
  title: 'QTI behaviour/End Attempt interaction',
  args: { ...args, title: 'end attempt' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs']
};
export default meta;

/**
 * An item with the button, the attempts it has counted and what its response processing wrote. The
 * candidate sees both on screen: `numAttempts` and `PROCESSOR`.
 */
const itemWithButton = (buttonArgs: typeof args) => html`
  <qti-assessment-item>
    <qti-outcome-declaration base-type="string" cardinality="single" identifier="PROCESSOR"></qti-outcome-declaration>

    <qti-item-body>
      <p>Attempts: <qti-printed-variable data-testid="attempts" identifier="numAttempts"></qti-printed-variable></p>
      <qti-end-attempt-interaction
        response-identifier="END"
        title=${buttonArgs.title ?? 'end attempt'}
        count-attempt=${buttonArgs['count-attempt'] ?? nothing}
      ></qti-end-attempt-interaction>
      <p>Processing: <qti-printed-variable data-testid="processed" identifier="PROCESSOR"></qti-printed-variable></p>
    </qti-item-body>
    <qti-response-processing>
      <qti-set-outcome-value identifier="PROCESSOR">
        <qti-base-value base-type="string">Processed!</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-processing>
  </qti-assessment-item>
`;

/** Presses the button once, and reads the attempts and the processing result on screen. */
const pressAndRead = async (
  canvasElement: HTMLElement,
  step: (name: string, run: () => unknown) => void | Promise<void>
) => {
  const screen = within(canvasElement);
  // What a printed variable shows. It renders its value straight into its shadow root, where no
  // testing-library query lands on an element, so the text is read there.
  const printed = (testId: string) => screen.getByTestId(testId).shadowRoot?.textContent?.trim() ?? '';
  const attempts = () => printed('attempts');

  await step('Before pressing: no attempt yet, nothing processed', async () => {
    await waitFor(() => expect(attempts()).toBe('0'));
    expect(printed('processed')).toBe('');
  });

  await step('Press the button', async () => {
    await userEvent.click(await screen.findByShadowRole('button', { name: 'end attempt' }));
  });

  await step('Response processing ran: "Processed!" shows', async () => {
    await waitFor(() => expect(printed('processed')).toBe('Processed!'));
  });

  return { attempts };
};

/** Pressing the button ends the attempt, so the item's response processing runs at once. */
export const Processing: Story = {
  render: args => itemWithButton(args),
  play: async ({ canvasElement, step }) => {
    await pressAndRead(canvasElement, step);
  }
};

/** `count-attempt="true"`: pressing the button counts the attempt, `numAttempts` goes from 0 to 1. */
export const CountAttempt: Story = {
  render: args => itemWithButton(args),
  args: { 'count-attempt': 'true' },
  play: async ({ canvasElement, step }) => {
    const { attempts } = await pressAndRead(canvasElement, step);

    await step('The attempt counts: Attempts shows 1', async () => {
      await waitFor(() => expect(attempts()).toBe('1'));
    });
  }
};

/**
 * Without `count-attempt` the attempt counts too. QTI 3 gives the attribute no default; an absent
 * value counts, as QTI 2.x's default `true` did and as amp-up and QTI.JS do.
 */
export const CountAttemptAbsent: Story = {
  name: 'Count Attempt absent',
  render: args => itemWithButton(args),
  args: { 'count-attempt': undefined },
  play: async ({ canvasElement, step }) => {
    const screen = within(canvasElement);

    await step('The button has no count-attempt attribute', async () => {
      const button = canvasElement.querySelector('qti-end-attempt-interaction');
      expect(button).not.toHaveAttribute('count-attempt');
    });

    const { attempts } = await pressAndRead(canvasElement, step);

    await step('The attempt counts: Attempts shows 1', async () => {
      await waitFor(() => expect(attempts()).toBe('1'));
    });
  }
};

/**
 * `count-attempt="false"`: pressing the button ends the attempt and processing runs, but it does not
 * count. For a hint or "show solution" button that must not use up one of the item's `max-attempts`.
 */
export const CountAttemptFalse: Story = {
  name: 'Count Attempt false',
  render: args => itemWithButton(args),
  args: { 'count-attempt': 'false' },
  play: async ({ canvasElement, step }) => {
    const { attempts } = await pressAndRead(canvasElement, step);

    await step('The attempt does not count: Attempts still shows 0', async () => {
      expect(attempts()).toBe('0');
    });
  }
};

/**
 * QTI info model §2.2.2: "If an Adaptive Item sets completionStatus to completed then the session
 * must be placed into the closed state", so no further attempt can start (§2.2.1). The button follows
 * its item and is greyed out from then on.
 */
export const ClosedOnceAnAdaptiveItemIsDone: Story = {
  name: 'Closed once an adaptive item is done',
  render: args => html`
    <qti-assessment-item adaptive="true">
      <qti-item-body>
        <qti-end-attempt-interaction response-identifier="END" title=${args.title ?? 'end attempt'}>
        </qti-end-attempt-interaction>
      </qti-item-body>
      <qti-response-processing>
        <qti-set-outcome-value identifier="completionStatus">
          <qti-base-value base-type="identifier">completed</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>
  `,
  play: async ({ canvasElement, step }) => {
    const button = await within(canvasElement).findByShadowRole('button', { name: 'end attempt' });

    await step('The button can be pressed', () => {
      expect(button).toBeEnabled();
    });

    await step('Press it: the item sets completionStatus to completed', async () => {
      await userEvent.click(button);
    });

    await step('The item is done: the button is greyed out', async () => {
      await waitFor(() => expect(button).toBeDisabled());
    });
  }
};
