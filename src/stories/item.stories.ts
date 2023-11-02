import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { Meta, StoryObj } from '@storybook/web-components';

import { useEffect, useRef, useState, virtual } from 'haunted';

import '@citolab/qti-components/qti-components';

import packages from '../assets/packages.json';
import { qtiTransform } from '@citolab/qti-components/qti-transform';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';

const meta: Meta = {
  component: 'qti-item',
  decorators: [story => html`${virtual(story)()}`],
  argTypes: {
    view: {
      options: ['candidate', 'scorer'],
      control: { type: 'radio' }
    },
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    disabled: { control: { type: 'boolean' } }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'biologie',
    itemIndex: 0
  }
};

export default meta;

export const QtiItem = {
  render: (args, { argTypes, loaded: { loadeditems } }) => {
    const items: { href: string; identifier: string }[] = loadeditems.items;
    const [itemXML, setItemXML] = useState<string>();
    const divRef = createRef<HTMLDivElement>();
    const qtiAssessmentItemRef = useRef<QtiAssessmentItem>(null);

    const qtipkg = args.qtipkg;
    const itemIndex = args.itemIndex;

    useEffect(async () => {
      if (items == undefined) return;
      if (args.itemIndex > items.length) return;
      const item = items[args.itemIndex];

      const uri = `${args.serverLocation}/${args.qtipkg}/depitems/${item.href}`;
      const xmlFetch = await fetch(uri);
      const xmlText = await xmlFetch.text();

      const xml = qtiTransform(xmlText)
        .assetsLocation(`${args.serverLocation}/${args.qtipkg}/depitems/`)
        .removeNamesSpaces()
        .fnCh($ => $('qti-inline-choice span').contents().unwrap())
        .fnCh($ => $('*').remove('qti-stylesheet'))
        // .mathml()
        .xml();

      setItemXML(xml);
    }, [itemIndex, items, qtipkg]);

    // useEffect(async () => {
    //   qtiItemRef.current.aud
    // }, [args.view]);

    useEffect(async () => {
      qtiAssessmentItemRef.current.disabled = args.disabled;
    }, [args.disabled]);

    return html`
      <div
        ${ref(divRef)}
        @qti-interaction-changed=${action(`on-interaction-changed`)}
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
        @qti-item-first-updated=${({ detail: item }) => {
          qtiAssessmentItemRef.current = item;
          action(`qti-item-first-updated`);
        }}
      >
        ${unsafeHTML(itemXML)}
      </div>
    `;
  },
  loaders: [
    async args => {
      return {
        loadeditems: await fetch(`${args.args.serverLocation}/${args.args.qtipkg}/items.json`)
          .then(response => {
            if (response.status >= 400 && response.status < 600) {
              console.log('error');
            }
            return response.json();
          })
          .catch(error => console.log(error))
      };
    }
  ]
};
