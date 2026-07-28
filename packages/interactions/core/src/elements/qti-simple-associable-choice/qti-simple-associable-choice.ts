import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { consume } from '@lit/context';

import { dragDropContext } from '../../context/drag-drop.context';
import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-simple-associable-choice.styles';

import type { DragDropState } from '../../context/drag-drop.context';
import type { CSSResultGroup } from 'lit';

/**
 * A choice in one of the two match sets of `qti-match-interaction`, or in
 * `qti-associate-interaction`.
 *
 * @customElement qti-simple-associable-choice
 *
 * @attr {string} identifier - Required. Value recorded in the response pair when this choice
 *   participates in an association.
 * @attr {number} [match-max=1] - How many associations this choice may take part in; `0` means
 *   unlimited. On a target this is its capacity — the bucket size in a sorting item.
 * @attr {number} [match-min=0] - Minimum associations this choice must take part in.
 * @attr {boolean} [fixed=false] - Pins this choice in place when the enclosing interaction is
 *   shuffled.
 * @attr {string} template-identifier - Not implemented. Identifier of a template variable
 *   controlling this choice's visibility.
 * @attr {'show'|'hide'} [show-hide=show] - Not implemented. How `template-identifier` controls
 *   visibility.
 */
// tslint:disable: indent
export class QtiSimpleAssociableChoice extends ActiveElementMixin(LitElement, 'qti-simple-associable-choice') {
  static override styles: CSSResultGroup = styles;

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
    // `part="qti-simple-associable-choice"` used to be stamped here — a part named after the tag,
    // and one that clobbered the `part="drag"` the mixin puts on a clone the moment the clone
    // connected. The theme reaches a placed chip as `::part(drag)` now.
  }

  /** Opt-in marker read by `DragDropSlottedMixin`; see qti-gap. */
  public readonly acceptsDeclarativeDrops = true;

  @consume({ context: dragDropContext, subscribe: true })
  @state()
  private _dragDrop?: Readonly<DragDropState>;

  /** The chips this choice holds when it acts as a drop target (match-interaction's second set). */
  public get drags(): readonly HTMLElement[] {
    return this._dragDrop?.nodesByTarget?.[this.identifier] ?? [];
  }

  // pk: This needs some explanation
  // in qti-match-interaction, qti-simple-associable-choice is used to denote the
  // draggable, but also the droppable. WEIRD.. but lets deal with it.
  // So we have a slot for whenever another qti-simple-associable-choice is dropped in here.
  // And we have slot for content like in this associate interaction
  override render() {
    // The same element is a drag source in one match set and a drop target in the other. As a
    // source it holds nothing and this region stays empty.
    return html`
      <div part="control"></div>
      <slot part="label"></slot>
      <div part="drop">
        ${repeat(
          this.drags,
          node => node.getAttribute('identifier'),
          node => node
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-associable-choice': QtiSimpleAssociableChoice;
  }
}
