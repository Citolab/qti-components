import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

import { qtiContext } from '@qti-components/base';
import { watch } from '@qti-components/utilities';
import { qtiTransformTest } from '@qti-components/transformers';

// eslint-disable-next-line import/no-relative-packages
import itemCss from '../../../../qti-theme/src/item.css?inline';

import type { QtiContext } from '@qti-components/base';

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

export class TestContainer extends LitElement {
  /** Scoped registry used by the test shadow root. Must be set before connection. */
  @property({ attribute: false })
  customElementRegistry: CustomElementRegistry | null = null;

  /** URL of the item to load */
  @property({ type: String, attribute: 'test-url' })
  testURL: string | null = null;

  /** A parsed HTML document */
  @state()
  testDoc: DocumentFragment | null = null;

  /** The raw XML string */
  @state()
  testXML: string | null = null;

  @state()
  @consume({ context: qtiContext, subscribe: true })
  protected qtiContext: QtiContext = {
    QTI_CONTEXT: { testIdentifier: '', candidateIdentifier: '', environmentIdentifier: 'default' }
  };

  /** Template content if provided */
  #templateContent: unknown = null;
  #resolvedCustomElementRegistry: CustomElementRegistry | null = null;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const registry = this.customElementRegistry;

    this.#resolvedCustomElementRegistry = registry;

    return (
      this.shadowRoot ??
      this.attachShadow({
        ...(this.constructor as typeof TestContainer).shadowRootOptions,
        ...(registry ? { customElementRegistry: registry } : {})
      })
    );
  }

  /** Callback function to transform the test after loading */
  // @property({ type: Function }) postLoadTestTransformCallback: PostLoadTestTransformCallback | null = null;

  @watch('testURL', { waitUntilFirstUpdate: true })
  protected async handleTestURLChange() {
    if (!this.testURL) return;
    try {
      const explicitSeed = this.qtiContext?.QTI_CONTEXT?.seed;
      let api = (await qtiTransformTest().load(this.testURL)).shuffleOrdering(explicitSeed);
      // Apply external transformation if provided
      const qtiTest = this.closest('qti-test') as any; // Type assertion to access mixin properties
      if (qtiTest?.postLoadTestTransformCallback) {
        // Create a temporary document to get the test element reference
        const tempDoc = api.htmlDoc(this.#resolvedCustomElementRegistry ?? undefined);
        const testElement = tempDoc.querySelector('qti-assessment-test') as any;

        if (testElement) {
          // Apply the callback with the test element
          api = await qtiTest.postLoadTestTransformCallback(api, testElement);
        }
      }

      this.#setTestDoc(api.htmlDoc(this.#resolvedCustomElementRegistry ?? undefined));
    } catch (error) {
      console.error('Error loading or parsing XML:', error);
    }
  }

  /**
   * Assign a new test document and announce it.
   *
   * The announcement has to happen here rather than on
   * `qti-assessment-test-connected`, because by then the new document's
   * children have already connected and registered themselves — a host that
   * resets its context on that event throws those registrations away. Lit's
   * re-render is async, so a handler running now still gets in before any child
   * of the new `qti-assessment-test` connects.
   */
  #setTestDoc(testDoc: DocumentFragment): void {
    this.testDoc = testDoc;
    this.dispatchEvent(
      new CustomEvent('qti-testdoc-loaded', {
        bubbles: true,
        composed: true
      })
    );
  }

  @watch('testXML', { waitUntilFirstUpdate: true })
  protected handleTestXMLChange() {
    if (!this.testXML) return;
    try {
      const explicitSeed = this.qtiContext?.QTI_CONTEXT?.seed;
      this.#setTestDoc(
        qtiTransformTest()
          .parse(this.testXML)
          .shuffleOrdering(explicitSeed)
          .htmlDoc(this.#resolvedCustomElementRegistry ?? undefined)
      );
    } catch (error) {
      console.error('Error parsing XML:', error);
    }
  }

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.#initializeTemplateContent();
    this.#applyStyles();
    if (this.testURL) {
      this.handleTestURLChange();
    }
    if (this.testXML) {
      this.handleTestXMLChange();
    }
  }

  #initializeTemplateContent() {
    const template = this.querySelector('template') as HTMLTemplateElement;
    this.#templateContent = template ? template.content : html``;
  }

  #applyStyles() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(itemCss);
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  override render() {
    return html`
      ${this.#templateContent}
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
