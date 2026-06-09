import { html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

import styles from './qti-order-interaction.styles';

import type { PropertyValueMap } from 'lit';
import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';

const SlottedBase = DragDropSlottedMixin(Interaction, `qti-simple-choice`, 'drop-list', `slot[part='drags']`);

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
    const responseVariable = this.responseVariable;
    if (!responseVariable?.correctResponse) {
      return [];
    }

    const response = Array.isArray(responseVariable.correctResponse)
      ? responseVariable.correctResponse
      : [responseVariable.correctResponse];

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
          ${[...Array(this.nrChoices)].map(
            (_, i) => html`<drop-list role="region" part="drop-list" identifier="droplist${i}"></drop-list>`
          )}
        </div>
      </div>`;
  }

  public override toggleCorrectResponse(show: boolean): void {
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

        const relativeDrop = this.shadowRoot.querySelector(`drop-list[identifier="droplist${dropIndex}"]`);
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

    const placedChoices = Array.from(
      this.shadowRoot.querySelectorAll<QtiSimpleChoice>('drop-list [qti-draggable="true"]')
    );
    placedChoices.forEach(choice => {
      choice.internals.states.delete('candidate-correct');
      choice.internals.states.delete('candidate-incorrect');
    });

    if (!show) return;

    const entries = this.#getCorrectOrderEntries();
    const correctByDrop = new Map<number, string>();
    entries.forEach(entry => correctByDrop.set(entry.dropIndex, entry.identifier));

    const dropLists = Array.from(this.shadowRoot.querySelectorAll<HTMLElement>('drop-list'));
    dropLists.forEach((dropList, index) => {
      const placedChoice = dropList.querySelector<QtiSimpleChoice>('[qti-draggable="true"]');
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
    const droppables = Array.from<QtiSimpleChoice>(this.shadowRoot.querySelectorAll('drop-list'));

    const response = droppables.map(droppable => {
      const dragsInDroppable = droppable.querySelectorAll('[qti-draggable="true"]');
      const identifiers = Array.from(dragsInDroppable).map(d => d.getAttribute('identifier'));
      return [...identifiers].join(' ');
    });
    return response;
  }

  public override shouldTreatBlockedMaxAsInvalid(): boolean {
    return false;
  }

  override async firstUpdated() {
    super.firstUpdated();
    this.childrenMap = Array.from(this.querySelectorAll('qti-simple-choice'));
    this.childrenMap.forEach(el => el.setAttribute('part', 'qti-simple-choice'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction': QtiOrderInteraction;
  }
}
