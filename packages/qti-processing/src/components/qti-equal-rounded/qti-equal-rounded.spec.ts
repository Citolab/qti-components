import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiEqualRounded } from './qti-equal-rounded';

describe('qti-equal-rounded', () => {
  it('rounded 3 decimals equal', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>3.175</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded rounding-mode="significantFigures" figures="2">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', '3.183');

    expect(qtiEqualRounded.calculate()).toBeTruthy();
  });

  it('rounded 3 decimals equal with default rounding-mode', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>3.175</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="2">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', '3.183');

    expect(qtiEqualRounded.calculate()).toBeTruthy();
  });

  it('rounded 3 decimals not equal with default rounding-mode', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="float" cardinality="single">
          <qti-correct-response>
            <qti-value>3.175</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="3">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', '3.183');

    expect(qtiEqualRounded.calculate()).toBeFalsy();
  });

  it('rounded 3 decimals equal with rounding mode: decimalPlaces', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration
          identifier="RESPONSE"
          rounding-mode="decimalPlaces"
          base-type="float"
          cardinality="single"
        >
          <qti-correct-response>
            <qti-value>1.68572</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="3">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', '1.69');

    expect(qtiEqualRounded.calculate()).toBeTruthy();
  });

  it('rounded 3 decimals not equal with rounding mode: decimalPlaces', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration
          identifier="RESPONSE"
          rounding-mode="decimalPlaces"
          base-type="float"
          cardinality="single"
        >
          <qti-correct-response>
            <qti-value>1.68432</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal-rounded figures="3">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal-rounded>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiEqualRounded = document.body.querySelector('qti-equal-rounded') as QtiEqualRounded;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', '1.68572');

    expect(qtiEqualRounded.calculate()).toBeFalsy();
  });
  /*
   * A pair the two rounding modes disagree about: at 3 decimal places 54.598
   * and 54.608 differ, at 3 significant figures both are 54.6.
   *
   * `rounding-mode` never reached the property — Lit derives `roundingmode`
   * from the property name unless told otherwise — so every comparison used the
   * `significantFigures` default and an item asking for decimal places got
   * significant figures. The existing specs above did not catch it because
   * their values round the same either way.
   */
  describe('rounding-mode actually selects the mode', () => {
    let testContainer: HTMLElement;

    beforeEach(() => {
      testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
    });

    afterEach(() => testContainer.remove());

    const compare = (mode: string) => {
      testContainer.innerHTML = `
        <qti-equal-rounded rounding-mode="${mode}" figures="3">
          <qti-base-value base-type="float">54.598</qti-base-value>
          <qti-base-value base-type="float">54.608</qti-base-value>
        </qti-equal-rounded>`;
      return (testContainer.querySelector('qti-equal-rounded') as QtiEqualRounded).calculate();
    };

    it('separates values that differ in the third decimal place', () => {
      expect(compare('decimalPlaces')).toBe(false);
    });

    it('treats the same values as equal to three significant figures', () => {
      expect(compare('significantFigures')).toBe(true);
    });

    it('reads the attribute onto the property', () => {
      testContainer.innerHTML = `<qti-equal-rounded rounding-mode="decimalPlaces" figures="3"></qti-equal-rounded>`;
      expect((testContainer.querySelector('qti-equal-rounded') as QtiEqualRounded).roundingMode).toBe('decimalPlaces');
    });
  });
});
