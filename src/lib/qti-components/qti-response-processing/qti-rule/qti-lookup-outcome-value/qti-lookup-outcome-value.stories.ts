import '@citolab/qti-components/qti-components';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { qtiTransformItem } from '@citolab/qti-components/qti-transformers';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import storyXML from './qti-lookup-outcome-value.xml?raw';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-lookup-outcome-variable'
};
export default meta;

// FIXME: Story can not be used as type Default:Story, got this error : 'Expected 2 arguments, but got 1.'
export const Default: Story = {
  render: args => {
    return html`${unsafeHTML(qtiTransformItem().parse(storyXML).html())}`;
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const assessmentItem = canvasElement.querySelector<QtiAssessmentItem>('qti-assessment-item');
    assessmentItem.updateResponseVariable('RAW_SCORE', '3');

    assessmentItem.processResponse();
    expect(assessmentItem.context.variables.find(v => v.identifier === 'SCORE').value).toEqual('2');
  }
};
