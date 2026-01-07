import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { http, HttpResponse, delay } from 'msw';
import { mswLoader } from 'msw-storybook-addon';

import { type QtiAssessmentItemRef } from '@qti-components/test';

import ChoiceSingleCardinality from '../../../../public/assets/qti-conformance/Basic/T4-T7/items/choice-single-cardinality.xml?raw';
import ChoiceMultipleCardinality from '../../../../public/assets/qti-conformance/Basic/T4-T7/items/choice-multiple-cardinality.xml?raw';
import ExtendedText from '../../../../public/assets/qti-conformance/Basic/T4-T7/items/extended-text.xml?raw';
import TextEntry from '../../../../public/assets/qti-conformance/Basic/T4-T7/items/text-entry.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta = {
  component: 'qti-assessment-stimulus-ref',
  loaders: [mswLoader]
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SlowLoadingItems: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(/\/assets\/qti-conformance\/Basic\/T4-T7\/items\/choice-single-cardinality\.xml$/, async () => {
          await delay(200);
          return HttpResponse.text(ChoiceSingleCardinality);
        }),
        http.get(/\/assets\/qti-conformance\/Basic\/T4-T7\/items\/choice-multiple-cardinality\.xml$/, async () => {
          await delay(200);
          return HttpResponse.text(ChoiceMultipleCardinality);
        }),
        http.get(/\/assets\/qti-conformance\/Basic\/T4-T7\/items\/extended-text\.xml$/, async () => {
          await delay(200);
          return HttpResponse.text(ExtendedText);
        }),
        http.get(/\/assets\/qti-conformance\/Basic\/T4-T7\/items\/text-entry\.xml$/, async () => {
          await delay(200);
          return HttpResponse.text(TextEntry);
        })
      ]
    }
  },
  render: () => {
    return html`<qti-test navigate="item"
      ><test-navigation
        ><test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        <nav><test-prev>Vorige</test-prev><test-next>Volgende</test-next></nav></test-navigation
      ></qti-test
    >`;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // wait one second then press next, wait another second etc to simulate user interaction with slow loading items
    await step('Wait and navigate through items', async () => {
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const nextButton = await canvas.getByText('Volgende');
        nextButton.click();
      }
    });

    // Check if qti-assessment-item element exists and has children
    await step('Check qti-assessment-item element and children', async () => {
      const testContainer = canvasElement.querySelector('test-container');
      const qtiAssessmentItem = testContainer?.shadowRoot?.querySelector<QtiAssessmentItemRef>(
        '[identifier="t1-test-entry-item2"]'
      );
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(qtiAssessmentItem).toBeInTheDocument();

      // Check if element has children, it should not have children, the other items should not be shown
      expect(qtiAssessmentItem.children.length).toBe(0);
    });
  }
};
