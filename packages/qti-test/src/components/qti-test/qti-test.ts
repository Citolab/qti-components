import { ContextProvider, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';

import { configContext, qtiContext } from '@qti-components/base';

import { testHostContext } from '../../internal/test-host.context';
import { TestNavigationMixin, TestViewMixin } from '../../mixins';
import { TestBaseMixin } from '../../mixins/test-base';
import { TestProcessingMixin } from '../../mixins/test-processing.mixin';
import { TestStateMixin } from '../../mixins/test-state.mixin';

import type { ConfigContext, QtiContext } from '@qti-components/base';
import type { IQtiTest } from '../../types/iqti-test';

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
 *  <test-navigation>
 *    <test-container test-url="./path/to/assessment.xml"></test-container>
 *    <nav class="flex">
 *      <test-prev></test-prev>
 *      <test-next></test-next>
 *    </nav>
 *  </test-navigation>
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
 * @event qti-state-changed - The candidate's persistable state changed. `detail` is a `QtiTestState`; assign it back to `state` to resume.
 * @event qti-test-context-updated - Deprecated: listen to `qti-state-changed` to persist a session. `detail` is the full test context, including declaration metadata and the answer key. Removed in the next major.
 */

export class QtiTest extends TestNavigationMixin(
  TestViewMixin(TestProcessingMixin(TestStateMixin(TestBaseMixin(LitElement))))
) {
  // TODO: Properly implement IQtiTest interface
  // export class QtiTest extends TestLoaderMixin(TestNavigationMixin(TestViewMixin(TestBase))) {

  constructor() {
    super();
    // The components inside find their test through this, across shadow roots (see TestHost).
    new ContextProvider(this, { context: testHostContext, initialValue: this });
  }

  @state()
  @provide({ context: configContext })
  public configContext: ConfigContext = {};

  /**
   * Who is taking which test, and the optional shuffle `seed`. Provided here, at the test, so
   * everything inside reads one value: the test-container shuffling the item order, the test
   * shuffling interactions as it navigates, and the expressions that read `QTI_CONTEXT`.
   *
   * Pass the same `seed` when resuming a session, or the order comes back different. Replace the
   * object, do not mutate it: an in-place change does not notify the components inside.
   *
   * `test-navigation.qtiContext` is an alias of this.
   */
  @state()
  @provide({ context: qtiContext })
  public qtiContext: QtiContext = {
    QTI_CONTEXT: {
      testIdentifier: '',
      candidateIdentifier: '',
      environmentIdentifier: 'default'
    }
  };

  /**
   * Renders the component's template.
   * Provides a default `<slot>` for content projection.
   */
  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(new CustomEvent('qti-test-connected', { detail: this }));
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test': QtiTest;
  }
}
