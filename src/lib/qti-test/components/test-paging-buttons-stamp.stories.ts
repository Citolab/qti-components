import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestPagingButtonsStamp } from './test-paging-buttons-stamp';

import '../../../../.storybook/utilities.css';

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
      <test-navigation>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        ${template(
          args,
          html`<template>
            <test-item-link item-id="{{ item.identifier }}"> {{ item.newIndex }} </test-item-link>
          </template>`
        )}
      </test-navigation>
    </qti-test>`
};

export const Title: Story = {
  render: () => html`
    <qti-test auto-score-items>
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
        <test-container test-url="/assets/api/kennisnet-1/AssessmentTest.xml"></test-container>
        <test-paging-buttons-stamp>
          <style>
            dl {
              display: grid;
              grid-template-columns: max-content 1fr;
              column-gap: 10px;
            }
            dt {
              font-weight: bold;
            }
            dd {
              margin: 0; /* Remove default margin */
            }
          </style>
          <template>
            <test-item-link class="{{item.active ? 'active' : ''}}" item-id="{{ item.identifier }}"
              >{{ item.index }}:{{ item.title }}</test-item-link
            >
          </template>
        </test-paging-buttons-stamp>
      </test-navigation>
    </qti-test>
  `
};
