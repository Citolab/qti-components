import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "Q12 - Inline Choice Interaction" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/Q12 - Inline Choice Interaction',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const Q12_L2_D21: Story = {
  name: 'Q12-L2-D21',
  ...todo(
    'Q12-L2-D21',
    'Invalid Example This should display a QTI validation exception: multiple cardinality not permitted.',
    'qti3.0/Advanced/Q12 - Inline Choice Interaction/README.md'
  )
};
