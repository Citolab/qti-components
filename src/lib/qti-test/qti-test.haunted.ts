import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { QtiAssessmentTest } from './qti-assessment-test';
import { ManifestData, requestItem } from './test-utils';
import { html } from 'lit';
import { useEffect, useState } from 'haunted';

export const QtiTestHaunted = manifestData => {
  const [md, setMd] = useState<ManifestData>(null);
  const assessmentTestEl = createRef<QtiAssessmentTest>();

  useEffect(() => {
    console.log('QtiTestHaunted', manifestData);
    setMd(manifestData);
  }, [md]);

  return md
    ? html`
        <qti-assessment-test
          ${ref(assessmentTestEl)}
          identifier="${md.testIdentifier}"
          @on-test-set-item=${async ({ detail: identifier }) => {
            const itemRefEl = assessmentTestEl.value.itemRefEls.get(identifier.new);
            const newItemXML = await requestItem(`${md.itemLocation}/${itemRefEl.href}`);
            itemRefEl.xml = newItemXML;
            assessmentTestEl.value?.itemRefEls.forEach(
              (value, key) => value.identifier !== itemRefEl.identifier && (value.xml = '')
            );
          }}
          @qti-assessment-first-updated=${(e: CustomEvent<QtiAssessmentTest>) => {
            // const storedTestContext = JSON.parse(localStorage.getItem(`${md.testIdentifier}-assessment-test-context`));
            // storedTestContext && (assessmentTestEl.value.context = storedTestContext);
          }}
          audience-context=""
          item-index="0"
        >
          <test-show-index></test-show-index>

          <qti-test-part>
            <qti-assessment-section>
              ${md.items.map(
                item =>
                  html`<qti-assessment-item-ref
                    item-location=${`${md.itemLocation}`}
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

// <label>
//   <input
//     type="checkbox"
//     @change=${(e: Event) => {
//       const el = e.target as HTMLInputElement;
//       setAudienceContext(el.checked ? 'scorer' : 'candidate');
//     }}
//   />
//   Toggle audience context
// </label>
