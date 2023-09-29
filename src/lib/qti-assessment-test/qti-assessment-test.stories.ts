import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { useEffect, useRef, virtual, useState } from 'haunted';

import '../qti-components/index';
import './index';

import packages from '../../assets/api/packages.json';

import { QtiAssessmentTest } from './qti-assessment-test';
import { QtiAssessmentItemRef } from './index';

export default {
  component: 'qti-assessment-test',
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

export const QtiTest = {
  render: (args, { argTypes, loaded: { loadeditems } }) => {
    if (!loadeditems) return html` <strong>cannot connect to server: ${args.serverLocation}</strong>`;

    const testEl = createRef<QtiAssessmentTest>();
    const itemRefEls = useRef<QtiAssessmentItemRef[]>([]);
    const [itemIndex, setItemIndex] = useState<number>(0);

    useEffect(async () => {
      if (itemRefEls.current.length === 0) return;
      const itemRefEl = itemRefEls.current[testEl.value.context.itemIndex];

      const uri = `${args.serverLocation}/${args.qtipkg}/items/${itemRefEl.href}`;
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1001) + 500));
      const xmlFetch = await fetch(uri);
      const xmlText = await xmlFetch.text();
      itemRefEl.itemLocation = `${args.serverLocation}/${args.qtipkg}/items/`;
      itemRefEl.xml = xmlText;
      // itemRefEl.audienceContext.view = args.view;
    }, [itemIndex, itemRefEls, args.qtipkg]);

    const view = args.view;

    // https://www.imsglobal.org/spec/qti/v3p0/impl#h.2rwe0ikqhcpe
    return html`
      <div
        @register-qti-assessment-item-ref=${e => itemRefEls.current.push(e.target)}
        @on-test-request-item=${({ detail: index }) => {
          itemRefEls.current[itemIndex].xml = ''; // clear the old item
          setItemIndex(index);
        }}
      >
        index: ${itemIndex}
        <qti-assessment-test ${ref(testEl)}>
          <test-progress></test-progress>

          <qti-test-part>
            <qti-assessment-section>
              ${loadeditems.items.map(
                (item, index) =>
                  html`<qti-assessment-item-ref
                    identifier="${item.identifier}"
                    href="${item.href}"
                  ></qti-assessment-item-ref>`
              )}
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </div>
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
