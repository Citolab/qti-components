import { html } from 'lit';

import './qti-portable-custom-interaction';

export default {
  component: 'qti-portable-custom-interaction'
};

export const Default = {
  render: args =>
    html`<qti-portable-custom-interaction
      response-identifier="RESPONSE"
      module="pci-getallen"
      custom-interaction-type-identifier="getallenFormule"
      data-button-text="Berekenen"
      data-sum1="$1 * 12 + 3"
      data-sum2="$1 * 4 + 53"
      data-table-size="4"
    >
      <qti-interaction-modules>
        <qti-interaction-module
          id="pci-getallen"
          primary-path="/assets/qti-portable-custom-interaction/pci-getallen.js"
        ></qti-interaction-module>
      </qti-interaction-modules>
      <qti-interaction-markup></qti-interaction-markup>
    </qti-portable-custom-interaction>`
};
