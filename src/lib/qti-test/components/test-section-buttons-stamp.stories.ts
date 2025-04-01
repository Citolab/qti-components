import { expect, fireEvent, fn } from '@storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { createRef, ref } from 'lit/directives/ref.js';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestSectionButtonsStamp } from './test-section-buttons-stamp';
import type { QtiAssessmentStimulusRef } from '../../qti-components';

import '../../../../.storybook/utilities.css';

const { events, args, argTypes, template } = getStorybookHelpers('test-section-buttons-stamp');

type Story = StoryObj<TestSectionButtonsStamp & typeof args>;

const meta: Meta<TestSectionButtonsStamp> = {
  component: 'test-section-buttons-stamp',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: args =>
    html` <qti-test navigate="item">
      <!-- <template item-ref><div style="border:2px solid red">{{ xmlDoc }}</div></template> -->
      <test-navigation>
        ${template(
          args,
          html`<template>
            <test-section-link section-id="{{ item.identifier }}"> {{ item.identifier }} </test-section-link>
          </template>`
        )}
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navInfoStart = await canvas.findByShadowText('info-start');
    const navBasic = await canvas.findByShadowText('basic');
    const navAdvanced = await canvas.findByShadowText('advanced');
    const navInfoEnd = await canvas.findByShadowText('info-end');

    const firstItem = await canvas.findByShadowTitle('Examples');
    expect(firstItem).toBeInTheDocument();

    // Spy on event listener
    const eventSpy = fn();
    canvasElement.addEventListener('qti-assessment-stimulus-ref-connected', eventSpy);

    await fireEvent.click(navInfoStart);
    await fireEvent.click(navBasic);

    // Wait until the event has been triggered four times
    await new Promise<void>(resolve => {
      const checkEventCount = () => {
        if (eventSpy.mock.calls.length === 4) {
          fireEvent.click(navAdvanced);
          resolve();
        } else {
          setTimeout(checkEventCount, 10);
        }
      };
      checkEventCount();
    });

    await fireEvent.click(navInfoEnd);
    const lastItem = await canvas.findByShadowTitle('Info End');
    expect(lastItem).toBeInTheDocument();
  }
};

export const StimulusDeliveryPlatform: Story = {
  render: args => {
    const placeholderRef = createRef<HTMLElement>();
    return html` <qti-test
      @qti-assessment-stimulus-ref-connected=${async (e: Event) => {
        e.preventDefault(); // this prevents the default behaviour of the item to set the stimulus content
        const stimulusRef = e.composedPath()[0] as QtiAssessmentStimulusRef;
        stimulusRef.updateStimulusRef(placeholderRef.value);
      }}
    >
      <test-navigation>
        ${template(
          args,
          html`<template>
            <test-section-link section-id="{{ item.identifier }}"> {{ item.identifier }} </test-section-link>
          </template>`
        )}
        <div class="flex">
          <div class="qti-shared-stimulus" ${ref(placeholderRef)}></div>
          <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        </div>
      </test-navigation>
    </qti-test>`;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navInfoStart = await canvas.findByShadowText('info-start');
    const navBasic = await canvas.findByShadowText('basic');
    const navAdvanced = await canvas.findByShadowText('advanced');
    const navInfoEnd = await canvas.findByShadowText('info-end');

    const firstItem = await canvas.findByShadowTitle('Examples');
    expect(firstItem).toBeInTheDocument();
    await fireEvent.click(navInfoStart);
    await fireEvent.click(navBasic);
    await fireEvent.click(navAdvanced);
    await fireEvent.click(navInfoEnd);
    const lastItem = await canvas.findByShadowTitle('Info End');
    expect(lastItem).toBeInTheDocument();
  }
};
