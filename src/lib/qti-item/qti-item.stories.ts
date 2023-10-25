import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { useEffect, useRef, virtual } from 'haunted';
import { createRef, ref } from 'lit-html/directives/ref.js';

import '@citolab/qti-components/qti-components';
import { QtiItem } from '@citolab/qti-components/qti-item';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';

import packages from '../../assets/api/packages.json';

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

export const QtiItemStory = {
  render: (args, { argTypes, loaded: { loadeditems } }) => {
    const items: { href: string; identifier: string }[] = loadeditems.items;

    const qtiItemRef = useRef<QtiAssessmentItem>(null);
    const assessmentItemRef = createRef<QtiItem>();

    useEffect(async () => {
      if (items == undefined) return;
      if (args.itemIndex > items.length - 1) return;
      const item = items[args.itemIndex];

      const uri = `${args.serverLocation}/${args.qtipkg}/depitems/${item.href}`;
      const xmlFetch = await fetch(uri);
      const xmlText = await xmlFetch.text();

      assessmentItemRef.value.xml = xmlText;
    }, [args.itemIndex, items, args.qtipkg]);

    const view = args.view;

    return html` <qti-item
        ${ref(assessmentItemRef)}
        .audienceContext=${{ view }}
        item-location=${`${args.serverLocation}/${args.qtipkg}/items/`}
        @qti-interaction-changed=${action(`on-interaction-changed`)}
        @qti-outcome-changed=${action(`qti-outcome-changed`)}
        @qti-item-connected=${({ detail: item }) => (qtiItemRef.current = item)}
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
