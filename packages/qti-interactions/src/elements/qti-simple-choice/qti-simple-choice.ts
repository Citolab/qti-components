import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-simple-choice.styles';

import type { CSSResultGroup } from 'lit';

/**
 * qti-order-interaction
 * qti-choice-interaction
 */
export class QtiSimpleChoice extends ActiveElementMixin(LitElement, 'qti-simple-choice') {
  static override styles: CSSResultGroup = styles;

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
