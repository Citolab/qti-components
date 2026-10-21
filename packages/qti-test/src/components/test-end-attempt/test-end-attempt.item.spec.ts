import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { TestEndAttempt } from './test-end-attempt';
import type { QtiTest } from '../qti-test/qti-test';
import type { QtiAssessmentItemRef } from '../qti-assessment-item-ref/qti-assessment-item-ref';

/**
 * `test-end-attempt` in a `<template item-ref>` ends the attempt of the item it is stamped into, as
 * with `<qti-test navigate="section">`, where every item of the section is on screen with its own
 * button. Its `disabled` follows that item, not the one the session has active. The items are handed
 * to their refs the way the navigation mixin does once it has fetched them.
 */
const assessmentTest = html`
  <qti-test>
    <template item-ref>{{ xmlDoc }}<test-end-attempt>Nakijken</test-end-attempt></template>
    <test-navigation>
      <test-end-attempt id="toolbar">Nakijken</test-end-attempt>
      <test-end-attempt id="named" item="ITEM-2">Nakijken</test-end-attempt>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="End attempt">
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="S1" title="S1" visible="true">
              <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
              <qti-assessment-item-ref identifier="ITEM-2" href="items/item-2.xml"></qti-assessment-item-ref>
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

const itemDoc = (identifier: string): DocumentFragment =>
  document.createRange().createContextualFragment(`
    <qti-assessment-item identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false">
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

describe('test-end-attempt for an item of its own', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;

  const itemRef = (identifier: string) =>
    qtiTest.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${identifier}"]`)!;
  /** The button stamped into an item-ref. */
  const buttonOf = (identifier: string) => itemRef(identifier).querySelector<TestEndAttempt>('test-end-attempt')!;
  const numAttempts = (identifier: string) =>
    Number(
      qtiTest.testContext.items
        .find(i => i.identifier === identifier)
        ?.variables?.find(v => v.identifier === 'numAttempts')?.value
    ) || 0;
  const ended: unknown[] = [];
  const onEnd = (e: Event) => ended.push((e as CustomEvent).detail);

  beforeEach(async () => {
    host = document.createElement('div');
    render(assessmentTest, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    document.body.append(host);
    await settle();
    // Both items on screen, as with navigate="section"; ITEM-1 is the active one.
    itemRef('ITEM-1').xmlDoc = itemDoc('ITEM-1');
    itemRef('ITEM-2').xmlDoc = itemDoc('ITEM-2');
    qtiTest.sessionContext = {
      ...qtiTest.sessionContext,
      navPartId: 'P1',
      navSectionId: 'S1',
      navItemRefId: 'ITEM-1'
    };
    await settle();
    ended.length = 0;
    document.addEventListener('cito-test-end-attempt', onEnd);
  });

  afterEach(() => {
    document.removeEventListener('cito-test-end-attempt', onEnd);
    host.remove();
  });

  it('is stamped into every item', () => {
    expect(buttonOf('ITEM-1')).toBeTruthy();
    expect(buttonOf('ITEM-2')).toBeTruthy();
    expect(buttonOf('ITEM-2')).not.toBe(buttonOf('ITEM-1'));
  });

  it('ends the attempt of its own item only, and is disabled by that item', async () => {
    expect(buttonOf('ITEM-2').hasAttribute('disabled')).toBe(false);

    buttonOf('ITEM-2').click();
    await settle();

    expect(ended).toEqual([{ itemId: 'ITEM-2' }]);
    expect(numAttempts('ITEM-2')).toBe(1);
    expect(numAttempts('ITEM-1')).toBe(0);
    // max-attempts defaults to 1: ITEM-2 is used up, ITEM-1 (the active item) is not.
    expect(buttonOf('ITEM-2').hasAttribute('disabled')).toBe(true);
    expect(buttonOf('ITEM-1').hasAttribute('disabled')).toBe(false);
    expect(host.querySelector('#toolbar')!.hasAttribute('disabled')).toBe(false);
  });

  it('in the toolbar, without an item, follows the active item', async () => {
    const toolbar = host.querySelector<TestEndAttempt>('#toolbar')!;
    toolbar.click();
    await settle();

    expect(ended).toEqual([{}]);
    expect(numAttempts('ITEM-1')).toBe(1);
    expect(numAttempts('ITEM-2')).toBe(0);
    expect(toolbar.hasAttribute('disabled')).toBe(true);
    expect(buttonOf('ITEM-2').hasAttribute('disabled')).toBe(false);
  });

  it('with an item attribute, ends the attempt of that item wherever it sits', async () => {
    const named = host.querySelector<TestEndAttempt>('#named')!;
    named.click();
    await settle();

    expect(ended).toEqual([{ itemId: 'ITEM-2' }]);
    expect(numAttempts('ITEM-2')).toBe(1);
    expect(numAttempts('ITEM-1')).toBe(0);
    expect(named.hasAttribute('disabled')).toBe(true);
    expect(buttonOf('ITEM-2').hasAttribute('disabled')).toBe(true);
    expect(host.querySelector('#toolbar')!.hasAttribute('disabled')).toBe(false);
  });

  it('an item attribute overrides the item it is stamped into', async () => {
    const stamped = buttonOf('ITEM-1');
    stamped.item = 'ITEM-2';
    await stamped.updateComplete;

    stamped.click();
    await settle();

    expect(ended).toEqual([{ itemId: 'ITEM-2' }]);
    expect(numAttempts('ITEM-2')).toBe(1);
    expect(numAttempts('ITEM-1')).toBe(0);
  });
});
