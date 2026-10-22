import { html, nothing } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import { itemContext } from '@qti-components/base';

import type { ItemContext } from '@qti-components/base';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '../qti-assessment-item';

/**
 * The two built-in variables every item carries: `numAttempts` (counts the attempts) and
 * `completionStatus` (whether the candidate is done). Each story walks one path that sets them and
 * checks the values a host reads afterwards, and where it matters the states the item published on
 * the way, which every consumer of the item context (feedback, test navigation) sees.
 */
const meta: Meta = {
  title: 'API Reference/Attempts and completion',
  component: 'qti-assessment-item',
  tags: ['!autodocs']
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

/** A fresh item has not been attempted; its completion is unknown. */
export const Initial: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement }) => {
    const { now } = await ready(canvasElement);
    expect(now()).toEqual({ numAttempts: '0', completionStatus: 'unknown', SCORE: '0' });
  }
};

/** `processResponse()` counts an attempt; `processResponse(false)` scores without counting. */
export const ProcessResponseCounts: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement }) => {
    const { item, now, choose } = await ready(canvasElement);
    await choose('A');

    expect(item.processResponse()).toBe(true);
    expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '1' });

    item.processResponse();
    expect(now().numAttempts).toBe('2');

    item.processResponse(false);
    expect(now()).toEqual({ numAttempts: '2', completionStatus: 'completed', SCORE: '1' });
  }
};

/**
 * A non-adaptive item sets completionStatus from the interactions' validity: on every answer, and
 * again at the end of each attempt. `min-choices="1"`: nothing chosen is incomplete.
 */
export const CompletionFollowsValidity: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement }) => {
    const { item, now, choose } = await ready(canvasElement);

    item.processResponse();
    expect(now()).toEqual({ numAttempts: '1', completionStatus: 'incomplete', SCORE: '0' });

    await choose('A');
    expect(now().completionStatus).toBe('completed');

    await choose('A'); // deselect: nothing chosen again
    expect(now().completionStatus).toBe('incomplete');

    await choose('B');
    item.processResponse();
    expect(now()).toEqual({ numAttempts: '2', completionStatus: 'completed', SCORE: '0' });
  }
};

/** An item without `qti-response-processing` still counts the attempt and sets completionStatus. */
export const WithoutResponseProcessing: StoryObj = {
  render: () => item({ processing: false }),
  play: async ({ canvasElement }) => {
    const { item, now, choose } = await ready(canvasElement);
    await choose('A');

    expect(item.processResponse()).toBe(false);
    expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '0' });
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
  play: async ({ canvasElement }) => {
    const { item, now, choose } = await ready(canvasElement);
    await choose('A');
    expect(now().completionStatus).toBe('unknown');

    item.processResponse();
    expect(now()).toEqual({ numAttempts: '1', completionStatus: 'unknown', SCORE: '1' });

    // The rule reads numAttempts of the attempt in progress: 2 here.
    item.processResponse();
    expect(now()).toEqual({ numAttempts: '2', completionStatus: 'completed', SCORE: '2' });
  }
};

/**
 * `qti-end-attempt-interaction` ends the attempt; it counts one only with `count-attempt="true"` (QTI 3
 * gives the attribute no default). The response of the one used is `true`, that of every other
 * end-attempt interaction `false` (QTI info model §2.4.5).
 */
export const EndAttemptInteraction: StoryObj = {
  render: () =>
    item({
      endAttempt: html`
        <qti-end-attempt-interaction data-testid="counts" response-identifier="END" count-attempt="true" title="Done">
        </qti-end-attempt-interaction>
        <qti-end-attempt-interaction data-testid="hint" response-identifier="HINT" title="Hint">
        </qti-end-attempt-interaction>
      `
    }),
  play: async ({ canvasElement }) => {
    const { host, item, now, choose } = await ready(canvasElement);
    type EndAttempt = HTMLElement & { endAttempt(e: Event): void };
    const response = (id: string) => item.itemContext.variables.find(v => v.identifier === id)?.value;
    await choose('A');

    within(host).getByTestId<EndAttempt>('hint').endAttempt(new Event('click'));
    expect(now()).toEqual({ numAttempts: '0', completionStatus: 'completed', SCORE: '1' });
    expect([response('HINT'), response('END')]).toEqual(['true', 'false']);

    within(host).getByTestId<EndAttempt>('counts').endAttempt(new Event('click'));
    expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '1' });
    expect([response('HINT'), response('END')]).toEqual(['false', 'true']);

    item.processResponse();
    expect([response('HINT'), response('END')]).toEqual(['false', 'false']);
  }
};

/** A host restores both through `variables`, sets them with `setOutcomeVariable`, and `resetResponses` clears them. */
export const RestoreSetAndReset: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement }) => {
    const { item, now, choose } = await ready(canvasElement);

    item.variables = [
      { identifier: 'numAttempts', value: '3', type: 'response' },
      { identifier: 'completionStatus', value: 'completed', type: 'outcome' }
    ];
    expect(now()).toEqual({ numAttempts: '3', completionStatus: 'completed', SCORE: '0' });

    await choose('A');
    item.processResponse();
    expect(now().numAttempts).toBe('4');

    item.setOutcomeVariable('numAttempts', '7');
    item.setOutcomeVariable('completionStatus', 'incomplete');
    expect(now()).toEqual({ numAttempts: '7', completionStatus: 'incomplete', SCORE: '1' });

    item.resetResponses();
    expect(now()).toEqual({ numAttempts: '0', completionStatus: 'unknown', SCORE: '0' });
  }
};

class ThrowingRule extends HTMLElement {
  process() {
    throw new Error('rule failed');
  }
}
if (!customElements.get('attempts-throwing-rule')) customElements.define('attempts-throwing-rule', ThrowingRule);

/**
 * A rule that throws ends `processResponse` with the error. The attempt counts (it started); the
 * outcomes keep the values from before it.
 */
export const ProcessingThrows: StoryObj = {
  render: () => item({ processing: html`${matchCorrect}<attempts-throwing-rule></attempts-throwing-rule>` }),
  play: async ({ canvasElement }) => {
    const { item, now, choose } = await ready(canvasElement);
    await choose('A');

    expect(() => item.processResponse()).toThrow('rule failed');
    expect(now()).toEqual({ numAttempts: '1', completionStatus: 'completed', SCORE: '0' });
  }
};

/**
 * `processResponse` publishes once, with the final values: no consumer sees the reset to the
 * defaults or a rule's intermediate write.
 */
export const PublishedDuringProcessResponse: StoryObj = {
  render: () => item(),
  play: async ({ canvasElement }) => {
    const { item, during, choose } = await ready(canvasElement);
    await choose('A');

    expect(during(() => item.processResponse())).toEqual([
      { numAttempts: '1', completionStatus: 'completed', SCORE: '1' }
    ]);
    // A repeat with the same answer never passes through SCORE 0.
    expect(during(() => item.processResponse())).toEqual([
      { numAttempts: '2', completionStatus: 'completed', SCORE: '1' }
    ]);
  }
};
