import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestSectionButtonsStamp } from './test-section-buttons-stamp';

import '../../../../.storybook/utilities.css';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-section-buttons-stamp');

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
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        ${template(
          args,
          html`<template>
            <test-section-link section-id="{{ item.identifier }}"> {{ item.newIndex }} </test-section-link>
          </template>`
        )}
      </test-navigation>
    </qti-test>`
};

export const Title: Story = {
  render: () => html`
    <qti-test>
      <test-navigation
        .initContext=${[
          {
            identifier: 'ITEM001',
            title: 'Test title',
            volgnummer: 2
          },
          {
            identifier: 'ITEM002',
            title: 'Test title 2',
            volgnummer: 2
          }
        ]}
        .configContext=${{
          infoItemCategory: 'info'
        }}
        .sessionContext=${{
          navItemId: 'ITEM001'
        }}
      >
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        <test-section-buttons-stamp>
          <template>
            <test-section-link class="{{item.active ? 'active' : ''}}" section-id="{{ item.identifier }}">
              {{ item.title }}
            </test-section-link>
          </template>
        </test-section-buttons-stamp>
      </test-navigation>
    </qti-test>
  `
};
