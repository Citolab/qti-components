import { html } from 'lit';
import { expect, fn, spyOn, waitFor, within } from 'storybook/test';

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

/**
 * An interaction adopts what the item holds for its response, but only when that changed to
 * something other than what the interaction itself last published. The candidate's own answer
 * therefore never comes back at them as a write.
 */
export const OwnAnswerIsNotEchoed: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host } = await readyItem(canvasElement);
    const interaction = host.querySelector<HTMLElement & { response: unknown }>('qti-choice-interaction');
    const adopted = spyOn(interaction, 'response', 'set');

    choice(host, 'Incorrect').click();

    await waitFor(() => expect(choice(host, 'Incorrect').matches(':state(checked)')).toBe(true));
    await new Promise(resolve => setTimeout(resolve, 50));
    // The choice interaction sets its own response once while handling the click. An echo from the
    // item would be a second call.
    expect(adopted.mock.calls.length).toBeLessThanOrEqual(1);
  }
};

/** Only a change to this response counts: another variable moving must not rewrite the answer. */
export const UnrelatedUpdateLeavesTheAnswerAlone: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);
    const interaction = host.querySelector<HTMLElement & { response: unknown }>('qti-choice-interaction');
    choice(host, 'Incorrect').click();
    await waitFor(() => expect(choice(host, 'Incorrect').matches(':state(checked)')).toBe(true));
    const adopted = spyOn(interaction, 'response', 'set');

    item.setOutcomeVariable('SCORE', '3');
    await item.updateComplete;

    expect(adopted).not.toHaveBeenCalled();
    expect(choice(host, 'Incorrect').matches(':state(checked)')).toBe(true);
  }
};

/** Unanswered in the item must not wipe a `response` the author put on the interaction. */
export const AuthoredResponseSurvivesAnEmptyItem: StoryObj = {
  render: () =>
    html`<div data-testid="host">
      <qti-assessment-item identifier="authored" title="Authored">
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        </qti-response-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="1" response="b">
            <qti-simple-choice identifier="a">A</qti-simple-choice>
            <qti-simple-choice identifier="b">B</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
      </qti-assessment-item>
    </div>`,
  play: async ({ canvasElement }) => {
    const { host } = await readyItem(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(choice(host, 'B').matches(':state(checked)')).toBe(true);
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

/** Set from the start, as an attribute: the interactions come up disabled. */
export const DisabledFromTheStart: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);
    item.setAttribute('disabled', '');
    await item.updateComplete;

    await waitFor(() => expect(host.querySelector('qti-choice-interaction').hasAttribute('disabled')).toBe(true));
  }
};

/** An interaction the author disabled stays so inside an item that says nothing about it. */
export const AuthoredDisabledSurvivesAnItemThatSaysNothing: StoryObj = {
  render: () =>
    html`<div data-testid="host">
      <qti-assessment-item identifier="authored" title="Authored">
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        </qti-response-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="1" disabled>
            <qti-simple-choice identifier="a">A</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
      </qti-assessment-item>
    </div>`,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);
    item.setOutcomeVariable('SCORE', '1');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(host.querySelector('qti-choice-interaction').hasAttribute('disabled')).toBe(true);
  }
};

/** `readonly` on the item reaches its interactions, and turning it off reaches them again. */
export const Readonly: StoryObj = {
  render,
  play: async ({ canvasElement }) => {
    const { host, item } = await readyItem(canvasElement);
    const interaction = host.querySelector<HTMLElement>('qti-choice-interaction');

    item.readonly = true;
    await waitFor(() => expect(interaction.hasAttribute('readonly')).toBe(true));

    item.readonly = false;
    await waitFor(() => expect(interaction.hasAttribute('readonly')).toBe(false));
  }
};

/** Set from the start, as an attribute: the interactions come up readonly. */
export const ReadonlyFromTheStart: StoryObj = {
  render: () => html`<div data-testid="host">${item()}</div>`,
  play: async ({ canvasElement }) => {
    const host = within(canvasElement).getByTestId('host');
    const el = host.querySelector<QtiAssessmentItem>('qti-assessment-item');
    el.setAttribute('readonly', '');
    await el.updateComplete;

    await waitFor(() => expect(host.querySelector('qti-choice-interaction').hasAttribute('readonly')).toBe(true));
  }
};

const feedbackItem = () => html`
  <qti-assessment-item identifier="feedback-item" title="Feedback item">
    <qti-outcome-declaration
      identifier="FEEDBACK"
      cardinality="single"
      base-type="identifier"
    ></qti-outcome-declaration>
    <qti-item-body>
      <qti-feedback-block data-kind="show" show-hide="show" outcome-identifier="FEEDBACK" identifier="correct"
        >Shown for correct</qti-feedback-block
      >
      <qti-feedback-block data-kind="hide" show-hide="hide" outcome-identifier="FEEDBACK" identifier="correct"
        >Hidden for correct</qti-feedback-block
      >
    </qti-item-body>
  </qti-assessment-item>
`;

const feedbackStatus = (item: HTMLElement) => ({
  show: item.querySelector<HTMLElement & { showStatus: string }>('[data-kind="show"]').showStatus,
  hide: item.querySelector<HTMLElement & { showStatus: string }>('[data-kind="hide"]').showStatus
});

/**
 * Feedback follows its outcome. Setting the same outcome again leaves it where it was, and
 * changing it moves both kinds: `show` follows the match, `hide` is its inverse.
 */
export const FeedbackFollowsItsOutcome: StoryObj = {
  render: () => html`<div data-testid="host">${feedbackItem()}</div>`,
  play: async ({ canvasElement }) => {
    const { item } = await readyItem(canvasElement);

    item.setOutcomeVariable('FEEDBACK', 'correct');
    expect(feedbackStatus(item)).toEqual({ show: 'on', hide: 'off' });

    item.setOutcomeVariable('FEEDBACK', 'correct');
    expect(feedbackStatus(item)).toEqual({ show: 'on', hide: 'off' });

    item.setOutcomeVariable('FEEDBACK', 'incorrect');
    expect(feedbackStatus(item)).toEqual({ show: 'off', hide: 'on' });
  }
};

/**
 * Nothing decides feedback for an item nobody has answered. Restoring variables that equal the
 * declared defaults is not an answer either, so a `hide` feedback is not switched on by it.
 */
export const RestoringDefaultsBeforeAnAttemptShowsNothing: StoryObj = {
  render: () => html`<div data-testid="host">${feedbackItem()}</div>`,
  play: async ({ canvasElement }) => {
    const { item } = await readyItem(canvasElement);
    const before = feedbackStatus(item);

    item.variables = [{ identifier: 'FEEDBACK', type: 'outcome', value: null }];
    await item.updateComplete;

    expect(feedbackStatus(item)).toEqual(before);
  }
};

/**
 * The modal feedback does not decide on connect the way the block and inline ones do, so this is
 * where restoring defaults used to differ. The item switched a `hide` modal on for an item nobody
 * had answered, which opened a dialog on a restore of nothing. That is deliberately gone: no
 * attempt, no outcome change, no decision.
 */
export const RestoringDefaultsLeavesAHideModalAlone: StoryObj = {
  render: () =>
    html`<div data-testid="host">
      <qti-assessment-item identifier="modal-item" title="Modal item">
        <qti-outcome-declaration
          identifier="FEEDBACK"
          cardinality="single"
          base-type="identifier"
        ></qti-outcome-declaration>
        <qti-item-body></qti-item-body>
        <qti-modal-feedback show-hide="hide" outcome-identifier="FEEDBACK" identifier="correct">
          <qti-content-body>Hidden for correct</qti-content-body>
        </qti-modal-feedback>
      </qti-assessment-item>
    </div>`,
  play: async ({ canvasElement }) => {
    const { item } = await readyItem(canvasElement);
    const modal = item.querySelector<HTMLElement & { showStatus: string }>('qti-modal-feedback');
    const before = modal.showStatus;

    item.variables = [{ identifier: 'FEEDBACK', type: 'outcome', value: null }];
    await item.updateComplete;

    expect(modal.showStatus).toBe(before);
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
