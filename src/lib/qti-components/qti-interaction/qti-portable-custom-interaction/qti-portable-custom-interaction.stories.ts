import { html } from 'lit';

import './qti-portable-custom-interaction';

export default {
  component: 'qti-portable-custom-interaction'
};

export const Default = {
  render: () =>
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
    </qti-portable-custom-interaction>`,
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

export const FallbackPath = {
  render: () =>
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
        custom-interaction-type-identifier="urn:fdc:hmhco.com:pci:shading1"
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
    </div>`,
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

export const GraphAmpIO = {
  render: () =>
    html`<qti-portable-custom-interaction
      custom-interaction-type-identifier="GraphAmpIO"
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
      <qti-interaction-modules>
        <qti-interaction-module id="graphInteraction" primary-path="modules/graphInteraction"></qti-interaction-module>
        <qti-interaction-module id="tap" primary-path="tap"> </qti-interaction-module>
        <qti-interaction-module id="d3" primary-path="modules/d3.v5.min"> </qti-interaction-module>
      </qti-interaction-modules>
    </qti-portable-custom-interaction>`
};

export const TapToReveal = {
  render: () =>
    html`<qti-portable-custom-interaction
      class="hmh-tap-border-rounded"
      custom-interaction-type-identifier="tapToReveal"
      data-tap-message="Tap to reveal the color of the solution"
      data-toggle="true"
      module="tap"
      response-identifier="RESPONSE"
      data-base-url="/assets/qti-portable-custom-interaction/"
    >
      <qti-prompt>
        <p>Add 30ml of red cabbage solution to 100ml of each of the solutions below.</p>
        <p>Observe the color change.</p>
        <p>Click to see if your solution became the expected color.</p>
      </qti-prompt>
      <qti-interaction-markup>
        <section class="border">
          <div role="grid">
            <div role="row">
              <figure role="gridcell">
                <figcaption>
                  <h5>Baking Soda</h5>
                </figcaption>
                <img
                  alt="Baking soda solution turns bright blue."
                  class="tap"
                  src="assets/qti-portable-custom-interaction/baking_soda.svg"
                />
              </figure>
              <figure role="gridcell">
                <figcaption>
                  <h5>Vinegar</h5>
                </figcaption>
                <img alt="Vinegar turns pink." class="tap" src="assets/qti-portable-custom-interaction/vinegar.svg" />
              </figure>
              <figure role="gridcell">
                <figcaption>
                  <h5>Ammonia</h5>
                </figcaption>
                <img
                  alt="Ammonia turns light green."
                  class="tap"
                  src="assets/qti-portable-custom-interaction/ammonia.svg"
                />
              </figure>
            </div>
          </div>
        </section>
      </qti-interaction-markup>
      <qti-interaction-modules>
        <qti-interaction-module id="tap" primary-path="tap"> </qti-interaction-module>
      </qti-interaction-modules>
    </qti-portable-custom-interaction>`,
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
