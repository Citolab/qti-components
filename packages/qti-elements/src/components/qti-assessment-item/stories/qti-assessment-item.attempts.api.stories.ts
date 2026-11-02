import { html, nothing } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import { itemContext } from '@qti-components/base';

import type { ItemContext } from '@qti-components/base';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '../qti-assessment-item';

/**
 * The two built-in variables every item carries (QTI info model §2.2.2): `numAttempts`, which the
 * item counts, and `completionStatus`, which is `not_attempted` until the item is presented,
 * `unknown` from then on, and what response processing sets; a non-adaptive item becomes
 * `completed` once an attempt ends (as in TAO and the 1EdTech reference results). Whether the
 * answers are valid is the item context's `valid`, not completionStatus. Each story walks one path that sets them and
 * checks the values a host reads afterwards, and where it matters the states the item published on
 * the way, which every consumer of the item context (feedback, test navigation) sees.
 */
const meta: Meta = {
  title: 'QTI behaviour/API Reference/Attempts and completion',
  component: 'qti-assessment-item',
  tags: ['!autodocs', 'cito-api']
};
export default meta;

type Options = {
  adaptive?: 'true' | 'false';
  /** Rules inside `qti-response-processing`; `false` leaves the element out. */
  processing?: ReturnType<typeof html> | false;
  endAttempt?: ReturnType<typeof html>;
};

/** SCORE 1 for the correct choice, else 0. */
const matchCorrect = html`
  <qti-response-condition>
    <qti-response-if>
      <qti-match>
        <qti-variable identifier="RESPONSE"></qti-variable>
        <qti-correct identifier="RESPONSE"></qti-correct>
      </qti-match>
      <qti-set-outcome-value identifier="SCORE"
        ><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value
      >
    </qti-response-if>
    <qti-response-else>
      <qti-set-outcome-value identifier="SCORE"
        ><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value
      >
    </qti-response-else>
  </qti-response-condition>
`;

const item = ({ adaptive = 'false', processing = matchCorrect, endAttempt }: Options = {}) => html`
  <div data-testid="host">
    <qti-assessment-item identifier="attempts" adaptive=${adaptive}>
      <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
        <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
      </qti-response-declaration>
      <qti-response-declaration identifier="END" cardinality="single" base-type="boolean"></qti-response-declaration>
      <qti-response-declaration identifier="HINT" cardinality="single" base-type="boolean"></qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value><qti-value>0</qti-value></qti-default-value>
      </qti-outcome-declaration>
      <qti-item-body>
        <qti-choice-interaction response-identifier="RESPONSE" min-choices="1" max-choices="0">
          <qti-simple-choice identifier="A">A</qti-simple-choice>
          <qti-simple-choice identifier="B">B</qti-simple-choice>
        </qti-choice-interaction>
        ${endAttempt ?? nothing}
      </qti-item-body>
      ${processing === false ? nothing : html`<qti-response-processing>${processing}</qti-response-processing>`}
    </qti-assessment-item>
  </div>
`;

type Snapshot = { numAttempts: unknown; completionStatus: unknown; SCORE: unknown };

const snapshot = (context: ItemContext): Snapshot => {
  const value = (identifier: string) => context.variables.find(v => v.identifier === identifier)?.value;
  return { numAttempts: value('numAttempts'), completionStatus: value('completionStatus'), SCORE: value('SCORE') };
};

/** The item, ready, with every context it publishes from now on recorded as a snapshot. */
const ready = async (canvasElement: HTMLElement) => {
  const host = within(canvasElement).getByTestId('host');
  const el = await waitFor(() => {
    const found = host.querySelector<QtiAssessmentItem>('qti-assessment-item');
    if (!found) throw new Error('item is not rendered yet');
    return found;
  });
  await el.updateComplete;
  await new Promise(resolve => setTimeout(resolve));

  const published: Snapshot[] = [];
  const probe = document.createElement('span');
  el.querySelector('qti-item-body')!.appendChild(probe);
  // The context protocol's request, as `@consume({ subscribe: true })` sends it.
  probe.dispatchEvent(
    Object.assign(new Event('context-request', { bubbles: true, composed: true }), {
      context: itemContext,
      contextTarget: probe,
      callback: (value: ItemContext) => published.push(snapshot(value)),
      subscribe: true
    })
  );
  published.length = 0;

  /** What a host reads now. */
  const now = () => snapshot(el.itemContext as ItemContext);
  /** Runs `action` and returns the states published while it ran. */
  const during = (action: () => unknown) => {
    const from = published.length;
    action();
    return published.slice(from);
  };
  const choose = async (name: string) => {
    within(host).getByText(name).click();
    await el.updateComplete;
  };
  return { host, item: el, now, during, choose };
};

/** A presented item has started its first attempt: completionStatus is `unknown`, no longer `not_attempted`. */
export const Initial: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement, step }) => {
    const { now } = await ready(canvasElement);

    await step('The item is on screen: no attempt yet, completion unknown, SCORE at its default', () => {
      expect(now()).toEqual({ numAttempts: '0', completionStatus: 'unknown', SCORE: '0' });
    });
  }
};

/** `processResponse()` counts an attempt; `processResponse(false)` scores without counting. */
export const ProcessResponseCounts: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement, step }) => {
    const { item, now, choose } = await ready(canvasElement);

    await step('Choose the right answer A', () => choose('A'));

    await step('processResponse() scores it and counts attempt 1', () => {
      expect(item.processResponse()).toBe(true);
      expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '1' });
    });

    await step('processResponse() again counts attempt 2', () => {
      item.processResponse();
      expect(now().numAttempts).toBe('2');
    });

    await step('processResponse(false) scores again without counting: still 2', () => {
      item.processResponse(false);
      expect(now()).toEqual({ numAttempts: '2', completionStatus: 'completed', SCORE: '1' });
    });
  }
};

/**
 * The item does not derive completionStatus from the answers: `valid` in the item context says
 * whether the interactions are valid (`min-choices="1"`: nothing chosen is invalid). completionStatus
 * stays `unknown` until an attempt ends.
 */
export const ValidityIsNotCompletion: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement, step }) => {
    const { item, now, choose } = await ready(canvasElement);

    await step('Nothing chosen: not valid (min-choices is 1)', () => {
      expect(item.itemContext.valid).toBe(false);
    });

    await step('Choose A: valid now, but completion is still unknown', async () => {
      await choose('A');
      expect(item.itemContext.valid).toBe(true);
      expect(now().completionStatus).toBe('unknown');
    });

    await step('End the attempt: completed', () => {
      item.processResponse();
      expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '1' });
    });
  }
};

/** A non-adaptive item's response processing may set completionStatus itself; the item keeps that value. */
export const NonAdaptiveProcessingSetsCompletion: StoryObj = {
  render: () =>
    item({
      processing: html`${matchCorrect}
        <qti-set-outcome-value identifier="completionStatus">
          <qti-base-value base-type="identifier">incomplete</qti-base-value>
        </qti-set-outcome-value>`
    }),
  play: async ({ canvasElement, step }) => {
    const { item, now, choose } = await ready(canvasElement);

    await step('Choose the wrong answer B', () => choose('B'));

    await step('End the attempt: processing set incomplete, and the item keeps it', () => {
      item.processResponse();
      expect(now()).toEqual({ numAttempts: '1', completionStatus: 'incomplete', SCORE: '0' });
    });
  }
};

/** An item without `qti-response-processing` still counts the attempt, and the ended attempt completes it. */
export const WithoutResponseProcessing: StoryObj = {
  render: () => item({ processing: false }),
  play: async ({ canvasElement, step }) => {
    const { item, now, choose } = await ready(canvasElement);

    await step('Choose A', () => choose('A'));

    await step('End the attempt: no rules (returns false), still counted and completed', () => {
      expect(item.processResponse()).toBe(false);
      expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '0' });
    });
  }
};

/**
 * An adaptive item: the item never sets completionStatus, neither on an answer nor at the end of an
 * attempt; its processing does. Outcomes are not reset between attempts, so SCORE accumulates.
 */
export const AdaptiveSetsItsOwnCompletion: StoryObj = {
  render: () =>
    item({
      adaptive: 'true',
      processing: html`
        <qti-set-outcome-value identifier="SCORE">
          <qti-sum>
            <qti-variable identifier="SCORE"></qti-variable>
            <qti-base-value base-type="float">1</qti-base-value>
          </qti-sum>
        </qti-set-outcome-value>
        <qti-response-condition>
          <qti-response-if>
            <qti-gte>
              <qti-variable identifier="numAttempts"></qti-variable>
              <qti-base-value base-type="integer">2</qti-base-value>
            </qti-gte>
            <qti-set-outcome-value identifier="completionStatus">
              <qti-base-value base-type="identifier">completed</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
        </qti-response-condition>
      `
    }),
  play: async ({ canvasElement, step }) => {
    const { item, now, choose } = await ready(canvasElement);

    await step('Choose A: an answer does not complete an adaptive item', async () => {
      await choose('A');
      expect(now().completionStatus).toBe('unknown');
    });

    await step('Attempt 1: SCORE 1, not completed yet (the rule waits for attempt 2)', () => {
      item.processResponse();
      expect(now()).toEqual({ numAttempts: '1', completionStatus: 'unknown', SCORE: '1' });
    });

    await step('Attempt 2: SCORE kept and added to (2), and the rule completes the item', () => {
      item.processResponse();
      expect(now()).toEqual({ numAttempts: '2', completionStatus: 'completed', SCORE: '2' });
    });
  }
};

/**
 * `qti-end-attempt-interaction` ends the attempt, and counts it unless it says `count-attempt="false"`
 * (QTI 3 gives the attribute no default; an absent value counts, as QTI 2.x's default `true` did). The
 * response of the one used is `true`, that of every other end-attempt interaction `false` (QTI info
 * model §2.4.5).
 */
export const EndAttemptInteraction: StoryObj = {
  render: () =>
    item({
      endAttempt: html`
        <qti-end-attempt-interaction data-testid="counts" response-identifier="END" title="Done">
        </qti-end-attempt-interaction>
        <qti-end-attempt-interaction data-testid="hint" response-identifier="HINT" count-attempt="false" title="Hint">
        </qti-end-attempt-interaction>
      `
    }),
  play: async ({ canvasElement, step }) => {
    const { host, item, now, choose } = await ready(canvasElement);
    type EndAttempt = HTMLElement & { endAttempt(e: Event): void };
    const response = (id: string) => item.itemContext.variables.find(v => v.identifier === id)?.value;

    await step('Choose A', () => choose('A'));

    await step('Hint (count-attempt="false"): HINT true, END false, no attempt counted', () => {
      within(host).getByTestId<EndAttempt>('hint').endAttempt(new Event('click'));
      expect(now()).toEqual({ numAttempts: '0', completionStatus: 'completed', SCORE: '1' });
      expect([response('HINT'), response('END')]).toEqual(['true', 'false']);
    });

    await step('Done (no count-attempt, so it counts): END true, HINT back to false, attempt 1', () => {
      within(host).getByTestId<EndAttempt>('counts').endAttempt(new Event('click'));
      expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '1' });
      expect([response('HINT'), response('END')]).toEqual(['false', 'true']);
    });

    await step('processResponse() ends an attempt without either button: both false', () => {
      item.processResponse();
      expect([response('HINT'), response('END')]).toEqual(['false', 'false']);
    });
  }
};

/** A host restores both through `variables`, sets them with `setOutcomeVariable`, and `resetResponses` clears them. */
export const RestoreSetAndReset: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement, step }) => {
    const { item, now, choose } = await ready(canvasElement);

    await step('A host restores numAttempts 3 and completed through variables', () => {
      item.variables = [
        { identifier: 'numAttempts', value: '3', type: 'response' },
        { identifier: 'completionStatus', value: 'completed', type: 'outcome' }
      ];
      expect(now()).toEqual({ numAttempts: '3', completionStatus: 'completed', SCORE: '0' });
    });

    await step('Choose A and end the attempt: counting goes on from 3 to 4', async () => {
      await choose('A');
      item.processResponse();
      expect(now().numAttempts).toBe('4');
    });

    await step('setOutcomeVariable sets both directly', () => {
      item.setOutcomeVariable('numAttempts', '7');
      item.setOutcomeVariable('completionStatus', 'incomplete');
      expect(now()).toEqual({ numAttempts: '7', completionStatus: 'incomplete', SCORE: '1' });
    });

    await step('resetResponses() starts over: 0 attempts, unknown, SCORE 0', () => {
      item.resetResponses();
      expect(now()).toEqual({ numAttempts: '0', completionStatus: 'unknown', SCORE: '0' });
    });
  }
};

class ThrowingRule extends HTMLElement {
  process() {
    throw new Error('rule failed');
  }
}
if (!customElements.get('attempts-throwing-rule')) customElements.define('attempts-throwing-rule', ThrowingRule);

/**
 * A rule that throws ends `processResponse` with the error. The attempt counts (it started), and
 * the outcomes keep the values from before it.
 */
export const ProcessingThrows: StoryObj = {
  render: () => item({ processing: html`${matchCorrect}<attempts-throwing-rule></attempts-throwing-rule>` }),
  play: async ({ canvasElement, step }) => {
    const { item, now, choose } = await ready(canvasElement);

    await step('Choose A', () => choose('A'));

    await step('End the attempt: a rule throws, and processResponse throws with it', () => {
      expect(() => item.processResponse()).toThrow('rule failed');
    });

    await step('The attempt still counts; the outcomes stay as they were (SCORE 0)', () => {
      expect(now()).toEqual({ numAttempts: '1', completionStatus: 'unknown', SCORE: '0' });
    });
  }
};

/**
 * `processResponse` publishes once, with the final values: no consumer sees the reset to the
 * defaults or a rule's intermediate write.
 */
export const PublishedDuringProcessResponse: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement, step }) => {
    const { item, during, choose } = await ready(canvasElement);

    await step('Choose A', () => choose('A'));

    await step('Attempt 1 publishes one state, with the final values', () => {
      expect(during(() => item.processResponse())).toEqual([
        { numAttempts: '1', completionStatus: 'completed', SCORE: '1' }
      ]);
    });

    await step('Attempt 2 also publishes once: never SCORE 0 from the reset in between', () => {
      expect(during(() => item.processResponse())).toEqual([
        { numAttempts: '2', completionStatus: 'completed', SCORE: '1' }
      ]);
    });
  }
};
