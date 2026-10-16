import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "I20 Shared Vocabulary CSS" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/I20 Shared Vocabulary CSS',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const I20_L2_D1: Story = {
  name: 'I20-L2-D1',
  ...todo(
    'I20-L2-D1',
    'For file qti-shared-vocabulary-1.xml, present the content with class of qti-underline with underlined text.',
    'qti3.0/Advanced/I20 Shared Vocabulary CSS/README.md'
  )
};

export const I20_L2_D2: Story = {
  name: 'I20-L2-D2',
  ...todo(
    'I20-L2-D2',
    'For file qti-shared-vocabulary-1.xml, present the content with class of qti-italic with an italic font.',
    'qti3.0/Advanced/I20 Shared Vocabulary CSS/README.md'
  )
};

export const I20_L2_D3: Story = {
  name: 'I20-L2-D3',
  ...todo(
    'I20-L2-D3',
    'For file qti-shared-vocabulary-1.xml, present the content with class of qti-align-left with text aligned to the left.',
    'qti3.0/Advanced/I20 Shared Vocabulary CSS/README.md'
  )
};

export const I20_L2_D4: Story = {
  name: 'I20-L2-D4',
  ...todo(
    'I20-L2-D4',
    'For file qti-shared-vocabulary-1.xml, present the content with class of qti-align-center with text aligned in the center.',
    'qti3.0/Advanced/I20 Shared Vocabulary CSS/README.md'
  )
};

export const I20_L2_D5: Story = {
  name: 'I20-L2-D5',
  ...todo(
    'I20-L2-D5',
    'For file qti-shared-vocabulary-1.xml, present the content with class of qti-align-right with text aligned to the right.',
    'qti3.0/Advanced/I20 Shared Vocabulary CSS/README.md'
  )
};

export const I20_L2_D11: Story = {
  name: 'I20-L2-D11',
  ...todo(
    'I20-L2-D11',
    'For file qti-shared-vocabulary-2.xml, present the content with class of qti-layout-row where all the columns of content are within the div of that class.',
    'qti3.0/Advanced/I20 Shared Vocabulary CSS/README.md'
  )
};

export const I20_L2_D21: Story = {
  name: 'I20-L2-D21',
  ...todo(
    'I20-L2-D21',
    'For file qti-shared-vocabulary-2.xml, present the content with class of qti-layout-row where all the columns of content are within the div of that class.',
    'qti3.0/Advanced/I20 Shared Vocabulary CSS/README.md'
  )
};
