import { html } from 'lit';

import packages from '../assets/packages.json';
import { getManifestInfo } from '../lib/qti-loader';

import type { Meta, StoryObj } from '@storybook/web-components';
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
      <qti-test class="h-full">
        <test-navigation class="flex h-full overflow-hidden">
          <test-paging-buttons-stamp class="flex flex-col gap-2 p-2 overflow-auto" style="min-width:160px">
            <template>
              <test-item-link item-id="{{ item.identifier }}"> {{ item.identifier }} </test-item-link>
            </template>
          </test-paging-buttons-stamp>

          <div class="flex flex-col flex-1">
            <test-view>View</test-view>
            <test-container class="flex-1 overflow-auto p-2" test-url="${testURL}"></test-container>
            <nav class="flex justify-between p-2">
              <test-end-attempt>End attempt</test-end-attempt>
              <test-show-correct-response>Show Correct</test-show-correct-response>
              <test-prev>Vorige</test-prev>
              <test-next>Volgende</test-next>
            </nav>
          </div>
        </test-navigation>
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

/*
        .context=${{
          items: [
            {
              identifier: 'INTRODUCTION',
              title: 'Introductie'
            },
            {
              identifier: 'ITEM001',
              title: 'Item 1'
            },
            {
              identifier: 'ITEM002',
              title: 'Item 2'
            },
            {
              identifier: 'ITEM003',
              title: 'Item 3'
            },
            {
              identifier: 'ITEM004',
              title: 'Item 4'
            },
            {
              identifier: 'ITEM005',
              title: 'Item 5'
            },
            {
              identifier: 'ITEM006',
              title: 'Item 6'
            }
          ],
          testOutcomeVariables: []
        }}
          */
