import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { candidateIn } from '../../conformance-candidate';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * The suite's "S3 and S4" sample (Advanced profile), loaded unmodified from
 * `public/assets/qti-conformance/Advanced/S3-S4/`: a nonlinear, simultaneous test part with two
 * visible sections, each selecting 2 of 3 items, section B shuffled.
 *
 * Selection and ordering follow the seed (roadmap 1 T4): with the seed `s3-s4` section A presents
 * items 1 and 2, and section B selects items 4 and 6 and shuffles them to 6, 4. Another seed selects
 * other items; the same seed always the same ones.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/S3 and S4',
  parameters: { controls: { disable: true }, a11y: { test: 'off' } },
  render: () => html`
    <qti-test navigate="item" .qtiContext=${{ QTI_CONTEXT: { seed: 's3-s4' } }}>
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Advanced/S3-S4/s3selection_s4ordering.xml"></test-container>
        <test-prev>Previous</test-prev>
        <test-next>Next</test-next>
      </test-navigation>
    </qti-test>
  `
};
export default meta;

/** The item-refs the test presents, without the suite's prefix: `item-1`, `item-2`, … */
const presented = (canvasElement: HTMLElement) =>
  candidateIn(canvasElement)
    .test()
    .testContext.items.map(item => item.identifier.replace('s3s4-sections-', ''));

export const S3_L2_D1: Story = {
  name: 'S3-L2-D1',
  parameters: {
    docs: {
      description: {
        story:
          'In Section A, we select 2 items out of 3 with Item 1 required. The remaining item needed to fill the selection must be selected randomly from the remaining 2 non-required items.'
      }
    },
    testTimeout: 60000
  },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);

    await step('The test opens on item 1, the required item of section A', async () => {
      await candidate.sees('S3S4 - Sections - Item 1');
      expect(candidate.section()).toBe('sectionA');
    });

    await step('Next shows item 2: the seed selected it from items 2 and 3', async () => {
      await candidate.press('Next');
      await candidate.sees('S3S4 - Sections - Item 2');
      expect(candidate.section()).toBe('sectionA');
    });

    await step('Section A presents 2 of its 3 items: item 3 is not in the test', async () => {
      expect(presented(canvasElement).filter(id => ['item-1', 'item-2', 'item-3'].includes(id))).toEqual([
        'item-1',
        'item-2'
      ]);
    });
  }
};

export const S4_L2_D1: Story = {
  name: 'S4-L2-D1',
  parameters: {
    docs: {
      description: {
        story: 'Section B, shuffled Order is true, which requires the selected items to be shuffled yet again.'
      }
    },
    testTimeout: 60000
  },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);

    await step('After section A, section B opens on item 6, not on item 4 as authored', async () => {
      await candidate.sees('S3S4 - Sections - Item 1');
      await candidate.press('Next');
      await candidate.sees('S3S4 - Sections - Item 2');
      await candidate.press('Next');
      await candidate.sees('S3S4 - Sections - Item 6');
      expect(candidate.section()).toBe('sectionB');
    });

    await step('Next shows item 4: the selected items 4 and 6, shuffled', async () => {
      await candidate.press('Next');
      await candidate.sees('S3S4 - Sections - Item 4');
      expect(candidate.section()).toBe('sectionB');
    });
  }
};

export const S3_L2_D2: Story = {
  name: 'S3-L2-D2',
  parameters: {
    docs: {
      description: {
        story:
          'In Section B, we select 2 items out of 3 with no items required. The items needed to fill the selection must be selected randomly from the 3 available items.'
      }
    },
    testTimeout: 60000
  },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);

    await step('Section B presents 2 of its 3 items, chosen by the seed: items 6 and 4', async () => {
      await candidate.sees('S3S4 - Sections - Item 1');
      expect(presented(canvasElement).filter(id => ['item-4', 'item-5', 'item-6'].includes(id))).toEqual([
        'item-6',
        'item-4'
      ]);
    });

    await step('Next through section B reaches items 6 and 4, and never item 5', async () => {
      await candidate.press('Next');
      await candidate.sees('S3S4 - Sections - Item 2');
      await candidate.press('Next');
      await candidate.sees('S3S4 - Sections - Item 6');
      await candidate.press('Next');
      await candidate.sees('S3S4 - Sections - Item 4');
      expect(presented(canvasElement)).not.toContain('item-5');
    });
  }
};

export const S4_L2_D11: Story = {
  name: 'S4-L2-D11',
  parameters: {
    docs: { description: { story: 'The test is presented as nonlinear, allowing students to navigate freely.' } },
    testTimeout: 60000
  },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);

    await step('The test opens on item 1, in section A', async () => {
      await candidate.sees('S3S4 - Sections - Item 1');
    });

    await step('The candidate jumps over the rest of section A to item 4, in section B', async () => {
      candidate.test().navigateTo('item', 's3s4-sections-item-4');
      await candidate.sees('S3S4 - Sections - Item 4');
      expect(candidate.section()).toBe('sectionB');
    });

    await step('Previous takes the candidate back, without answering anything first', async () => {
      const before = candidate.itemRef();
      await candidate.press('Previous');
      await waitFor(() => expect(candidate.itemRef()).not.toBe(before), { timeout: 5000 });
    });

    await step('And straight back to item 1', async () => {
      candidate.test().navigateTo('item', 's3s4-sections-item-1');
      await candidate.sees('S3S4 - Sections - Item 1');
    });
  }
};

export const S4_L2_D12: Story = {
  name: 'S4-L2-D12',
  parameters: {
    docs: {
      description: {
        story:
          'The test contains two sections, both of which are defined as visible, so should be visible to the test-taker'
      }
    },
    testTimeout: 60000
  },
  play: async ({ canvasElement, step }) => {
    const candidate = candidateIn(canvasElement);
    const screen = within(canvasElement);
    const visible = async (text: string) =>
      waitFor(async () => {
        const found = await screen.findAllByShadowText(text, { exact: false });
        expect(found.some(element => element.checkVisibility())).toBe(true);
      });

    await step('On an item of section A, the instructions of section A are shown', async () => {
      await candidate.sees('S3S4 - Sections - Item 1');
      expect(candidate.section()).toBe('sectionA');
      await visible('Instructions for Section A');
    });

    await step('On an item of section B, the instructions of section B are shown', async () => {
      candidate.test().navigateTo('item', 's3s4-sections-item-4');
      await candidate.sees('S3S4 - Sections - Item 4');
      expect(candidate.section()).toBe('sectionB');
      await visible('Instructions for Section B');
    });
  }
};
