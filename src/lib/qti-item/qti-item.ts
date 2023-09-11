import { css, html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { audienceContext } from '../context/audience-context';
import { ContextProvider } from '@lit-labs/context';

import styles from '../../styles.css?inline';
import { qtiTransform } from '../qti-transform';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @property({ type: String, attribute: 'item-location' }) itemLocation = '';

  public set audienceContext(context: {
    view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';
  }) {
    this.provider.value.view = context.view;
    this.provider.updateObservers();
  }

  private provider = new ContextProvider(this, audienceContext, {
    view: 'candidate'
  });

  private _xml;
  set xml(val: string) {
    const oldVal = this._xml;
    this._xml = qtiTransform(val).customTypes().customDefinition().assetsLocation(`${this.itemLocation}`).xml(); // .assetsLocation(`${this.itemLocation}/`).removeNamesSpaces().xml();
    this.requestUpdate('xml', oldVal);
    // this.setAttribute('xml', '--cleared--'); // we clear this after setting the XML, else the dom isn't readably anymore with this large string
  }
  @property({ type: String })
  get xml() {
    return this._xml;
  }

  static override styles = css`
    :host {
      display: block;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    // const sheet = new CSSStyleSheet();
    // sheet.replaceSync(styles);
    // this.shadowRoot.adoptedStyleSheets.push(sheet);
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    this.shadowRoot.appendChild(styleTag);
  }

  // PK: the slot here is just added for the image which will join later qti-extended, qti-ext, screenshot
  override render = () => html`${unsafeHTML(this._xml)}<slot></slot>`;
}
