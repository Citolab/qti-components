import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const initialContextValue = {
  items: [],
  testOutcomeVariables: []
};

/**
 * @fires qti-assessment-item-connected - Fired when the first item is updated
 * @fires qti-interaction-changed - Fired when an interaction changes
 * @fires qti-outcome-changed - Fired when an outcome changes
 *
 * @prop {string} identifier - The identifier of the test
 * @prop {string} view - The view of the test
 * @prop {TestContext} context - The context of the test
 */
@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  // @consume({ context: sessionContext, subscribe: true })
  // @state()
  // public _sessionContext?: SessionContext;

  // updated(changedProperties: PropertyValues<this>) {
  //   if (changedProperties.has('_sessionContext')) {
  //     this.itemRefEls.forEach((itemRefEl, identifier) => {
  //       itemRefEl.view = this._sessionContext.view;
  //     });
  //     this.querySelectorAll('[view]')?.forEach((element: HTMLElement) => {
  //       element.getAttribute('view') === this._sessionContext.view
  //         ? element.classList.add('show')
  //         : element.classList.remove('show');
  //     });
  //   }
  // }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new Event('qti-assessment-test-connected', {
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html` <slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-test': QtiAssessmentTest;
  }
}
