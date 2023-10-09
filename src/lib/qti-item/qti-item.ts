import { css, html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { AudienceContext, audienceContext } from '../context/audience-context';
import { provide } from '@lit-labs/context';

import styles from '../../styles.css?inline';
import { qtiTransform } from '../qti-transform';
import { QtiAssessmentItem } from '../qti-components';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @property({ type: String, attribute: 'item-location' }) itemLocation = '';

  @property({ type: Boolean, attribute: false })
  disabled: boolean = false;

  update(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('disabled')) {
      if (this.assessmentItem) this.assessmentItem.disabled = this.disabled;
    }
    super.update(changedProperties);
  }

  @state()
  private _xml: string = '';

  set xml(val: string) {
    this._xml = qtiTransform(val)
      .customTypes()
      .cDataToComment()
      .customDefinition()
      .assetsLocation(`${this.itemLocation}`)
      .xml();
  }

  set css(val: string) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(val);
    this.shadowRoot?.adoptedStyleSheets.push(sheet);
  }

  get assessmentItem(): QtiAssessmentItem | null {
    return this.shadowRoot?.querySelector('qti-assessment-item');
  }

  @provide({ context: audienceContext })
  @property({ attribute: false })
  public audienceContext: AudienceContext = {
    view: 'candidate'
  };

  constructor() {
    super();
    // this.addEventListener('qti-item-connected', (e: any) => (this.assessmentItem = e.detail));
    // this.addEventListener('qti-item-disconnected', (e: any) => (this.assessmentItem = null));
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.css = styles;
  }

  override render = () => html`${unsafeHTML(this._xml)}<slot></slot>`;
}
