import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { useEffect, useRef, virtual, useState } from 'haunted';

import '@citolab/qti-components/qti-test';
import '@citolab/qti-components/qti-components';
import { QtiAssessmentTest } from '@citolab/qti-components/qti-test';

import packages from '../../assets/api/packages.json';
import { ManifestData, fetchManifestData, requestItem } from './test-utils';
import { ifDefined } from 'lit/directives/if-defined.js';
import './qti-test.css';

export default {
  title: 'qti-test',
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

export const QtiAssessmentTestStory = {
  render: (args, { argTypes, loaded: { manifestData } }) => {
    const md = manifestData as ManifestData;
    const assessmentTestEl = createRef<QtiAssessmentTest>();

    useEffect(() => {
      assessmentTestEl.value.signalContext.subscribe(a => {
        localStorage.setItem(`${md.testIdentifier}-assessment-test-context`, JSON.stringify(a));
      });
    }, [assessmentTestEl.value]);

    return html`
      <qti-assessment-test
        identifier="${md.testIdentifier}"
        ${ref(assessmentTestEl)}
        @on-test-set-item=${async ({ detail: identifier }) => {
          const itemRefEl = assessmentTestEl.value.itemRefEls.get(identifier.new);
          const newItemXML = await requestItem(`${md.itemLocation}/${itemRefEl.href}`);
          assessmentTestEl.value.itemRefEls.forEach((value, key) => (value.xml = ''));
          itemRefEl.xml = newItemXML;
        }}
        @qti-assessment-first-updated=${(e: CustomEvent<QtiAssessmentTest>) => {
          const storedTestContext = JSON.parse(localStorage.getItem(`${md.testIdentifier}-assessment-test-context`));
          storedTestContext && (assessmentTestEl.value.context = storedTestContext);
        }}
      >
        <test-show-index></test-show-index>
        <qti-test-part>
          <qti-assessment-section>
            ${md.items.map(
              item =>
                html`<qti-assessment-item-ref
                  item-location=${`${md.itemLocation}`}
                  identifier="${item.identifier}"
                  href="${item.href}"
                  category="${ifDefined(item.category)}"
                >
                </qti-assessment-item-ref>`
            )}
          </qti-assessment-section>
        </qti-test-part>

        <div class="nav">
          <test-prev>
            <svg class="arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clip-rule="evenodd"
              />
            </svg>
          </test-prev>

          <test-paging-buttons></test-paging-buttons>

          <test-next>
            <svg class="arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
          </test-next>
        </div>

        <test-slider></test-slider>
      </qti-assessment-test>
    `;
  },
  loaders: [
    async args => ({
      manifestData: await fetchManifestData(`${args.args.serverLocation}/${args.args.qtipkg}`)
    })
  ]
};
