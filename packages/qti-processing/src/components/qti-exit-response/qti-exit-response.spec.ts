import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * `qti-exit-response` ends the attempt's response processing wherever it sits.
 * Each case scores an item whose rules would set SCORE twice, and asserts the
 * exit stopped the second write while keeping the first.
 */
describe('qti-exit-response', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const scoreOf = (item: QtiAssessmentItem) => item.variables.find(v => v.identifier === 'SCORE')?.value;

  const item = (rules: unknown) => {
    render(
      html`
        <qti-assessment-item identifier="ITEM">
          <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"> </qti-outcome-declaration>
          <qti-response-processing>${rules}</qti-response-processing>
        </qti-assessment-item>
      `,
      testContainer
    );
    return testContainer.querySelector('qti-assessment-item') as QtiAssessmentItem;
  };

  const setScore = (value: number) => html`
    <qti-set-outcome-value identifier="SCORE">
      <qti-base-value base-type="float">${value}</qti-base-value>
    </qti-set-outcome-value>
  `;

  it('stops the rules that follow it', () => {
    const assessmentItem = item(html`${setScore(1)}<qti-exit-response></qti-exit-response>${setScore(9)}`);
    assessmentItem.processResponse();

    expect(scoreOf(assessmentItem)).toBe('1');
  });

  it('keeps the outcomes already set before it', () => {
    const assessmentItem = item(html`${setScore(4)}<qti-exit-response></qti-exit-response>`);
    assessmentItem.processResponse();

    expect(scoreOf(assessmentItem)).toBe('4');
  });

  it('stops the run from inside a response condition branch', () => {
    const assessmentItem = item(html`
      <qti-response-condition>
        <qti-response-if>
          <qti-base-value base-type="boolean">true</qti-base-value>
          ${setScore(2)}
          <qti-exit-response></qti-exit-response>
        </qti-response-if>
      </qti-response-condition>
      ${setScore(9)}
    `);
    assessmentItem.processResponse();

    expect(scoreOf(assessmentItem)).toBe('2');
  });

  it('stops the run from inside a response processing fragment', () => {
    const assessmentItem = item(html`
      <qti-response-processing-fragment>
        ${setScore(3)}
        <qti-exit-response></qti-exit-response>
      </qti-response-processing-fragment>
      ${setScore(9)}
    `);
    assessmentItem.processResponse();

    expect(scoreOf(assessmentItem)).toBe('3');
  });

  it('does not swallow a genuine error raised by another rule', () => {
    const assessmentItem = item(html`${setScore(1)}`);
    const rule = assessmentItem.querySelector('qti-set-outcome-value') as any;
    rule.process = () => {
      throw new Error('boom');
    };

    expect(() => assessmentItem.processResponse()).toThrow('boom');
  });
});
