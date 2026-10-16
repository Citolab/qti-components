import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "I17 - Composite Item" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/I17 - Composite Item',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const I17_L2_D1: Story = {
  name: 'I17-L2-D1',
  ...todo(
    'I17-L2-D1',
    'Display shakespeare_biography.xml where there are 3 distinct interactions presented to the candidate (2 choice and 1 text entry).',
    'qti3.0/Advanced/I17 - Composite Item/README.md'
  )
};

export const I9_L2_D1: Story = {
  name: 'I9-L2-D1',
  ...todo(
    'I9-L2-D1',
    'The system MUST score interaction response_1 as follows (SCORE_1 is evaluated using the <qti-match> operator):',
    'qti3.0/Advanced/I17 - Composite Item/README.md'
  )
};

export const I9_L2_D2: Story = {
  name: 'I9-L2-D2',
  ...todo(
    'I9-L2-D2',
    'The system MUST score interaction response_2 as follows (SCORE_2 is evaluated using the <qti-match> operator):',
    'qti3.0/Advanced/I17 - Composite Item/README.md'
  )
};

export const I9_L2_D3: Story = {
  name: 'I9-L2-D3',
  ...todo(
    'I9-L2-D3',
    'The system MUST score interaction response_3 as follows (SCORE_3 is evaluated using the <qti-map-response> operator):',
    'qti3.0/Advanced/I17 - Composite Item/README.md'
  )
};

export const I9_L2_D11: Story = {
  name: 'I9-L2-D11',
  ...todo(
    'I9-L2-D11',
    "The system MUST score the assessment as follows (SCORE is computed by summing; i.e., using the <qti-sum> operator, each interaction's subscore):",
    'qti3.0/Advanced/I17 - Composite Item/README.md'
  )
};
