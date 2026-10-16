import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "S3 and S4" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/S3 and S4',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const S3_L2_D1: Story = {
  name: 'S3-L2-D1',
  ...todo(
    'S3-L2-D1',
    's3selection_s4ordering.xml, In Section A, we select 2 items out of 3 with Item 1 required. The remaining item needed to fill the selection (value 2 in this case) must be selected randomly from the remaining 2 non-required items.',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
};

export const S4_L2_D1: Story = {
  name: 'S4-L2-D1',
  ...todo(
    'S4-L2-D1',
    's3selection_s4ordering.xml, Section B, shuffled Order is true, which requires the selected items to be shuffled yet again.',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
};

export const S3_L2_D2: Story = {
  name: 'S3-L2-D2',
  ...todo(
    'S3-L2-D2',
    's3selection_s4ordering.xml, In Section B, we select 2 items out of 3 with no items required.  The items needed to fill the selection (value 2 in this case) must be selected randomly from the 3 available items.',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
};

export const S4_L2_D11: Story = {
  name: 'S4-L2-D11',
  ...todo(
    'S4-L2-D11',
    'The test is presented as nonlinear, allowing students to navigate freely.',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
};

export const S4_L2_D12: Story = {
  name: 'S4-L2-D12',
  ...todo(
    'S4-L2-D12',
    'The test contains two sections, both of which are defined as visible, so should be visible to the test-taker',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
};
