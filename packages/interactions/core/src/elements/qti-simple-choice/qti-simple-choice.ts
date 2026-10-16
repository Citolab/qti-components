import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-simple-choice.styles';

import type { CSSResultGroup } from 'lit';

/**
 * A choice, used by `qti-choice-interaction` and `qti-order-interaction`.
 *
 * The `control` part is one box whose *role* is carried by state, not by its name: a radio
 * circle under `:state(radio)`, a checkbox square under `:state(checkbox)`, and a drag grip
 * when the choice is draggable. Style it as `qti-simple-choice::part(control)`.
 *
 * @customElement qti-simple-choice
 *
 * @attr {string} identifier - Required. Value recorded in the response when this choice is
 *   selected, or its position when used for ordering.
 * @attr {boolean} [fixed=false] - Pins this choice in place when the enclosing interaction is
 *   shuffled.
 * @attr {string} template-identifier - Identifier of a template variable controlling this
 *   choice's visibility.
 * @attr {'show'|'hide'} [show-hide=show] - How `template-identifier` controls visibility.
 *
 * @csspart control - The box before the label (radio / checkbox / drag grip).
 * @csspart control-mark - The mark inside the box (inner dot / checkmark).
 * @csspart label - The default slot holding the choice content.
 * @csspart marker - The order-number badge, when `marker` is set.
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
    return this['internals'].states.has('checked');
  }

  override render() {
    // The host takes focus (it carries the tabindex, see ActiveElementMixin), not the control: a
    // focusable control inside a delegating shadow root made the host miss `:focus-visible`, so the
    // theme's ring could not be drawn on the choice, and the browser drew its own on the radio.
    return html`<div part="control"><div part="control-mark"></div></div>
      ${this.marker ? html`<div id="label" part="marker">${this.marker}</div>` : nothing}
      <slot part="label"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-choice': QtiSimpleChoice;
  }
}
