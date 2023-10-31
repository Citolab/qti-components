import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { QtiAssessmentTest } from './qti-assessment-test';
import { ManifestData, requestItem } from './test-utils';
import { html } from 'lit';
import { TestContext } from './qti-assessment-test.context';

export const QtiTestHaunted = (manifestData: ManifestData, itemIndex: number, testContext: TestContext) => {
  const assessmentTestEl = createRef<QtiAssessmentTest>();
  return manifestData
    ? html`
        <qti-assessment-test
          ${ref(assessmentTestEl)}
          identifier="${manifestData.testIdentifier}"
          @on-test-set-item=${async ({ detail: identifier }) => {
            const itemRefEl = assessmentTestEl.value.itemRefEls.get(identifier.new);
            const newItemXML = await requestItem(`${manifestData.itemLocation}/${itemRefEl.href}`);
            itemRefEl.xml = newItemXML;
            assessmentTestEl.value?.itemRefEls.forEach(
              (value, key) => value.identifier !== itemRefEl.identifier && (value.xml = '')
            );
          }}
          @qti-assessment-first-updated=${(e: CustomEvent<QtiAssessmentTest>) => {
            testContext && (assessmentTestEl.value.context = testContext);
          }}
          item-index=${itemIndex}
        >
          <test-show-index></test-show-index> : <test-item-id></test-item-id>

          <qti-test-part>
            <qti-assessment-section>
              ${manifestData.items.map(
                item =>
                  html`<qti-assessment-item-ref
                    item-location=${`${manifestData.itemLocation}`}
                    identifier="${item.identifier}"
                    href="${item.href}"
                    category="${ifDefined(item.category)}"
                  >
                  </qti-assessment-item-ref>`
              )}
            </qti-assessment-section>
          </qti-test-part>

          <div class="nav">
            <test-prev> &#9001; </test-prev>
            <test-paging-buttons></test-paging-buttons>
            <test-next> &#9002; </test-next>
          </div>

          <test-slider></test-slider>

          <test-toggle-scoring></test-toggle-scoring>

          <test-manual-scoring></test-manual-scoring>
        </qti-assessment-test>
      `
    : ``;
};
