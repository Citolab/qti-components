import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

import { watch } from '../../decorators/watch';
import itemCss from '../../../item.css?inline';
import { qtiTransformTest } from '../../qti-transformers';

import type { QtiTest } from '../../exports/qti-test';
/**
 * `<test-container>` is a custom element designed for hosting the qti-assessment-item.
 * The `qti-assessment-test` will be placed inside the shadow DOM of this element.
 * The element loads the test from the provided URL and renders it inside the shadow DOM.
 *
 * ```html
 * <qti-test>
 *   <test-navigation>
 *      <test-container class="m-4 bg-white" test-url="./path/to/assessmenttest.xml"></test-container>
 *   </test-navigation>
 * </qti-test>
 * ```
 */
@customElement('test-container')
export class TestContainer extends LitElement {
  /** URL of the item to load */
  @property({ type: String, attribute: 'test-url' })
  testURL: string = null;

  /** A parsed HTML document */
  @state()
  testDoc: DocumentFragment = null;

  /** The raw XML string */
  @state()
  testXML: string = null;

  /** Template content if provided */
  private templateContent = null;

  /** Callback function to transform the test after loading */
  // @property({ type: Function }) postLoadTestTransformCallback: PostLoadTestTransformCallback | null = null;

  @watch('testURL', { waitUntilFirstUpdate: true })
  protected async handleTestURLChange() {
    if (!this.testURL) return;
    try {
      let api = await qtiTransformTest().load(this.testURL);
      // Apply external transformation if provided
      const qtiTest = this.closest('qti-test') as unknown as QtiTest;
      if (qtiTest?.postLoadTestTransformCallback) {
        // Create a temporary document to get the test element reference
        const tempDoc = api.htmlDoc();
        const testElement = tempDoc.querySelector('qti-assessment-test') as any;

        if (testElement) {
          // Apply the callback with the test element
          api = await qtiTest.postLoadTestTransformCallback(api, testElement);
        }
      }

      this.testDoc = api.htmlDoc();
    } catch (error) {
      console.error('Error loading or parsing XML:', error);
    }
  }

  @watch('testXML', { waitUntilFirstUpdate: true })
  protected handleTestXMLChange() {
    if (!this.testXML) return;
    try {
      this.testDoc = qtiTransformTest().parse(this.testXML).htmlDoc();
    } catch (error) {
      console.error('Error parsing XML:', error);
    }
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.initializeTemplateContent();
    this.applyStyles();
    if (this.testURL) {
      this.handleTestURLChange();
    }
    if (this.testXML) {
      this.handleTestXMLChange();
    }
  }

  private initializeTemplateContent() {
    const template = this.querySelector('template') as HTMLTemplateElement;
    this.templateContent = template ? template.content : html``;
  }

  private applyStyles() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(itemCss);
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  render() {
    return html`
      ${this.templateContent}
      <slot></slot>
      ${until(this.testDoc, html`<span>Loading...</span>`)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-container': TestContainer;
  }
}
