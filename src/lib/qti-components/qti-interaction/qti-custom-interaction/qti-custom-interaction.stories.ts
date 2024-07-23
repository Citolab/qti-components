/* eslint-disable lit-a11y/obj-alt */
/* eslint-disable lit/no-invalid-html */
import { html } from 'lit';

import { qtiTransformItem } from 'src/lib/qti-transformers';
import './qti-custom-interaction';
import itemXML from './qti-custom-interaction.xml?raw';
export default {
  component: 'qti-custom-interaction'
};

const xml = String.raw;

export const Default = {
  render: args =>
    html` <qti-custom-interaction
      response-identifier="RESPONSE"
      id="Ie855768e-179b-4226-a30e-6ead190c14b7"
      height="370"
      width="467"
      data="../ref/6047-BiKB-bmi_467x370_29/json/manifest.json"
      data-base-item="/qti-custom-interaction/items/"
      data-base-ref="/qti-custom-interaction/"
      .response=${`{"data":["","3","","12","","4",""]}`}
    >
    </qti-custom-interaction>`
};

export const TransformXML = {
  render: args =>
    qtiTransformItem()
      .parse(
        xml`<qti-custom-interaction
        response-identifier="RESPONSE"
        id="Ie855768e-179b-4226-a30e-6ead190c14b7"
        data-dep-min-values="0"
      >
        <object
          type="application/javascript"
          height="370"
          width="467"
          data="../ref/6047-BiKB-bmi_467x370_29/json/manifest.json"
        >
          <param name="responseLength" value="1" valuetype="DATA" />
        </object>
      </qti-custom-interaction>`
      )
      .customInteraction('/qti-custom-interaction/', 'items/')
      .htmldoc()
};

export const TransformItem = {
  render: args =>
    qtiTransformItem()
      .parse(itemXML)
      .path('/qti-custom-interaction/items/')
      .customInteraction('/qti-custom-interaction/', 'items/')
      .htmldoc()
};
