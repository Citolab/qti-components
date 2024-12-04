import type { Meta, StoryObj } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { TestPagingButtonsStamp } from './test-paging-buttons-stamp';
import { html } from 'lit';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-paging-buttons-stamp');

type Story = StoryObj<TestPagingButtonsStamp & typeof args>;

const meta: Meta<TestPagingButtonsStamp> = {
  title: 'qti-test/test-components/test-paging-buttons-stamp',
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
    html` <qti-test testURL="/assets/api/biologie/assessment.xml">
      <test-container></test-container>
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
