import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "S5 - Rubric Block in Sections" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `conformance-todo` and `no-tests` tags: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'qti-conformance/advanced/S5 - Rubric Block in Sections - to do',
  tags: ['conformance-todo', 'no-tests'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const S5_L2_D1: Story = {
  name: 'S5-L2-D1',
  ...todo(
    'S5-L2-D1',
    'from assessment.xml, the first rubric block with content "Rubric Block for Section 1" is displayed in the context to a candidate in relation to the questions within the section (Question 1). The rubric block content may be presented prior to the question(s), or on the same screen as the question(s) within the section.',
    'qti3.0/Advanced/S5 - Rubric Block in Sections/README.md'
  )
};

export const S5_L2_D2: Story = {
  name: 'S5-L2-D2',
  ...todo(
    'S5-L2-D2',
    'from assessment.xml, the first rubric block with content "Rubric Block for Section 2" is displayed in the context to a candidate in relation to the questions within the section (Question 2). The rubric block content may be presented prior to the question(s), or on the same screen as the question(s) within the section.',
    'qti3.0/Advanced/S5 - Rubric Block in Sections/README.md'
  )
};

export const S5_L2_D3: Story = {
  name: 'S5-L2-D3',
  ...todo(
    'S5-L2-D3',
    'from assessment.xml, the first rubric block with content "Rubric Block for Section 3" is displayed in the context to a candidate in relation to the questions within the section (Question 3). The rubric block content may be presented prior to the question(s), or on the same screen as the question(s) within the section.',
    'qti3.0/Advanced/S5 - Rubric Block in Sections/README.md'
  )
};
