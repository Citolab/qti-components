import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSliderInteraction } from '../qti-slider-interaction';

type Story = StoryObj<QtiSliderInteraction>;

/**
 * ## Form Association Stories
 *
 * The slider interaction inside a plain `<form>`: its value reaches `FormData` under its `name` once
 * the candidate moves it, and `form.reset()` empties it. A slider has no minimum or maximum rule of
 * its own, so it never blocks a submit.
 */
const meta: Meta<QtiSliderInteraction> = {
  component: 'qti-slider-interaction',
  title: 'Interactions/Slider/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

export const FormDataAndReset: Story = {
  name: 'FormData - holds the value, reset empties it',
  render: () => html`
    <form role="form" @submit=${(e: Event) => e.preventDefault()}>
      <qti-slider-interaction
        name="RESPONSE"
        response-identifier="RESPONSE"
        lower-bound="1"
        upper-bound="5"
        step="1"
      ></qti-slider-interaction>
      <input type="submit" value="submit" />
    </form>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form');
    const slider = canvas.getByRole<QtiSliderInteraction>('slider');
    await slider.updateComplete;

    await step('an untouched slider submits nothing', async () => {
      expect(new FormData(form).get('RESPONSE')).toBe(null);
      expect(form.checkValidity()).toBe(true);
    });

    await step('moving it puts its value in FormData', async () => {
      // The knob has no role of its own; it is the drag handle inside the slider's shadow root.
      const knob = slider.shadowRoot?.querySelector('#knob') as HTMLElement;
      const rail = slider.shadowRoot?.querySelector('#rail') as HTMLElement;
      await drag(knob, { delta: { x: rail.getBoundingClientRect().width, y: 0 }, duration: 100 });
      await waitFor(() => expect(slider.internals.ariaValueNow).toBe('5'));
      expect(new FormData(form).get('RESPONSE')).toContain('5');
    });

    await step('form.reset() empties it', async () => {
      form.reset();
      await slider.updateComplete;
      expect(slider.response).toBe(null);
      expect(new FormData(form).get('RESPONSE')).toBe(null);
    });
  }
};
