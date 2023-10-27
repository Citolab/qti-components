import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import '@citolab/qti-components/qti-test';
import '@citolab/qti-components/qti-components';

import { packages } from '../../assets/packages.json';
export default {
  component: 'qti-test',
  argTypes: {
    view: {
      options: ['candidate', 'scorer'],
      control: { type: 'radio' }
    },
    qtipkg: {
      options: packages,
      control: { type: 'radio' }
    }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: packages[0]
  }
};

export const Default = {
  render: args => {
    return html`
      <qti-test
        @qti-outcome-changed=${action('qti-outcome-changed')}
        @qti-interaction-changed=${action('qti-interaction-changed')}
        package-uri="${args.serverLocation}/${args.qtipkg}/"
      >
      </qti-test>
    `;
  }
};
