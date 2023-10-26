import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { useEffect, useRef, virtual, useState } from 'haunted';

import '@citolab/qti-components/qti-test';
import '@citolab/qti-components/qti-components';
import { QtiAssessmentTest } from '@citolab/qti-components/qti-test';

import packages from '../../assets/api/packages.json';
import { ManifestData, fetchManifestData, requestItem } from './test-utils';
import { ifDefined } from 'lit/directives/if-defined.js';

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
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    'navigation-mode': {
      control: { type: 'radio' },
      options: ['linear', 'nonlinear']
    },
    'submission-mode': {
      control: { type: 'radio' },
      options: ['individual', 'simultaneous']
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
      console.log('Erbuiten', assessmentTestEl.value.signalContext.value);
    }, [assessmentTestEl]);

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
        @qti-outcome-changed=${() =>
          localStorage.setItem(
            `${md.testIdentifier}-assessment-test-context`,
            JSON.stringify(assessmentTestEl.value.context)
          )}
        @qti-interaction-changed=${() =>
          localStorage.setItem(
            `${md.testIdentifier}-assessment-test-context`,
            JSON.stringify(assessmentTestEl.value.context)
          )}
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

        <test-prev>PREV</test-prev>
        <test-paging-buttons></test-paging-buttons>
        <test-next>NEXT</test-next>
      </qti-assessment-test>
    `;
  },
  loaders: [
    async args => ({
      manifestData: await fetchManifestData(`${args.args.serverLocation}/${args.args.qtipkg}`)
    })
  ]
};
