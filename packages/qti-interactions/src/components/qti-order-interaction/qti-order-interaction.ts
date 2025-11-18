import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';

import { ObservableDragDropMixin } from '../../mixins/drag-drop/observable-drag-drop-mixin';
import styles from './qti-order-interaction.styles';

import type { PropertyValueMap } from 'lit';

@customElement('qti-order-interaction')
export class QtiOrderInteraction extends ObservableDragDropMixin(Interaction, 'qti-simple-choice', 'drop-list') {
  static override styles = styles;
  protected childrenMap: Element[];

  @state() protected nrChoices: number = 0;
  @state() correctResponses: string[] = [];
  @state() showCorrectResponses: boolean = false;

  /** orientation of choices */
  @property({ type: String })
  public orientation: 'horizontal' | 'vertical';

  // Required abstract methods from Interaction base class
  get response(): string[] {
    return this.getResponse();
  }

  set response(value: string | string[] | null) {
    // For order interaction, we need to place items in the correct droplists
    if (Array.isArray(value)) {
      this.setResponseValue(value);
    }
  }

  validate(): boolean {
    // Basic validation - check if we have choices and droplists
    const choices = this.querySelectorAll('qti-simple-choice');
    const dropLists = this.shadowRoot?.querySelectorAll('drop-list');
    return choices.length > 0 && (dropLists?.length || 0) > 0;
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
            (_, i) =>
              html`<drop-list role="region" part="drop-list" identifier="droplist${i}" tabindex="-1"></drop-list>`
          )}
        </div>
      </div>`;
  }

  public override toggleCorrectResponse(show: boolean): void {
    const responseVariable = this.responseVariable;
    // Always start by removing old correct answers
    this.shadowRoot.querySelectorAll('.correct-option').forEach(option => option.remove());

    if (show && responseVariable?.correctResponse) {
      const response = Array.isArray(responseVariable.correctResponse)
        ? responseVariable.correctResponse
        : [responseVariable.correctResponse];

      const correctIds = response.map(r => r.split(' ')[0]); // e.g., ['A', 'B', 'C']

      const used = new Set<string>(); // to track already rendered correct-answers

      const gaps = this.querySelectorAll('qti-simple-choice');

      gaps.forEach((gap, i) => {
        const identifier = gap.getAttribute('identifier');
        if (!identifier || !correctIds.includes(identifier)) return;

        // Only render once per identifier
        if (used.has(identifier)) return;
        used.add(identifier);

        // Get the choice label
        const text = gap.textContent?.trim();
        if (!text) return;

        const relativeDrop = this.shadowRoot.querySelector(`drop-list[identifier="droplist${i}"]`);
        if (!relativeDrop) return;

        const span = document.createElement('span');
        span.classList.add('correct-option');
        span.textContent = text;

        // Style
        span.style.border = '1px solid var(--qti-correct)';
        span.style.borderRadius = '4px';
        span.style.padding = '2px 4px';
        span.style.display = 'inline-block';
        span.style.marginTop = '4px';

        relativeDrop.insertAdjacentElement('afterend', span);
      });
    }
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
    const droppables = Array.from(this.shadowRoot.querySelectorAll('drop-list'));

    const response = droppables.map(droppable => {
      const dragsInDroppable = droppable.querySelectorAll('[qti-draggable="true"]');
      const identifiers = Array.from(dragsInDroppable).map(d => d.getAttribute('identifier'));
      return [...identifiers].join(' ');
    });
    return response;
  }

  private setResponseValue(value: string[]): void {
    // This method should programmatically set the response by moving items to correct droplists
    // For now, implement basic functionality - this can be enhanced later
    const droppables = Array.from(this.shadowRoot.querySelectorAll('drop-list'));
    const choices = Array.from(this.querySelectorAll('qti-simple-choice'));

    // Clear existing placements
    choices.forEach(choice => {
      // Remove from current droplist if any
      if (choice.parentElement?.tagName.toLowerCase() === 'drop-list') {
        const slot = this.shadowRoot.querySelector('slot[part="drags"]');
        if (slot) {
          slot.appendChild(choice);
        }
      }
    });

    // Place items according to response value
    value.forEach((responseItem, index) => {
      const [identifier] = responseItem.split(' ');
      const choice = choices.find(c => c.getAttribute('identifier') === identifier);
      const droplist = droppables[index];

      if (choice && droplist) {
        droplist.appendChild(choice);
      }
    });
  }

  override async firstUpdated(changedProps: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.firstUpdated(changedProps);
    this.childrenMap = Array.from(this.querySelectorAll('qti-simple-choice'));
    this.childrenMap.forEach(el => el.setAttribute('part', 'qti-simple-choice'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction': QtiOrderInteraction;
  }
}
