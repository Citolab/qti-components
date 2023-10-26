import { useEffect } from 'haunted';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { QtiAssessmentTest } from './qti-assessment-test';
import { ManifestData, requestItem } from './test-utils';
import { html } from 'lit';

export const QtiTestHaunted = manifestData => {
  const md = manifestData as ManifestData;
  const assessmentTestEl = createRef<QtiAssessmentTest>();

  // useEffect(() => {
  //   assessmentTestEl.value.signalContext.subscribe(a => {
  //     localStorage.setItem(`${md.testIdentifier}-assessment-test-context`, JSON.stringify(a));
  //   });
  // }, [assessmentTestEl.value]);

  return html`
    <qti-assessment-test
      identifier="${md.testIdentifier}"
      ${ref(assessmentTestEl)}
      @on-test-set-item=${async ({ detail: identifier }) => {
        const itemRefEl = assessmentTestEl.value.itemRefEls.get(identifier.new);
        const newItemXML = await requestItem(`${md.itemLocation}/${itemRefEl.href}`);
        itemRefEl.xml = newItemXML;
        itemRefEl.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
        assessmentTestEl.value.itemRefEls.forEach(
          (value, key) => value.identifier !== itemRefEl.identifier && (value.xml = '')
        );
      }}
      @qti-assessment-first-updated=${(e: CustomEvent<QtiAssessmentTest>) => {
        // const storedTestContext = JSON.parse(localStorage.getItem(`${md.testIdentifier}-assessment-test-context`));
        // storedTestContext && (assessmentTestEl.value.context = storedTestContext);
      }}
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
        <test-prev>
          <svg class="arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clip-rule="evenodd"
            />
          </svg>
        </test-prev>

        <test-paging-buttons></test-paging-buttons>

        <test-next>
          <svg class="arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </test-next>
      </div>

      <test-slider></test-slider>
    </qti-assessment-test>
  `;
};
