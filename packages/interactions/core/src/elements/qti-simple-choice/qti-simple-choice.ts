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
 * @csspart control - The box before the label (radio / checkbox / drag grip).
 * @csspart control-mark - The mark inside the box (inner dot / checkmark).
 * @csspart label - The default slot holding the choice content.
 * @csspart marker - The order-number badge, when `marker` is set.
 */
export class QtiSimpleChoice extends ActiveElementMixin(LitElement, 'qti-simple-choice') {
  static override styles: CSSResultGroup = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true
  };

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
    return html`<div part="control" tabindex="0"><div part="control-mark"></div></div>
      ${this.marker ? html`<div id="label" part="marker">${this.marker}</div>` : nothing}
      <slot part="label"></slot>
      <span part=${this.correctionPart} aria-hidden="true"></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-choice': QtiSimpleChoice;
  }
}
