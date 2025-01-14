import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { TestContext } from '../context';
import { testContext } from '../context';
import type { QtiAssessmentItem } from '../../../qti-components';

// Converter function to interpret "true" and "false" as booleans
const stringToBooleanConverter = {
  fromAttribute(value: string): boolean {
    return value === 'true';
  },
  toAttribute(value: boolean): string {
    return value ? 'true' : 'false';
  }
};

// @customElement('qti-assessment-item-ref')
export class QtiAssessmentItemRef extends LitElement {
  @property({ type: String }) category?: string;
  @property({ type: String }) identifier?: string;
  @property({ type: Boolean, converter: stringToBooleanConverter }) required?: boolean;
  @property({ type: Boolean, converter: stringToBooleanConverter }) fixed?: boolean;
  @property({ type: String }) href?: string;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  weigths: Map<string, number> = new Map();

  @property({ type: Object, attribute: false })
  xmlDoc!: DocumentFragment; // the XMLDocument

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  get assessmentItem(): QtiAssessmentItem | null {
    return this.renderRoot?.querySelector('qti-assessment-item');
  }

  async connectedCallback(): Promise<void> {
    // debugger;
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('qti-assessment-item-ref-connected', {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, href: this.href, category: this.category }
      })
    );
  }

  render() {
    return html`${this.xmlDoc}`;
  }
}

if (!customElements.get('qti-assessment-item-ref')) {
  customElements.define('qti-assessment-item-ref', QtiAssessmentItemRef);
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item-ref': QtiAssessmentItemRef;
  }
}
