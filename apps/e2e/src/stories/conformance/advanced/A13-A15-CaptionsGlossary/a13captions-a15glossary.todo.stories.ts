import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "A13captions_A15glossary" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/A13captions_A15glossary',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const A13_L2_D1: Story = {
  name: 'A13-L2-D1',
  ...todo(
    'A13-L2-D1',
    'For the item qti-glossary-captions.xml -- has the ability to display captions for the included video when requested by the candidate.',
    'qti3.0/Advanced/A13captions_A15glossary/README.md'
  )
};

export const A15_L2_D1: Story = {
  name: 'A15-L2-D1',
  ...todo(
    'A15-L2-D1',
    'For the item qti-glossary-captions.xml -- Has the ability to present the glossary term provided for the word "acronym" when requested by the candidate. The glossary-on-screen feature can be activated in the delivery system either by a candidate\'s PNP or by the test administration system settings.',
    'qti3.0/Advanced/A13captions_A15glossary/README.md'
  )
};

export const A15_L2_D2: Story = {
  name: 'A15-L2-D2',
  ...todo(
    'A15-L2-D2',
    'Presentation of the glossary-on-screen term should not trap keyboard users (trap = users are unable to escape the glossary window using keyboard only).',
    'qti3.0/Advanced/A13captions_A15glossary/README.md'
  )
};
