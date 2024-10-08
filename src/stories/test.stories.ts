/* eslint-disable lit-a11y/click-events-have-key-events */
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import packages from '../assets/packages.json';
import '../lib/qti-components';
import { OutcomeVariable, QtiAssessmentItem } from '../lib/qti-components';
import '../lib/qti-player/components';
import '../lib/qti-player/css/index.css';
import '../lib/qti-test/qti-test';

import { QtiTest } from '../lib/qti-test/qti-test';
import { qtiTransformItem } from '../lib/qti-transformers';
import { fetchAssessmentFromManifest } from './fetch-item';

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
  args: {
    qtipkg: 'biologie'
  },

  render: (
    args,
    { argTypes, loaded: { manifestData: jsonData } }: { argTypes: ArgTypes; loaded: Record<'manifestData', any> }
  ) => {
    const testRef = createRef<QtiTest | undefined | null>();
    const { itemLocation, assessmentLocation, testIdentifier, assessmentXML, items } = jsonData;

    let sequence = 1;
    const augmentedItems = items.map(item => {
      const sequenceNumber = item.category === 'dep-informational' ? 'info' : sequence++;
      return {
        ...item,
        thumbnail: 'https://via.placeholder.com/150',
        title: item.identifier,
        sequenceNumber: sequenceNumber
      };
    });

    let oldIdentifier = null;
    const changeItem = async identifier => {
      const itemRefEl = testRef.value.itemRefEls.get(identifier)!;
      if (!itemRefEl.xmlDoc) {
        itemRefEl.xmlDoc = await qtiTransformItem()
          .load(`${assessmentLocation}/${itemRefEl.href}`)
          .then(api => api.path(itemLocation).htmldoc());
      }
      if (oldIdentifier != null) {
        testRef.value.itemRefEls.get(oldIdentifier).xmlDoc = null;
      }
      oldIdentifier = identifier;
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
          const scoreOutcomeIdentifier = qtiAssessmentItem.variables.find(
            v => v.identifier === 'SCORE'
          ) as OutcomeVariable;

          if (scoreOutcomeIdentifier.externalScored === null && qtiAssessmentItem.adaptive === 'false') {
            e.target.processResponse();
          }

          /*setSessionData(sessionIdentifier, testRef.value!.context*/
        }}
        class="flex h-full w-full flex-col"
      >
        <div class="flex gap-2 items-center p-2">
          <button class="btn btn-primary rounded-circle">
            <hi-24-outline-arrow-left></hi-24-outline-arrow-left>
          </button>
          <test-view-toggle>Nakijken</test-view-toggle>
          <div class="flex gap-2">
            <test-scoring-buttons view="scorer"></test-scoring-buttons>
            <test-scoring-feedback
              view="scorer"
              data-text-no-response="je hebt geen antwoord ingevuld"
              data-text-correct="je antwoord is goed"
              data-text-incorrect="je antwoord is fout"
            ></test-scoring-feedback>
          </div>
        </div>
        <div class="relative flex-1 overflow-auto">
          <div popover id="popover-thumbs" class="w-full">
            <div class="flex flex-wrap gap-2">
              ${augmentedItems.map(
                item => html`
                  <test-item-link item-id=${item.identifier} class="relative">
                    <img src=${item.thumbnail} alt=${item.title} />
                    <test-item-indicator
                      item-id=${item.identifier}
                      info-category="dep-informational"
                      class="absolute left-2 top-2"
                    >
                    </test-item-indicator>
                  </test-item-link>
                `
              )}
            </div>
          </div>

          <div popover id="popover-list" class="w-full absolute bottom-0">
            <div class="columns-1 md:columns-4">
              ${augmentedItems.map(
                item => html`
                  <test-item-link item-id=${item.identifier} class="flex items-center gap-2">
                    <test-item-indicator item-id=${item.identifier} info-category="dep-informational">
                    </test-item-indicator>
                    <div class="flex justify-between gap-1 w-full">
                      <div class="flex-1">${item.category !== 'dep-informational' ? item.title : html`info`}</div>
                      <div>${item.sequenceNumber}</div>
                    </div>
                  </test-item-link>
                `
              )}
            </div>
          </div>

          <test-assessment-xml-container class="block p-2" .xmlDoc=${assessmentXML}> </test-assessment-xml-container>
        </div>

        <div class="flex w-full items-center justify-between p-2 gap-2">
          <button class="btn btn-primary">Inleveren</button>
          <div class="flex items-center">
            <div class="hidden md:flex flex-1 gap-1 overflow-auto w-full">
              ${augmentedItems.map(
                item => html`
                  <test-item-link item-id=${item.identifier}>
                    <test-item-indicator item-id=${item.identifier} info-category="dep-informational">
                    </test-item-indicator>
                  </test-item-link>
                `
              )}
            </div>

            <div class="flex gap-2 ">
              <button popovertarget="popover-thumbs" class="btn btn-outline">
                <hi-24-outline-squares-2x2></hi-24-outline-squares-2x2>
              </button>
              <button popovertarget="popover-list" class="btn btn-outline">
                <hi-24-outline-bars-3></hi-24-outline-bars-3>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <test-prev class="btn btn-primary" role="button">
              <hi-24-outline-chevron-left></hi-24-outline-chevron-left>
            </test-prev>
            <test-next class="btn btn-primary" role="button">
              <div class="hidden md:flex">Volgende</div>
              <hi-24-outline-chevron-right></hi-24-outline-chevron-right>
            </test-next>
          </div>
        </div>
      </qti-test>
    `;
  },

  loaders: [
    async ({ args }) => ({ manifestData: await fetchAssessmentFromManifest(`${args.serverLocation}/${args.qtipkg}`) })
  ]
};

/* <test-paging-buttons class="flex gap-1" max-displayed-items="100"></test-paging-buttons> */
/*

        <div class="grid grid-cols-2">
          <div>
            <test-print-variables class="text-sm"></test-print-variables>
          </div>

          <div>
            <test-item-debug></test-item-debug>
          </div>
        </div> 

        */
/*
            <test-paging-tmpl-button class=" hidden md:flex md:gap-1" info-category="dep-informational">
              <template>
                <style>
                  @scope {
                    img {
                      border: 5px solid black;
                      background-color: goldenrod;
                    }
                  }
                </style>
                <button
                  class="flex h-4 w-4 cursor-pointer items-center justify-center border-2"
                  aria-label="Button"
                ></button>
              </template>
            </test-paging-tmpl-button>
            */
