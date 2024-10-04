/* eslint-disable lit-a11y/click-events-have-key-events */
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import packages from '../assets/packages.json';
import '../lib/qti-components';
import { QtiAssessmentItem } from '../lib/qti-components';
import '../lib/qti-player/components';
import '../lib/qti-player/css/test.css';
import '../lib/qti-test/qti-test';
import { QtiTest } from '../lib/qti-test/qti-test';
import { qtiTransformItem } from '../lib/qti-transformers';
import { fetchAssessmentFromManifest } from './fetch-item';
// import '../lib/qti-player/css/item.css';

const setSessionData = <T>(key: string, value?: T): void => sessionStorage.setItem(key, JSON.stringify(value));
const getSessionData = <T>(key: string): T | null =>
  sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null;

export interface ItemInfo {
  identifier: string;
  domains?: { title: string; colorIndex: number }[];
  thumbnail?: string;
  title: string;
}

const meta: Meta = {
  title: 'Test',
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    }
  },
  args: {
    serverLocation: '/api',
    qtipkg: 'conformance'
  },
  parameters: {
    layout: 'fullscreen'
  }
};
export default meta;
type Story = StoryObj;
export const Test: Story = {
  render: (
    args,
    { argTypes, loaded: { manifestData: jsonData } }: { argTypes: ArgTypes; loaded: Record<'manifestData', any> }
  ) => {
    const testRef = createRef<QtiTest | undefined | null>();
    const { itemLocation, assessmentLocation, testIdentifier, assessmentXML, items } = jsonData;

    const augmentedItems = items.map(item => ({
      identifier: item.identifier,
      thumbnail: 'https://via.placeholder.com/150',
      title: 'wadooo',
      domains: [
        {
          title: 'woei',
          colorIndex: '#ff0000'
        }
      ]
    })) as ItemInfo[];

    const changeItem = async identifier => {
      const itemRefEl = testRef.value.itemRefEls.get(identifier)!;
      if (!itemRefEl.xmlDoc) {
        itemRefEl.xmlDoc = await qtiTransformItem()
          .load(`${assessmentLocation}/${itemRefEl.href}`)
          .then(api => api.path(itemLocation).htmldoc());
      }
      testRef.value.itemRefEls.forEach(
        value => (value.style.display = value.identifier !== itemRefEl.identifier ? 'none' : 'block')
      );
    };
    return html`
      <qti-test
        ${ref(testRef)}
        .identifier=${testIdentifier}
        @qti-test-set-item=${e => changeItem(e.detail)}
        @qti-response-processed=${e => {}}
        @qti-item-connected=${e => {}}
        @qti-assessment-test-connected=${e => {
          /* e.target.context = testContext ? testContext : null; */
        }}
        @qti-outcome-changed=${_ => {
          /*setSessionData(sessionIdentifier, testRef.value!.context*/
        }}
        @qti-interaction-changed=${e => {
          const qtiAssessmentItem: QtiAssessmentItem = e.target;
          const scoreOutcomeIdentifier = qtiAssessmentItem.variables.find(v => v.identifier === 'SCORE');

          if (/*scoreOutcomeIdentifier.externalScored === null && */ qtiAssessmentItem.adaptive === 'false') {
            e.target.processResponse();
          }

          /*setSessionData(sessionIdentifier, testRef.value!.context*/
        }}
        class="flex h-dvh w-full flex-col"
      >
        <div class="flex gap-2 items-center">
          <button class="m-2 flex h-10 w-10 items-start justify-center rounded-full bg-primary p-2 text-primary-light">
            <hi-24-outline-arrow-left class="h-6 w-6 stroke-[2px]"></hi-24-outline-arrow-left>
          </button>
          <test-view-toggle> Nakijken </test-view-toggle>
          <test-auto-scoring></test-auto-scoring>
        </div>
        <div class="relative flex-1 min-h-2xl overflow-y-auto">
          <test-popover-thumbs
            popover
            id="popover-thumbs"
            class="bottom-0 left-0 right-0 z-20  max-h-full w-full overflow-y-auto bg-white/60 pb-4 backdrop-blur-xl"
          >
            <test-navigation-thumbs class="grid grid-cols-4 gap-4 px-4 md:grid-cols-6 lg:grid-cols-10">
              ${augmentedItems.map(
                item => html`
                  <button
                    identifier=${item.identifier}
                    class=${`relative border-2 border-b-4 bg-white p-2`}
                    @click=${e => {
                      changeItem(item.identifier);
                      e.target.closest('dialog').close();
                    }}
                  >
                    <img src=${item.thumbnail} alt=${item.title} />
                  </button>
                `
              )}
            </test-navigation-thumbs>
          </test-popover-thumbs>

          <test-popover-list
            popover
            id="popover-list"
            class="bottom-0 left-0 right-0 z-20  max-h-full w-full overflow-y-auto bg-white/60 backdrop-blur-xl"
          >
          </test-popover-list>

          ${unsafeHTML(assessmentXML)}
        </div>
        <div
          class="z-20 flex w-full items-center justify-between gap-2 border-t border-slate-200 bg-white p-2 lg:gap-4"
        >
          <button
            class="flex h-10 cursor-pointer items-center rounded bg-primary-light px-4 font-semibold text-primary-dark"
          >
            Inleveren
          </button>
          <div class="relative flex flex-1 items-center justify-center gap-2">
            <test-paging-tmpl-button class=" hidden md:flex md:gap-1" info-category="dep-informational">
              <template>
                <button
                  class="flex h-4 w-4 cursor-pointer items-center justify-center border-2"
                  aria-label="Button"
                ></button>
              </template>
            </test-paging-tmpl-button>
            <!-- <test-paging-buttons class="flex gap-1" max-displayed-items="100"></test-paging-buttons> -->

            <div class="flex gap-2 self-start lg:self-end">
              <button
                popovertarget="popover-thumbs"
                class="cursor-pointer rounded px-2 py-2 text-slate-500 ring-2 ring-inset ring-slate-300"
              >
                <hi-24-outline-squares-2x2 class="h-6 w-6 stroke-[2px] text-slate-500"></hi-24-outline-squares-2x2>
              </button>
              <button
                popovertarget="popover-list"
                class="cursor-pointer rounded px-2 py-2 text-slate-500 ring-2 ring-inset ring-slate-300"
              >
                <hi-24-outline-bars-3 class="h-6 w-6 stroke-[2px]"></hi-24-outline-bars-3>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2">
            <test-prev
              class="part[button]:disabled:bg-slate-300 flex cursor-pointer flex-nowrap text-nowrap rounded bg-primary py-2 pl-2 pr-2 font-semibold text-white"
            >
              <hi-24-outline-chevron-left class="h-6 w-6 stroke-[2px]"></hi-24-outline-chevron-left>
            </test-prev>
            <test-next
              class="part[button]:disabled:bg-slate-300 flex cursor-pointer flex-nowrap text-nowrap rounded bg-primary py-2 pl-2 pr-2 font-semibold text-white disabled:bg-slate-300 md:pl-4"
            >
              <div class="hidden md:flex">Volgende</div>
              <hi-24-outline-chevron-right class="h-6 w-6 stroke-[2px]"></hi-24-outline-chevron-right>
            </test-next>
          </div>
        </div>
        <div class="grid grid-cols-2">
          <div>
            <test-print-variables class="text-sm"></test-print-variables>
          </div>

          <dl>
            <dt class="font-bold">id :</dt>
            <dd><test-item-id></test-item-id></dd>

            <dt class="font-bold">title</dt>
            <dd><test-item-title></test-item-title></dd>
          </dl>
        </div>
      </qti-test>
    `;
  },
  loaders: [
    async ({ args }) => ({ manifestData: await fetchAssessmentFromManifest(`${args.serverLocation}/${args.qtipkg}`) })
  ]
};
