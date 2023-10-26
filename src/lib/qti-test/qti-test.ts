/* eslint-disable wc/no-invalid-element-name */

import { html, LitElement } from 'lit';
import { customElement, property, query, queryAssignedElements, state } from 'lit/decorators.js';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';
import { QtiAssessmentTest } from './qti-assessment-test';
import { until } from 'lit/directives/until.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './qti-test.css?inline';
import { createRef, ref } from 'lit/directives/ref.js';
import { fetchManifestData, requestItem } from './test-utils';

@customElement('qti-test')
export class QtiTest extends LitElement {
  @query('qti-test-part')
  _qtiTestPart;

  @state()
  private content: Promise<any>;

  @state()
  private _items = [];

  private _itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();
  private _controller = new AbortController();

  @property({ type: String, attribute: 'package-uri' })
  public packageURI: string = '';

  private _itemLocation: string;

  private _assessmentTestEl = createRef<QtiAssessmentTest>();

  set context(value: any) {
    this._assessmentTestEl.value.context = value;
  }

  get context(): any {
    return this._assessmentTestEl.value.context;
  }

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('packageURI')) {
      this._items = []; // empty all items
      const { itemLocation, items, testIdentifier } = await fetchManifestData(this.packageURI); // load new items async
      this._itemLocation = itemLocation;
      this._items = items;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.css = styles;
  }

  getAssessmentTest(): QtiAssessmentTest {
    return this.querySelector<QtiAssessmentTest>('qti-assessment-test');
  }

  set css(val: string) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(val);
    this.shadowRoot?.adoptedStyleSheets.push(sheet);
  }

  override render() {
    return html`
      ${until(this.content, html`<span>Loading...</span>`)}
      ${this._items.length > 0 &&
      html`
        <qti-assessment-test
        ${ref(this._assessmentTestEl)}
          @register-item-ref=${e => {
            this._itemRefEls.set(e.target.identifier, e.target);
            const itemRefEl = this._itemRefEls.get(e.target.identifier);
            e.target.itemLocation = `${this._itemLocation}/${itemRefEl.href}`;
          }}
          @on-test-set-item="${async ({ detail: identifier }) => {
            const itemRefEl = this._itemRefEls.get(identifier.new);

            this._qtiTestPart.loading = true;
            const newItemXML = await requestItem(`${this._itemLocation}/${itemRefEl.href}`);
            this._assessmentTestEl.value.itemRefEls.forEach((value, key) => (value.xml = ''));
            itemRefEl.xml = newItemXML;

            this._qtiTestPart.loading = false;
          }}"

        >
          <test-show-index></test-show-index>
          <qti-test-part>
            <qti-assessment-section>
              </qti-assessment-item-ref>
              ${this._items.map(
                item =>
                  html`<qti-assessment-item-ref
                    identifier="${item.identifier}"
                    href="${item.href}"
                    category="${ifDefined(item.category)}"
                  ></qti-assessment-item-ref>`
              )}
            </qti-assessment-section>
          </qti-test-part>
          
          <!-- <test-progress></test-progress> -->
          <div class="nav">
            <test-prev>
            <svg class="arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
          <!-- <span class="sr-only">PREV</span> -->
            </test-prev>

            <test-paging-buttons></test-paging-buttons>
            
            <test-next>
              <!-- <span class="sr-only">NEXT</span> -->
              <svg class="arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </test-next>
          </div>
          <slot></slot>
          <!-- <test-paging-radio></test-paging-radio> -->
          <test-slider></test-slider>
          <!-- <test-show-correct>correct</test-show-correct> -->
          <!-- <test-print-variables></test-print-variables> -->
        </qti-assessment-test>
      `}
    `;
  }
}
