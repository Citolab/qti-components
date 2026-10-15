import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "T12 - Sections" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `conformance-todo` and `no-tests` tags: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'qti-conformance/advanced/T12 - Sections - to do',
  tags: ['conformance-todo', 'no-tests'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const T12_L2_D1: Story = {
  name: 'T12-L2-D1',
  ...todo(
    'T12-L2-D1',
    'The Test contains 8 Items: Item 1, Item 2, Item 3, Item 4, Item 5, Item 6, Item 7, Item 8. Items MUST be displayed in 3 different Sections. Section 1 contains items 1-4. Section 2 contains items 5-7. Section 3 contains only item 8.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};

export const T2_L2_D1: Story = {
  name: 'T2-L2-D1',
  ...todo(
    'T2-L2-D1',
    'The test is limited to 60 seconds. The amount of time remaining MUST be available to the candidate during the assessment session.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};

export const S1_L2_D1: Story = {
  name: 'S1-L2-D1',
  ...todo(
    'S1-L2-D1',
    'In Section 1, allow-skipping="true", candidates MUST be able to "skip"; i.e., proceed without entering a response, all items in Section 1 and proceed to other sections in the assessment.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};

export const S9_L2_D1: Story = {
  name: 'S9-L2-D1',
  ...todo(
    'S9-L2-D1',
    'Section 3 is derived from a section reference (AssessmentSectionRef) using file section3.xml and contains only item 8. The system MUST present the referenced section to the candidate as part of the assessment.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};

export const S1_L2_D2: Story = {
  name: 'S1-L2-D2',
  ...todo(
    'S1-L2-D2',
    'In Section 2, allow-skipping="false", candidates MUST provide a response for each item in Section 2 before proceeding to the next items within Section 2 and Section 3.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};
