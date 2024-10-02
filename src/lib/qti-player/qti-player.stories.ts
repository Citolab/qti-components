/* eslint-disable lit-a11y/click-events-have-key-events */

import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import packages from '../../assets/packages.json';

import { signal } from '@lit-labs/preact-signals';
import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { fetchAssessmentFromManifest } from 'src/stories/fetch-item';
import '../qti-components';
import '../qti-test/qti-test';
import './qti-player';

// import 'virtual:uno.css';
// import assessment from '../../../public/assets/api/conformance/assessment.xml?raw';

export type ScoreType = 'response-processing' | 'api' | 'manual' | 'busy' | undefined;

const setSessionData = <T>(key: string, value?: T): void => sessionStorage.setItem(key, JSON.stringify(value));
const getSessionData = <T>(key: string): T | null =>
  sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null;

export interface ItemInfoExt extends ItemExtContext {
  // identifier: string;
  // href: string;
  // category: string;
  // --------------------------------------------------------------------------------
  scoreType?: ScoreType;
  answered?: boolean;
  score?: number;
  domains?: { title: string; colorIndex: number }[];
  thumbnail?: string;
  title: string;
  type: string;
  sequenceNumber: number;
  active: boolean;
}

import { createRef, ref } from 'lit/directives/ref.js';
import { ItemExtContext, TestContext } from '../qti-test/context/test.context';
import { QtiTest } from '../qti-test/qti-test';
import { qtiTransformItem } from '../qti-transformers';
import './css/item.css';
import './css/test.css';

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
  }
};
export default meta;
type Story = StoryObj;
export const QtiPlayer: Story = {
  render: (
    args,
    { argTypes, loaded: { manifestData: jsonData } }: { argTypes: ArgTypes; loaded: Record<'manifestData', any> }
  ) => {
    const { itemLocation, assessmentLocation, testIdentifier, assessmentXML } = jsonData;

    const sessionIdentifier = `qti-assessment-test-story-${args.qtipkg}-session`;
    const itemIdentifier: string = getSessionData('session') ? getSessionData('session') : null;
    const testRef = createRef<QtiTest | undefined | null>();

    const isThumbsOpen = signal<Boolean>(false);
    const isListOpen = signal<Boolean>(false);

    const viewMode = signal<'candidate' | 'scorer'>('candidate');

    const items = jsonData.items.map(item => ({
      ...item,
      thumbnail: 'https://via.placeholder.com/150',
      title: 'wadooo',
      answered: false,
      scoreType: 'manual',
      type: 'regular',
      active: false
    })) as ItemInfoExt[];

    const currentItem = items.find(i => i.identifier === itemIdentifier);
    // const sessionState = signal<SessionStateType>('started');
    // const showWarning = signal<'complete' | 'incomplete' | 'complete_scoring' | 'incomplete_scoring' | false>(false);
    // const submit = (force?: boolean) => {};

    const testContext = getSessionData(sessionIdentifier) as TestContext;
    const changeItem = async identifier => {
      setSessionData('session', identifier);

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
        @qti-assessment-test-connected=${e => {
          const assessmentTest = e.target;
          assessmentTest.context = testContext?.items ? testContext : null;
        }}
        @qti-outcome-changed=${() => {
          setSessionData(sessionIdentifier, testRef.value!.context);
        }}
        @qti-interaction-changed=${() => {
          setSessionData(sessionIdentifier, testRef.value!.context);
        }}
        @qti-assessment-item-first-updated=${() => {
          const assessmentItem = testRef?.value?.itemRefEls.get(itemIdentifier || '')?.assessmentItem;
          if (assessmentItem) {
            // assessmentItem.disabled = viewMode === 'scorer';
          }
        }}
        .itemIdentifier=${itemIdentifier}
        class="flex h-full w-full flex-col"
      >
        <dialog
          id="thumbpopover"
          popover
          class="absolute bottom-0 left-0 right-0 z-20 flex max-h-full flex-col gap-4 overflow-y-auto bg-white bg-white/60 p-4 pb-4 backdrop-blur-xl"
        >
          <div class="mt-1 flex justify-between gap-8 text-sky-800">
            <div class="font-semibold">Titel</div>
            <button
              @click=${() => (isThumbsOpen.value = false)}
              class="flex cursor-pointer gap-2 rounded border-none bg-white p-2 text-lg  font-bold text-sky-800  shadow-sm outline-none ring-transparent"
            >
              <hi-24-outline-x-mark class="h-6 w-6 stroke-[2px]"></hi-24-outline-x-mark>
            </button>
          </div>
          <test-navigation-thumbs class="grid grid-cols-4 gap-4 px-4 md:grid-cols-6 lg:grid-cols-10">
            ${items.map(
              item => html`
                <div
                  class=${`relative border-2 border-b-4 bg-white p-2`}
                  @click=${e => {
                    changeItem(item.identifier);
                    // isThumbsOpen.value = false;
                    e.target.closest('dialog').close();
                  }}
                >
                  <img src=${item.thumbnail} alt=${item.title} />
                </div>
              `
            )}
          </test-navigation-thumbs>
        </dialog>

        <div class="relative flex-grow overflow-hidden">
          <!-- <test-navigation
            id="listpopover"
            popover
            class="absolute bottom-0 left-0 right-0 z-20 flex max-h-full flex-col gap-4 overflow-y-auto bg-white/60 pb-4 backdrop-blur-xl"
          ></test-navigation> -->
        </div>

        <div
          className=" flex-col scrollbar-hide flex w-full  snap-x snap-mandatory  items-start overflow-x-scroll h-full overflow-y-hidden scroll-px-0 gap-0 px-0"
        >
          ${unsafeHTML(assessmentXML)}
        </div>

        ${viewMode.value === 'scorer'
          ? html`
              <div class="flex w-full flex-grow items-center  bg-slate-200 px-2">
                <div class="hidden flex-col justify-center text-lg font-semibold text-sky-800 md:flex">Punten</div>
                <test-scoring-buttons
                  .view=${'scorer'}
                  ...=${currentItem?.scoreType === 'api' || currentItem?.scoreType === 'manual'
                    ? {}
                    : { disabled: true }}
                ></test-scoring-buttons>
                ${viewMode.value === 'scorer' &&
                currentItem?.type !== 'info' &&
                html`<score-info
                  .scoreType=${currentItem?.scoreType}
                  .score=${currentItem?.score}
                  .answered=${currentItem?.answered}
                ></score-info>`}
              </div>
            `
          : nothing}

        <div class="flex gap-2">
          <button>
            <div class="m-2 flex h-10 w-10 items-start justify-center rounded-full bg-primary p-2 text-primary-light">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
          </button>
        </div>

        <div
          class="z-20 flex w-full  items-center justify-between gap-2 border-t border-slate-200 bg-white p-2 lg:gap-4"
        >
          <button
            class="flex h-10 cursor-pointer items-center rounded bg-primary-light px-4 font-semibold text-primary-dark"
            onclick="console.log('rapportage')"
          >
            Inleveren
          </button>
          <div class="relative flex flex-1 items-center justify-start gap-2">
            <test-paging-tmpl-button class="flex" info-category="">
              <template>
                <button
                  class="flex h-4 w-4 cursor-pointer items-center justify-center border-2"
                  aria-label="Button"
                ></button>
              </template>
            </test-paging-tmpl-button>
            <!-- <test-paging-buttons class="flex gap-1" max-displayed-items="100"></test-paging-buttons> -->

            <!-- <test-paging-tmpl-stampino class="flex">
              <template>
                <template type="repeat" repeat="{{ items }}">
                  <button
                    aria-label="Button"
                    identifier="{{ item.identifier }}"
                    ?category="{{ item.category }}"
                    class="
                      flex h-4 w-4 cursor-pointer items-center justify-center border-2
                      {{ item.type === 'regular' ? 'rounded-2xl' : '' }} 
                      {{ item.active ? '!border-sky-600' : '' }}
                      {{ item.answered ? 'bg-slate-300 shadow-sm' : '' }}
                      {{ item.correct ? 'bg-green-100 border-green-400' : '' }}
                      {{ item.incorrect ? 'bg-red-100 border-red-400' : '' }}"
                  ></button>
                </template>
              </template>
            </test-paging-tmpl-stampino> -->

            <div class="flex gap-2 self-start lg:self-end">
              <button
                popovertarget="thumbpopover"
                class="cursor-pointer rounded px-2 py-2 text-slate-500 ring-2 ring-inset ring-slate-300"
              >
                <hi-24-outline-squares-2x2 class="h-6 w-6 stroke-[2px] text-slate-500"></hi-24-outline-squares-2x2>
              </button>
              <button
                popovertarget="listpopover"
                class="cursor-pointer rounded px-2 py-2 text-slate-500 ring-2 ring-inset ring-slate-300"
              >
                <hi-24-outline-bars-3 class="h-6 w-6 stroke-[2px]"></hi-24-outline-bars-3>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2">
            <test-prev
              class="part[button]:disabled:bg-slate-300 flex cursor-pointer flex-nowrap text-nowrap rounded bg-primary py-2 pl-2 pr-2 font-semibold text-white md:pl-4"
            >
              <hi-24-outline-chevron-left class="h-6 w-6 stroke-[2px]"></hi-24-outline-chevron-left>
            </test-prev>
            <test-next
              class="part[button]:disabled:bg-slate-300 flex cursor-pointer flex-nowrap text-nowrap rounded bg-primary py-2 pl-2 pr-2 font-semibold text-white disabled:bg-slate-300 md:pl-4"
            >
              <div class="hidden md:flex">Volgende</div>
              <hi-24-outline-chevron-right class="h-6 w-6 stroke-[2px]"></hi-24-outline-chevron-right>
            </test-next>
            <test-view-toggle
              class="flex h-10 items-center gap-4 rounded bg-primary-light pl-2 font-bold text-primary-dark"
            >
              <div class="hidden md:flex">Nakijken</div>
            </test-view-toggle>
          </div>
        </div>
      </qti-test>
    `;
  },
  loaders: [
    async ({ args }) => ({ manifestData: await fetchAssessmentFromManifest(`${args.serverLocation}/${args.qtipkg}`) })
  ]
};
