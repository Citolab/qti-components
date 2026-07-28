import { html, LitElement } from 'lit';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-hottext.styles';

import type { CSSResultGroup } from 'lit';

/**
 * A selectable span of text inside `qti-hottext-interaction`.
 *
 * @customElement qti-hottext
 *
 * @attr {string} identifier - Required. Value recorded in the response when this span is
 *   selected.
 * @attr {string} template-identifier - Not implemented. Identifier of a template variable
 *   controlling this span's visibility.
 * @attr {'show'|'hide'} [show-hide=show] - Not implemented. How `template-identifier` controls
 *   visibility.
 */
export class QtiHottext extends ActiveElementMixin(LitElement, 'qti-hottext') {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<div part="control"><div part="control-mark"></div></div>
      <slot part="label"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hottext': QtiHottext;
  }
}
