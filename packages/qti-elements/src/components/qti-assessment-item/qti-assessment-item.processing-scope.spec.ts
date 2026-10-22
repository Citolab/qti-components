import '@citolab/qti-components';
import { html, render } from 'lit';

import { itemContext } from '@qti-components/base';

import type { TemplateResult } from 'lit';
import type { ItemContext } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * Response processing runs once on `qti-response-processing`'s own copy of the context and the item
 * publishes the final outcomes in one update, as a backend would hand them back. These record every item context the item publishes.
 */

/** SCORE = SCORE + 1, twice; FEEDBACK is read off the SCORE the rules above wrote, in the same run. */
const scoringRules = html`
  <qti-set-outcome-value identifier="SCORE">
    <qti-sum>
      <qti-variable identifier="SCORE"></qti-variable>
      <qti-base-value base-type="integer">1</qti-base-value>
    </qti-sum>
  </qti-set-outcome-value>
  <qti-set-outcome-value identifier="SCORE">
    <qti-sum>
      <qti-variable identifier="SCORE"></qti-variable>
      <qti-base-value base-type="integer">1</qti-base-value>
    </qti-sum>
  </qti-set-outcome-value>
  <qti-response-condition>
    <qti-response-if>
      <qti-gte>
        <qti-variable identifier="SCORE"></qti-variable>
        <qti-base-value base-type="integer">2</qti-base-value>
      </qti-gte>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-base-value base-type="identifier">two</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-if>
    <qti-response-else>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-base-value base-type="identifier">less</qti-base-value>
      </qti-set-outcome-value>
    </qti-response-else>
  </qti-response-condition>
`;

const itemWith = (adaptive: 'true' | 'false') =>
  html`<qti-assessment-item identifier="scope" adaptive=${adaptive}>
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response><qti-value>ChoiceA</qti-value></qti-correct-response>
    </qti-response-declaration>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="integer">
      <qti-default-value><qti-value>0</qti-value></qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier">
      <qti-default-value><qti-value>empty</qti-value></qti-default-value>
    </qti-outcome-declaration>
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
        <qti-simple-choice identifier="ChoiceA">Choice A</qti-simple-choice>
      </qti-choice-interaction>
    </qti-item-body>
    <qti-response-processing>${scoringRules}</qti-response-processing>
  </qti-assessment-item>`;

class ThrowingRule extends HTMLElement {
  process() {
    throw new Error('rule failed');
  }
}
customElements.define('test-throwing-rule', ThrowingRule);

/** Sits among the rules without doing anything, to read the context the rules are handed. */
class ProbeRule extends HTMLElement {
  process() {}
}
customElements.define('test-probe-rule', ProbeRule);

const valueOf = (context: ItemContext, identifier: string) =>
  context.variables?.find(v => v.identifier === identifier)?.value;

describe('qti-assessment-item response processing scope', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  /** Subscribes to the item context from `parent`, as `@consume({ subscribe: true })` does. */
  const subscribe = (parent: Element, received: ItemContext[], tag = 'span') => {
    const probe = document.createElement(tag);
    parent.appendChild(probe);
    const request = Object.assign(new Event('context-request', { bubbles: true, composed: true }), {
      context: itemContext,
      contextTarget: probe,
      callback: (value: ItemContext) => received.push(value),
      subscribe: true
    });
    probe.dispatchEvent(request);
    return probe;
  };

  /** Renders the item and subscribes to its context like any consumer inside it does. */
  const setup = async (template: TemplateResult) => {
    render(template, container);
    const item = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
    await Promise.resolve();

    const published: ItemContext[] = [];
    subscribe(item.querySelector('qti-item-body')!, published);
    published.length = 0; // only what is published from here on

    /** Every context `processResponse` published. */
    const process = () => {
      const from = published.length;
      item.processResponse();
      return published.slice(from);
    };
    return { item, published, process };
  };

  it('publishes once per processResponse, with the final values', async () => {
    const { process } = await setup(itemWith('false'));

    const first = process();
    expect(first).toHaveLength(1);
    expect(valueOf(first[0], 'SCORE')).toBe('2');
    expect(valueOf(first[0], 'FEEDBACK')).toBe('two');
    expect(valueOf(first[0], 'numAttempts')).toBe('1');
    expect(valueOf(first[0], 'completionStatus')).toBeDefined();
  });

  it('keeps the reset to defaults inside the run: a repeat attempt never publishes score 0 or empty feedback', async () => {
    const { process } = await setup(itemWith('false'));
    process();

    const second = process();
    expect(second).toHaveLength(1);
    // Reset to SCORE 0 first (QTI), then +1 +1: the same 2, not 4.
    expect(valueOf(second[0], 'SCORE')).toBe('2');
    expect(valueOf(second[0], 'FEEDBACK')).toBe('two');
    expect(valueOf(second[0], 'numAttempts')).toBe('2');
    for (const context of second) {
      expect(valueOf(context, 'SCORE')).not.toBe('0');
      expect(valueOf(context, 'FEEDBACK')).not.toBe('empty');
    }
  });

  it('an adaptive item keeps its outcomes between attempts', async () => {
    const { process } = await setup(itemWith('true'));

    expect(valueOf(process()[0], 'SCORE')).toBe('2');
    const second = process();
    expect(second).toHaveLength(1);
    expect(valueOf(second[0], 'SCORE')).toBe('4');
  });

  it('sends one cito-item-outcomes-changed per run, after the publish, with the final values', async () => {
    const { item, process } = await setup(itemWith('false'));
    const events: { outcome: string; value: unknown; published: unknown }[][] = [];
    item.addEventListener('cito-item-outcomes-changed', (e: Event) => {
      const { outcomes } = (e as CustomEvent).detail;
      events.push(
        outcomes.map((o: { identifier: string; value: unknown }) => ({
          outcome: o.identifier,
          value: o.value,
          published: valueOf(item.itemContext, o.identifier)
        }))
      );
    });

    process();
    events.length = 0;
    process(); // a repeat attempt: the reset and the item both set completionStatus

    expect(events).toHaveLength(1);
    const [outcomes] = events;
    const identifiers = outcomes.map(e => e.outcome);
    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(outcomes.filter(e => e.outcome === 'SCORE')).toEqual([{ outcome: 'SCORE', value: '2', published: '2' }]);
    expect(outcomes.find(e => e.outcome === 'FEEDBACK')).toEqual({
      outcome: 'FEEDBACK',
      value: 'two',
      published: 'two'
    });
    for (const e of outcomes) expect(e.value).toEqual(e.published);
  });

  it('a run that throws publishes nothing; the next run starts from the item context', async () => {
    const { item, process } = await setup(itemWith('false'));
    process();
    const before = item.itemContext;

    const processing = item.querySelector('qti-response-processing')!;
    const seenByRules: ItemContext[] = [];
    const probe = subscribe(processing, seenByRules, 'test-probe-rule');
    const failing = document.createElement('test-throwing-rule');
    processing.appendChild(failing);

    expect(() => process()).toThrow('rule failed');
    // The attempt counts; the failed run's outcomes are not applied.
    expect(valueOf(item.itemContext, 'numAttempts')).toBe('2');
    expect(valueOf(item.itemContext, 'SCORE')).toBe(valueOf(before, 'SCORE'));
    expect(valueOf(item.itemContext, 'FEEDBACK')).toBe(valueOf(before, 'FEEDBACK'));
    // The rules only ever read the processor's copy.
    expect(seenByRules.length).toBeGreaterThan(0);
    expect(seenByRules).not.toContain(before);

    probe.remove();

    failing.remove();
    const after = process();
    expect(after).toHaveLength(1);
    expect(valueOf(after[0], 'SCORE')).toBe('2');
    expect(valueOf(after[0], 'numAttempts')).toBe('3');
  });

  it('cito-item-set-outcomes from a host applies several outcomes in one publish', async () => {
    const { item, published } = await setup(itemWith('false'));
    const changed: string[] = [];
    const attemptsEnded: unknown[] = [];
    item.addEventListener('cito-item-outcomes-changed', (e: Event) =>
      changed.push(...(e as CustomEvent).detail.outcomes.map((o: { identifier: string }) => o.identifier))
    );
    item.addEventListener('qti-item-context-updated', (e: Event) =>
      attemptsEnded.push((e as CustomEvent).detail.responseProcessed)
    );

    item.dispatchEvent(
      new CustomEvent('cito-item-set-outcomes', {
        detail: {
          outcomes: [
            { identifier: 'SCORE', value: '5' },
            { identifier: 'FEEDBACK', value: 'two' }
          ]
        }
      })
    );

    expect(published).toHaveLength(1);
    expect(valueOf(published[0], 'SCORE')).toBe('5');
    expect(valueOf(published[0], 'FEEDBACK')).toBe('two');
    expect(valueOf(published[0], 'completionStatus')).toBe('unknown');
    expect(changed).toEqual(['SCORE', 'FEEDBACK']);
    expect(attemptsEnded).toEqual([]);
  });

  it('with responseProcessed, a host ends the attempt: completionStatus is set and the test is told', async () => {
    const { item, published } = await setup(itemWith('false'));
    const attemptsEnded: unknown[] = [];
    item.addEventListener('qti-item-context-updated', (e: Event) =>
      attemptsEnded.push((e as CustomEvent).detail.responseProcessed)
    );

    item.dispatchEvent(
      new CustomEvent('cito-item-set-outcomes', {
        detail: {
          outcomes: [
            { identifier: 'SCORE', value: '1' },
            { identifier: 'numAttempts', value: '1' }
          ],
          responseProcessed: true
        }
      })
    );

    expect(published).toHaveLength(1);
    expect(valueOf(published[0], 'numAttempts')).toBe('1');
    expect(valueOf(published[0], 'completionStatus')).toBe('completed');
    expect(attemptsEnded).toEqual([true]);
  });

  it('a qti-set-outcome-value outside a run reaches neither the item nor anything above it', async () => {
    const { item, published } = await setup(itemWith('false'));
    const above: Event[] = [];
    container.addEventListener('qti-set-outcome-value', e => above.push(e));

    item.querySelector('qti-response-processing qti-set-outcome-value')!.dispatchEvent(
      new CustomEvent('qti-set-outcome-value', {
        bubbles: true,
        composed: true,
        detail: { outcomeIdentifier: 'SCORE', value: '9' }
      })
    );

    expect(published).toHaveLength(0);
    expect(above).toHaveLength(0);
    expect(valueOf(item.itemContext, 'SCORE')).toBe('0');
  });
});
