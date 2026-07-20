import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { property, state } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

import styles from './qti-order-interaction.styles';
import { findCorrectlyPlacedIdentifiers } from './utils/longest-increasing-subsequence';

import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';
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
  @state() correctResponses: string[] = [];
  @state() showCorrectResponses: boolean = false;

  /** orientation of choices */
  @property({ type: String })
  public orientation: 'horizontal' | 'vertical';

  #getCorrectOrderEntries(): Array<{ identifier: string; dropIndex: number }> {
    const correctResponseValue = this.correctResponse;
    if (!correctResponseValue) {
      return [];
    }

    const response = Array.isArray(correctResponseValue) ? correctResponseValue : [correctResponseValue];

    return response
      .map((entry, index) => {
        const [identifier, dropId] = entry.split(' ');
        const parsedDropIndex = dropId?.startsWith('droplist') ? parseInt(dropId.replace('droplist', ''), 10) : index;
        const dropIndex = Number.isNaN(parsedDropIndex) ? index : parsedDropIndex;
        return { identifier, dropIndex };
      })
      .filter(entry => Boolean(entry.identifier));
  }

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

  public override toggleCandidateCorrection(show: boolean): void {
    super.toggleCandidateCorrection(show);

    // Read placement, not the DOM. The drop targets render their chips from the placement map, and
    // Lit renders on a microtask — a query here runs before the chip is in the tree, so no state was
    // ever set and the correction badges silently stopped appearing. The nodes in the map are the
    // same nodes that get rendered, so marking them now survives the render.
    const dropTargets = Array.from(this.shadowRoot.querySelectorAll<HTMLElement>(`[part~='drop']`));
    const placedChoices = dropTargets.flatMap(drop => this.chipsIn(drop) as QtiSimpleChoice[]);
    placedChoices.forEach(choice => {
      choice.candidateCorrection = null;
    });

    if (!show) return;

    const correctOrder = this.#getCorrectOrderEntries()
      .sort((entryA, entryB) => entryA.dropIndex - entryB.dropIndex)
      .map(entry => entry.identifier);
    if (correctOrder.length === 0) return;

    // `placedChoices` is already in drop order — `dropTargets` comes back in document order, which
    // is droplist0..n, and chipsIn preserves each target's own order.
    const placedEntries = placedChoices
      .map(placedChoice => ({ placedChoice, identifier: placedChoice.getAttribute('identifier') }))
      .filter((entry): entry is { placedChoice: QtiSimpleChoice; identifier: string } => Boolean(entry.identifier));

    // A single misplaced chip shouldn't cascade into every chip after it being marked wrong. The
    // longest increasing subsequence is the largest set already in the right relative order;
    // whatever falls outside it is what the candidate actually got wrong.
    const correctlyPlacedIdentifiers = findCorrectlyPlacedIdentifiers(
      placedEntries.map(entry => entry.identifier),
      correctOrder
    );

    placedEntries.forEach(({ placedChoice, identifier }) => {
      placedChoice.candidateCorrection = correctlyPlacedIdentifiers.has(identifier) ? 'correct' : 'incorrect';
    });
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
