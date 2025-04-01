import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestStamp } from './test-stamp';

import './test-stamp';

const { events, args, argTypes, template } = getStorybookHelpers('test-stamp');

type Story = StoryObj<TestStamp & typeof args>;

const meta: Meta<TestStamp> = {
  component: 'test-stamp',
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
      <test-navigation>
        <strong>${template(args, html`<template>{{ item.identifier }}</template>`)}</strong>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};
