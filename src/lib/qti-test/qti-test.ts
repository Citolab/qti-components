/* eslint-disable wc/no-invalid-element-name */

import { html, LitElement } from 'lit';
import * as cheerio from 'cheerio';

import { customElement, property, query, state } from 'lit/decorators.js';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';
import { QtiAssessmentTest } from './qti-assessment-test';
import { until } from 'lit/directives/until.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// import './index';

@customElement('qti-test')
export class QtiTest extends LitElement {
  // @property({ type: String, attribute: 'navigation-mode' })
  // private _navigationMode: 'linear' | 'nonlinear' = 'linear';

  @property({ type: String, attribute: 'assessment-test-uri' })
  public assessmentTestURI: string = '';

  @state()
  private _loadedItems = [];

  private _itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();
  private _controller = new AbortController();
  itemLocation: string;

  getAssessmentTest(): QtiAssessmentTest {
    return this.querySelector<QtiAssessmentTest>('qti-assessment-test');
  }

  fetchData = async () => {
    const uri = this.getAttribute('assessment-test-uri');
    const response = await fetch(uri);
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
    this._loadedItems = items;
  };

  @state()
  private content: Promise<any>;

  connectedCallback(): void {
    super.connectedCallback();
    this.content = this.fetchData();

    this.itemLocation = this.assessmentTestURI.substring(0, this.assessmentTestURI.lastIndexOf('/'));
  }

  requestItem(identifier: string) {
    const fetchXml = async () => {
      for (const itemRef of this._itemRefEls.values()) {
        itemRef.xml = '';
      }
      const itemRefEl = this._itemRefEls.get(identifier);
      const controller = new AbortController();
      const signal = controller.signal;
      try {
        const xmlFetch = await fetch(`${this.itemLocation}/${itemRefEl.href}`, { signal });
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
          @register-item-ref=${e => {
            this._itemRefEls.set(e.target.identifier, e.target);
            e.target.itemLocation = `${this.itemLocation}/${e.target.href}`;
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
                  >
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
      `}
    `;
  }
}
