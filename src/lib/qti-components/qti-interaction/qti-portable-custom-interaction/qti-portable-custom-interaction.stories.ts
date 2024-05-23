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

// the data-base-url should be filled during import/upload the content package. This is needed to find /modules/module_resolution.js
export const GraphAmpIO = {
  render: args =>
    html`<qti-portable-custom-interaction
      custom-interaction-type-identifier="urn:edmentum.com:pci:2019:graphInteraction"
      data-height="360"
      data-prompt="Use the drawing tool(s) to form the correct answer on the provided graph."
      data-show-axes="true"
      data-width="360"
      data-x="-10,10"
      data-x-step="1"
      data-y="-10,10"
      data-y-step="1"
      module="graphInteraction"
      response-identifier="RESPONSE"
      data-base-url="/assets/qti-portable-custom-interaction/"
    >
      <qti-interaction-markup>
        <div class="qti-padding-2">
          <div class="graphInteraction">
            <div class="graph-interaction">
              <div class="graph-interaction__prompt"></div>
              <div class="graph-interaction__canvas"></div>
            </div>
          </div>
        </div>
      </qti-interaction-markup>
    </qti-portable-custom-interaction>`
};

//       base-url="./qti-portable-custom-interaction/" data-item-path-uri="https://storage.googleapis.com/bank-dev-ampup/c/54393195-3146-417d-ba1f-eb80dc5a30e8/43894675-a8cb-4846-b594-29fcd130bc7f/b110b173-a4a7-4ec2-8dff-4988395da848/"
