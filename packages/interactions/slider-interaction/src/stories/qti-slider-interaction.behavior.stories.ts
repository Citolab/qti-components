import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiSliderInteraction } from '../qti-slider-interaction';

const meta: Meta<QtiSliderInteraction> = {
  component: 'qti-slider-interaction',
  title: 'Interactions/Slider/Behavior',
  tags: ['behavior', 'specific']
};
export default meta;

const item = (declaration: unknown) => html`
  <qti-assessment-item identifier="slider-default">
    ${declaration}
    <qti-item-body>
      <qti-slider-interaction response-identifier="VERTROUWEN" lower-bound="1" upper-bound="5" step="1">
        <qti-prompt>How confident are you? (1 = not sure, 5 = very sure)</qti-prompt>
      </qti-slider-interaction>
    </qti-item-body>
  </qti-assessment-item>
`;

const withDefault = html`
  <qti-response-declaration identifier="VERTROUWEN" cardinality="single" base-type="integer">
    <qti-default-value><qti-value>3</qti-value></qti-default-value>
  </qti-response-declaration>
`;

const withoutDefault = html`
  <qti-response-declaration identifier="VERTROUWEN" cardinality="single" base-type="integer"></qti-response-declaration>
`;

// The item is scaffolding with no role of its own; it is only read for the response variable.
const responseOf = (canvasElement: HTMLElement) =>
  (canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem).variables.find(
    v => v.identifier === 'VERTROUWEN'
  )?.value;

/**
 * The response declaration gives VERTROUWEN a default of 3, the slider runs from 1 to 5. Before the
 * candidate touches anything, the slider shows 3 and the response is 3: a response variable starts
 * at its default value, and that is the slider's only initial position (QTI 3).
 */
export const ResponseDefaultValue: StoryObj = {
  render: () => item(withDefault),
  play: async ({ canvasElement, step }) => {
    const slider = within(canvasElement).getByShadowRole<QtiSliderInteraction>('slider');

    await step('The slider shows the declared default', async () => {
      await waitFor(() => expect(slider.internals.ariaValueNow).toBe('3'));
    });

    await step('The response variable holds the default, not the lower bound', async () => {
      expect(responseOf(canvasElement)).toBe('3');
    });
  }
};

/** Without a default the slider has no position, so the response stays empty until the candidate moves it. */
export const NoDefaultStartsEmpty: StoryObj = {
  render: () => item(withoutDefault),
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByShadowRole<QtiSliderInteraction>('slider');
    await slider.updateComplete;

    expect(slider.response).toBeNull();
    expect(slider.internals.ariaValueNow).toBeNull();
    expect(responseOf(canvasElement)).toBeNull();
  }
};

/** Moving the slider replaces the default, and the item follows. */
export const DragOverridesDefault: StoryObj = {
  render: () => item(withDefault),
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByShadowRole<QtiSliderInteraction>('slider');
    await waitFor(() => expect(slider.internals.ariaValueNow).toBe('3'));

    // The knob has no role of its own; it is the drag handle inside the slider's shadow root.
    const knob = slider.shadowRoot?.querySelector('#knob') as HTMLElement;
    const rail = slider.shadowRoot?.querySelector('#rail') as HTMLElement;
    await drag(knob, { delta: { x: rail.getBoundingClientRect().width, y: 0 }, duration: 100 });

    await waitFor(() => expect(slider.internals.ariaValueNow).toBe('5'));
    expect(responseOf(canvasElement)).toBe('5');
  }
};
