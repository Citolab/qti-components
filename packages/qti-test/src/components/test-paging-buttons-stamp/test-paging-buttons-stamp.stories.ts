import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestPagingButtonsStamp } from './test-paging-buttons-stamp';

import '../../../../../.storybook/utilities.css';

const { events, args, argTypes, template } = getStorybookHelpers('test-paging-buttons-stamp');

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
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        ${template(
          args,
          html`<template>
            <test-item-link item-id="{{ item.identifier }}"> {{ item.index }} </test-item-link>
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
          navItemRefId: 'ITEM001'
        }}
      >
        <test-container test-url="/assets/api/kennisnet-1/AssessmentTest.xml"></test-container>
        <test-paging-buttons-stamp data-testid="paging-buttons">
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
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // expect(nextButton).toBeDisabled();
    const pagingButtons = await canvas.findByTestId('paging-buttons');
    await waitFor(
      () => {
        const button = pagingButtons.querySelector('test-item-link');
        if (!button) {
          throw new Error('interaction not loaded yet');
        }
      },
      { timeout: 5000 }
    );
    // const allButtons = pagingButtons.querySelectorAll('test-item-link');
    // waitFor(() => expect(allButtons[0].textContent).toBe(':'));
    // waitFor(() => expect(allButtons[1].textContent).toBe('1:Test title'));
    // await new Promise(resolve => setTimeout(resolve, 500));
    // await fireEvent.click(allButtons[6]);
    // await new Promise(resolve => setTimeout(resolve, 500));
    // waitFor(() => expect(allButtons[0].textContent).toBe(':'));
    // expect(allButtons[0].textContent).toBe('1:');
    // const firstItem = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    // expect(firstItem).toBeInTheDocument();
    // await new Promise(resolve => setTimeout(resolve, 50));
    // await fireEvent.click(linkButton);
    // await new Promise(resolve => setTimeout(resolve, 50));
    // const secondItem = await findByShadowTitle(canvasElement, 'T1 - Choice Interaction - Multiple Cardinality');
    // expect(secondItem).toBeInTheDocument();
    // await fireEvent.click(linkButton);
    // await new Promise(resolve => setTimeout(resolve, 50));
    // await fireEvent.click(linkButton);
    // await new Promise(resolve => setTimeout(resolve, 50));
    // expect(linkButton).toBeDisabled();
  }
};
