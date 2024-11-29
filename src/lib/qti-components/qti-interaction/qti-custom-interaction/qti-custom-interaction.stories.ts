import { html } from 'lit';

import './qti-custom-interaction';
import itemXML from './qti-custom-interaction.xml?raw';
import { qtiTransformItem } from '@citolab/qti-components/qti-transformers';
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

export const AbsolutePaths = {
  render: args => {
    return html`<qti-assessment-item time-dependent="false" label="32la7n">
      <qti-item-body class="defaultBody" xml:lang="nl-NL">
        <qti-custom-interaction
          response-identifier="RESPONSE"
          id="I5e526eed-d47d-44cb-b693-b684c0c1f7f2"
          data-base-ref="http://localhost:3333/application/convert-online/package/b8f677c918bc247c4fc5675eae33c666a74f635968483382b805f0516342e930"
          data-base-item="http://localhost:3333/application/convert-online/package/b8f677c918bc247c4fc5675eae33c666a74f635968483382b805f0516342e930"
          data="http://localhost:3333/application/convert-online/package/b8f677c918bc247c4fc5675eae33c666a74f635968483382b805f0516342e930/ref/9051-NaBB-duimpiano_1/json/manifest.json"
          width="454"
          height="505"
        ></qti-custom-interaction>
      </qti-item-body>
    </qti-assessment-item>`;
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
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
      .htmlDoc()
};

export const TransformItem = {
  render: args =>
    qtiTransformItem()
      .parse(itemXML)
      .path('/qti-custom-interaction/items/')
      .customInteraction('/qti-custom-interaction/', 'items/')
      .htmlDoc()
};
