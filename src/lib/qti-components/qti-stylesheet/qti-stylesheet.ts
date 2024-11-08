import { LitElement, PropertyValueMap } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-stylesheet')
export class QtiStylesheet extends LitElement {
  private styleLink: HTMLStyleElement | HTMLLinkElement;

  // protected createRenderRoot(): HTMLElement | DocumentFragment {
  //   return this;
  // }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties);

    const item = this.getRootNode();
    const link = this.getAttribute('href');

    if (link !== null) {
      const styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.type = 'text/css';
      styles.media = 'screen';
      styles.href = link;
      item.appendChild(styles);
      this.styleLink = styles;
    }

    if (this.textContent !== null) {
      const styles = document.createElement('style');
      styles.media = 'screen';
      styles.textContent = this.textContent;
      item.appendChild(styles);
      this.styleLink = styles;
    }
  }

  override disconnectedCallback() {
    if (this.styleLink) {
      try {
        this.styleLink.remove();
      } catch (error) {
        console.log('could not remove stylesheet');
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-stylesheet': QtiStylesheet;
  }
}
