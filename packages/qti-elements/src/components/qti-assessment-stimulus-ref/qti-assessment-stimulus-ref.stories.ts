import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { http, HttpResponse, delay } from 'msw';
import { mswLoader } from 'msw-storybook-addon';

import UnbeleivableNight from '../../../../../public/assets/qti-test-package-stimulus/items/ref/unbelievableNight.xml?raw';
import itemWithStimulusWithoutPlacement from '../../../../../public/assets/qti-assessment-stimulus-ref/itemWithStimulusWithoutPlacement.xml?raw';

import type { QtiAssessmentStimulusRef } from './qti-assessment-stimulus-ref';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta = {
  component: 'qti-assessment-stimulus-ref'
} satisfies Meta<QtiAssessmentStimulusRef>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StimulusLoadedByItemPlacedInItem: Story = {
  render: _args =>
    html`<qti-assessment-item>
      <qti-assessment-stimulus-ref
        identifier="Stimulus1"
        href="assets/qti-assessment-stimulus-ref/unbelievableNight.xml"
        title="An Unbelievable Night"
      ></qti-assessment-stimulus-ref>
      <qti-item-body>
        <div
          class="qti-base-stimulus"
          data-stimulus-idref="Stimulus1"
          style="outline: 2px solid red; outline-offset: 2px;"
        ></div>
      </qti-item-body>
    </qti-assessment-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check if stimulus is loaded', async () => {
      const stimulus = await canvas.findByText('An Unbelievable Night', {}, { timeout: 5000 });
      const stimulusContainer = canvasElement.querySelector('[data-stimulus-idref="Stimulus1"]');
      expect(stimulusContainer).toContainElement(stimulus);
    });
  }
};

/*
 * To orchestrate loading the stimulus from a test, it is important that if the user navigates
 * to an item or section that the loading is aborted. So when in a test we let the qti-test
 * orchestrate the loading of the stimulus by not preventing the default behaviour of the event.
 * The item will then load the stimulus and append it to the placeholder element with the matching
 * data-stimulus-idref attribute.
 */
export const StimulusLoadedByTestPlacedInItem: Story = {
  render: _args =>
    html`<qti-test>
      <qti-assessment-test>
        <qti-assessment-item-ref identifier="Item1" href="qti-assessment-stimulus-ref/itemWithStimulusRef.xml">
          <qti-assessment-item identifier="Item1">
            <qti-assessment-stimulus-ref
              identifier="Stimulus1"
              href="assets/qti-assessment-stimulus-ref/unbelievableNight.xml"
              title="An Unbelievable Night"
            ></qti-assessment-stimulus-ref>
            <qti-item-body>
              <div
                class="qti-base-stimulus"
                data-stimulus-idref="Stimulus1"
                style="outline: 2px solid red; outline-offset: 2px;"
              ></div>
            </qti-item-body>
          </qti-assessment-item>
        </qti-assessment-item-ref>
      </qti-assessment-test>
    </qti-test>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check if stimulus is loaded', async () => {
      const stimulus = await canvas.findByText('An Unbelievable Night', {}, { timeout: 5000 });
      const stimulusContainer = canvasElement.querySelector('[data-stimulus-idref="Stimulus1"]');
      expect(stimulusContainer).toContainElement(stimulus);
    });
  }
};

export const StimulusLoadedByTestPlacedInTest: Story = {
  render: _args =>
    html`<qti-test>
      <qti-assessment-test>
        <qti-assessment-item-ref identifier="Item1">
          <qti-assessment-item identifier="Item1">
            <qti-assessment-stimulus-ref
              identifier="Stimulus1"
              href="assets/qti-assessment-stimulus-ref/unbelievableNight.xml"
              title="An Unbelievable Night"
            ></qti-assessment-stimulus-ref>
            <qti-item-body> </qti-item-body>
          </qti-assessment-item>
        </qti-assessment-item-ref>
      </qti-assessment-test>
      <div class="qti-base-stimulus" data-stimulus-idref style="outline: 2px solid red; outline-offset: 2px;"></div>
    </qti-test>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check if stimulus is loaded', async () => {
      const stimulus = await canvas.findByText('An Unbelievable Night', {}, { timeout: 5000 });
      const stimulusContainer = canvasElement.querySelector('[data-stimulus-idref]');
      expect(stimulusContainer).toContainElement(stimulus);
    });
  }
};

export const ItemAndStimulusLoadedByTestWithPlacement: Story = {
  render: _args =>
    html` <style>
        .qti-base-stimulus {
          outline: 2px solid red;
          outline-offset: 2px;
        }
      </style>
      <qti-test navigate="item">
        <qti-assessment-test>
          <qti-assessment-item-ref
            identifier="Item1"
            href="assets/qti-assessment-stimulus-ref/itemWithStimulusWithPlacement.xml"
          >
          </qti-assessment-item-ref>
        </qti-assessment-test>
      </qti-test>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check if stimulus is loaded', async () => {
      const stimulus = await canvas.findByText('An Unbelievable Night', {}, { timeout: 5000 });
      const stimulusContainer = canvasElement.querySelector('[data-stimulus-idref]');
      expect(stimulusContainer).toContainElement(stimulus);
    });
  }
};

export const ItemAndStimulusLoadedTestByWithoutPlacement: Story = {
  render: _args =>
    html` <qti-test navigate="item">
      <qti-assessment-test>
        <qti-assessment-item-ref
          identifier="Item1"
          href="assets/qti-assessment-stimulus-ref/itemWithStimulusWithoutPlacement.xml"
        >
        </qti-assessment-item-ref>
      </qti-assessment-test>
      <div class="qti-base-stimulus" data-stimulus-idref style="outline: 2px solid red; outline-offset: 2px;"></div>
    </qti-test>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check if stimulus is loaded', async () => {
      const stimulus = await canvas.findByText('An Unbelievable Night', {}, { timeout: 5000 });
      const stimulusContainer = canvasElement.querySelector('[data-stimulus-idref]');
      expect(stimulusContainer).toContainElement(stimulus);
    });
  }
};

export const ItemAndStimulusSlowLoadedTestByWithoutPlacement: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(/\/assets\/qti-assessment-stimulus-ref\/itemWithStimulusWithoutPlacement.xml$/, async () => {
          await delay(2000);
          return HttpResponse.text(itemWithStimulusWithoutPlacement);
        }),
        http.get(/\/unbelievableNight\.xml$/, async () => {
          await delay(2000);
          return HttpResponse.text(UnbeleivableNight);
        })
      ]
    }
  },
  render: _args =>
    html` <qti-test navigate="item">
      <qti-assessment-test>
        <qti-assessment-item-ref
          identifier="Item1"
          href="assets/qti-assessment-stimulus-ref/itemWithStimulusWithoutPlacement.xml"
        >
        </qti-assessment-item-ref>
      </qti-assessment-test>
      <div class="qti-base-stimulus" data-stimulus-idref style="outline: 2px solid red; outline-offset: 2px;"></div>
    </qti-test>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check if stimulus is loaded', async () => {
      const stimulus = await canvas.findByText('An Unbelievable Night', {}, { timeout: 5000 });
      const stimulusContainer = canvasElement.querySelector('[data-stimulus-idref]');
      expect(stimulusContainer).toContainElement(stimulus);
    });
  }
};
