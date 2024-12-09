import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

import itemCss from '../../../item.css?inline';

/**
 * `<test-container>` is a custom element designed for hosting the qti-assessment-test.
 * The `qti-assessment-test` will be placed inside the shadow DOM of this element.
 *
 * ### Example Usage
 * The `test-container` element to hosts the visual representation of the items.
 * You can style the container by adding a class to the element.
 *
 * ```html
 * <qti-test testurl="./path/to/assessment.xml">
 *   <test-container class="container bg-white m-2"></test-container>
 * </qti-test>
 * ```
 *
 * @tag test-container
 */
@customElement('test-container')
export class TestContainer extends LitElement {
  /**
   * Internal state for the dynamically loaded content.
   * This is a Promise resolving to the content that will be rendered.
   */
  @state()
  private content: Promise<DocumentFragment>;

  /**
   * Preloaded content from a `<template>` child, if present.
   */
  private preContent: any;

  /**
   * Lifecycle callback invoked when the element is added to the DOM.
   * Handles template preloading and dispatches a `qti-load-test-request` event
   * if no template is found.
   */
  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    const template = this.querySelector('template') as HTMLTemplateElement;
    if (template) {
      this.preContent = template.content;
    } else {
      this.preContent = html``;

      // Dynamically create and apply styles
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(itemCss);
      this.shadowRoot.adoptedStyleSheets = [sheet];

      await this.updateComplete;

      // Dispatch a custom event to request test content
      const event = new CustomEvent<{ promise: Promise<DocumentFragment> }>('qti-load-test-request', {
        bubbles: true,
        composed: true,
        detail: {
          promise: null
        }
      });

      const preventDefault = this.dispatchEvent(event);
      if (!preventDefault) {
        console.warn('No qti-load-test-request listener found');
        this.preContent = html`<span>qti-load-test-request was not catched</span>`;
      } else {
        this.content = (async () => {
          return await event.detail.promise;
        })();
      }
    }
  }

  /**
   * Renders the component content.
   * Preloaded template content is rendered first, followed by the default slot
   * and dynamically loaded content.
   */
  render() {
    return html`
      ${this.preContent}
      <slot></slot>
      ${until(this.content, html`<span>Loading...</span>`)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-container': TestContainer;
  }
}
