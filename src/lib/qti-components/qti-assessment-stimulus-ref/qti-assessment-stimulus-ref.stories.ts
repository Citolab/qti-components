import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
// import { vi } from 'vitest';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentStimulusRef } from './qti-assessment-stimulus-ref';

const meta = {
  component: 'qti-assessment-stimulus-ref'
} satisfies Meta<typeof QtiAssessmentStimulusRef>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StimulusElement: Story = {
  render: _args => html`
    <qti-assessment-stimulus-ref
      identifier="Stimulus1"
      href="assets/qti-assessment-stimulus-ref/unbelievableNight.xml"
      title="An Unbelievable Night"
    ></qti-assessment-stimulus-ref>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Check if stimulus is loaded', async () => {
      // check if this is in the console.log 'AssessmentStimulusRef must be inside an assessment item'
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      expect(logSpy).toHaveBeenCalledWith('AssessmentStimulusRef must be inside an assessment item'); // check exact args
    });
  }
};

export const StimulusLoadedByItemPlacedInItem: Story = {
  render: _args =>
    html`<qti-assessment-item>
      <qti-assessment-stimulus-ref
        identifier="Stimulus1"
        href="assets/qti-assessment-stimulus-ref/unbelievableNight.xml"
        title="An Unbelievable Night"
      ></qti-assessment-stimulus-ref>
      <qti-item-body>
        <div class="qti-shared-stimulus" data-stimulus-idref="Stimulus1"></div>
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
              <div class="qti-shared-stimulus" data-stimulus-idref="Stimulus1"></div>
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
        <qti-assessment-item-ref identifier="Item1" href="qti-assessment-stimulus-ref/itemWithStimulusRef.xml">
          <qti-assessment-item identifier="Item1">
            <qti-assessment-stimulus-ref
              identifier="Stimulus1"
              href="assets/qti-assessment-stimulus-ref/unbelievableNight.xml"
              title="An Unbelievable Night"
            ></qti-assessment-stimulus-ref>
            <qti-item-body> </qti-item-body>
          </qti-assessment-item>
        </qti-assessment-item-ref>
        <div class="qti-shared-stimulus" data-stimulus-idref></div>
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
