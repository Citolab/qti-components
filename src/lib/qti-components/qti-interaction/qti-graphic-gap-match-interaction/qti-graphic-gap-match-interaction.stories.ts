import { action } from '@storybook/addon-actions';
import { html } from 'lit';

import '../qti-associable-hotspot';
import '../qti-gap-img';
import './qti-graphic-gap-match-interaction';

const responses = ['[]', '["G1"]', '["W G1"]', '["Su G1","A G2"]'];

export default {
  component: 'qti-graphic-gap-match-interaction',

  // args: {
  //   disabled: false,
  //   readonly: false,
  // },
  argTypes: {
    response: {
      control: { type: 'radio', options: responses }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
};

export const Default = {
  render: args => html`
    <qti-prompt>
      <p>
        Some of the labels on the following diagram are missing: can you identify the correct three-letter codes for the
        unlabelled airports?
      </p>
    </qti-prompt>
    <qti-graphic-gap-match-interaction
      @qti-register-interaction="${e => {
        action(JSON.stringify(e.detail.responseIdentifier))();
      }}"
      @qti-interaction-response="${e => action(JSON.stringify(e.detail))()}"
      class="qti-choices-top"
      response-identifier="RESPONSE"
      shuffle="false"
      min-associations="0"
      max-associations="4"
      ?disabled="${args.disabled}"
    >
      <img
        alt="timeline from 1939 to 1991"
        src="qti-graphic-gap-match-interaction/timeline-558.png"
        height="326"
        width="558"
      />
      <qti-gap-img identifier="DraggerA" match-max="1">
        <img
          src="qti-graphic-gap-match-interaction/a-cw.png"
          alt="Choice A, The Cold War Ends"
          height="63"
          width="78"
        />
      </qti-gap-img>
      <qti-gap-img identifier="DraggerB" match-max="1">
        <img
          src="qti-graphic-gap-match-interaction/b-ww2.png"
          alt="Choice B, World War 2 Ends"
          height="63"
          width="78"
        />
      </qti-gap-img>
      <qti-gap-img identifier="DraggerC" match-max="1">
        <img
          src="qti-graphic-gap-match-interaction/c-vietnam.png"
          alt="Choice C, Vietnam Conflict Ends"
          height="63"
          width="78"
        />
      </qti-gap-img>
      <qti-gap-img identifier="DraggerD" match-max="1">
        <img src="qti-graphic-gap-match-interaction/d-bay.png" alt="Choice D, Bay of Pigs" height="63" width="78" />
      </qti-gap-img>
      <qti-associable-hotspot
        coords="55,256,133,319"
        identifier="A"
        match-max="1"
        shape="rect"
      ></qti-associable-hotspot>
      <qti-associable-hotspot
        coords="190,256,268,319"
        identifier="B"
        match-max="1"
        shape="rect"
      ></qti-associable-hotspot>
      <qti-associable-hotspot
        coords="309,256,387,319"
        identifier="C"
        match-max="1"
        shape="rect"
      ></qti-associable-hotspot>
      <qti-associable-hotspot
        coords="450,256,528,319"
        identifier="D"
        match-max="1"
        shape="rect"
      ></qti-associable-hotspot>
    </qti-graphic-gap-match-interaction>
  `
};
