/* eslint-disable wc/no-invalid-element-name */

import { useRef } from 'haunted';
import { html, LitElement } from 'lit';

import { customElement, property, query, state } from 'lit/decorators.js';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

@customElement('qti-test')
export class QtiTest extends LitElement {
  @property({ type: String, attribute: 'navigation-mode' })
  private _navigationMode: 'linear' | 'nonlinear' = 'linear';

  @property({ type: String, attribute: 'assessment-test-uri' })
  private assessmentTestURI: '';
  loadedItems = [];
  itemRefEls = useRef<Map<string, QtiAssessmentItemRef>>(new Map());
  controller = new AbortController();

  requestItem(identifier: string) {
    const fetchXml = async () => {
      for (const itemRef of this.itemRefEls.current.values()) {
        itemRef.xml = '';
      }
      const itemRefEl = this.itemRefEls.current.get(identifier);
      const controller = new AbortController();
      const signal = controller.signal;
      try {
        const xmlFetch = await fetch(`${this.assessmentTestURI}/items/${itemRefEl.href}`, { signal });
        const xmlText = await xmlFetch.text();
        itemRefEl.xml = xmlText;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error(error);
        }
      }
    };
    if (this.controller) {
      this.controller.abort();
    }
    fetchXml();
  }

  override render() {
    return html`
      <qti-assessment-test
        @register-item-ref=${e => {
          this.itemRefEls.current.set(e.target.identifier, e.target);
          e.target.itemLocation = `${this.assessmentTestURI}/items/${e.target.href}`;
        }}
        @on-test-set-item=${({ detail: identifier }) => this.requestItem(identifier)}
      >
        <test-show-index></test-show-index>
        <qti-test-part identifier="part1" navigation-mode="nonlinear" submission-mode="individual">
          <qti-assessment-section identifier="section-1" title="Section 1" visible="true" required="true">
            ${this.loadedItems.map(
              item =>
                html`<qti-assessment-item-ref identifier="${item.identifier}" href="${item.href}">
                </qti-assessment-item-ref>`
            )}
          </qti-assessment-section>
        </qti-test-part>
        <test-next>NEXT</test-next>

        <test-prev>PREV</test-prev>
        <test-progress></test-progress>
        <test-paging-buttons></test-paging-buttons>
        <test-paging-radio></test-paging-radio>
        <test-slider></test-slider>
        <test-show-correct>correct</test-show-correct>
        <test-print-variables></test-print-variables>
      </qti-assessment-test>
    `;
  }
}
