import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-components';

type Constructor<T = {}> = new (...args: any[]) => T;

export interface QtiItemInterface {
  identifier?: string;
  href?: string;
  xmlDoc: DocumentFragment;
  assessmentItem: QtiAssessmentItem | null;
}

export function QtiItemMixin<T extends Constructor<LitElement>>(Base: T) {
  class QtiItemClass extends Base {
    @property({ type: String, reflect: true }) identifier?: string;
    @property({ type: String }) href?: string;

    @property({ type: Object, attribute: false })
    xmlDoc!: DocumentFragment; // the XMLDocument

    protected createRenderRoot(): HTMLElement | DocumentFragment {
      return this;
    }

    get assessmentItem(): QtiAssessmentItem | null {
      return this.renderRoot?.querySelector('qti-assessment-item');
    }

    async connectedCallback(): Promise<void> {
      super.connectedCallback();
      await this.updateComplete;
      this.dispatchEvent(
        new CustomEvent('qti-item-connected', {
          bubbles: true,
          composed: true,
          detail: { identifier: this.identifier, href: this.href }
        })
      );
    }

    render() {
      return html`${this.xmlDoc}`;
    }
  }
  return QtiItemClass as Constructor<QtiItemInterface> & T;
}
