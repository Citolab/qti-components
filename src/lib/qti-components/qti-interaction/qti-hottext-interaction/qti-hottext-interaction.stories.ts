import type { StoryObj, Meta } from '@storybook/web-components';
import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import type { QtiHottextInteraction } from './qti-hottext-interaction';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-hottext-interaction');

type Story = StoryObj<QtiHottextInteraction & typeof args>;

const meta: Meta<QtiHottextInteraction> = {
  component: 'qti-hottext-interaction',
  title: 'components/qti-hottext-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <p>
          Sponsors of the Olympic Games
          <qti-hottext identifier="A">who bought</qti-hottext> advertising time on United States television
          <qti-hottext identifier="B">includes</qti-hottext>
          <qti-hottext identifier="C">at least</qti-hottext> a dozen international firms
          <qti-hottext identifier="D">whose</qti-hottext> names are familiar to American consumers.
          <qti-hottext identifier="E">No error.</qti-hottext>
        </p>
      `
    )
};

export const Button = {
  render: Default.render,
  args: {
    maxChoices: 1,
    class: ['qti-input-control-hidden']
  }
};

export const Hidden = {
  render: Default.render,
  args: {
    maxChoices: 1,
    class: ['qti-unselected-hidden']
  }
};
