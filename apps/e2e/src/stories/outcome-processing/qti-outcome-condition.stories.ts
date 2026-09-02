import { action } from 'storybook/actions';
import { expect } from 'storybook/test';
import { html } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'outcome-processing/qti-outcome-condition'
};
export default meta;

/**
 * Renders an item whose response processing routes a single RESPONSE through an
 * `qti-outcome-condition`:
 *   - RESPONSE == "B"  -> outcome-if      -> GRADE = "pass"
 *   - RESPONSE == "A"  -> outcome-else-if -> GRADE = "partial"
 *   - anything else    -> outcome-else    -> GRADE = "fail"
 */
const render = () => {
  const onOutcomeChanged = action('qti-outcome-changed');

  return html`
    <div class="item" @qti-outcome-changed=${onOutcomeChanged}>
      <qti-assessment-item identifier="OUTCOME_CONDITION_ITEM">
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
          <qti-correct-response>
            <qti-value>B</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration
          identifier="GRADE"
          cardinality="single"
          base-type="identifier"
        ></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction max-choices="1" response-identifier="RESPONSE">
            <qti-simple-choice identifier="A">A</qti-simple-choice>
            <qti-simple-choice identifier="B">B</qti-simple-choice>
            <qti-simple-choice identifier="C">C</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-outcome-condition>
            <qti-outcome-if>
              <qti-match>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="identifier">B</qti-base-value>
              </qti-match>
              <qti-set-outcome-value identifier="GRADE">
                <qti-base-value base-type="identifier">pass</qti-base-value>
              </qti-set-outcome-value>
            </qti-outcome-if>
            <qti-outcome-else-if>
              <qti-match>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="identifier">A</qti-base-value>
              </qti-match>
              <qti-set-outcome-value identifier="GRADE">
                <qti-base-value base-type="identifier">partial</qti-base-value>
              </qti-set-outcome-value>
            </qti-outcome-else-if>
            <qti-outcome-else>
              <qti-set-outcome-value identifier="GRADE">
                <qti-base-value base-type="identifier">fail</qti-base-value>
              </qti-set-outcome-value>
            </qti-outcome-else>
          </qti-outcome-condition>
        </qti-response-processing>
      </qti-assessment-item>
    </div>
  `;
};

const gradeFor = async (canvasElement: HTMLElement, response: string) => {
  const assessmentItem = canvasElement.querySelector<QtiAssessmentItem>('qti-assessment-item')!;
  await assessmentItem.updateComplete;
  assessmentItem.updateResponseVariable('RESPONSE', response);
  assessmentItem.processResponse();
  return assessmentItem.variables.find(v => v.identifier === 'GRADE')?.value;
};

/** outcome-if branch: its boolean expression is true, so the rest are skipped. */
export const IfBranch: Story = {
  name: 'outcome-if (true)',
  render,
  play: async ({ canvasElement }) => {
    const grade = await gradeFor(canvasElement, 'B');
    expect(grade, 'RESPONSE=B -> GRADE=pass').toBe('pass');
  }
};

/** outcome-else-if branch: outcome-if false, this one's expression true. */
export const ElseIfBranch: Story = {
  name: 'outcome-else-if (true)',
  render,
  play: async ({ canvasElement }) => {
    const grade = await gradeFor(canvasElement, 'A');
    expect(grade, 'RESPONSE=A -> GRADE=partial').toBe('partial');
  }
};

/** outcome-else branch: no preceding expression is true. */
export const ElseBranch: Story = {
  name: 'outcome-else (fallthrough)',
  render,
  play: async ({ canvasElement }) => {
    const grade = await gradeFor(canvasElement, 'C');
    expect(grade, 'RESPONSE=C -> GRADE=fail').toBe('fail');
  }
};
