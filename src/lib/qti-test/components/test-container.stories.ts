import { expect } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';
import { findByShadowTitle } from 'shadow-dom-testing-library';
import { TestContainer } from './test-container';

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

export const Default: Story = {
  render: args =>
    html` <qti-test testURL="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> ${template(args)} </qti-test>`,
  args: {},
  play: async ({ canvasElement }) => {
    const itemElement = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(itemElement).toBeInTheDocument();
  }
};
