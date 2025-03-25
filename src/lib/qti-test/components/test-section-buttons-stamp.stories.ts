import { expect, fireEvent } from '@storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { findByShadowTitle, within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestSectionButtonsStamp } from './test-section-buttons-stamp';

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
    html` <qti-test>
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
    await fireEvent.click(navInfoStart);
    await fireEvent.click(navBasic);
    await fireEvent.click(navAdvanced);
    await fireEvent.click(navInfoEnd);
    const lastItem = await canvas.findByShadowTitle('Info End');
    expect(lastItem).toBeInTheDocument();
  }
};
