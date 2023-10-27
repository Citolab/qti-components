import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { useRef, virtual } from 'haunted';
import '../../../qti-item';

import xml from './qti-media-interaction.xml?raw';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';

export default {
  component: 'qti-media-interaction',
  decorators: [story => html`${virtual(story)()}`],
  argTypes: {
    autostart: { type: 'boolean', description: '' },
    minPlays: { type: 'number', description: '' },
    maxPlays: { type: 'number', description: '' },
    loop: { type: 'boolean', description: '' }
    // coords: { type: 'object', description: '' },
  }
  // args: { autostart: false, minPlays: 0, maxPlays: 0, loop: false },
};

export const Default = {
  render: args => html`
    <qti-media-interaction
      autostart=${args.autostart}
      loop=${args.loop}
      min-plays=${args.minPlays}
      max-plays=${args.maxPlays}
      response-identifier="RESPONSE"
      @qti-interaction-response="${e => {
        action(e);
      }}"
      .response=${args.response}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
    >
      <qti-prompt>Play this video.</qti-prompt>
      <video width="320" height="240">
        <source src="qti-media-interaction/earth.mp4" type="video/mp4" />
        Your browser does not support the video tag
      </video>
    </qti-media-interaction>
  `,

  args: {}
};

export const Item = {
  render: () => {
    const qtiItemRef = useRef<QtiAssessmentItem>(null);
    return html`<qti-item
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
        @qti-interaction-changed=${action(`qti-interaction-changed`)}
        @qti-item-connected=${({ detail }) => (qtiItemRef.current = detail)}
        xml=${xml}
      ></qti-item>
      <button @click=${() => qtiItemRef.current.processResponse()}>PROCESS</button>`;
  }
};
