import { LitElement } from 'lit';
export class QtiStylesheet extends LitElement {
  private styleLink: HTMLStyleElement;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
    const item = this.closest('qti-assessment-item');
    const link = this.getAttribute('href');
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.type = 'text/css';
    styles.media = 'screen';
    styles.href = link;
    item.appendChild(styles);
    this.styleLink = styles;
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
