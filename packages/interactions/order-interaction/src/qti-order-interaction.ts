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
import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';

const SlottedBase = DragDropSlottedMixin(Interaction, `qti-simple-choice`, `[part~='drop']`, `slot[part='drags']`);

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
      </div>`;
  }

  public override toggleInternalCorrectResponse(show: boolean): void {
    // Always start by removing old correct answers
    this.shadowRoot.querySelectorAll('.correct-option').forEach(option => option.remove());

    if (show) {
      const entries = this.#getCorrectOrderEntries();
      const labelsByIdentifier = new Map<string, string>();
      Array.from(this.querySelectorAll('qti-simple-choice')).forEach(choice => {
        const id = choice.getAttribute('identifier');
        const label = choice.textContent?.trim();
        if (id && label) {
          labelsByIdentifier.set(id, label);
        }
      });

      entries.forEach(({ identifier, dropIndex }) => {
        const label = labelsByIdentifier.get(identifier);
        if (!label) return;

        const relativeDrop = this.shadowRoot.querySelector(`[part~='drop'][identifier="droplist${dropIndex}"]`);
        if (!relativeDrop) return;

        const span = document.createElement('span');
        span.classList.add('correct-option');
        span.textContent = label;
        span.style.border = '1px solid var(--qti-correct)';
        span.style.borderRadius = '4px';
        span.style.padding = '2px 4px';
        span.style.display = 'inline-block';
        span.style.marginTop = '4px';

        relativeDrop.insertAdjacentElement('afterend', span);
      });
    }
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
      choice.internals.states.delete('candidate-correct');
      choice.internals.states.delete('candidate-incorrect');
    });

    if (!show) return;

    const entries = this.#getCorrectOrderEntries();
    const correctByDrop = new Map<number, string>();
    entries.forEach(entry => correctByDrop.set(entry.dropIndex, entry.identifier));

    dropTargets.forEach((dropList, index) => {
      const placedChoice = this.chipsIn(dropList)[0] as QtiSimpleChoice | undefined;
      if (!placedChoice) return;

      const expectedIdentifier = correctByDrop.get(index);
      const actualIdentifier = placedChoice.getAttribute('identifier');
      if (expectedIdentifier && actualIdentifier === expectedIdentifier) {
        placedChoice.internals.states.add('candidate-correct');
      } else {
        placedChoice.internals.states.add('candidate-incorrect');
      }
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
