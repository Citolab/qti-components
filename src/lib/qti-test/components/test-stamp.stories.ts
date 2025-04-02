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
        <dl style="display: grid; grid-template-columns: 1fr 1fr;">
          <dt>Testpart</dt>
          <dd>
            ${template(
              args,
              html`
                <template>
                  <template type="repeat" repeat="{{ testpart.items }}">
                    <p>{{ item.identifier }}</p>
                  </template>
                </template>
              `
            )}
          </dd>

          <dt>Section</dt>
          <dd>
            ${template(
              args,
              html`
                <template>
                  <template type="repeat" repeat="{{ section.items }}">
                    <p>{{ item.identifier }}</p>
                  </template>
                </template>
              `
            )}
          </dd>

          <dt>Item</dt>
          <dd>${template(args, html`<template>{{ item.identifier }}</template>`)}</dd>
        </dl>

        <h2></h2>

        <test-container test-url="/assets/api/kennisnet-1/AssessmentTest.xml"></test-container>
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};
