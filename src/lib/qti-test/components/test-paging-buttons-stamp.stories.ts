import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestPagingButtonsStamp } from './test-paging-buttons-stamp';


const { events, args, argTypes, template } = getWcStorybookHelpers('test-paging-buttons-stamp');

type Story = StoryObj<TestPagingButtonsStamp & typeof args>;

const meta: Meta<TestPagingButtonsStamp> = {
  component: 'test-paging-buttons-stamp',
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
      <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
      ${template(
        args,
        html`<template>
          <test-item-link item-id="{{ item.identifier }}">
            <test-item-indicator item-id="{{ item.identifier }}">{{ item.newIndex }}</test-item-indicator>
          </test-item-link>
        </template>`
      )}
    </qti-test>`
};
