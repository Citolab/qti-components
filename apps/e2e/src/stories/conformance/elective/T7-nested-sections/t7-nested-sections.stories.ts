import { html } from 'lit';
import { expect } from 'storybook/test';

import { candidateIn } from '../../conformance-candidate';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * The suite's "T7 - Nested Sections" sample (Elective), loaded unmodified from
 * `public/assets/qti-conformance/Elective/T7-nested-sections/`. Its README calls it a QTI 2.2 sample,
 * but the file is QTI 3. One linear, individual part: section 1 holds subsection 1-A, item 4 and
 * subsection 1-B; section 2 holds item 8. The criterion has no ID.
 *
 * The README names the items of subsection 1-A "Item 1-A, Item 1-B, Item 1-C", but the fixture's are
 * `item-1-a`, `item-2-a`, `item-3-a`, titled "Item 1-A", "Item 2-A", "Item 3-A". The story follows the
 * fixture.
 */
const meta: Meta = {
  title: 'Testing/Conformance/elective/T7 - Nested Sections',
  parameters: { controls: { disable: true }, a11y: { test: 'off' } },
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Elective/T7-nested-sections/sections.xml"></test-container>
        <test-end-attempt>End attempt</test-end-attempt>
        <test-next>Next</test-next>
      </test-navigation>
    </qti-test>
  `
};
export default meta;

/** The items in document order, each with the section it sits in. */
const ITEMS = [
  ['1-A', 'assessmentSection-1-a'],
  ['2-A', 'assessmentSection-1-a'],
  ['3-A', 'assessmentSection-1-a'],
  ['4', 'assessmentSection-1'],
  ['5-B', 'assessmentSection-1-b'],
  ['6-B', 'assessmentSection-1-b'],
  ['7-B', 'assessmentSection-1-b'],
  ['8', 'assessmentSection-2']
] as const;

export const NestedSectionsInOrder: Story = {
  name: 'Nested sections are taken in order of appearance',
  parameters: {
    docs: {
      description: {
        story:
          'The candidate will take, in order of appearance, the following Items: Item 1-A, Item 1-B, Item 1-C, Item 4, Item 5-B, Item 6-B, Item 7-B, Item 8.'
      }
    },
    testTimeout: 120000
  },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);
    const seen: [string, string | null][] = [];

    for (const [item] of ITEMS) {
      await step(`Item ${item} is on screen; the candidate answers it and goes on`, async () => {
        await candidate.sees(`T7 - Sections - Item ${item}`);
        seen.push([item, candidate.section()]);
        await candidate.choose('Choice 1');
        await candidate.press('End attempt');
        if (item !== '8') await candidate.press('Next');
      });
    }

    await step('The items came in document order, each in its own (sub)section', async () => {
      expect(seen).toEqual(ITEMS.map(([item, section]) => [item, section]));
    });
  }
};
