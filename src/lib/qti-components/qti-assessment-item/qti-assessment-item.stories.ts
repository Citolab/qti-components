import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { QtiAssessmentItem } from './qti-assessment-item';

const { events, args, argTypes, template } = getStorybookHelpers('qti-assessment-item');

type Story = StoryObj<QtiAssessmentItem & typeof args>;

/**
 * ### [3.1 Assessment Item](https://www.imsglobal.org/spec/qti/v3p0/impl#h.dltnnj87l0yj)
 * # qti-assessment-item
 */
const meta: Meta<QtiAssessmentItem> = {
  component: 'qti-assessment-item',
  args: {
    ...args,
    identifier: 'my-identifier'
  },
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
    html`${template(
      args,
      html`
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
          <qti-correct-response>
            <qti-value>ChoiceA</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
          <qti-default-value>
            <qti-value>0</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
            <qti-prompt>What does it say?</qti-prompt>
            <qti-simple-choice identifier="ChoiceA">You must stay with your luggage at all times.</qti-simple-choice>
            <qti-simple-choice identifier="ChoiceB">Do not let someone else look after your luggage.</qti-simple-choice>
            <qti-simple-choice identifier="ChoiceC">Remember your luggage when you leave.</qti-simple-choice>
          </qti-choice-interaction>
          <qti-end-attempt-interaction title="end attempt"></qti-end-attempt-interaction>
        </qti-item-body>
        <qti-response-processing
          template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"
        ></qti-response-processing>
      `
    )} `
};
