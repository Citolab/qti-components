import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * The condition of a `qti-response-if` / `qti-response-else-if` is a single boolean (QTI info model,
 * ResponseIf). Variables and base values hold booleans as the strings `'true'` and `'false'`, so the
 * branch runs only for `true`; `false` and NULL do not apply. Each case scores the branch that ran:
 * 1 for the if, 2 for the else-if, 3 for the else.
 */
describe('qti-response-condition', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const setScore = (value: number) => html`
    <qti-set-outcome-value identifier="SCORE">
      <qti-base-value base-type="float">${value}</qti-base-value>
    </qti-set-outcome-value>
  `;

  // Literal values: a binding inside `qti-value` would leave Lit's marker comment in its text.
  const defaultValue: Record<string, unknown> = {
    true: html`<qti-default-value><qti-value>true</qti-value></qti-default-value>`,
    false: html`<qti-default-value><qti-value>false</qti-value></qti-default-value>`,
    null: ''
  };

  /** Runs response processing once with FLAG's default (`null`: no default) and returns the branch that ran. */
  const branchFor = (
    flag: 'true' | 'false' | null,
    condition = html`<qti-variable identifier="FLAG"></qti-variable>`
  ) => {
    render(
      html`
        <qti-assessment-item identifier="ITEM">
          <qti-outcome-declaration identifier="FLAG" cardinality="single" base-type="boolean">
            ${defaultValue[String(flag)]}
          </qti-outcome-declaration>
          <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
          <qti-response-processing>
            <qti-response-condition>
              <qti-response-if>${condition}${setScore(1)}</qti-response-if>
              <qti-response-else>${setScore(3)}</qti-response-else>
            </qti-response-condition>
          </qti-response-processing>
        </qti-assessment-item>
      `,
      testContainer
    );
    const item = testContainer.querySelector('qti-assessment-item') as QtiAssessmentItem;
    item.processResponse();
    return item.variables.find(v => v.identifier === 'SCORE')?.value;
  };

  it('runs the if for a boolean variable that is true', () => {
    expect(branchFor('true')).toBe('1');
  });

  it('skips the if for a boolean variable that is false', () => {
    expect(branchFor('false')).toBe('3');
  });

  it('skips the if for a boolean variable that is NULL', () => {
    expect(branchFor(null)).toBe('3');
  });

  it('skips the if for a base value false', () => {
    expect(branchFor(null, html`<qti-base-value base-type="boolean">false</qti-base-value>`)).toBe('3');
  });

  it('runs the if for a base value true', () => {
    expect(branchFor(null, html`<qti-base-value base-type="boolean">true</qti-base-value>`)).toBe('1');
  });

  it('skips an else-if whose boolean variable is false', () => {
    render(
      html`
        <qti-assessment-item identifier="ITEM">
          <qti-outcome-declaration identifier="FLAG" cardinality="single" base-type="boolean">
            <qti-default-value><qti-value>false</qti-value></qti-default-value>
          </qti-outcome-declaration>
          <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
          <qti-response-processing>
            <qti-response-condition>
              <qti-response-if
                ><qti-base-value base-type="boolean">false</qti-base-value>${setScore(1)}</qti-response-if
              >
              <qti-response-else-if><qti-variable identifier="FLAG"></qti-variable>${setScore(2)}</qti-response-else-if>
              <qti-response-else>${setScore(3)}</qti-response-else>
            </qti-response-condition>
          </qti-response-processing>
        </qti-assessment-item>
      `,
      testContainer
    );
    const item = testContainer.querySelector('qti-assessment-item') as QtiAssessmentItem;
    item.processResponse();
    expect(item.variables.find(v => v.identifier === 'SCORE')?.value).toBe('3');
  });
});
