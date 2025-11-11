import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestStamp } from './test-stamp';

import './test-stamp';
import '../test-print-context/test-print-context';

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
        <!-- <test-print-context></test-print-context> -->
        ${template(args, html`<template>{{ test.title }}</template>`)}
        ${template(
          args,
          html`
            <template>
              <ul>
                <li>{{ test.identifier }}</li>
                <li>{{ test.title }}</li>
              </ul>

              <ul>
                <li>{{ testpart.items }}</li>
                <li>{{ testpart.active }}</li>
                <li>{{ testpart.identifier }}</li>
                <li>{{ testpart.navigationMode }}</li>
                <li>{{ testpart.submissionMode }}</li>
              </ul>

              <ul>
                <li>{{ section.title }}</li>
                <li>{{ section.active }}</li>
                <li>{{ section.identifier }}</li>

                <li>{{required}}</li>
                <li>{{fixed}}</li>
                <li>{{visible}}</li>
                <li>{{keepTogether}}</li>

                <li>{{ section.items }}</li>
              </ul>
              <template type="if" if="{{ testpart.items }}">
                <template type="repeat" repeat="{{ testpart.items }}">
                  <p>{{ item.identifier }}</p>
                </template>
              </template>
            </template>
          `
        )}
        ${template(
          args,
          html`
            <template>
              <template type="if" if="{{ section.items }}">
                <template type="repeat" repeat="{{ section.items }}">
                  <p>{{ item.identifier }}</p>
                </template>
              </template>
            </template>
          `
        )}
        ${template(args, html`<template>{{ item.identifier }}</template>`)}

        <test-container test-url="/assets/api/kennisnet-1/AssessmentTest.xml"></test-container>
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};
