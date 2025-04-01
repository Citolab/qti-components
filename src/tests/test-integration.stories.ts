import { fireEvent } from '@storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { createRef, ref } from 'lit/directives/ref.js';

import { ExtendedXMLHttpRequest } from '../testing/xmlHttpRequest';

import type { QtiAssessmentStimulusRef } from '../lib';
import type { Meta, StoryObj } from '@storybook/web-components';

import '../../.storybook/utilities.css';

type Story = StoryObj;

const meta: Meta = {
  component: 'test-integration',
  async beforeEach() {
    const xhr = XMLHttpRequest;
    window.XMLHttpRequest = ExtendedXMLHttpRequest;

    return () => {
      window.XMLHttpRequest = xhr;
    };
  },
  tags: ['skip-test'],
  render: () => {
    const placeholderRef = createRef<HTMLElement>();
    return html` <qti-test
      @qti-assessment-stimulus-ref-connected=${async (e: Event) => {
        e.preventDefault(); // this prevents the default behaviour of the item to set the stimulus content
        const stimulusRef = e.composedPath()[0] as QtiAssessmentStimulusRef;
        stimulusRef.updateStimulusRef(placeholderRef.value);
      }}
      @qti-request-navigation=${() => (placeholderRef.value.innerHTML = ``)}
    >
      <style>
        .qti-shared-stimulus:empty {
          display: none;
        }
      </style>
      <test-navigation>
        <test-section-buttons-stamp>
          <template>
            <test-section-link section-id="{{ item.identifier }}"> {{ item.identifier }} </test-section-link>
          </template>
        </test-section-buttons-stamp>
        <div class="flex space-between">
          <div class="qti-shared-stimulus w-1/2" ${ref(placeholderRef)}></div>
          <test-container class="w-1/2" test-url="/assets/qti-test-package/assessment.xml">
            <template
              ><style>
                .qti-layout-col6:has(.qti-shared-stimulus:empty) {
                  display: none;
                }
                .qti-layout-col6 {
                  width: 100%;
                }
              </style></template
            >
          </test-container>
        </div>
      </test-navigation>
    </qti-test>`;
  }
};
export default meta;

export const SlowLoadingStimulus: Story = {
  beforeEach: async () => {
    ExtendedXMLHttpRequest.configureBehaviors(
      {
        '/assets/qti-test-package/items/info_start.xml': { type: 'slow', delay: 800 },
        '/assets/qti-test-package/items//ref/unbelievableNight.xml': { type: 'slow', delay: 800 }
      },
      { type: 'passthrough' },
      false
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify options are shuffled', async () => {
      // const navInfoStart = await canvas.findByShadowText('info-start');
      const navBasic = await canvas.findByShadowText('basic');
      // const navAdvanced = await canvas.findByShadowText('advanced');
      const navInfoEnd = await canvas.findByShadowText('info-end');

      // const firstItem = await canvas.findByShadowTitle('Examples');
      // expect(firstItem).toBeInTheDocument();
      // await fireEvent.click(navInfoStart);
      await new Promise(resolve => setTimeout(resolve, 400));
      await fireEvent.click(navBasic);
      await new Promise(resolve => setTimeout(resolve, 400));
      await fireEvent.click(navInfoEnd);
      // await fireEvent.click(navAdvanced);
      // const lastItem = await canvas.findByShadowTitle('Info End');
      // expect(lastItem).toBeInTheDocument();

      // const qtiSharedStimulus = canvasElement.querySelector('.qti-shared-stimulus');

      await new Promise(resolve => setTimeout(resolve, 1500));
      // expect(qtiSharedStimulus?.children.length).toBe(0);
    });
  }
};

export const NotLoadingAdvancedOrder: Story = {
  beforeEach: async () => {
    ExtendedXMLHttpRequest.configureBehaviors(
      {
        '/assets/qti-test-package/items/graphic_associate.xml': { type: 'slow', delay: 800 },
        '/assets/qti-test-package/items/order.xml': { type: 'error', status: 404, statusText: 'Not Found' }
      },
      { type: 'passthrough' },
      false
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify options are shuffled', async () => {
      const navAdvanced = await canvas.findByShadowText('advanced');
      await fireEvent.click(navAdvanced);
    });
  }
};
