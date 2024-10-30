import type { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

declare class QtiItemMixinInterface {}
export const QtiItemMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class QtiItemMixinClass extends superClass {
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

  return QtiItemMixinClass as Constructor<QtiItemMixinInterface> & T;
};
