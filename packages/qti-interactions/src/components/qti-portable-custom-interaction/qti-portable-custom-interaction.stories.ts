import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, waitFor } from 'storybook/test';

import { removeDoubleSlashes } from '@qti-components/shared';
import { qtiTransformItem } from '@qti-components/transformers';

import type { ItemContainer, QtiItem } from '@qti-components/item';
import type { ModuleResolutionConfig } from '@qti-components/transformers';
import type { QtiPortableCustomInteraction } from './qti-portable-custom-interaction';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

import './qti-portable-custom-test-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-portable-custom-interaction');

type Story = StoryObj<QtiPortableCustomInteraction & typeof args>;

/**
 *
 * ### [3.2.23 Portable Custom Interaction (PCI)](https://www.imsglobal.org/spec/qti/v3p0/impl#h.98xaka8g51za)
 * allow the item author to present an interaction with a custom user interface and behavior, supported by, respectively, delivery engine-specific or author-provided code.  Portable Custom Interactions (PCIs) allow the Javascript code implementing the interaction to be made available to delivery systems, with a standard Javascript interface, offering the potential for making PCIs more interoperable and portable between conforming delivery engines.
 *
 */
const meta: Meta<QtiPortableCustomInteraction> = {
  component: 'qti-portable-custom-interaction',
  title: '3.2 interaction types/23 Portable Custom Interaction (PCI)',
  // args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: []
};
export default meta;

export const Default: Story = {
  render: () =>
    html` <qti-portable-custom-interaction-test
      response-identifier="RESPONSE"
      module="pci-getallen"
      custom-interaction-type-identifier="getallenFormule"
      data-button-text="Berekenen"
      data-sum1="$1 * 12 + 3"
      data-sum2="$1 * 4 + 53"
      data-table-size="4"
      data-base-url="/assets/qti-portable-interaction/baking_soda"
    >
      <qti-interaction-modules>
        <qti-interaction-module id="pci-getallen" primary-path="pci-getallen.js"></qti-interaction-module>
      </qti-interaction-modules>
      <qti-interaction-markup></qti-interaction-markup>
    </qti-portable-custom-interaction-test>`,
  play: async ({ canvasElement, step }) => {
    const pciElement = canvasElement.querySelector('qti-portable-custom-interaction-test');
    await new Promise(resolve => {
      pciElement?.addEventListener('qti-portable-custom-interaction-loaded', () => {
        resolve(true);
      });
    });
    await step('set first value', async () => {
      let content = await pciElement.getIFrameContent();
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(
        content.includes(
          `<div class="font-bold flex items-center justify-center bg-white border-1 text-right h-16 w-16">4</div>`
        )
      ).toBeFalsy();
      await pciElement.iFrameSetValueElement('input', '4');
      await pciElement.iFrameClickOnElementByText('Berekenen');
      await new Promise(resolve => setTimeout(resolve, 500));
      content = await pciElement.getIFrameContent();
      expect(
        content.includes(
          `<div class="font-bold flex items-center justify-center bg-white border-1 text-right h-16 w-16">4</div>`
        )
      ).toBeTruthy();
    });
  },
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
      <qti-portable-custom-interaction-test
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
        data-base-url="/assets/qti-portable-interaction/baking_soda"
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
      </qti-portable-custom-interaction-test>
      <p>
        By the second week she has already saved the exact amount she planned on spending on the present ($30) and is
        trying to work out if she will be able to afford a more expensive present costing $45.
      </p>
      <p>
        To help her do this use the buttons below to create a chart representing $45 assuming that each square
        represents $5 and then click to shade the fraction of the chart representing the amount saved in two weeks.
      </p>
      <qti-portable-custom-interaction-test
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
        data-base-url="/assets/qti-portable-interaction/baking_soda"
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
      </qti-portable-custom-interaction-test>
    </div>`,
  play: async ({ canvasElement, step }) => {
    const pciElements = canvasElement.querySelectorAll('qti-portable-custom-interaction-test');
    const secondPciElement = pciElements[1];
    await new Promise(resolve => {
      secondPciElement?.addEventListener('qti-portable-custom-interaction-loaded', () => {
        resolve(true);
      });
    });
    await step('check response without interaction', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = secondPciElement.response;
      // expect(response).toEqual('0');
    });
    await step('click two rects and check the response', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await new Promise(resolve => setTimeout(resolve, 1000));
      await secondPciElement.iFrameClickOnElementByText('More');
      await new Promise(resolve => setTimeout(resolve, 200));
      await secondPciElement.iFrameClickOnElementByText('More');
      await new Promise(resolve => setTimeout(resolve, 200));
      await secondPciElement.iFrameClickOnElement('rect:nth-of-type(1)');
      await new Promise(resolve => setTimeout(resolve, 200));
      await secondPciElement.iFrameClickOnElement('rect:nth-of-type(3)');
      await new Promise(resolve => setTimeout(resolve, 200));
      await secondPciElement.iFrameClickOnElement('rect:nth-of-type(5)');
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = secondPciElement.response;

      expect(response).toEqual('3');
      await secondPciElement.iFrameClickOnElement('rect:nth-of-type(3)');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response2 = secondPciElement.response;
      expect(response2).toEqual('2');
    });
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

export const TapToReveal = {
  render: () =>
    html`<qti-portable-custom-interaction-test
      class="hmh-tap-border-rounded"
      custom-interaction-type-identifier="tapToReveal"
      data-tap-message="Tap to reveal the color of the solution"
      data-toggle="true"
      module="tap"
      response-identifier="RESPONSE"
      data-base-url="/assets/qti-portable-interaction/baking_soda"
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
                  src="assets/qti-portable-interaction/baking_soda/baking_soda.svg"
                />
              </figure>
              <figure role="gridcell">
                <figcaption>
                  <h5>Vinegar</h5>
                </figcaption>
                <img
                  alt="Vinegar turns pink."
                  class="tap"
                  src="assets/qti-portable-interaction/baking_soda/vinegar.svg"
                />
              </figure>
              <figure role="gridcell">
                <figcaption>
                  <h5>Ammonia</h5>
                </figcaption>
                <img
                  alt="Ammonia turns light green."
                  class="tap"
                  src="assets/qti-portable-interaction/baking_soda/ammonia.svg"
                />
              </figure>
            </div>
          </div>
        </section>
      </qti-interaction-markup>
      <qti-interaction-modules>
        <qti-interaction-module id="tap" primary-path="tap"> </qti-interaction-module>
      </qti-interaction-modules>
    </qti-portable-custom-interaction-test>`,
  play: async ({ canvasElement, step }) => {
    const pciElement = canvasElement.querySelector('qti-portable-custom-interaction-test');
    await new Promise(resolve => {
      pciElement?.addEventListener('qti-portable-custom-interaction-loaded', () => {
        resolve(true);
      });
    });
    await step('check response without interaction', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = pciElement.response;
      expect(response).toEqual('0');
    });
    await step('click on the second option and check the response', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await pciElement.iFrameClickOnElement('.hmh-tap-image');
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = pciElement.response;
      expect(response).toEqual('1');
    });
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

export const ConvertedTAO = {
  render: () =>
    html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="i605b50d60c465892a88c0651ffd390"
      title="decisiontask"
      label="decisiontask"
      xml:lang="en-US"
      adaptive="false"
      time-dependent="false"
      tool-name="TAO"
      tool-version="3.4.0-sprint134"
    >
      <qti-response-declaration
        identifier="RESPONSE"
        cardinality="single"
        base-type="string"
      ></qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-stylesheet
        href="/assets/qti-portable-interaction/i605b50d60c465892a88c0651ffd390/decisiontask/runtime/css/base.css"
        type="text/css"
        title="base"
      ></qti-stylesheet>
      <qti-stylesheet
        href="/assets/qti-portable-interaction/i605b50d60c465892a88c0651ffd390/decisiontask/runtime/css/decisiontask.css"
        type="text/css"
        title="decisiontask"
      ></qti-stylesheet>
      <qti-item-body>
        <div class="grid-row">
          <div class="col-12"></div>
        </div>
        <div class="grid-row">
          <div class="col-12"></div>
        </div>
        <div class="grid-row">
          <div class="col-12">
            <qti-portable-custom-interaction-test
              custom-interaction-type-identifier="decisiontask"
              module="decisiontask"
              data-use-default-paths="true"
              data-use-default-shims="true"
              data-version="1.0.1"
              data-data__0__stimulusindex="1"
              data-data__0__stimulus="5 + 7 = 12"
              data-data__0__response="1"
              data-data__1__stimulusindex="2"
              data-data__1__stimulus="4 + 4 = 9"
              data-data__1__response="2"
              data-data__2__stimulusindex="3"
              data-data__2__stimulus="7 + 6 = 13"
              data-data__2__response="1"
              data-uploaded-fname="stimuli_IIL_item.csv"
              data-feedback="true"
              data-shufflestimuli=""
              data-respkey=""
              data-tlimit="0"
              data-level="2"
              data-buttonlabel0="True"
              data-buttonlabel1="False"
              data-buttonlabel2=""
              data-buttonlabel3=""
              data-buttonlabel4=""
              data-buttonlabel5=""
              data-buttonlabel6=""
              data-buttonlabel7=""
              data-0__stimulusindex="1"
              data-0__stimulus="5 + 7 = 12"
              data-0__response="1"
              data-1__stimulusindex="2"
              data-1__stimulus="4 + 4 = 9"
              data-1__response="2"
              data-2__stimulusindex="3"
              data-2__stimulus="7 + 6 = 13"
              data-2__response="1"
              data-stimulusindex="3"
              data-stimulus="7 + 6 = 13"
              data-response="1"
              response-identifier="RESPONSE"
              data-base-url="/assets/qti-portable-interaction/i605b50d60c465892a88c0651ffd390/"
            >
              <qti-interaction-modules>
                <qti-interaction-module
                  id="decisiontask"
                  primary-path="decisiontask/runtime/decisiontask.amd.js"
                ></qti-interaction-module>
                <qti-interaction-module
                  id="IMSGlobal/jquery_2_1_1"
                  primary-path="IMSGlobal/jquery_2_1_1"
                ></qti-interaction-module>
                <qti-interaction-module
                  id="decisiontask/runtime/js/renderer"
                  primary-path="decisiontask/runtime/js/renderer"
                ></qti-interaction-module>
              </qti-interaction-modules>
              <qti-interaction-markup>
                <div class="decisiontask">
                  <div class="prompt"></div>
                  <div class="globalWrapper"></div>
                </div>
              </qti-interaction-markup>
            </qti-portable-custom-interaction-test>
          </div>
        </div>
      </qti-item-body>
    </qti-assessment-item> `,
  play: async ({ canvasElement, step }) => {
    let pciElement = canvasElement.querySelector('qti-portable-custom-interaction-test');
    await step('check response without interaction', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      pciElement = canvasElement.querySelector('qti-portable-custom-interaction-test');
      const response = pciElement.response;
      expect(response).toEqual('');
    });
    await step('click on the second option and check the response', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await pciElement.iFrameClickOnElementByText('Cliquer ici pour commencer');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const content = await pciElement.getIFrameContent();
      expect(content).toContain('5 + 7 = 12');
      await pciElement.iFrameClickOnElementByText('True');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = pciElement.response;
      const expectedResponse = [{ stimulusindex: '1', stimulus: '5 + 7 = 12', time: 1018, correct: 1 }];
      const parsedResponse = JSON.parse(response);
      expect(parsedResponse[0].stimulusindex).toEqual(expectedResponse[0].stimulusindex);
      expect(parsedResponse[0].stimulus).toEqual(expectedResponse[0].stimulus);
      expect(parsedResponse[0].correct).toEqual(expectedResponse[0].correct);
    });
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

export const TaoNew = {
  render: () =>
    html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="i674ee5ef802e720241203120519e9a7"
      title="Item 9"
      label="likert_PCI"
      xml:lang="en-US"
      adaptive="false"
      time-dependent="false"
      tool-name="TAO"
      tool-version="2024.11 LTS"
    >
      <qti-response-declaration
        identifier="RESPONSE"
        cardinality="single"
        base-type="integer"
      ></qti-response-declaration>
      <qti-item-body>
        <div class="grid-row">
          <div class="col-12">
            <qti-portable-custom-interaction-test
              custom-interaction-type-identifier="likertScoreInteraction"
              data-version="1.0.0"
              data-level="5"
              data-label-min="min"
              data-label-max="max"
              data-icons=""
              data-numbers=""
              module="likertScoreInteraction"
              response-identifier="RESPONSE"
              data-use-default-paths="true"
              data-use-default-shims="true"
              data-base-url="/assets/qti-portable-interaction/likert_pci_1733224036/"
            >
              <qti-interaction-modules>
                <qti-interaction-module
                  id="likertScoreInteraction"
                  primary-path="/runtime/js/likertScoreInteraction.min.js"
                ></qti-interaction-module>
              </qti-interaction-modules>
              <qti-interaction-markup>
                <div class="likertScoreInteraction">
                  <div class="prompt"></div>
                  <div class="scale">
                    <ul class="likert"></ul>
                  </div>
                </div>
              </qti-interaction-markup>
            </qti-portable-custom-interaction-test>
          </div>
        </div>
      </qti-item-body>
    </qti-assessment-item> `,
  play: async ({ canvasElement, step }) => {
    let pciElement = canvasElement.querySelector('qti-portable-custom-interaction-test');
    await step('check response without interaction', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      pciElement = canvasElement.querySelector('qti-portable-custom-interaction-test');
      // const response = pciElement.response;
      // expect(response).toEqual('0');
    });
    await step('click on the second option and check the response', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await pciElement.iFrameClickOnElement('input[type="radio"]');
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = pciElement.response;
      expect(response).toEqual('1');
    });
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

export const VerhoudingenRestoreResponse = {
  render: () => {
    const qti = `<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="i67a0dfca446508820f6286cf78feea"
      title="verhoudingen"
      label="verhoudingen"
      xml:lang="en-US"
      adaptive="false"
      time-dependent="false"
      tool-name="TAO"
      tool-version="3.4.0-sprint121"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
        <qti-correct-response>
          <qti-value>[{&quot;color&quot;:&quot;red&quot;,&quot;percentage&quot;:50}]</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-item-body>
        <div class="grid-row">
          <div class="col-12">
            <qti-portable-custom-interaction-test
              custom-interaction-type-identifier="colorProportions"
              data-version="1.0.1"
              data-colors="red, blue, green"
              data-width="400"
              data-height="400"
              data-base-url="/assets/qti-portable-interaction/verhoudingen/"
              module="colorProportions"
              response-identifier="RESPONSE"
            >
              <qti-interaction-modules>
                <qti-interaction-module
                  id="colorProportions"
                  primary-path="/interaction/runtime/js/index.js"
                ></qti-interaction-module>
              </qti-interaction-modules>
              <qti-interaction-markup>
                <div class="pciInteraction">
                  <div class="prompt"></div>
                  <ul class="pci"></ul>
                </div>
              </qti-interaction-markup>
            </qti-portable-custom-interaction-test>
          </div>
        </div>
      </qti-item-body>
    </qti-assessment-item>`;
    const storedResponse = [
      { color: 'blue', percentage: 12.5 },
      { color: 'green', percentage: 37.5 },
      { color: 'red', percentage: 50 }
    ];
    let assessmentItem = null;
    const onItemFirstUpdated = e => {
      assessmentItem = (e as CustomEvent<QtiAssessmentItem>).detail;
      assessmentItem.updateResponseVariable('RESPONSE', JSON.stringify(storedResponse));
    };
    return html`
      <qti-item>
        <item-container @qti-assessment-item-connected="${onItemFirstUpdated}" .itemXML=${qti}></item-container>
      </qti-item>
    `;
  },
  play: async ({ canvasElement, step }) => {
    await step('check the restored response', async () => {
      const qtiItem = canvasElement.querySelector('qti-item') as QtiItem;
      // await new Promise(resolve => setTimeout(resolve, 1000));

      const pciElement = await waitFor(
        () => {
          if (!qtiItem) throw new Error('qtiItem is not defined');
          if (!qtiItem.children.length) throw new Error('qtiItem has no children');
          const assessmentItem = qtiItem.children[0].shadowRoot.querySelector('qti-assessment-item');
          if (!assessmentItem) throw new Error('assessmentItem is not defined');
          const el = assessmentItem.querySelector('qti-portable-custom-interaction-test');
          if (!el) throw new Error('Element not found');
          return el;
        },
        {
          timeout: 10000,
          interval: 1000
        }
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      const content = await pciElement.getIFrameContent();
      expect(content).toContain('fill="red"');
      expect(content).toContain('fill="green"');
    });
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

// Base story function that accepts itemName as parameter
const createPciConformanceStory = (itemName: string): Story => ({
  args: {
    // Remove the item-url since we'll fetch the data ourselves
  },
  render: () =>
    html`<qti-item>
      <div>
        <item-container style="display: block;width: 400px; height: 350px;" id="item-container">
          <template>
            <style>
              qti-assessment-item {
                padding: 1rem;
                display: block;
                aspect-ratio: 4 / 3;
                width: 800px;
                border: 2px solid blue;
                transform: scale(0.5);
                transform-origin: top left;
              }
            </style>
          </template>
        </item-container>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    console.log(canvasElement);

    await step('Fetch and load QTI XML', async () => {
      try {
        const getModuleResolution = async (baseUrl: string, name: string) => {
          // try to find the files: /modules/module_resolution.js` and  modules/fallback_module_resolution.js`;
          const modulResolutionResource = await fetch(removeDoubleSlashes(`${baseUrl}/${name}`));
          if (!modulResolutionResource.ok) {
            // If 404 or any error, skip the rest
            return null;
          }
          const fileContent = await modulResolutionResource.text();
          if (fileContent) {
            const config = JSON.parse(fileContent) as ModuleResolutionConfig;
            return config;
          }
          return null;
        };

        // Fetch the XML file using the parameterized item name
        const baseUrl = `/assets/qti-portable-interaction/pci-conformance/${itemName}`;
        const response = await fetch(`${baseUrl}/qti.xml`);
        const xmlText = await response.text();
        const qti = xmlText
          .replaceAll('<qti-portable-custom-interaction', '<qti-portable-custom-interaction-test')
          .replaceAll('</qti-portable-custom-interaction>', '</qti-portable-custom-interaction-test>');
        const transform = await qtiTransformItem()
          .parse(qti)
          .configurePci(baseUrl, getModuleResolution, 'qti-portable-custom-interaction-test');

        // Find the item-container element
        const itemContainer = canvasElement.querySelector('#item-container') as ItemContainer;

        if (itemContainer) {
          itemContainer.itemXML = transform.xml();
        }
      } catch (error) {
        console.error('Failed to fetch QTI XML:', error);
      }
    });
  }
});

// Create the individual stories using the base function
export const PciConformance1: Story = createPciConformanceStory('item-1');
export const PciConformance2: Story = createPciConformanceStory('item-2');
export const PciConformance3: Story = createPciConformanceStory('item-3');
export const PciConformance4: Story = createPciConformanceStory('item-4');
export const PciConformance5: Story = createPciConformanceStory('item-5');
export const PciConformance6: Story = createPciConformanceStory('item-6');
