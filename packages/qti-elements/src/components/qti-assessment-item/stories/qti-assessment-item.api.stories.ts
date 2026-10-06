import { html } from 'lit';
import { expect, fn, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '../qti-assessment-item';

/**
 * The item tier of the public API (`plans/public-api.md`): what a host calls on a single
 * `<qti-assessment-item>` to score it from outside, lock it, or show someone's answers in review.
 * Kennisnet scores through a backend and CitoTestUit reviews answers; both go through these members
 * and nothing else.
 *
 * Several of these are about *when* something happens, because the reactive-state work changes the
 * timing and a host written against today's timing must not notice.
 */
const meta: Meta = {
  title: 'qti-elements/qti-assessment-item/Host API',
  component: 'qti-assessment-item'
};
export default meta;

const item = () => html`
  <qti-assessment-item identifier="item-under-test" title="Item under test">
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response><qti-value>correct</qti-value></qti-correct-response>
    </qti-response-declaration>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
      <qti-default-value><qti-value>0</qti-value></qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration
      identifier="FEEDBACK"
      cardinality="single"
      base-type="identifier"
    ></qti-outcome-declaration>
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
        <qti-simple-choice identifier="correct">Correct</qti-simple-choice>
        <qti-simple-choice identifier="incorrect">Incorrect</qti-simple-choice>
      </qti-choice-interaction>
    </qti-item-body>
    <qti-response-processing
      template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"
    ></qti-response-processing>
    <qti-modal-feedback show-hide="show" outcome-identifier="FEEDBACK" identifier="correct">
      <qti-content-body>That is right</qti-content-body>
    </qti-modal-feedback>
    <qti-modal-feedback show-hide="show" outcome-identifier="FEEDBACK" identifier="incorrect">
      <qti-content-body>That is wrong</qti-content-body>
    </qti-modal-feedback>
  </qti-assessment-item>
`;

const render = () => html`<div data-testid="host">${item()}</div>`;

const readyItem = async (canvasElement: HTMLElement) => {
  const host = within(canvasElement).getByTestId('host');
  const el = await waitFor(() => {
    const found = host.querySelector<QtiAssessmentItem>('qti-assessment-item');
    if (!found) throw new Error('item is not rendered yet');
    return found;
  });
  await el.updateComplete;
  return { host, item: el };
};

const choice = (host: HTMLElement, name: string) => within(host).getByText(name);

/**
 * `setOutcomeVariable` is how a host replays a stored outcome so its feedback shows again. The
 * feedback must be on by the time the call returns: Kennisnet sets the outcome and reads the
 * dialog straight after, with no await in between.
 */
export const SetOutcomeVariable: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { item } = await readyItem(canvasElement);
    const changed = fn();
    item.addEventListener('qti-outcome-changed', changed);
    const feedback = (id: string) =>
      item.querySelector<HTMLElement & { showStatus: string }>(`qti-modal-feedback[identifier="${id}"]`);

    item.setOutcomeVariable('FEEDBACK', 'correct');

    // Synchronous on purpose: no waitFor.
    expect(feedback('correct').showStatus).toBe('on');
    expect(feedback('incorrect').showStatus).toBe('off');

    const [event] = changed.mock.calls.at(-1) as [CustomEvent];
    expect(event.detail).toMatchObject({ item: 'item-under-test', outcomeIdentifier: 'FEEDBACK', value: 'correct' });
    expect(item.variables).toContainEqual(expect.objectContaining({ identifier: 'FEEDBACK', value: 'correct' }));
  }
};

/**
 * `processResponse()` scores what the candidate answered. The score is readable from `variables`
 * afterwards, and every call counts as an attempt unless the host passes `false`.
 */
export const ProcessResponse: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);

    choice(host, 'Correct').click();
    expect(item.processResponse()).toBeTruthy();

    await waitFor(() =>
      expect(item.variables).toContainEqual(expect.objectContaining({ identifier: 'SCORE', value: '1' }))
    );
  }
};

/**
 * `variables` is both the read and the write side for a review screen: assign a student's stored
 * answers and the interactions show them. Read it back for the same values.
 */
export const VariablesRoundTrip: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);

    item.variables = [{ identifier: 'RESPONSE', type: 'response', value: 'correct' }];

    // Not synchronous: an interaction may pick the value up on its next update.
    await waitFor(() => expect(choice(host, 'Correct').matches(':state(checked)')).toBe(true));
    expect(choice(host, 'Incorrect').matches(':state(checked)')).toBe(false);
    expect(item.variables).toContainEqual(expect.objectContaining({ identifier: 'RESPONSE', value: 'correct' }));
  }
};

/** The older, per-interaction form of the same thing. Deprecated, but CitoTestUit still reads it. */
export const ResponsesSetter: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);

    item.responses = [{ responseIdentifier: 'RESPONSE', response: 'incorrect' }];

    await waitFor(() => expect(choice(host, 'Incorrect').matches(':state(checked)')).toBe(true));
  }
};

/** A submitted item is locked from outside; setting it back unlocks it. */
export const Disabled: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);
    const interaction = host.querySelector<HTMLElement>('qti-choice-interaction');

    item.disabled = true;
    await waitFor(() => expect(interaction.hasAttribute('disabled')).toBe(true));

    item.disabled = false;
    await waitFor(() => expect(interaction.hasAttribute('disabled')).toBe(false));
  }
};

/**
 * Inside a test the item's own identifier is not the one the host knows: the item-ref's is. Hosts
 * key their stored data on it, so it has to be settable and readable.
 */
export const AssessmentItemRefId: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { item } = await readyItem(canvasElement);

    item.assessmentItemRefId = 'ref-7';

    expect(item.assessmentItemRefId).toBe('ref-7');
  }
};
