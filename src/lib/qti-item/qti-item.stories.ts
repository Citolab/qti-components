import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { useEffect, useRef, virtual } from 'haunted';
import { createRef, ref } from 'lit-html/directives/ref.js';

import '@citolab/qti-components/qti-components';
import { QtiItem } from '@citolab/qti-components/qti-item';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';

import packages from '../../assets/packages.json';
import { ManifestData, fetchManifestData, requestItem } from '@citolab/qti-components/qti-test';
import { xml } from 'lit-xml';

export default {
  component: 'qti-item',
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

export const Default = {
  render: args => {
    const assessmentItemRef = createRef<QtiItem>();

    const view = args.view;

    return html` <qti-item
      ${ref(assessmentItemRef)}
      @qti-interaction-changed=${action(`on-interaction-changed`)}
      @qti-outcome-changed=${action(`qti-outcome-changed`)}
      @qti-item-connected=${action(`qti-item-connected`)}
      .xml=${xml`<qti-assessment-item>
  <qti-item-body>
    <p>Look at the text in the picture.</p>
    <qti-choice-interaction  max-choices="1" response-identifier="RESPONSE">
      <qti-prompt>What does it say?</qti-prompt>
      <qti-simple-choice identifier="ChoiceA">You must stay with your luggage at all times.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">Do not let someone else look after your luggage.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceC">Remember your luggage when you leave.</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`.toString()}
    ></qti-item>`;
  }
};

export const Item = {
  decorators: [story => html`${virtual(story)()}`],
  render: (args, { argTypes, loaded: { manifestData } }) => {
    const md = manifestData as ManifestData;
    const qtiItemRef = useRef<QtiAssessmentItem>(null);
    const assessmentItemRef = createRef<QtiItem>();

    useEffect(async () => {
      const item = md.items[args.itemIndex];
      assessmentItemRef.value.xml = await requestItem(`${md.itemLocation}/${item.href}`);
    }, [args.itemIndex, md.items, args.qtipkg]);

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
      manifestData: await fetchManifestData(`${args.args.serverLocation}/${args.args.qtipkg}`)
    })
  ]
};
