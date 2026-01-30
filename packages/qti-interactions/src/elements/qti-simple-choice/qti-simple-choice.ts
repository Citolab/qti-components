import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';

/**
 * qti-order-interaction
 * qti-choice-interaction
 */
export class QtiSimpleChoice extends ActiveElementMixin(LitElement, 'qti-simple-choice') {
  @property({ type: String, attribute: 'template-identifier' })
  public templateIdentifier: string | null = null;

  @property({ type: String, attribute: 'show-hide' })
  public showHide: string | null = 'show';

  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value: string | null) => value === 'true',
      toAttribute: (value: boolean) => String(value)
    }
  })
  public fixed: boolean = false;

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
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
    return this['internals'].states.has('--checked');
  }

  override render() {
    return html`<div part="ch">
        <div part="cha"></div>
      </div>
      ${this.marker ? html`<div id="label">${this.marker}</div>` : nothing}
      <slot part="slot"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-choice': QtiSimpleChoice;
  }
}
