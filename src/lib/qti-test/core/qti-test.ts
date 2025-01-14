import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { TestLoaderMixin, TestNavigationMixin, TestViewMixin } from './mixins';
import { TestBase } from './test-base';
import { TestProcessingMixin } from './mixins/test-processing.mixin';

/**
 * `<qti-test>` is a custom element designed for rendering and interacting with QTI (Question and Test Interoperability) tests.
 *
 * This component leverages several mixins to provide functionality for loading, navigating, processing, and displaying QTI test assessments.
 *
 * ### Example Usage
 *
 * Minimal example including navigation:
 *
 * ```html
 * <qti-test>
 *   <test-container test-url="./path/to/assessment.xml"></test-container>
 *   <nav class="flex">
 *      <test-prev></test-prev>
 *      <test-next></test-next>
 *   </nav>
 * </qti-test>
 * ```
 *
 * Use the following file structure
 * A qti-test loads a QTI3.0 assessmenttest.xml file from a package folder.
 *
 * ```plaintext
 * Root/
 * ├── index.html
 * └── /assets/api/examples/
 *     ├── assessmenttest.xml
 *     └── imsmanifest.xml
 *
 * ```
 *
 * ### Test components
 *
 * Use test components inside the qti-test component for added functionality.
 * ### Test next
 * `<test-next> | TestNext`
 *
 * ### Test prev
 *
 * `<test-prev> | TestPrev`
 * ### Test components
 *
 * You can use normal class names to style the elements.
 * And you can use the `test-prev` and `test-next` elements to navigate through the test.
 *
 */
@customElement('qti-test')
export class QtiTest extends TestLoaderMixin(TestProcessingMixin(TestNavigationMixin(TestViewMixin(TestBase)))) {
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
