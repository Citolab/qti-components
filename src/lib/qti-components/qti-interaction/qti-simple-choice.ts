import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ActiveElementMixin } from './internal/active-element/active-element.mixin';

/**
 * qti-order-interaction
 * qti-choice-interaction
 */
@customElement('qti-simple-choice')
export class QtiSimpleChoice extends ActiveElementMixin(LitElement, 'qti-simple-choice') {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
    }
    slot {
      width: 100%;
      display: flex;
      align-items: center;
    }
    [part='ch'] {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
    }
  `;

  // property label
  @property({ type: String, attribute: false })
  public marker: string;


  get checked() {
    return this['internals'].states.has('checked');
  }

  override render() {
    return html`<div part="ch">
        <div part="cha"></div>
      </div>
      ${this.marker ? html`<div id="label">${this.marker}</div>` : nothing}
      <slot part="slot"></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-choice': QtiSimpleChoice;
  }
}
