import { html } from 'lit';
import { useArgs } from '@storybook/preview-api';
import { ifDefined } from 'lit/directives/if-defined.js';

import packages from '../assets/packages.json';
import { getManifestInfo } from '../lib/qti-loader';

import type { Meta, StoryObj } from '@storybook/web-components';

import '../../.storybook/utilities.css';

const meta: Meta = {
  argTypes: {
    packages: {
      options: packages.packages,
      control: { type: 'radio' }
    }
  },
  args: {
    serverLocation: '/api',
    itemIdentifier: undefined,
    packages: 'examples'
  },
  parameters: {
    layout: 'fullscreen'
  }
};
export default meta;
type Story = StoryObj;

export const Test: Story = {
  render: (_, { loaded: { testURL } }) => {
    const [args, updateArgs] = useArgs();

    return html`
      <qti-test class="h-full" nav-item-id=${ifDefined(args.itemIdentifier)}>
        <test-navigation
          auto-score-items
          class="flex h-full overflow-hidden"
          @qti-request-navigation=${({ detail }) => {
            updateArgs({ itemIdentifier: detail.id });
            location.reload();
          }}
        >
          <test-paging-buttons-stamp class="flex flex-col gap-2 p-2 overflow-auto" style="min-width:160px">
            <template>
              <test-item-link class="btn btn-primary {{item.active ? 'active' : ''}}" item-id="{{ item.identifier }}">
                {{ item.index }} {{ item.title }} {{ item.difficulty }}
                <template type="if" if="{{ item.type === 'info' }}">
                  <i class="bi bi-info-circle"></i>
                </template>
              </test-item-link>
            </template>
          </test-paging-buttons-stamp>

          <div class="flex flex-col flex-1">
            <div style="padding:1rem; background-color:#ffeeee; color:#ff0000; margin-bottom:3px;">
              BEWARE CHANGING PACKAGE<br />
              <span style="color:#ff5555; margin-top:10px;"
                ><small
                  >can cause old testContext to be combined with new package. now solved with auto reload</small
                ></span
              >
            </div>

            <test-view>View</test-view>
            <test-container class="flex-1 overflow-auto p-2" test-url="${testURL}"></test-container>
            <nav class="flex justify-between p-2">
              <test-end-attempt>End attempt</test-end-attempt>
              <test-show-correct-response>Show Correct</test-show-correct-response>
              <test-prev>Vorige</test-prev>
              <test-next>Volgende</test-next>
            </nav>
          </div>
          <test-print-item-variables></test-print-item-variables>
        </test-navigation>
      </qti-test>
    `;
  },
  loaders: [
    async ({ args }) => {
      const { testURL } = await getManifestInfo(`${args.serverLocation}/${args.packages}/imsmanifest.xml`);
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
