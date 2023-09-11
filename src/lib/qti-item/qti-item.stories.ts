import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import { useEffect, useRef, useState, virtual } from 'haunted';

import '../qti-components';
import './qti-item';

import packages from '../../assets/api/packages.json';
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
    }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'biologie',
    itemIndex: 0
  }
};

export const QtiItem = {
  render: (args, { argTypes, loaded: { loadeditems } }) => {
    const items: { href: string; identifier: string }[] = loadeditems.items;
    const [itemXML, setItemXML] = useState<string>();
    const qtiItemRef = useRef<QtiAssessmentItem>(null);

    useEffect(async () => {
      if (items == undefined) return;
      if (args.itemIndex > items.length) return;
      const item = items[args.itemIndex];

      const uri = `${args.serverLocation}/${args.qtipkg}/items/${item.href}`;
      const xmlFetch = await fetch(uri);
      const xmlText = await xmlFetch.text();

      setItemXML(xmlText);
    }, [args.itemIndex, items, args.qtipkg]);

    const view = args.view;

    return html` <qti-item
        .audienceContext=${{ view }}
        item-location=${`${args.serverLocation}/${args.qtipkg}/items/`}
        @qti-interaction-changed=${action(`on-interaction-changed`)}
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
        @qti-item-connected=${({ detail: item }) => (qtiItemRef.current = item)}
        xml=${itemXML}
      ></qti-item>
      <button @click=${() => qtiItemRef.current.processResponse()}>PROCESS</button>`;
  },
  loaders: [
    async args => ({
      loadeditems: await fetch(`${args.args.serverLocation}/${args.args.qtipkg}/items.json`)
        .then(response => (response.ok ? response.json() : console.log('error')))
        .catch(console.log)
    })
  ]
};
