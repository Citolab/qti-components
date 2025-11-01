import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { qtiTransformItem } from '@qti-components/transformers';

import itemXML from './qti-custom-interaction.xml?raw';

import type { QtiCustomInteraction } from './qti-custom-interaction';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes } = getStorybookHelpers('qti-custom-interaction');

type Story = StoryObj<QtiCustomInteraction & typeof args>;

/**
 *
 *
 * # qti-custom-interaction
 *
 * [qti-custom-interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.ml3l73qfo5e3)
 *
 * The qti-custom-interaction renders a custom interaction that is not part of the QTI specification.
 * This is part of Facet's custom interaction implementation, which is documented here: [Custom Interactions](<https://qti-components.citolab.nl/documentation/Custom Script Interaction API Reference 1.0.pdf>).
 *
 */
const meta: Meta<QtiCustomInteraction> = {
  component: 'qti-custom-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['!dev']
};
export default meta;

const xml = String.raw;

/**
 * before it enters the dom it is transformed
 *
 * The attributes of the `<object>` element are copied to the `qti-custom-interaction` element.
 * The `<object>` element is then removed from the xml.
 * We add the following
 *
 * - `data-base-item`: the base-url for the item, so it can reference the `manifest`, pointed to in the `data` attribute to the correct location
 * - `data-base-ref`: the base-url for the links in the manifest.json, so it can reference files in the manifest.
 *
 * > **Warning**
 * > This is needed because the files in the manifest.json points to an absolute path, which is not correct in the context of the item.
 */
export const Default: Story = {
  render: _args =>
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

export const AbsolutePaths: Story = {
  render: () => {
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

export const TransformXML: Story = {
  render: () =>
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

/**
 * We supply the following function in qti-transformers to transform the xml of the item, including a step to transform the custom interaction.
 * In the following example, we also adjust the relative path from the iten in path.
 * then we deliver the html of the item.
 * the html of the item is then rendered in browser.
 */
export const TransformItem: Story = {
  render: () =>
    qtiTransformItem()
      .parse(itemXML)
      .path('/qti-custom-interaction/items/')
      .customInteraction('/qti-custom-interaction/', 'items/')
      .htmlDoc()
};
