import '@citolab/qti-components';
import '../register';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { TestCharacterSheet } from './test-character-sheet';
import type { QtiAssessmentItemRef, QtiTest } from '@citolab/qti-components/qti-test';

/**
 * The character sheet types into the answer field that last had focus, and only into a field of a
 * rendered item. The item is handed to its ref the way the navigation mixin does once it has fetched it.
 */
const assessmentTest = html`
  <qti-test>
    <test-navigation>
      <test-character-sheet characters="é € ²">Tekens</test-character-sheet>
      <input id="outside" type="text" />
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Characters">
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="S1" title="S1" visible="true">
              <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
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
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"></qti-response-declaration>
      <qti-item-body>
        <p>Antwoord: <qti-text-entry-interaction response-identifier="RESPONSE"></qti-text-entry-interaction></p>
      </qti-item-body>
    </qti-assessment-item>
  `);

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

describe('test-character-sheet', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;
  let sheet: TestCharacterSheet;

  const itemRef = (identifier: string) =>
    qtiTest.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${identifier}"]`)!;
  /** The input of the item's text entry: the field a candidate types in. */
  const field = () =>
    itemRef('ITEM-1')
      .querySelector('qti-text-entry-interaction')!
      .shadowRoot!.querySelector('input') as HTMLInputElement;
  const keys = () => [...sheet.shadowRoot!.querySelectorAll<HTMLButtonElement>('.key')];
  const response = () =>
    qtiTest.testContext.items.find(i => i.identifier === 'ITEM-1')?.variables?.find(v => v.identifier === 'RESPONSE')
      ?.value;

  beforeEach(async () => {
    host = document.createElement('div');
    render(assessmentTest, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    sheet = host.querySelector('test-character-sheet') as TestCharacterSheet;
    document.body.append(host);
    await settle();
    itemRef('ITEM-1').xmlDoc = itemDoc('ITEM-1');
    qtiTest.sessionContext = { ...qtiTest.sessionContext, navPartId: 'P1', navSectionId: 'S1', navItemRefId: 'ITEM-1' };
    await settle();
  });

  afterEach(() => host.remove());

  it('is a button with the characters it was given, disabled until an answer field has had focus', () => {
    expect(sheet.getAttribute('role')).toBe('button');
    expect(sheet.getAttribute('aria-expanded')).toBe('false');
    expect(keys().map(key => key.textContent!.trim())).toEqual(['é', '€', '²']);
    expect(sheet.hasAttribute('disabled')).toBe(true);

    sheet.click();
    expect(sheet.open).toBe(false);
  });

  it('ignores a field that is not in an item', async () => {
    host.querySelector<HTMLInputElement>('#outside')!.focus();
    await settle();
    expect(sheet.hasAttribute('disabled')).toBe(true);
  });

  it('opens once the answer field had focus, and types the picked character into it at the caret', async () => {
    field().focus();
    await settle();
    expect(sheet.hasAttribute('disabled')).toBe(false);

    sheet.click();
    await settle();
    expect(sheet.open).toBe(true);
    expect(sheet.getAttribute('aria-expanded')).toBe('true');

    field().value = 'caf';
    field().setSelectionRange(3, 3);
    keys()[0].click();
    await settle();

    expect(field().value).toBe('café');
    expect(response()).toBe('café');
    expect(document.activeElement === field() || sheet.shadowRoot!.activeElement === null).toBe(true);
  });

  it('replaces a selection', async () => {
    field().focus();
    field().value = 'EUR 5';
    field().setSelectionRange(0, 3);
    await settle();
    sheet.click();
    await settle();
    keys()[1].click();
    await settle();

    expect(field().value).toBe('€ 5');
  });

  it('closes on Escape and on a click outside', async () => {
    field().focus();
    await settle();
    sheet.click();
    await settle();
    expect(sheet.open).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(sheet.open).toBe(false);

    sheet.click();
    await settle();
    expect(sheet.open).toBe(true);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await settle();
    expect(sheet.open).toBe(false);
  });

  it('closes when another item comes on screen', async () => {
    field().focus();
    await settle();
    sheet.click();
    await settle();
    expect(sheet.open).toBe(true);

    qtiTest.sessionContext = { ...qtiTest.sessionContext, navItemRefId: null };
    await settle();
    expect(sheet.open).toBe(false);
  });
});
