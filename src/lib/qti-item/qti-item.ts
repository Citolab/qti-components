import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { QtiItemMixin } from './qti-item.mixin';
import itemCss from '../../item.css?inline';

@customElement('qti-item')
export class QtiItem extends QtiItemMixin(LitElement) {
  connectedCallback() {
    super.connectedCallback();
    // Dynamically create and apply styles
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(itemCss);
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
