import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { candidateIn } from '../../conformance-candidate';
import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * The suite's "S3 and S4" sample (Advanced profile), loaded unmodified from
 * `public/assets/qti-conformance/Advanced/S3-S4/`: a nonlinear, simultaneous test part with two
 * visible sections, each selecting 2 of 3 items, section B shuffled. A story with a `play` asserts its
 * criterion; a placeholder (tagged `todo`, with the phase that tests it) has none yet.
 *
 * `qti-selection` is roadmap 1 T4, so today every item of a section is presented; the stories here do
 * not count items. Section B shuffles, so the test gets a seed.
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

// todo: phase T4
export const S3_L2_D1: Story = {
  name: 'S3-L2-D1',
  tags: ['todo'],
  ...todo(
    'S3-L2-D1',
    's3selection_s4ordering.xml, In Section A, we select 2 items out of 3 with Item 1 required. The remaining item needed to fill the selection (value 2 in this case) must be selected randomly from the remaining 2 non-required items.',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
};

// todo: phase T4
export const S4_L2_D1: Story = {
  name: 'S4-L2-D1',
  tags: ['todo'],
  ...todo(
    'S4-L2-D1',
    's3selection_s4ordering.xml, Section B, shuffled Order is true, which requires the selected items to be shuffled yet again.',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
};

// todo: phase T4
export const S3_L2_D2: Story = {
  name: 'S3-L2-D2',
  tags: ['todo'],
  ...todo(
    'S3-L2-D2',
    's3selection_s4ordering.xml, In Section B, we select 2 items out of 3 with no items required.  The items needed to fill the selection (value 2 in this case) must be selected randomly from the 3 available items.',
    'qti3.0/Advanced/S3 and S4/readme.md'
  )
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

    await step('The candidate jumps over the rest of section A to item 5, in section B', async () => {
      candidate.test().navigateTo('item', 's3s4-sections-item-5');
      await candidate.sees('S3S4 - Sections - Item 5');
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
