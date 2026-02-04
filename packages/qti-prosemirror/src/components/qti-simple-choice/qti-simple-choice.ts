import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import styles from '@qti-components/interactions/src/elements/qti-simple-choice/qti-simple-choice.styles';

import type { CSSResultGroup } from 'lit';

/**
 * qti-order-interaction
 * qti-choice-interaction
 */
export class QtiSimpleChoiceEdit extends LitElement {
  // make sure we can text select and click the choices
  static override styles: CSSResultGroup = [
    styles,
    css`
      :host {
        user-select: unset !important;
        cursor: unset !important;
      }
    `
  ];
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
