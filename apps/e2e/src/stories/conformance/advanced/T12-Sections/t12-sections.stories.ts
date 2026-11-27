import { html } from 'lit';
import { expect } from 'storybook/test';

import { candidateIn } from '../../conformance-candidate';
import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * The suite's "T12 - Sections" sample (Advanced profile), loaded unmodified from
 * `public/assets/qti-conformance/Advanced/T12/`: one linear, individual test part with three sections,
 * the third from a `qti-assessment-section-ref` (`section3.xml`). A story with a `play` asserts its
 * criterion; a placeholder (tagged `todo`, with the phase that tests it) has none yet. The QTI 3
 * conformance page counts a story without the `todo` tag as tested.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/T12 - Sections',
  parameters: { controls: { disable: true }, a11y: { test: 'off' } },
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Advanced/T12/assessment.xml"></test-container>
        <test-end-attempt>End attempt</test-end-attempt>
        <test-next>Next</test-next>
      </test-navigation>
    </qti-test>
  `
};
export default meta;

/** The items in the order the candidate meets them, each with the section it is presented in. */
const ITEMS = [
  [1, 'assessmentSection-1'],
  [2, 'assessmentSection-1'],
  [3, 'assessmentSection-1'],
  [4, 'assessmentSection-1'],
  [5, 'assessmentSection-2'],
  [6, 'assessmentSection-2'],
  [7, 'assessmentSection-2'],
  [8, 'assessmentSection-3']
] as const;

/**
 * Takes the test from item 1 to item 8 as a candidate does in a linear part: answer, end the attempt,
 * Next. Section 2 does not allow skipping, so every item is answered. Calls `onItem` on each.
 */
const takeTheTest = async (
  canvasElement: HTMLElement,
  step: (label: string, play: () => Promise<void>) => Promise<void> | void,
  onItem: (item: number, section: string | null) => void
) => {
  const candidate = candidateIn(canvasElement);
  for (const [item] of ITEMS) {
    await step(`Item ${item} is on screen; the candidate answers it and goes on`, async () => {
      await candidate.sees(`T12 - Sections - Item ${item}`);
      onItem(item, candidate.section());
      await candidate.choose('Choice 1');
      await candidate.press('End attempt');
      if (item < 8) await candidate.press('Next');
    });
  }
};

export const T12_L2_D1: Story = {
  name: 'T12-L2-D1',
  parameters: {
    docs: {
      description: {
        story:
          'The Test contains 8 Items: Item 1, Item 2, Item 3, Item 4, Item 5, Item 6, Item 7, Item 8. Items MUST be displayed in 3 different Sections. Section 1 contains items 1-4. Section 2 contains items 5-7. Section 3 contains only item 8.'
      }
    },
    testTimeout: 120000
  },
  play: async ({ canvasElement, step }) => {
    const seen: [number, string | null][] = [];
    await takeTheTest(canvasElement, step, (item, section) => seen.push([item, section]));

    await step('The 8 items were presented in 3 sections: 1-4, 5-7 and 8', async () => {
      expect(seen).toEqual(ITEMS.map(([item, section]) => [item, section]));
    });
  }
};

// todo: phase T5
export const T2_L2_D1: Story = {
  name: 'T2-L2-D1',
  tags: ['todo'],
  ...todo(
    'T2-L2-D1',
    'The test is limited to 60 seconds. The amount of time remaining MUST be available to the candidate during the assessment session.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};

// todo: phase T3
export const S1_L2_D1: Story = {
  name: 'S1-L2-D1',
  tags: ['todo'],
  ...todo(
    'S1-L2-D1',
    'In Section 1, allow-skipping="true", candidates MUST be able to "skip"; i.e., proceed without entering a response, all items in Section 1 and proceed to other sections in the assessment.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};

export const S9_L2_D1: Story = {
  name: 'S9-L2-D1',
  parameters: {
    docs: {
      description: {
        story:
          'Section 3 is derived from a section reference (AssessmentSectionRef) using file section3.xml and contains only item 8. The system MUST present the referenced section to the candidate as part of the assessment.'
      }
    },
    testTimeout: 120000
  },
  play: async ({ canvasElement, step }) => {
    const inSection3: number[] = [];
    await takeTheTest(canvasElement, step, (item, section) => {
      if (section === 'assessmentSection-3') inSection3.push(item);
    });

    await step('Section 3, from section3.xml, was presented with only item 8 in it', async () => {
      expect(inSection3).toEqual([8]);
    });
  }
};

// todo: phase T3
export const S1_L2_D2: Story = {
  name: 'S1-L2-D2',
  tags: ['todo'],
  ...todo(
    'S1-L2-D2',
    'In Section 2, allow-skipping="false", candidates MUST provide a response for each item in Section 2 before proceeding to the next items within Section 2 and Section 3.',
    'qti3.0/Advanced/T12 - Sections/README.md'
  )
};
