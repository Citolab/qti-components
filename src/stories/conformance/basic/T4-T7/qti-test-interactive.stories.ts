import { expect, fireEvent, userEvent, waitFor } from '@storybook/test';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { getByShadowText, findByShadowText, findByShadowRole, within } from 'shadow-dom-testing-library';

import { getManifestInfo, type ManifestInfo } from '../../../../lib/qti-loader';

import type { QtiTest } from '@citolab/qti-components/qti-test/core';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';

type Story = StoryObj;

const meta: Meta<QtiTest> = {
  title: 'qti-conformance/basic/T4 and T7 - Test Structures'
};
export default meta;

// one Test Element
export const T4_T7: Story = {
  name: 'T4-L1-D1, T4-L1-D2, T7-L1-D1, T7-L1-D2, T14-L1-D1',
  render: (
    args,
    { loaded: { manifestInfo } }: { argTypes: ArgTypes; loaded: Record<'manifestInfo', ManifestInfo> }
  ) => {
    const qtiTestRef = createRef<QtiTest | undefined | null>();
    const { testURI } = manifestInfo;

    return html`
      <qti-test ${ref(qtiTestRef)} class="flex h-full w-full flex-col">
        <test-navigation>
          <div class="relative flex-1 overflow-auto">
            <test-container test-url="${manifestInfo.testURL}" class="block"></test-container>
          </div>

          <div class="flex w-full items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <test-prev class="btn btn-primary" role="button"> Vorige </test-prev>
              <test-next class="btn btn-primary" role="button"> Volgende </test-next>
            </div>
          </div>
        </test-navigation>
      </qti-test>
    `;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const responses = [
      'correct',
      ['choice_a', 'choice_b'],
      'jumps',
      `Gentle rain descends,
Whispers on the windowpane,
Nature’s lullaby.`
    ];
    const qtiTest = canvasElement.querySelector<QtiTest>('qti-test');
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
    const context = qtiTest.testContext;
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
