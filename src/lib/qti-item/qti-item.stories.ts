import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { QtiItem as QtiItemComponent } from '.';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { qtiTransform } from '../qti-transform/qti-transform';
import { useEffect, useState, virtual } from 'haunted';

import '../qti-components';
import './qti-item';

import packages from '../../assets/api/package.json';

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
    scales: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    'in-shadow-root': { control: { type: 'boolean' } }
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

      const xml = qtiTransform(xmlText)
        .assetsLocation(`${args.serverLocation}/${args.qtipkg}/items/`)
        .removeNamesSpaces()
        .fnCh($ => $('qti-inline-choice span').contents().unwrap())
        .fnCh($ => $('*').remove('qti-stylesheet'))
        // .mathml()
        .xml();

      setItemXML(xml);
    }, [itemIndex, items, qtipkg]);

    const view = args.view;

    return html`
      <qti-item
        ${ref(itemContainer)}
        @qti-interaction-changed=${action(`on-interaction-changed`)}
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
        .qtiContext=${{ view }}
        ?scales=${args.scales}
        ?disabled=${args.disabled}
        ?readonly=${args.readonly}
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
