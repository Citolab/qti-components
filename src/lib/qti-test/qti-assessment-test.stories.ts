import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { useEffect, useRef, virtual, useState } from 'haunted';

import '../qti-components/index';
import './index';

import packages from '../../assets/api/packages.json';

// import { QtiAssessmentItemRef } from './index';
import { QtiAssessmentTest } from './qti-assessment-test';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

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
  render: (args, { argTypes, loaded: { loadeditems } }) => {
    const itemRefEls = useRef<Map<string, QtiAssessmentItemRef>>(new Map());

    function requestItem(identifier: string) {
      const fetchXml = async () => {
        for (const itemRef of itemRefEls.current.values()) {
          itemRef.xml = '';
        }
        const itemRefEl = itemRefEls.current.get(identifier);
        const xmlFetch = await fetch(`${args.serverLocation}/${args.qtipkg}/items/${itemRefEl.href}`); // , { signal });
        const xmlText = await xmlFetch.text();
        itemRefEl.xml = xmlText;
      };
      fetchXml();
    }

    return html`
      <button
        @click=${() => {
          const test = document.querySelector('qti-assessment-test') as QtiAssessmentTest;
          const context = test.context;
          localStorage.setItem('context', JSON.stringify(context));
        }}
      >
        Save
      </button>

      <button
        @click=${() => {
          const test = document.querySelector('qti-assessment-test') as QtiAssessmentTest;
          const context = JSON.parse(localStorage.getItem('context'));
          test.context = context;
        }}
      >
        Load
      </button>

      <qti-assessment-test
        @register-item-ref=${e => {
          itemRefEls.current.set(e.target.identifier, e.target);
          e.target.itemLocation = `${args.serverLocation}/${args.qtipkg}/items/${e.target.href}`;
        }}
        @on-test-set-item=${({ detail: identifier }) => requestItem(identifier)}
      >
        <test-show-index></test-show-index>
        <qti-test-part identifier="part1" navigation-mode="nonlinear" submission-mode="individual">
          <qti-assessment-section identifier="section-1" title="Section 1" visible="true" required="true">
            ${loadeditems.items.map(
              item =>
                html`<qti-assessment-item-ref identifier="${item.identifier}" href="${item.href}">
                </qti-assessment-item-ref>`
            )}
          </qti-assessment-section>
        </qti-test-part>

        <test-prev>PREV</test-prev>
        <test-progress></test-progress>
        <test-paging-buttons></test-paging-buttons>
        <test-paging-radio></test-paging-radio>
        <test-slider></test-slider>
        <test-next>NEXT</test-next>
        <test-show-correct>correct</test-show-correct>
        <test-print-variables></test-print-variables>
      </qti-assessment-test>
    `;
  },
  loaders: [
    async args => ({
      loadeditems: await fetch(`${args.args.serverLocation}/${args.args.qtipkg}/items.json`)
        .then(response => (response.ok ? response.json() : console.log('error')))
        .catch(console.log)
    })
  ]
};
