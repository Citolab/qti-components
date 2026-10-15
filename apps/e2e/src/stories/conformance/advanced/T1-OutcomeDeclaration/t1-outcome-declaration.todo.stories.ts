import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "T1 - Outcome Declaration" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `conformance-todo` and `no-tests` tags: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'qti-conformance/advanced/T1 - Outcome Declaration - to do',
  tags: ['conformance-todo', 'no-tests'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const T1_L2_D1: Story = {
  name: 'T1-L2-D1',
  ...todo(
    'T1-L2-D1',
    'The variable value bound to the SCORE_TOTAL is by default, initialized to 0, where base-type="float".',
    'qti3.0/Advanced/T1 - Outcome Declaration/README.md'
  )
};

export const T9_L2_D1: Story = {
  name: 'T9-L2-D1',
  ...todo(
    'T9-L2-D1',
    'While taking the test, the variable value bound to the SCORE_TOTAL Outcome Declaration remains strictly equal to the amount of correctly responded AssessmentItems amongst the AssessmentTest.',
    'qti3.0/Advanced/T1 - Outcome Declaration/README.md'
  )
};
