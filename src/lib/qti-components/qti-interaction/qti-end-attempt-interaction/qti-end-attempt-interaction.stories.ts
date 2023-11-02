import '@citolab/qti-components/qti-components';

import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/web-components';

import xml from './qti-end-attempt-interaction.xml?raw';
import { useRef, virtual } from 'haunted';
import { QtiAssessmentItem } from '../../index';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

const meta: Meta = {
  component: 'qti-end-attempt-interaction',
  decorators: [story => html`${virtual(story)()}`]
};
export default meta;

export const Default = {
  render: args => html`
    <qti-assessment-item
      @qti-register-interaction="${action(`qti-register-interaction`)}"
      @qti-interaction-response="${action(`qti-interaction-response`)}"
    >
      <qti-item-body>
        <qti-printed-variable class="qti-well" identifier="numAttempts"></qti-printed-variable>

        <qti-end-attempt-interaction title="test num attempts"></qti-end-attempt-interaction>
      </qti-item-body>
      <qti-response-processing> </qti-response-processing>
    </qti-assessment-item>
  `
};

export const Example = {
  render: () => {
    const qtiItemRef = useRef<QtiAssessmentItem>(null);
    return html` <qti-item
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
        @qti-interaction-changed=${action(`qti-interaction-changed`)}
        @qti-item-connected=${({ detail }) => (qtiItemRef.current = detail)}
        >${unsafeHTML(xml)}</qti-item
      >
      <button @click=${() => qtiItemRef.current.processResponse()}>PROCESS</button>`;
  }
};
