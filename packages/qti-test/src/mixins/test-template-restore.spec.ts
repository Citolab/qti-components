import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiTest } from '../components/qti-test/qti-test';
import type { QtiAssessmentItemRef } from '../components/qti-assessment-item-ref/qti-assessment-item-ref';

/**
 * An item with template processing draws its values once. Coming back to it — navigating back, or
 * resuming a session — must show the same values, or the candidate sees a different question than
 * the one they answered.
 */
const assessmentTest = html`
  <qti-test>
    <test-container>
      <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Templates">
        <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
          <qti-assessment-section identifier="S1" title="S1" visible="true">
            <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
          </qti-assessment-section>
        </qti-test-part>
      </qti-assessment-test>
    </test-container>
  </qti-test>
`;

/** What the navigation mixin hands an item-ref: a random `n` and a correct response derived from it. */
const itemDoc = (): DocumentFragment =>
  document.createRange().createContextualFragment(`
    <qti-assessment-item identifier="item-1" title="Item 1" adaptive="false" time-dependent="false">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="integer"></qti-response-declaration>
      <qti-template-declaration identifier="n" base-type="integer" cardinality="single"></qti-template-declaration>
      <qti-template-processing>
        <qti-set-template-value identifier="n">
          <qti-random-integer min="1" max="1000000"></qti-random-integer>
        </qti-set-template-value>
        <qti-set-correct-response identifier="RESPONSE">
          <qti-variable identifier="n"></qti-variable>
        </qti-set-correct-response>
      </qti-template-processing>
      <qti-item-body><qti-printed-variable identifier="n"></qti-printed-variable></qti-item-body>
    </qti-assessment-item>
  `);

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

describe('qti-test template values', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;

  beforeEach(async () => {
    host = document.createElement('div');
    render(assessmentTest, host);
    document.body.append(host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    await settle();
  });

  afterEach(() => host.remove());

  const loadItem = async (): Promise<QtiAssessmentItem> => {
    const itemRef = qtiTest.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref[identifier="ITEM-1"]');
    itemRef.xmlDoc = itemDoc();
    await settle();
    return itemRef.assessmentItem;
  };

  const drawn = (item: QtiAssessmentItem) => item.variables.find(v => v.identifier === 'n')?.value;

  it('shows the same template values when an item is loaded again', async () => {
    const first = drawn(await loadItem());
    expect(first).toMatch(/^\d+$/);

    // Two random draws from a million coincide once in a million runs; three loads make a fluke
    // pass of a broken restore practically impossible.
    expect(drawn(await loadItem())).toBe(first);
    expect(drawn(await loadItem())).toBe(first);
  });

  it('keeps the drawn values in the test context, so a stored session carries them', async () => {
    const value = drawn(await loadItem());

    const stored = qtiTest.testContext.items
      .find(i => i.identifier === 'ITEM-1')
      ?.variables?.find(v => v.identifier === 'n');
    expect(stored?.value).toBe(value);
  });
});
