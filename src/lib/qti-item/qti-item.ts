import styles from '../../item.css?inline';

class QtiItem extends HTMLElement {
  identifier?: string;
  href?: string;

  set xmlDoc(xml: DocumentFragment) {
    // eslint-disable-next-line wc/attach-shadow-constructor
    this.attachShadow({ mode: 'open' });
    const style = new CSSStyleSheet();
    style.replaceSync(styles);
    this.shadowRoot.adoptedStyleSheets = [style];
    this.shadowRoot.innerHTML = ''; // Clear any existing content
    this.shadowRoot.appendChild(xml.cloneNode(true));
  }

  connectedCallback() {
    // Initialize properties
    this.identifier = this.getAttribute('identifier') || undefined;
    this.href = this.getAttribute('href') || undefined;

    // Dispatch the custom event
    this.dispatchEvent(
      new CustomEvent('qti-item-connected', {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, href: this.href }
      })
    );
  }

  static get observedAttributes() {
    return ['identifier', 'href'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this[name as 'identifier' | 'href'] = newValue;
    }
  }
}

customElements.define('qti-item', QtiItem);

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
