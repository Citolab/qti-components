import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

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
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        ${template(
          args,
          html`<template>
            <test-section-link section-id="{{ item.identifier }}"> {{ item.identifier }} </test-section-link>
          </template>`
        )}
      </test-navigation>
    </qti-test>`
};
