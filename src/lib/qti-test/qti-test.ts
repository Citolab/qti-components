/* eslint-disable wc/no-invalid-element-name */

import { html, LitElement } from 'lit';
import * as cheerio from 'cheerio';

import { customElement, property, query, queryAssignedElements, state } from 'lit/decorators.js';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';
import { QtiAssessmentTest } from './qti-assessment-test';
import { until } from 'lit/directives/until.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './qti-test.css?inline';
import { createRef, ref } from 'lit/directives/ref.js';

@customElement('qti-test')
export class QtiTest extends LitElement {
  @query('qti-test-part')
  _qtiTestPart;

  @state()
  private content: Promise<any>;

  @state()
  private _loadedItems = [];

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

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('packageURI')) {
      this._loadedItems = []; // empty all items
      this.content = this.fetchData(); // load new items async
    }
  }

  private _testFromImsmanifest = async href => {
    const response = await fetch(href);
    const imsmanifestXML = await response.text();
    await new Promise<void>(r => setTimeout(() => r(), 1000)); // Add some delay for demo purposes
    const $ = cheerio.load(imsmanifestXML, { xmlMode: true, xml: { xmlMode: true } });
    // <resource identifier="TST-bb-bi-22-examenvariant-1" type="imsqti_test_xmlv3p0" href="depitems/bb-bi-22-examenvariant-1.xml">
    const el = $('resource[type="imsqti_test_xmlv3p0"]').first();
    return el.attr('href');
  };

  private _itemsFromAssessmentTest = async href => {
    const response = await fetch(`${this.packageURI}/${href}`);
    const assessmentTestXML = await response.text();

    // Add some delay for demo purposes
    await new Promise<void>(r => setTimeout(() => r(), 1000));

    const $ = cheerio.load(assessmentTestXML, { xmlMode: true, xml: { xmlMode: true } });
    const items = [];
    $('qti-assessment-item-ref').each((_, element) => {
      const identifier = $(element).attr('identifier')!;
      const href = $(element).attr('href')!;
      const category = $(element).attr('category');
      items.push({ identifier, href, category });
    });
    return items;
  };

  fetchData = async () => {
    const assessmentTestHref = await this._testFromImsmanifest(this.packageURI + '/imsmanifest.xml');
    const assessmentTestItems = await this._itemsFromAssessmentTest(assessmentTestHref);
    this._itemLocation = `${this.packageURI}/${assessmentTestHref.substring(0, assessmentTestHref.lastIndexOf('/'))}`;
    this._loadedItems = assessmentTestItems;
  };

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

  async requestItem(identifier: string, oldIdentifier: string) {
    const fetchXml = async () => {
      const itemRefEl = this._itemRefEls.get(identifier);
      this._controller = new AbortController();
      const signal = this._controller.signal;
      try {
        const xmlFetch = await fetch(`${this._itemLocation}/${itemRefEl.href}`, { signal });
        const xmlText = await xmlFetch.text();
        oldIdentifier && (this._itemRefEls.get(oldIdentifier).xml = '');
        itemRefEl.xml = xmlText;
      } catch (error) {
        if (error.name === 'AbortError') {
          oldIdentifier && (this._itemRefEls.get(oldIdentifier).xml = '');
          console.log('Fetch aborted');
        } else {
          console.error(error);
        }
      }
    };
    this._controller?.abort();

    this._qtiTestPart.loading = true;
    await fetchXml();
    this._qtiTestPart.loading = false;
  }

  override render() {
    return html`
      ${until(this.content, html`<span>Loading...</span>`)}
      ${this._loadedItems.length > 0 &&
      html`
        <qti-assessment-test
        ${ref(this._assessmentTestEl)}
          @register-item-ref=${e => {
            this._itemRefEls.set(e.target.identifier, e.target);
            const itemRefEl = this._itemRefEls.get(e.target.identifier);
            e.target.itemLocation = `${this._itemLocation}/${itemRefEl.href}`;
          }}
          @on-test-set-item="${(e: CustomEvent<{ old: string; new: string }>) => {
            const { old, new: newItem } = e.detail;
            this.requestItem(newItem, old);
          }}"

        >
          <test-show-index></test-show-index>
          <qti-test-part>
            <qti-assessment-section>
              </qti-assessment-item-ref>
              ${this._loadedItems.map(
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
          <span class="sr-only">PREV</span>
            </test-prev>

            <test-paging-buttons></test-paging-buttons>
            
            <test-next>
              <span class="sr-only">NEXT</span>
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
