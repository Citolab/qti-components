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
    const [itemIndex, setItemIndex] = useState<number | null>(null);

    useEffect(() => {
      if (itemRefEls.current.length === 0) return;
      if (itemIndex === null) return;

      const itemRefEl = itemRefEls.current[testEl.value.context.itemIndex];
      const uri = `${args.serverLocation}/${args.qtipkg}/items/${itemRefEl.href}`;

      const controller = new AbortController();
      const signal = controller.signal;

      const fetchXml = async () => {
        try {
          const xmlFetch = await fetch(uri, { signal });
          const xmlText = await xmlFetch.text();
          itemRefEl.itemLocation = `${args.serverLocation}/${args.qtipkg}/items/`;
          console.log('useEffect: set ItemXML');
          itemRefEl.xml = xmlText;
        } catch (error) {
          console.error(error);
        }
      };

      fetchXml();

      return () => {
        controller.abort();
      };
    }, [itemIndex, itemRefEls, args.qtipkg]);

    return html`
      <div
        @register-qti-assessment-item-ref=${e => itemRefEls.current.push(e.target)}
        @on-test-set-index=${({ detail: index }) => {
          console.log('setXML = ""');
          if (itemRefEls.current[itemIndex]) itemRefEls.current[itemIndex].xml = ''; // clear the old item
          setItemIndex(index);
        }}
      >
        index: ${itemIndex}
        <qti-assessment-test ${ref(testEl)}>
          <test-progress></test-progress>
          <test-next>NEXT</test-next>
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
