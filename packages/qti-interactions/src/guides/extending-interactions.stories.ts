import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { qtiTransformItem } from '@qti-components/transformers';

import './extending-interactions.example';
import './extending-interactions.five-pager';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { ItemContainer } from '@qti-components/item';

const meta: Meta = {
  title: 'Extending QTI/Creating an extended interaction',
  parameters: { controls: { disable: true } }
};
export default meta;

type Story = StoryObj;

/** Subclass `Interaction` from scratch: answer it and the item's variable follows. */
export const RatingInteraction: Story = {
  render: () => html`
    <qti-assessment-item identifier="rating-item" title="Rating item">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
      </qti-response-declaration>
      <qti-item-body>
        <p>How difficult was this item?</p>
        <example-rating-interaction response-identifier="RESPONSE"></example-rating-interaction>
      </qti-item-body>
    </qti-assessment-item>
  `,
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector<QtiAssessmentItem>('qti-assessment-item')!;
    const four = await within(canvasElement).findByShadowRole('button', { name: '4' });

    four.click();

    await waitFor(() => expect(four).toHaveAttribute('aria-pressed', 'true'));
    expect(item.variables).toContainEqual(expect.objectContaining({ identifier: 'RESPONSE', value: '4' }));
  }
};

/** What the item author writes: a plain QTI slider that asks for a type through its class. */
const fivePagerItemXml = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="five-pager-item" title="Five pager" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="integer"></qti-response-declaration>
  <qti-item-body>
    <qti-slider-interaction class="type:five-pager" response-identifier="RESPONSE" lower-bound="1" upper-bound="5" step="1">
      <qti-prompt>How difficult was this item?</qti-prompt>
    </qti-slider-interaction>
  </qti-item-body>
</qti-assessment-item>`;

/** Load it through the transformer: `class="type:five-pager"` becomes `<qti-slider-interaction-five-pager>`. */
export const FivePagerThroughTheTransformer: Story = {
  // Loaded in `render`, not `play`, so the docs page shows the item too.
  render: () => {
    const container = document.createElement('item-container') as ItemContainer;
    // `itemXML` is only watched after the first update, so wait for the container to connect.
    void Promise.all([
      Promise.resolve(qtiTransformItem().parse(fivePagerItemXml).extendElementsWithClass('type')),
      container.updateComplete
    ]).then(([transformed]) => {
      container.itemXML = transformed.xml();
    });
    return container;
  },
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector<ItemContainer>('item-container')!;
    const three = await within(canvasElement).findByShadowRole('button', { name: '3' }, { timeout: 5000 });
    three.click();

    await waitFor(() => expect(three).toHaveAttribute('aria-pressed', 'true'));
    const item = container.shadowRoot?.querySelector<QtiAssessmentItem>('qti-assessment-item');
    expect(item?.variables).toContainEqual(expect.objectContaining({ identifier: 'RESPONSE', value: '3' }));
  }
};
