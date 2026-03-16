import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { StoryObj, Meta } from '@storybook/web-components-vite';
import type { QtiHottextInteraction } from './qti-hottext-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-hottext-interaction');

type Story = StoryObj<QtiHottextInteraction & typeof args>;

/**
 *
 * ### [3.2.7 Hot Text Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.sbnpx830yzqu)
 * presents a set of choices to the candidate represented as selectable runs of text embedded within a surrounding context, such as a passage of text.
 *
 */
const meta: Meta<QtiHottextInteraction> = {
  component: 'qti-hottext-interaction',
  title: '07 Hot Text',
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

export const Multiple: Story = {
  render: args =>
    template(
      args,
      html`
        <p>
          Sponsors of the Olympic Games
          <qti-hottext-interaction max-choices="2" response-identifier="RESPONSE" class="qti-input-control-hidden">
            <qti-hottext identifier="A">who bought</qti-hottext> advertising time on United States television
            <qti-hottext identifier="B">includes</qti-hottext>
            <qti-hottext identifier="C">at least</qti-hottext> a dozen international firms
            <qti-hottext identifier="D">whose</qti-hottext> names are familiar to American consumers.
            <qti-hottext identifier="E">No error.</qti-hottext>
          </qti-hottext-interaction>
        </p>
      `
    )
};
