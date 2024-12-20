import { expect } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import { TestContainer } from './test-container';
import { qtiTransformTest } from '../../qti-transformers';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-container');

type Story = StoryObj<TestContainer & typeof args>;

const meta: Meta<TestContainer> = {
  component: 'test-container',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const TestURL: Story = {
  render: args =>
    html` <qti-test>
      ${template(args)}
      <script>
        component.testURL = '/assets/qti-conformance/Basic/T4-T7/assessment.xml';
      </script>
    </qti-test>`,
  args: {},
  play: async ({ canvasElement }) => {
    const itemElement = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(itemElement).toBeInTheDocument();
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
