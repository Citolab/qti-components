import '@citolab/qti-components/qti-components';

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import packages from '../assets/packages.json';
import { fetchAssessmentFromManifest } from './fetch-item';

const meta: Meta = {
  title: 'Test',
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    }
  },
  args: {
    serverLocation: '/api',
    qtipkg: 'conformance'
  }
};

export default meta;
type Story = StoryObj;

export const Player: Story = {
  render: (_, { argTypes, loaded: { xml } }) => {
    return html` <qti-player> ${unsafeHTML(xml.assessmentXML)} </qti-player> `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchAssessmentFromManifest(`${args.serverLocation}/${args.qtipkg}`) })]
};

export const Custom: Story = {
  render: (_, { argTypes, loaded: { xml } }) => {
    return html`
      <qti-player>
        <qti-test>
          ${unsafeHTML(xml.assessmentXML)}

          <test-prev></test-prev>
          <test-paging-buttons> </test-paging-buttons>
          <test-next>Volgende</test-next>

          <test-show-index></test-show-index>
          <test-item-id></test-item-id>
          <test-print-score></test-print-score>
          <test-view></test-view>
          <test-scoring-buttons view="scorer"></test-scoring-buttons>
          <test-slider></test-slider>
          <test-progress></test-progress>
          <test-process-response>NAKIJKEN</test-process-response>
        </qti-test>
      </qti-player>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchAssessmentFromManifest(`${args.serverLocation}/${args.qtipkg}`) })]
};
