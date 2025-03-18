import { html } from 'lit';
import { useArgs } from '@storybook/preview-api';

import packages from '../assets/packages.json';
import { getManifestInfo } from '../lib/qti-loader';

import type { Meta, StoryObj } from '@storybook/web-components';

import '../../.storybook/utilities.css';

const meta: Meta = {
  title: 'Test',
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

    // nav-item-id=${ifDefined(args.itemIdentifier)}
    return html`
      <qti-test class="h-full" @qti-test-context-updated=${({ detail }) => {}}>
        <test-navigation
          auto-score-items
          class="flex h-full overflow-hidden"
          @qti-request-navigation=${({ detail }) => {
            updateArgs({ itemIdentifier: detail.id });
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
            <test-view>View</test-view>
            <test-container class="flex-1 overflow-auto p-2" test-url="${testURL}"></test-container>
            <nav class="flex justify-between p-2">
              <test-end-attempt>End attempt</test-end-attempt>
              <test-show-correct-response>Show Correct</test-show-correct-response>
              <test-prev>Vorige</test-prev>
              <test-next>Volgende</test-next>
            </nav>
          </div>
          <div class="overflow-auto" style="min-width: 600px; max-width: 600px">
            <test-print-item-variables></test-print-item-variables>
            <test-print-context></test-print-context>
          </div>
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
