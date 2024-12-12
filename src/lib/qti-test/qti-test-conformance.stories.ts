import { expect, fireEvent, userEvent, waitFor } from '@storybook/test';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import { getByShadowText, findByShadowText, findByShadowRole } from 'shadow-dom-testing-library';
import { QtiTest } from './qti-test';
import { getManifestInfo, ManifestInfo } from '../qti-loader';

type Story = StoryObj;

const meta: Meta<QtiTest> = {
  title: 'qti-conformance/basic/T4 and T7 - Test Structures',
  parameters: {
    layout: 'fullscreen'
  }
};
export default meta;

// one Test Element
export const T4_T7: Story = {
  name: 'T4-L1-D1, T4-L1-D2, T7-L1-D1, T7-L1-D2, T14-L1-D1',
  render: (
    args,
    { loaded: { manifestInfo } }: { argTypes: ArgTypes; loaded: Record<'manifestInfo', ManifestInfo> }
  ) => {
    const qtiPlayerRef = createRef<QtiTest | undefined | null>();

    return html`
      <qti-test ${ref(qtiPlayerRef)} class="flex h-full w-full flex-col">
        <div class="relative flex-1 overflow-auto">
          <test-container test-url="${manifestInfo.testURL}" class="block"></test-container>
        </div>

        <div class="flex w-full items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <test-prev class="btn btn-primary" role="button">
              <hi-24-outline-chevron-left>Previous</hi-24-outline-chevron-left>
            </test-prev>
            <test-next class="btn btn-primary" role="button">
              <div class="hidden md:flex">Next</div>
              <hi-24-outline-chevron-right></hi-24-outline-chevron-right>
            </test-next>
          </div>
        </div>
      </qti-test>
    `;
  },
  play: async ({ canvasElement }) => {
    const responses = [
      'correct',
      ['choice_a', 'choice_b'],
      'jumps',
      `Gentle rain descends,
Whispers on the windowpane,
Nature’s lullaby.`
    ];
    const qtiPlayer = canvasElement.querySelector<QtiTest>('qti-test');
    const prevButton = canvasElement.querySelector('test-prev') as HTMLElement;
    const nextButton = canvasElement.querySelector('test-next') as HTMLElement;
    const testContainer = canvasElement.querySelector('test-container') as HTMLElement;
    const choice = await findByShadowText(testContainer, 'Correct');

    // ITEM 1 - choice: correct/incorrect
    await fireEvent.click(choice);
    await fireEvent.click(nextButton);
    // ITEM 2 - choice multiple
    const choiceA = await findByShadowText(testContainer, 'choice_a');
    const choiceB = getByShadowText(testContainer, 'choice_b');
    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);
    await fireEvent.click(nextButton);
    // ITEM 3 - text entry

    const textEntryInteraction = await findByShadowRole<HTMLInputElement>(testContainer, 'textbox');
    await userEvent.type(textEntryInteraction, responses[2].toString());
    await fireEvent.click(nextButton);

    // ITEM 4 - extended text entry
    const extendedTextInteraction = await findByShadowRole<HTMLInputElement>(testContainer, 'textbox');
    await userEvent.type(extendedTextInteraction, responses[3].toString());
    await fireEvent.click(prevButton);

    // Check if the previous response is still there
    const textEntryInteraction2 = await findByShadowRole<HTMLInputElement>(testContainer, 'textbox');

    // Wait for the input's value to be set to the expected response
    await waitFor(() => {
      expect(textEntryInteraction2.value).toBe(responses[2].toString());
    });
    // Now check the context
    const context = qtiPlayer.context;
    let itemIndex = 0;
    for (const item of context.items) {
      const response = item.variables.find(v => v.identifier === 'RESPONSE');
      expect(JSON.stringify(response.value)).toBe(JSON.stringify(responses[itemIndex]));
      itemIndex++;
    }
  },
  loaders: [
    async ({ args }) => ({ manifestInfo: await getManifestInfo(`/assets/qti-conformance/Basic/T4-T7/imsmanifest.xml`) })
  ]
};
