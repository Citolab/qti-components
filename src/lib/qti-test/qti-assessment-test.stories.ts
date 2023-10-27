import { html } from 'lit';
import { virtual } from 'haunted';

import '@citolab/qti-components/qti-test';
import '@citolab/qti-components/qti-components';

import packages from '../../assets/packages.json';
import { fetchManifestData } from './test-utils';
import './qti-test.css';
import { QtiTestHaunted } from './qti-test.haunted';

export default {
  component: 'qti-assessment-test',
  argTypes: {
    view: {
      options: ['candidate', 'scorer'],
      control: { type: 'radio' }
    },
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'biologie'
  },
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      values: [{ name: 'gray', value: '#eeeeee', default: true }]
    }
  },
  decorators: [story => html`${virtual(story)()}`]
};

export const Default = {
  render: (args, { argTypes, loaded: { manifestData } }) => {
    return html`${QtiTestVirtual(manifestData)}`;
  },
  loaders: [
    async args => ({
      manifestData: await fetchManifestData(`${args.args.serverLocation}/${args.args.qtipkg}`)
    })
  ]
};

const QtiTestVirtual = virtual(QtiTestHaunted);
