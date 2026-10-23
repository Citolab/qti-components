import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

import type { TemplateResult } from 'lit';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiTest } from '../qti-test/qti-test';
import type { QtiAssessmentItemRef } from '../qti-assessment-item-ref/qti-assessment-item-ref';
import type { TestEndAttempt } from '../test-end-attempt/test-end-attempt';
import type { QtiTestState } from '../../types/qti-test-state';

/**
 * Once an item has used the attempts its `max-attempts` allows, `test-navigation` disables it, so
 * the candidate cannot change the answer after the last attempt is ended. The state comes from the
 * computed context, so it holds for every item on screen (`navigate="section"`) and for a restored
 * state, and it is released when the attempts are back to zero. The items are handed to their refs
 * the way the navigation mixin does once it has fetched them.
 */

const testMarkup = (refs: TemplateResult, { autoScore = false, submissionMode = 'individual' } = {}) => html`
  <qti-test>
    <test-navigation ?auto-score-items=${autoScore}>
      <test-end-attempt id="end-1" item="ITEM-1">Nakijken</test-end-attempt>
      <test-end-attempt id="end-2" item="ITEM-2">Nakijken</test-end-attempt>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Attempts">
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode=${submissionMode}>
            <qti-assessment-section identifier="S1" title="S1" visible="true">${refs}</qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

/** Two item-refs, each with its own `max-attempts` (undefined: none declared, so the default of 1). */
const refs = (max1?: number, max2?: number) => html`
  <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml">
    ${max1 === undefined ? '' : html`<qti-item-session-control max-attempts=${max1}></qti-item-session-control>`}
  </qti-assessment-item-ref>
  <qti-assessment-item-ref identifier="ITEM-2" href="items/item-2.xml">
    ${max2 === undefined ? '' : html`<qti-item-session-control max-attempts=${max2}></qti-item-session-control>`}
  </qti-assessment-item-ref>
`;

const itemDoc = (identifier: string, adaptive = false): DocumentFragment =>
  document.createRange().createContextualFragment(`
    <qti-assessment-item identifier="${identifier}" title="${identifier}" adaptive="${adaptive}" time-dependent="false">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-response-processing
        template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"
      ></qti-response-processing>
      <qti-item-body>
        <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
          <qti-simple-choice identifier="A">A</qti-simple-choice>
          <qti-simple-choice identifier="B">B</qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>
    </qti-assessment-item>
  `);

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

const stateWith = (numAttempts: number): QtiTestState => ({
  version: 1,
  test: {
    items: [
      {
        identifier: 'ITEM-1',
        variables: [
          { identifier: 'numAttempts', type: 'response', value: String(numAttempts) },
          { identifier: 'RESPONSE', type: 'response', value: 'B' }
        ]
      }
    ],
    outcomes: []
  },
  session: { navItemRefId: 'ITEM-1' }
});

describe('test-navigation disables an item whose attempts are used', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;

  const itemRef = (identifier: string) =>
    qtiTest.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${identifier}"]`)!;
  const item = (identifier: string) => itemRef(identifier).assessmentItem as QtiAssessmentItem;
  const interaction = (identifier: string) =>
    item(identifier).querySelector('qti-choice-interaction') as HTMLElement & { disabled: boolean };
  const endAttempt = async (identifier: string) => {
    host.querySelector<TestEndAttempt>(`#end-${identifier.slice(-1)}`)!.click();
    await settle();
  };

  /** Mounts the test, optionally restores a state first, then puts both items on screen. */
  const mount = async (
    markup: TemplateResult,
    { state, adaptive = false }: { state?: QtiTestState; adaptive?: boolean } = {}
  ) => {
    host = document.createElement('div');
    render(markup, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    if (state) qtiTest.state = state;
    document.body.append(host);
    await settle();
    // Both items on screen, as with navigate="section"; ITEM-1 is the active one.
    itemRef('ITEM-1').xmlDoc = itemDoc('ITEM-1', adaptive);
    itemRef('ITEM-2').xmlDoc = itemDoc('ITEM-2', adaptive);
    qtiTest.sessionContext = { ...qtiTest.sessionContext, navPartId: 'P1', navSectionId: 'S1', navItemRefId: 'ITEM-1' };
    await settle();
  };

  afterEach(() => host?.remove());

  it('with max-attempts 1, disables the item and its interaction after the attempt is ended', async () => {
    await mount(testMarkup(refs(1, 1)));
    expect(item('ITEM-1').disabled).toBeFalsy();
    expect(interaction('ITEM-1').disabled).toBe(false);

    await endAttempt('ITEM-1');

    expect(item('ITEM-1').disabled).toBe(true);
    expect(interaction('ITEM-1').disabled).toBe(true);
  });

  it('with max-attempts 2, disables the item after the second attempt, not the first', async () => {
    await mount(testMarkup(refs(2, 2)));

    await endAttempt('ITEM-1');
    expect(item('ITEM-1').disabled).toBeFalsy();
    expect(interaction('ITEM-1').disabled).toBe(false);

    await endAttempt('ITEM-1');
    expect(item('ITEM-1').disabled).toBe(true);
    expect(interaction('ITEM-1').disabled).toBe(true);
  });

  it('disables an item restored with its attempts used as soon as it loads, and releases it on a new state', async () => {
    await mount(testMarkup(refs()), { state: stateWith(1) });

    expect(item('ITEM-1').disabled).toBe(true);
    expect(interaction('ITEM-1').disabled).toBe(true);
    expect(item('ITEM-2').disabled).toBeFalsy();

    qtiTest.state = stateWith(0);
    await settle();

    expect(item('ITEM-1').disabled).toBe(false);
    expect(interaction('ITEM-1').disabled).toBe(false);
  });

  it('never disables an item with unlimited attempts (max-attempts 0)', async () => {
    await mount(testMarkup(refs(0, 0)));

    await endAttempt('ITEM-1');
    await endAttempt('ITEM-1');
    await endAttempt('ITEM-1');

    expect(item('ITEM-1').disabled).toBeFalsy();
    expect(interaction('ITEM-1').disabled).toBe(false);
  });

  it('never disables an item in a simultaneous part: the answer may change until the part ends', async () => {
    await mount(testMarkup(refs(1, 1), { submissionMode: 'simultaneous' }));

    await endAttempt('ITEM-1');

    expect(item('ITEM-1').disabled).toBeFalsy();
    expect(interaction('ITEM-1').disabled).toBe(false);
  });

  it('never disables an adaptive item', async () => {
    await mount(testMarkup(refs(1, 1)), { adaptive: true });

    await endAttempt('ITEM-1');
    await endAttempt('ITEM-1');

    expect(item('ITEM-1').disabled).toBeFalsy();
    expect(interaction('ITEM-1').disabled).toBe(false);
  });

  it('with every item of the section on screen, disables only the item that used its attempts', async () => {
    await mount(testMarkup(refs()));

    await endAttempt('ITEM-2');

    expect(item('ITEM-2').disabled).toBe(true);
    expect(interaction('ITEM-2').disabled).toBe(true);
    // ITEM-1 is the active item, and has not ended an attempt.
    expect(item('ITEM-1').disabled).toBeFalsy();
    expect(interaction('ITEM-1').disabled).toBe(false);
  });

  it('locks nothing with auto-score-items, where every change is scored as an attempt', async () => {
    await mount(testMarkup(refs(), { autoScore: true }));

    await endAttempt('ITEM-1');

    expect(item('ITEM-1').disabled).toBeFalsy();
    expect(interaction('ITEM-1').disabled).toBe(false);
  });

  it('leaves an item the host disabled itself disabled when its attempts reset', async () => {
    await mount(testMarkup(refs()), { state: stateWith(0) });
    item('ITEM-1').disabled = true;
    await settle();

    qtiTest.state = stateWith(1);
    await settle();
    qtiTest.state = stateWith(0);
    await settle();

    expect(item('ITEM-1').disabled).toBe(true);
  });
});
