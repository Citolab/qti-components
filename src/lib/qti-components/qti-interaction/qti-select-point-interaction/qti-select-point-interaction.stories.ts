import { html } from 'lit';

import '../../index';
import { action } from '@storybook/addon-actions';

export default {
  component: 'qti-select-point-interaction'
};

export const Default = {
  render: args =>
    html` <qti-select-point-interaction
      @qti-register-interaction=${action(`qti-register-interaction`)}
      @qti-interaction-response=${action(`qti-interaction-response`)}
      max-choices="1"
      response-identifier="RESPONSE1"
    >
      <qti-prompt>Mark Edinburgh on this map of the United Kingdom.</qti-prompt>

      <img src="qti-select-point-interaction/uk.png" height="280" width="206" />
    </qti-select-point-interaction>`
};
