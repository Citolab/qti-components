import { LitElement, PropertyValueMap } from 'lit';
export class QtiStylesheet extends LitElement {
  private styleLink: HTMLStyleElement | HTMLLinkElement;

  constructor() {
    super();
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties);

    const item = this.closest('qti-assessment-item');
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
    const item = this.closest('qti-assessment-item');
    if (this.styleLink && this.styleLink.parentElement === this) {
      try {
        item.removeChild(this.styleLink);
      } catch (error) {
        console.log('could not remove stylesheet');
      }
    }
  }
}

customElements.define('qti-stylesheet', QtiStylesheet);
