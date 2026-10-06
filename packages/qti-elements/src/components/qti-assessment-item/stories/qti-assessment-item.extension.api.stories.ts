import { html } from 'lit';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Interaction } from '@qti-components/base';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '../qti-assessment-item';

/**
 * The extension tier of the public API (`plans/public-api.md`): a host that adds its own
 * interaction by subclassing `Interaction`. PeilingLezen does it about 17 times. This is the
 * contract such a subclass lives by, written as the subclass would write it and run inside a real
 * item, so changing how children register with the item (Phase 4) cannot pass unnoticed.
 *
 * `Interaction` is imported from `@qti-components/base`, the module a host reaches as
 * `@citolab/qti-components/qti-base`.
 */
const meta: Meta = {
  title: 'qti-elements/qti-assessment-item/Extension API',
  component: 'qti-assessment-item'
};
export default meta;

/** What a host's interaction has to provide: `validate()` and the `response` accessors. */
class HostInteraction extends Interaction {
  /** Every value the base class handed to the `response` setter, in order. */
  readonly adopted: unknown[] = [];
  #answer = '';

  validate(): boolean {
    return this.#answer !== '';
  }

  get response(): string | null {
    return this.#answer || null;
  }

  set response(value: string | string[] | null) {
    this.adopted.push(value);
    this.#answer = typeof value === 'string' ? value : '';
  }

  /** What the host's own UI does when the candidate answers. */
  pick(answer: string): void {
    this.#answer = answer;
    this.saveResponse(answer);
  }
}
if (!customElements.get('host-extension-interaction')) {
  customElements.define('host-extension-interaction', HostInteraction);
}

const render = () => html`
  <div data-testid="host">
    <qti-assessment-item identifier="extension-item" title="Extension item">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
      </qti-response-declaration>
      <qti-item-body>
        <host-extension-interaction response-identifier="RESPONSE"></host-extension-interaction>
      </qti-item-body>
    </qti-assessment-item>
  </div>
`;

const ready = async (canvasElement: HTMLElement) => {
  const host = within(canvasElement).getByTestId('host');
  const item = host.querySelector<QtiAssessmentItem>('qti-assessment-item');
  const interaction = host.querySelector<HostInteraction>('host-extension-interaction');
  await item.updateComplete;
  await interaction.updateComplete;
  return { item, interaction };
};

/**
 * The interaction registers with the item it sits in, so the item asks it to validate and counts
 * its verdict. Nothing else tells the item the interaction exists.
 */
export const RegistersWithTheItem: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { item, interaction } = await ready(canvasElement);

    expect(item.validate(false), 'empty and required').toBe(false);

    interaction.pick('a');

    expect(item.validate(false), 'answered').toBe(true);
  }
};

/** `saveResponse` is how the interaction answers: it reaches the item's variables and the event. */
export const PublishesThroughSaveResponse: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { item, interaction } = await ready(canvasElement);
    const changed = fn();
    item.addEventListener('qti-interaction-changed', changed);

    interaction.pick('a');

    expect(item.variables).toContainEqual(expect.objectContaining({ identifier: 'RESPONSE', value: 'a' }));
    expect(changed).toHaveBeenCalledTimes(1);
    expect((changed.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      responseIdentifier: 'RESPONSE',
      response: 'a'
    });
  }
};

/**
 * The base class hands the item's value to the `response` setter when it changes to something the
 * interaction did not publish itself, and not otherwise. A setter that does real work (a re-render,
 * an event) therefore never runs for the candidate's own answer.
 */
export const AdoptsARestoredResponseButNotItsOwn: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { item, interaction } = await ready(canvasElement);

    interaction.pick('a');
    await item.updateComplete;
    expect(interaction.adopted, 'its own answer is not handed back').toEqual([]);

    item.variables = [{ identifier: 'RESPONSE', type: 'response', value: 'b' }];

    await waitFor(() => expect(interaction.adopted).toEqual(['b']));
    expect(interaction.response).toBe('b');
  }
};

/** The verdict reaches `itemContext.valid`, where the test reads it. */
export const ValidityReachesTheItemContext: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { item, interaction } = await ready(canvasElement);

    await waitFor(() => expect(item.itemContext.valid, 'before answering').toBe(false));

    interaction.pick('a');

    await waitFor(() => expect(item.itemContext.valid, 'after answering').toBe(true));
  }
};

/** `readonly` and `disabled` set on the item reach the interaction. */
export const FollowsReadonlyAndDisabled: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { item, interaction } = await ready(canvasElement);

    item.readonly = true;
    item.disabled = true;

    await waitFor(() => expect(interaction.readonly, 'readonly').toBe(true));
    expect(interaction.disabled, 'disabled').toBe(true);

    item.readonly = false;
    item.disabled = false;

    await waitFor(() => expect(interaction.readonly, 'readonly off').toBe(false));
    expect(interaction.disabled, 'disabled off').toBe(false);
  }
};
