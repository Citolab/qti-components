import { fireEvent } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { http, HttpResponse, delay } from 'msw';
import { mswLoader } from 'msw-storybook-addon';

import '../../../../.storybook/utilities.css';

type Story = StoryObj;

const meta: Meta = {
  component: 'test-integration',
  tags: ['skip-test'],
  loaders: [mswLoader],
  render: () => {
    return html` <qti-test>
      <style>
        .qti-base-stimulus:empty {
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
          <div class="qti-base-stimulus w-1/2" data-stimulus-idref="Stimulus1"></div>

          <test-container class="w-1/2" test-url="/assets/qti-test-package-stimulus/assessment.xml">
            <template
              ><style>
                .qti-layout-col6:has(.qti-base-stimulus:empty) {
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

import UnbeleivableNight from '../../../../public/assets/qti-test-package-stimulus/items/ref/unbelievableNight.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

export const SlowLoadingStimulus: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(/\/assets\/qti-test-package-stimulus\/items\/\/ref\/unbelievableNight\.xml$/, async () => {
          await delay(2000);
          return HttpResponse.text(UnbeleivableNight);
        })
      ]
    }
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
      await new Promise(resolve => setTimeout(resolve, 1400));
      await fireEvent.click(navBasic);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fireEvent.click(navInfoEnd);
      // await fireEvent.click(navAdvanced);
      // const lastItem = await canvas.findByShadowTitle('Info End');
      // expect(lastItem).toBeInTheDocument();

      // const qtiSharedStimulus = canvasElement.querySelector('.qti-base-stimulus');

      await new Promise(resolve => setTimeout(resolve, 1500));
      // expect(qtiSharedStimulus?.children.length).toBe(0);
    });
  }
};
