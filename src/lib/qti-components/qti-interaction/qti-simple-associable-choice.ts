import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ActiveElementMixin } from './internal/active-element/active-element.mixin';

/* 
qti-match-interaction
qti-associate-interaction
*/
@customElement('qti-simple-associable-choice')
// tslint:disable: indent
export class QtiSimpleAssociableChoice extends ActiveElementMixin(LitElement, 'qti-simple-associable-choice') {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
    }
    slot {
      width: 100%;
      display: block;
    }
    slot[name='qti-simple-associable-choice'] {
      width: 100%;
    }
  `;

  /** the minimal number of selections a candidate must make */
  @property({
    type: Number,
    attribute: 'match-min'
  })
  public matchMin: number = 0;

  /** the maximum number of selections a candidate must make, the other options will be disabled when max options is checked */
  @property({
    type: Number,
    attribute: 'match-max'
  })
  public matchMax: number = 1;

  @property({
    type: String,
    attribute: 'fixed',
    converter: {
      fromAttribute: (value: string | null) => value === 'true',
      toAttribute: (value: boolean) => String(value)
    }
  })
  public fixed: boolean = false;

  // pk: This needs some explanation
  // in the associate interaction there is a special slot for these qti-simple-associable-choices
  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('slot', 'qti-simple-associable-choice');
    this.setAttribute('part', 'qti-simple-associable-choice');
  }

  // pk: This needs some explanation
  // in qti-match-interaction, qti-simple-associable-choice is used to denote the
  // draggable, but also the droppable. WEIRD.. but lets deal with it.
  // So we have a slot for whenever another qti-simple-associable-choice is dropped in here.
  // And we have slot for content like in this associate interaction
  override render() {
    return html`
      <slot part="slot"></slot>
      <slot part="dropslot" name="qti-simple-associable-choice"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-associable-choice': QtiSimpleAssociableChoice;
  }
}
