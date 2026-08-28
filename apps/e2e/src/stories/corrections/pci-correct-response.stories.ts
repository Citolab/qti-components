import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import { withCorrection } from '../kennisnet/with-correction';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/** Structural type rather than an import: the correction classes reach this story through the
 * scoped registry `withCorrection` installs, not through a module reference. */
type CorrectionAssessmentItem = HTMLElement & {
  showCorrectResponse(show: boolean): void;
};

const itemXML = `<qti-assessment-item
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
      <qti-value>[{&quot;color&quot;:&quot;blue&quot;,&quot;percentage&quot;:12.5},{&quot;color&quot;:&quot;green&quot;,&quot;percentage&quot;:12.5},{&quot;color&quot;:&quot;red&quot;,&quot;percentage&quot;:75}]</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
  <qti-item-body>
    <div class="grid-row">
      <div class="col-12">
        <qti-portable-custom-interaction
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
            <qti-interaction-module id="colorProportions" primary-path="/interaction/runtime/js/index.js"></qti-interaction-module>
          </qti-interaction-modules>
          <qti-interaction-markup>
            <div class="pciInteraction">
              <div class="prompt"></div>
              <ul class="pci"></ul>
            </div>
          </qti-interaction-markup>
        </qti-portable-custom-interaction>
      </div>
    </div>
  </qti-item-body>
</qti-assessment-item>`;

/**
 * `withCorrection` mounts the story inside a shadow root, so the scoped registry that maps
 * `qti-assessment-item` and `qti-portable-custom-interaction` onto their correction subclasses
 * applies to the item parsed from the XML above.
 */
const storyRoot = (canvasElement: HTMLElement): ParentNode =>
  Array.from(canvasElement.querySelectorAll<HTMLElement>('*')).find(element => element.shadowRoot)?.shadowRoot ??
  canvasElement;

/**
 * The PCI renders inside an iframe and paints into shadow roots, so collect both to be able to
 * assert on what a candidate actually sees.
 */
const deepIframeHtml = (iframe: HTMLIFrameElement | null): string => {
  const doc = iframe?.contentDocument;
  if (!doc) return '';
  const collectShadowHtml = (root: ParentNode): string[] =>
    Array.from(root.querySelectorAll('*')).flatMap(node =>
      node.shadowRoot ? [node.shadowRoot.innerHTML, ...collectShadowHtml(node.shadowRoot)] : []
    );
  return [doc.body.innerHTML, ...collectShadowHtml(doc)].join('\n');
};

const meta: Meta = {
  title: 'corrections/portable custom interaction',
  decorators: [withCorrection],
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

export default meta;

/**
 * A portable custom interaction has no markup the correction elements could annotate, so
 * `QtiPortableCustomInteractionCorrection` answers `showCorrectResponse` with a second,
 * inert instance of the interaction that is fed the correct response instead.
 */
export const ShowCorrectResponse: Story = {
  render: () => html`
    <qti-item>
      <item-container .itemXML=${itemXML}></item-container>
    </qti-item>
  `,
  play: async ({ canvasElement, step }) => {
    const assessmentItem = await waitFor(
      () => {
        const itemContainer = storyRoot(canvasElement).querySelector('item-container') as HTMLElement | null;
        const item = itemContainer?.shadowRoot?.querySelector<CorrectionAssessmentItem>('qti-assessment-item');
        if (!item) throw new Error('assessmentItem is not defined');
        // Wait for the interaction's own iframe: until it exists the interaction has not registered
        // itself on the item, and there is no response variable to read a correct response from.
        if (!item.querySelector('qti-portable-custom-interaction > iframe')) {
          throw new Error('interaction not rendered');
        }
        return item;
      },
      { timeout: 10000, interval: 500 }
    );

    await step('show the correct response', async () => {
      assessmentItem.showCorrectResponse(true);

      const viewer = await waitFor(
        () => {
          const container = assessmentItem.querySelector('[id^="correct-response-container-"]');
          if (!container) throw new Error('correct response container not found');
          const element = container.querySelector('qti-portable-custom-interaction');
          if (!element) throw new Error('correct response viewer not found');
          return element as HTMLElement;
        },
        { timeout: 10000, interval: 500 }
      );

      await waitFor(
        () => {
          const viewerHtml = deepIframeHtml(viewer.querySelector('iframe'));
          // The correct response is 75% red, 12.5% blue and 12.5% green; an
          // unanswered interaction paints every square white instead.
          expect(viewerHtml).toContain('fill="red"');
          expect(viewerHtml).toContain('fill="blue"');
          expect(viewerHtml).toContain('fill="green"');
        },
        { timeout: 10000, interval: 500 }
      );

      // Asserted once the viewer has settled: only its own iframe may be there. The runtime
      // generated children of the original interaction — its iframe, and the overlay `disable()`
      // adds — must not be cloned along, or the viewer paints a dead frame over the live one.
      expect(viewer.querySelectorAll('iframe')).toHaveLength(1);
      expect(viewer.querySelector('.pci-interaction-overlay')).toBeNull();
    });

    await step('hide the correct response', async () => {
      // The viewer must not register itself as a real interaction on the item. When it did, this
      // threw: Cannot read properties of undefined (reading 'cardinality').
      assessmentItem.showCorrectResponse(false);

      await waitFor(
        () => {
          expect(assessmentItem.querySelector('[id^="correct-response-container-"]')).toBeNull();
          expect(assessmentItem.querySelector('.pci-interaction-overlay')).toBeNull();
        },
        { timeout: 10000, interval: 500 }
      );
    });
  }
};
