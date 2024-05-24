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
      data-base-url="/assets/qti-portable-custom-interaction/"
    >
      <qti-interaction-modules>
        <qti-interaction-module id="pci-getallen" primary-path="pci-getallen.js"></qti-interaction-module>
      </qti-interaction-modules>
      <qti-interaction-markup></qti-interaction-markup>
    </qti-portable-custom-interaction>`
};

export const FallbackPath = {
  render: args =>
    html`<div>
      Mary is saving to buy a birthday present for her mother. Every week she counts the money she has saved into piles
      of $5. At the end of the first week Mary had saved $10 and was planning to buy her mother a present worth $30.
      <p></p>
      She represented this in the following shaded chart with a shaded square for every $5 saved and a target of $30.
      <p></p>
      <qti-portable-custom-interaction
        custom-interaction-type-identifier="urn:fdc:hmhco.com:pci:shading"
        data-active="0"
        module="shading"
        data-controls="none"
        data-dimension1_initial="3"
        data-dimension2_initial="2"
        data-element_diameter="60"
        data-render="grid"
        data-selected="0.0,1.0"
        data-selected_color="red"
        data-unselected_color="white"
        data-value="numShaded"
        response-identifier="EXAMPLE"
        data-base-url="/assets/qti-portable-custom-interaction/"
      >
        <qti-interaction-modules>
          <qti-interaction-module
            id="jquery"
            primary-path="https://code.jquery.com/jquery-2.2.2.min.js"
          ></qti-interaction-module>
          <qti-interaction-module
            fallback-path="modules/shading.js"
            id="shading"
            primary-path="modules/shadingXX.js"
          ></qti-interaction-module>
        </qti-interaction-modules>
        <qti-interaction-markup> </qti-interaction-markup>
      </qti-portable-custom-interaction>
      <p>
        By the second week she has already saved the exact amount she planned on spending on the present ($30) and is
        trying to work out if she will be able to afford a more expensive present costing $45.
      </p>
      <p>
        To help her do this use the buttons below to create a chart representing $45 assuming that each square
        represents $5 and then click to shade the fraction of the chart representing the amount saved in two weeks.
      </p>
      <qti-portable-custom-interaction
        custom-interaction-type-identifier="urn:fdc:hmhco.com:pci:shading"
        data-controls="full"
        data-dimension1_initial="2"
        data-dimension2_initial="2"
        data-element_diameter="60"
        data-render="grid"
        data-selected_color="red"
        data-unselected_color="white"
        data-value="numShaded"
        module="shading"
        response-identifier="RESPONSE"
        data-base-url="/assets/qti-portable-custom-interaction/"
      >
        <qti-interaction-modules>
          <qti-interaction-module
            id="jquery"
            primary-path="https://code.jquery.com/jquery-2.2.2.min.js"
          ></qti-interaction-module>
          <qti-interaction-module
            fallback-path="modules/shading.js"
            id="shading"
            primary-path="modules/shadingYY.js"
          ></qti-interaction-module>
        </qti-interaction-modules>
        <qti-interaction-markup> </qti-interaction-markup>
      </qti-portable-custom-interaction>
    </div>`
};

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
