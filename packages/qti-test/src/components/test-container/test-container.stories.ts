import { expect } from 'storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import { qtiTransformTest } from '@qti-components/transformers';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../../tools/testing/test-utils';

import type { TestContainer } from './test-container';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-container');

type Story = StoryObj<TestContainer & typeof args>;

const meta: Meta<TestContainer & { 'test-url': string }> = {
  component: 'test-container',
  args: { ...args, 'test-url': '/assets/qti-conformance/Basic/T4-T7/assessment.xml' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const TestURL: Story = {
  render: args => {
    return html`<qti-test navigate="item">${template(args)}</qti-test>`;
  },
  play: async ({ canvasElement }) => {
    //getAssessmentItemFromTestContainerByDataTitle
    const testElement = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(testElement).toBeInTheDocument();
  }
};

export const TestDoc: Story = {
  render: (_, { loaded: { testDoc } }) => {
    return html`
      <qti-test navigate="item">
        <test-container .testDoc=${testDoc}></test-container>
      </qti-test>
    `;
  },
  loaders: [
    async ({ args }) => {
      const testDoc = qtiTransformTest()
        .load(args['test-url'])
        .then(api => api.htmlDoc());
      return { testDoc };
    }
  ],
  play: TestURL.play,
  tags: ['!autodocs']
};

export const TestXML: Story = {
  render: (_, { loaded: { testXML } }) => {
    return html`
      <qti-test navigate="item">
        <test-container .testXML=${testXML}></test-container>
      </qti-test>
    `;
  },
  loaders: [
    async ({ args }) => {
      const testXML = await qtiTransformTest()
        .load(args['test-url'])
        .then(api => api.xml());
      return { testXML };
    }
  ],
  play: TestURL.play,
  tags: ['!autodocs']
};

export const TestWithTemplate: Story = {
  render: args => {
    return html`
      <qti-test navigate="item">
        <test-navigation>
          <test-container test-url=${args['test-url']}>
            <template>
              <style>
                qti-assessment-test {
                  display: block;
                  border: 2px solid blue;
                }
              </style>
            </template>
          </test-container>
        </test-navigation>
      </qti-test>
    `;
  },
  play: TestURL.play,
  tags: ['!autodocs']
};
