import { html } from 'lit';

import './qti-graphic-associate-interaction';
import '../../qti-prompt/qti-prompt';
import '../qti-associable-hotspot';
import { action } from '@storybook/addon-actions';

export default {
  component: 'qti-graphic-associate-interaction',
  argTypes: {
    'min-associations': { control: { type: 'number' }, table: { category: 'QTI' } },
    'max-associations': { control: { type: 'number' }, table: { category: 'QTI' } },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } }
  }
};

export const Default = {
  render: args => html`
    <qti-graphic-associate-interaction
      response-identifier="RESPONSE"
      @qti-register-interaction=${action(`qti-register-interaction`)}
      @qti-interaction-response=${action(`qti-interaction-response`)}
      max-associations="3"
    >
      <qti-prompt> Mark the airline's new routes on the airport map: </qti-prompt>
      <img
        src="qti-graphic-associate-interaction/uk.png"
        alt="Map of United Kingdom airports"
        width="206"
        height="280"
      />
      <qti-associable-hotspot shape="circle" coords="78,102,8" identifier="A" match-max="3"></qti-associable-hotspot>
      <qti-associable-hotspot shape="circle" coords="117,171,8" identifier="B" match-max="3"></qti-associable-hotspot>
      <qti-associable-hotspot shape="circle" coords="166,227,8" identifier="C" match-max="3"></qti-associable-hotspot>
      <qti-associable-hotspot shape="circle" coords="100,102,8" identifier="D" match-max="3"></qti-associable-hotspot>
    </qti-graphic-associate-interaction>
  `
};
