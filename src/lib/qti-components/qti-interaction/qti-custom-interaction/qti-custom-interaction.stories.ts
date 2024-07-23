/* eslint-disable lit-a11y/obj-alt */
/* eslint-disable lit/no-invalid-html */
import { html } from 'lit';

import { qtiTransformItem } from 'src/lib/qti-transformers';
import './qti-custom-interaction';
// import itemXML from './qti-custom-interaction.xml?raw';
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

const ciXML = xml`<qti-custom-interaction
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
    </qti-custom-interaction>`;

export const TransformOriginal = {
  render: args =>
    qtiTransformItem()
      .parse(ciXML)
      .pciHooks('/qti-custom-interaction/ref')
      .fn(xmlFragment => {
        const qtiCustomInteraction = xmlFragment.querySelector('qti-custom-interaction');
        const qtiCustomInteractionObject = qtiCustomInteraction.querySelector('object');

        qtiCustomInteraction.setAttribute('data-base-item', '/qti-custom-interaction/items/');
        qtiCustomInteraction.setAttribute('data-base-ref', '/qti-custom-interaction/');
        qtiCustomInteraction.setAttribute('data', qtiCustomInteractionObject.getAttribute('data'));
        qtiCustomInteraction.setAttribute('width', qtiCustomInteractionObject.getAttribute('width'));
        qtiCustomInteraction.setAttribute('height', qtiCustomInteractionObject.getAttribute('height'));

        qtiCustomInteraction.removeChild(qtiCustomInteractionObject);
      })
      .htmldoc()
};
