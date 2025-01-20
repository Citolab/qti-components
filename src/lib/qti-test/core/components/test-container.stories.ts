import { expect } from '@storybook/test';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import { qtiTransformTest } from '../../../qti-transformers';

import type { TestContainer } from './test-container';
import type { Meta, StoryObj } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-container');

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
    return html`<qti-test>${template(args)}</qti-test>`;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const testElement = await canvas.findByShadowTitle('T1 - Test Entry - Item 1');
    expect(testElement).toBeInTheDocument();
  }
};

export const TestDoc: Story = {
  render: (_, { loaded: { testDoc } }) => {
    return html`
      <qti-test>
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
      <qti-test>
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
      <qti-test>
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
      </qti-test>
    `;
  },
  play: TestURL.play,
  tags: ['!autodocs']
};
