import { css, html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { AudienceContext, audienceContext } from '../context/audience-context';
import { provide } from '@lit/context';

import styles from '../../styles.css?inline';
import { qtiTransform } from '../qti-transform';
import { QtiAssessmentItem } from '../qti-components';

@customElement('qti-item')
/**
 * A custom element representing a QTI item.
 * @element qti-item
 */
export class QtiItem extends LitElement {
  /**
   * The location of the item.
   * @attr item-location
   */
  @property({ type: String, attribute: 'item-location' }) itemLocation = '';

  /**
   * Whether the item is disabled.
   */
  @property({ type: Boolean, attribute: false })
  disabled: boolean = false;

  /**
   * Updates the element.
   * @param changedProperties - The changed properties.
   */
  update(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('disabled')) {
      if (this.assessmentItem) this.assessmentItem.disabled = this.disabled;
    }
    super.update(changedProperties);
  }

  /**
   * The XML content of the item.
   */
  @state()
  protected _xml: string = '';

  /**
   * Sets the XML content of the item.
   * @param val - The XML content.
   */
  set xml(val: string) {
    this._xml = qtiTransform(val)
      .customTypes()
      .cDataToComment()
      .customDefinition()
      .assetsLocation(`${this.itemLocation}`)
      .xml();
  }

  /**
   * Sets the CSS content of the item.
   * @param val - The CSS content.
   */
  set css(val: string) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(val);
    this.shadowRoot?.adoptedStyleSheets.push(sheet);
  }

  /**
   * Returns the assessment item.
   */
  get assessmentItem(): QtiAssessmentItem | null {
    return this.shadowRoot?.querySelector('qti-assessment-item');
  }

  /**
   * The audience context. describes
   */
  @provide({ context: audienceContext })
  @property({ attribute: false })
  public audienceContext: AudienceContext = {
    view: 'candidate'
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.css = styles;
  }

  override render = () => html`${unsafeHTML(this._xml)}<slot></slot>`;
}
