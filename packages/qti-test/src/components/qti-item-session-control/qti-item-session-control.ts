import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

// Converter function to interpret "true" and "false" as booleans
const stringToBooleanConverter = {
  fromAttribute(value: string): boolean {
    return value === 'true';
  },
  toAttribute(value: boolean): string {
    return value ? 'true' : 'false';
  }
};

/**
 * @summary The qti-item-session-control element contains configurations relating to flow of test sessions.
 * @documentation https://www.imsglobal.org/sites/default/files/spec/qti/v3/info/imsqti_asi_v3p0p1_infomodel_v1p0.html#Derived_ItemSessionControl
 */
export class QtiItemSessionControl extends LitElement {
  @property({ type: Number, attribute: 'max-attempts' })
  maxAttempts: number = 1;

  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'show-feedback' })
  showFeedback = false;

  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'allow-review' })
  allowReview = true;

  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'show-solution' })
  showSolution = false;

  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'allow-comment' })
  allowComment = false;

  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'allow-skipping' })
  allowSkipping = true;

  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'validate-responses' })
  validateResponses = false;

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('qti-item-session-control-connected', {
        detail: this,
        bubbles: true,
        composed: true
      })
    );
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item-session-control': QtiItemSessionControl;
  }
}
