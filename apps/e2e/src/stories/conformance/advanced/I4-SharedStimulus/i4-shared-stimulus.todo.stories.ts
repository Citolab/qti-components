import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "I4 Shared Stimulus" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'qti-conformance/advanced/I4 Shared Stimulus',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const I4_L2_D1: Story = {
  name: 'I4-L2-D1',
  ...todo(
    'I4-L2-D1',
    'The passage unbelievableNight.xml (stimulus) is presented and available to candidates while responding to any of the 3 questions associated with the stimulus.',
    'qti3.0/Advanced/I4 Shared Stimulus/README.md'
  )
};

export const I4_L2_D2: Story = {
  name: 'I4-L2-D2',
  ...todo(
    'I4-L2-D2',
    'For Item 1 and Item 3, in the absence of a data-stimulus-idref in the qti-item-body, delivery platforms may insert the shared stimulus in platform-default location(s).',
    'qti3.0/Advanced/I4 Shared Stimulus/README.md'
  )
};

export const I4_L2_D101: Story = {
  name: 'I4-L2-D101',
  ...todo(
    'I4-L2-D101',
    'For Item 2, the presence of a data-stimulus-idref in the qti-item-body requires delivery platforms to insert the shared stimulus at that exact location in the qti-item-body.  Consequently, the shared stimulus must be presented in the left column of the two-column layout, while the stem is presented in the right column of the two-column layout.',
    'qti3.0/Advanced/I4 Shared Stimulus/README.md'
  )
};
