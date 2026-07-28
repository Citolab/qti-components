import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-gap-text.styles';

import type { CSSResultGroup } from 'lit';

/**
 * A draggable text token that fills a `qti-gap` inside `qti-gap-match-interaction`.
 *
 * @customElement qti-gap-text
 *
 * @attr {string} identifier - Required. Value recorded in the response pair when this token is
 *   placed into a gap.
 * @attr {number} [match-max=1] - How many gaps this token may fill; `0` means unlimited.
 *   Read from the DOM by the drag-drop mixin.
 * @attr {number} [match-min=0] - Minimum gaps this token must fill.
 * @attr {boolean} [fixed=false] - Pins this token in place when the interaction is shuffled.
 * @attr {string} template-identifier - Not implemented. Identifier of a template variable
 *   controlling this token's visibility.
 * @attr {'show'|'hide'} [show-hide=show] - Not implemented. How `template-identifier` controls
 *   visibility.
 */
export class QtiGapText extends ActiveElementMixin(LitElement, 'qti-gap-text') {
  static override styles: CSSResultGroup = styles;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('slot', 'drags');
  }

  override render() {
    return html`<div part="control"></div>
      <slot part="label"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-text': QtiGapText;
  }
}
