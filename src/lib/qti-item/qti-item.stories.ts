import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { QtiItem as QtiItemComponent } from '.';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { qtiTransform } from '../qti-transform/qti-transform';
import { useEffect, useRef, useState, virtual } from 'haunted';

import * as cheerio from 'cheerio';
import '../qti-components';
import './qti-item';

import packages from '../../assets/api/package.json';
import { QtiAssessmentItem } from '../qti-components';

export default {
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
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'replay',
    itemIndex: 0
  }
};

export const QtiItem = {
  render: (args, { argTypes, loaded: { loadeditems } }) => {
    const items: { href: string; identifier: string }[] = loadeditems.items;
    const [itemXML, setItemXML] = useState<string>();
    const qtiItemRef = useRef<QtiAssessmentItem>(null);

    const itemContainer = createRef<QtiItemComponent>();

    const qtipkg = args.qtipkg;
    const itemIndex = args.itemIndex;

    useEffect(async () => {
      if (items == undefined) return;
      if (args.itemIndex > items.length) return;
      const item = items[args.itemIndex];

      const uri = `${args.serverLocation}/${args.qtipkg}/items/${item.href}`;
      const xmlFetch = await fetch(uri);
      const xmlText = await xmlFetch.text();

      setItemXML(xmlText);
    }, [itemIndex, items, qtipkg]);

    const view = args.view;

    return html`
      <qti-item
        ${ref(itemContainer)}
        item-location=${`${args.serverLocation}/${args.qtipkg}/items/`}
        @qti-interaction-changed=${action(`on-interaction-changed`)}
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
        @qti-item-connected=${({ detail }) => (qtiItemRef.current = detail)}
        .audienceContext=${{ view }}
        xml=${itemXML}
      >
      </qti-item>
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
