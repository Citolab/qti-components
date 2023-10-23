/* eslint-disable wc/no-invalid-element-name */

import { html, LitElement } from 'lit';
import * as cheerio from 'cheerio';

import { customElement, property, query, state } from 'lit/decorators.js';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';
import { QtiAssessmentTest } from './qti-assessment-test';
import { until } from 'lit/directives/until.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './qti-test.css?inline';
import { createRef, ref } from 'lit/directives/ref.js';

@customElement('qti-test')
export class QtiTest extends LitElement {
  // @property({ type: String, attribute: 'navigation-mode' })
  // private _navigationMode: 'linear' | 'nonlinear' = 'linear';

  @state()
  private content: Promise<any>;

  @state()
  private _loadedItems = [];

  private _itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();
  private _controller = new AbortController();

  @property({ type: String, attribute: 'package-uri' })
  public packageURI: string = '';

  @property({ type: String, attribute: 'current-item-identifier' })
  public currentItemIdentifier: string = '';

  itemLocation: string;

  assessmentTestEl = createRef<QtiAssessmentTest>();

  set context(value: any) {
    this.assessmentTestEl.value.context = value;
  }

  get context(): any {
    return this.assessmentTestEl.value.context;
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
    await new Promise<void>(r => setTimeout(() => r(), 500)); // Add some delay for demo purposes
    const $ = cheerio.load(imsmanifestXML, { xmlMode: true, xml: { xmlMode: true } });
    // <resource identifier="TST-bb-bi-22-examenvariant-1" type="imsqti_test_xmlv3p0" href="depitems/bb-bi-22-examenvariant-1.xml">
    const el = $('resource[type="imsqti_test_xmlv3p0"]').first();
    return el.attr('href');
  };

  private _itemsFromAssessmentTest = async href => {
    const response = await fetch(`${this.packageURI}/${href}`);
    const assessmentTestXML = await response.text();

    // Add some delay for demo purposes
    await new Promise<void>(r => setTimeout(() => r(), 500));

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
    this.itemLocation = `${this.packageURI}/${assessmentTestHref.substring(0, assessmentTestHref.lastIndexOf('/'))}`;
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

  requestItem(identifier: string) {
    const fetchXml = async () => {
      for (const itemRef of this._itemRefEls.values()) {
        itemRef.xml = '';
        itemRef.removeAttribute('active');
      }
      const itemRefEl = this._itemRefEls.get(identifier);
      const controller = new AbortController();
      const signal = controller.signal;
      try {
        const xmlFetch = await fetch(`${this.itemLocation}/${itemRefEl.href}`, { signal });
        const xmlText = await xmlFetch.text();
        itemRefEl.xml = xmlText;
        itemRefEl.setAttribute('active', '');
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error(error);
        }
      }
    };
    if (this._controller) {
      this._controller.abort();
    }
    fetchXml();
  }

  override render() {
    return html`
      ${until(this.content, html`<span>Loading...</span>`)}
      ${this._loadedItems.length > 0 &&
      html`
        <qti-assessment-test
        ${ref(this.assessmentTestEl)}
          @register-item-ref=${e => {
            this._itemRefEls.set(e.target.identifier, e.target);
            const itemRefEl = this._itemRefEls.get(e.target.identifier);
            e.target.itemLocation = `${this.itemLocation}/${itemRefEl.href}`;
          }}
          @on-test-set-item=${({ detail: identifier }) => this.requestItem(identifier)}
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
          <test-prev>PREV</test-prev>
          <test-paging-buttons></test-paging-buttons>
          <test-next>NEXT</test-next>
          <!-- <test-paging-radio></test-paging-radio> -->
          <!-- <test-slider></test-slider> -->
          <!-- <test-show-correct>correct</test-show-correct> -->
          <!-- <test-print-variables></test-print-variables> -->
        </qti-assessment-test>
      `}
    `;
  }
}
