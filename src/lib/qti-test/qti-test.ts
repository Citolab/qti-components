import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { TestLoaderMixin, TestNavigationMixin, TestViewMixin } from './mixins';
import { TestBase } from './test-base';

/**
 * `<qti-test>` is a custom element designed for rendering and interacting with QTI (Question and Test Interoperability) tests.
 *
 * This component leverages several mixins to provide functionality for loading, navigating, processing, and displaying QTI test assessments.
 *
 * ### Example Usage
 *
 * Minimal markup:
 * ```html
 * <qti-test test="./path/to/assessment.xml">
 *   <test-container></test-container>
 * </qti-test>
 * ```
 *
 * With navigation buttons:
 * ```html
 * <qti-test test="./path/to/assessment.xml">
 *   <test-container></test-container>
 *   <div class="flex">
 *      <test-prev></test-prev>
 *      <test-next></test-next>
 *   </div>
 * </qti-test>
 * ```
 *
 * You can use normal class names to style the elements.
 * And you can use the `test-prev` and `test-next` elements to navigate through the test.
 *
 * @attr {string} testURL - the relative location to the QTI assessment.xml file
 *
 * @tag qti-player
 *
 * ### Features
 *
 * - **Dynamic Template Loading**:
 *   If a `<template>` element is included as a child of `<qti-test>`, its content is dynamically appended to the shadow DOM.
 *
 * - **Extensibility**:
 *   Built on a mixin architecture for modular functionality.
 */
@customElement('qti-test')
export class QtiTest extends TestLoaderMixin(TestNavigationMixin(TestViewMixin(TestBase))) {
  /**
   * Lifecycle callback invoked when the element is added to the DOM.
   * Automatically appends the content of a `<template>` element (if present)
   * to the shadow DOM.
   */
  override connectedCallback() {
    super.connectedCallback();
    const template = this.querySelector(':scope > template') as HTMLTemplateElement;
    if (template) {
      this.shadowRoot?.appendChild(template.content);
    }
  }

  /**
   * Renders the component's template.
   * Provides a default `<slot>` for content projection.
   */
  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test': QtiTest;
  }
}
