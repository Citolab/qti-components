import { expect, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { http, HttpResponse, delay } from 'msw';

import '../../../../.storybook/utilities.css';

type Story = StoryObj;

const meta: Meta = {
  title: 'Testing/E2E/test-integration',
  component: 'test-integration',
  render: () => {
    return html` <qti-test navigate="section">
      <style>
        .qti-base-stimulus:empty {
          display: none;
        }
      </style>
      <test-navigation>
        <test-stamp>
          <template>
            <template type="repeat" repeat="{{ activeTestpart.sections }}">
              <test-section-link section-id="{{ item.identifier }}"> {{ item.identifier }} </test-section-link>
            </template>
          </template>
        </test-stamp>
        <div class="flex justify-between">
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

import UnbeleivableNight from './fixtures/qti-test-package-stimulus/items/ref/unbelievableNight.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * Each fetch of the slow stimulus, with the signal the test passed to it. The signal is read on the
 * page, where the abort happens: msw answers from a service worker, which does not see it.
 */
const stimulusFetches: { signal?: AbortSignal | null }[] = [];
const isStimulus = (input: RequestInfo | URL) =>
  String(input instanceof Request ? input.url : input).includes('unbelievableNight.xml');

/**
 * The stimulus of the basic section answers two seconds late. Shown when it arrives, cleared when the
 * candidate leaves, and when the candidate leaves BEFORE it arrives, its request is aborted and it never
 * lands on the page they went to.
 */
export const SlowLoadingStimulus: Story = {
  parameters: {
    testTimeout: 30000,
    msw: {
      handlers: [
        http.get(/\/assets\/qti-test-package-stimulus\/items\/\/ref\/unbelievableNight\.xml$/, async () => {
          await delay(2000);
          return HttpResponse.text(UnbeleivableNight);
        })
      ]
    }
  },
  beforeEach: () => {
    stimulusFetches.length = 0;
    const fetch = window.fetch;
    window.fetch = (input, init) => {
      if (isStimulus(input))
        stimulusFetches.push({ signal: init?.signal ?? (input instanceof Request ? input.signal : null) });
      return fetch(input, init);
    };
    return () => {
      window.fetch = fetch;
    };
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const stimulus = () => canvasElement.querySelector('[data-stimulus-idref="Stimulus1"]')!;
    const link = (section: string) => canvas.findByShadowText(section);

    await step('A stimulus that arrives late is still shown', async () => {
      (await link('basic')).click();
      await waitFor(() => expect(stimulus().querySelector('qti-assessment-stimulus')).not.toBeNull(), {
        timeout: 5000
      });
    });

    await step('Leaving the section clears it', async () => {
      (await link('info-end')).click();
      await waitFor(() => expect(stimulus().children).toHaveLength(0));
    });

    await step('Leaving before it arrives aborts it, and it never shows up', async () => {
      const before = stimulusFetches.length;
      (await link('basic')).click();
      await waitFor(() => expect(stimulusFetches.length).toBeGreaterThan(before), { timeout: 5000 });
      (await link('info-end')).click();

      // Past the moment the late response would have landed.
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(stimulus().children).toHaveLength(0);
      expect(stimulusFetches.at(-1)?.signal?.aborted).toBe(true);
    });
  }
};
