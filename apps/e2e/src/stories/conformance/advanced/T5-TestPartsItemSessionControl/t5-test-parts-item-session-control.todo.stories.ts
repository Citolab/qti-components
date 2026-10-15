import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "T5 - Test Parts - Item Session Control" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `conformance-todo` and `no-tests` tags: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'qti-conformance/advanced/T5 - Test Parts - Item Session Control - to do',
  tags: ['conformance-todo', 'no-tests'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const T5_L2_D1: Story = {
  name: 'T5-L2-D1',
  ...todo(
    'T5-L2-D1',
    'for assessment.xml testPart-1, for any of the assessment items within the test part is being responded, the number of attempts per AssessmentItem per candidate is unlimited.',
    'qti3.0/Advanced/T5 - Test Parts - Item Session Control/README.md'
  )
};
