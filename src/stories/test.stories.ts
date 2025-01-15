import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import packages from '../assets/packages.json';
import { getManifestInfo } from '../lib/qti-loader';
import '../../.storybook/utilities.css';

const meta: Meta = {
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    }
  },
  args: {
    serverLocation: '/api',
    qtipkg: 'examples'
  },
  parameters: {
    layout: 'fullscreen'
  }
};
export default meta;
type Story = StoryObj;

export const Test: Story = {
  render: (_, { loaded: { testURL } }) => {
    return html`
      <qti-test class="flex flex-col h-full overflow-hidden">
        <test-container class="flex-1 overflow-auto p-2" test-url="${testURL}"></test-container>
        <nav class="flex justify-between p-2">
          <test-end-attempt>End attempt</test-end-attempt>
          <test-show-correct-response>Show Correct</test-show-correct-response>
          <test-prev>Vorige</test-prev>
          <test-next>Volgende</test-next>
        </nav>
      </qti-test>
    `;
  },
  loaders: [
    async ({ args }) => {
      const { testURL } = await getManifestInfo(`${args.serverLocation}/${args.qtipkg}/imsmanifest.xml`);
      return { testURL };
    }
  ]
};
