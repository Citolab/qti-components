import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { property, state } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

import styles from './qti-order-interaction.styles';

import type { PropertyValueMap } from 'lit';

const SlottedBase = DragDropSlottedMixin(Interaction, `qti-simple-choice`, `[part~='drop']`, `slot[part~='drags']`);

/**
 * Order interaction: candidates arrange choices into a target sequence.
 *
 * @slot prompt - The prompt shown above the interaction.
 * @slot drags - The draggable choice sources.
 *
 * @csspart container - The outer container wrapping drags and drops.
 * @csspart drags - Wrapper around the drag sources slot.
 * @csspart drops - The drop-target region.
 * @csspart drop - Each individual drop target.
 * @csspart drag - A choice that has been placed into a drop target.
 */
export class QtiOrderInteraction extends DragDropSlottedSortableMixin(SlottedBase, '[qti-draggable="true"]') {
  static override styles = styles;
  protected childrenMap: Element[];

  @state() protected nrChoices: number = 0;

  /** orientation of choices */
  @property({ type: String })
  public orientation: 'horizontal' | 'vertical';

  override render() {
    const choices = Array.from(this.querySelectorAll('qti-simple-choice'));
    if (this.nrChoices < choices.length) {
      this.nrChoices = choices.length;
    }

    return html` <slot name="prompt"> </slot>
      <div part="container">
        <slot part="drags"> </slot>
        <div part="drops">
          ${[...Array(this.nrChoices)].map((_, i) => {
            const identifier = `droplist${i}`;
            // The chips are rendered here, from the interaction's placement map, rather than being
            // appended into this div by handleDrop. `data-declarative-drops` is what tells the
            // mixin to keep them in the map and leave this element's children alone.
            const drags = this._dragDrop?.nodesByTarget?.[identifier] ?? [];
            return html`<div role="region" part="drop" data-declarative-drops identifier=${identifier}>
              ${repeat(
                drags,
                node => node.getAttribute('identifier'),
                node => node
              )}
            </div>`;
          })}
        </div>
        <div id="validation-message" part="message" role="alert" style="display:none;"></div>
      </div>`;
  }

  // some interactions have a different way of getting the response
  // this is called from the drag and drop mixin class
  // you have to implement your own getResponse method in the superclass
  // cause they are different for some interactions.
  getValue(val: string[]) {
    return val?.map((v, i) => `${v} droplist${i}`) || [];
  }

  // some interactions have a different way of getting the response
  // this is called from the drag and drop mixin class
  // you have to implement your own getResponse method in the superclass
  // cause they are different for some interactions.
  // MH: is this function called? Shouldn't we use getValue?
  protected getResponse(): string[] {
    const droppables = Array.from<HTMLElement>(this.shadowRoot.querySelectorAll(`[part~='drop']`));

    // Read placement, not the DOM. The DOM is rendered *from* placement now, so querying it back
    // out would be asking the same question twice and hoping for the same answer.
    return droppables.map(droppable =>
      this.chipsIn(droppable)
        .map(chip => chip.getAttribute('identifier'))
        .join(' ')
    );
  }

  public override shouldTreatBlockedMaxAsInvalid(): boolean {
    return false;
  }

  override async firstUpdated() {
    super.firstUpdated();
    this.childrenMap = Array.from(this.querySelectorAll('qti-simple-choice'));
    // `part="drag"` used to be stamped on the light-DOM originals here, purely so the clone would
    // inherit it — a slotted chip's own `part` is unreachable. The mixin stamps the clone directly
    // now, at the moment it makes it.
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction': QtiOrderInteraction;
  }
}
