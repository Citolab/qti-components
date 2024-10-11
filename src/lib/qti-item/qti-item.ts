import styles from '../../item.css?inline';
import { VariableValue } from '../qti-components';

class QtiItem extends HTMLElement {
  view?: string;

  #renderRoot = null;

  set xmlDoc(xml: DocumentFragment) {
    if (!this.#renderRoot) {
      // eslint-disable-next-line wc/attach-shadow-constructor, wc/no-closed-shadow-root
      this.#renderRoot = this.attachShadow({ mode: 'open' }); // can not be closed, else drag and drops will not work
      const style = new CSSStyleSheet();
      style.replaceSync(styles);
      this.#renderRoot.adoptedStyleSheets = [style];
      this.#renderRoot.innerHTML = ''; // Clear any existing content

      this.#renderRoot.addEventListener('qti-interaction-changed', this.#variablesChanged);
      this.#renderRoot.addEventListener('qti-outcome-changed', this.#variablesChanged);
    }

    this.#renderRoot.innerHTML = ``;
    this.#renderRoot.appendChild(xml.cloneNode(true));
  }

  processResponse() {
    this.#assessmentItem?.variables?.processResponse() || console.warn('No qti-assessment-item found');
  }

  get variables(): VariableValue<string | string[] | null>[] {
    return this.#assessmentItem?.variables || console.warn('No qti-assessment-item found');
  }

  set variables(variables: VariableValue<string | string[] | null>[]) {
    this.#assessmentItem.variables = variables;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'view':
        break;

      default:
        if (oldValue !== newValue) {
          this[name as 'view'] = newValue;
        }
        break;
    }
  }

  /* Private methods */
  get #assessmentItem() {
    return this.#renderRoot.querySelector('qti-assessment-item') || console.warn('No qti-assessment-item found');
  }

  #variablesChanged = (e: CustomEvent<any>) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('qti-item-variables-changed', {
        bubbles: false,
        detail: {
          variables: this.#assessmentItem.variables
        }
      })
    );
  };
}

customElements.define('qti-item', QtiItem);

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
