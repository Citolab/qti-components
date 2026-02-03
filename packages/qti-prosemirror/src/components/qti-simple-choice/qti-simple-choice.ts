import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

// eslint-disable-next-line import/no-relative-packages
import styles from '../../../../qti-interactions/src/elements/qti-simple-choice/qti-simple-choice.styles';

import type { CSSResultGroup } from 'lit';

/**
 * qti-order-interaction
 * qti-choice-interaction
 */
export class QtiSimpleChoiceEdit extends LitElement {
  static override styles: CSSResultGroup = styles;

  public internals: ElementInternals;
  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  // property label
  @property({ type: String, attribute: false })
  public marker: string;

  override render() {
    return html`<div part="ch">
        <div part="cha"></div>
      </div>
      ${this.marker ? html`<div id="label">${this.marker}</div>` : nothing}
      <slot part="slot"></slot>`;
  }
}
customElements.define('qti-simple-choice', QtiSimpleChoiceEdit);
