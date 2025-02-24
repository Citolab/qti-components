import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { ShuffleMixin } from '../internal/shuffle/shuffle-mixin'; // Import the mixin
import { Interaction } from '../../../exports/interaction';
import styles from './qti-order-interaction.styles';

import type { ResponseVariable } from '../../../exports/variables';
import type { QtiSimpleChoice } from '../qti-simple-choice';
@customElement('qti-order-interaction')
export class QtiOrderInteraction extends ShuffleMixin(
  DragDropInteractionMixin(Interaction, `qti-simple-choice`, 'drop-list', `slot[part='drags']`),
  'qti-simple-choice'
) {
  static styles = styles;
  protected childrenMap: Element[];

  @state() protected nrChoices: number = 0;
  @state() correctResponses: string[] = [];
  @state() showCorrectResponses: boolean = false;

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
          ${[...Array(this.nrChoices)].map(
            (_, i) => html`<drop-list role="region" part="drop-list" identifier="droplist${i}"></drop-list>`
          )}
        </div>
      </div>`;
  }

  public toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean): void {
    if (show && responseVariable.correctResponse) {
      let matches: { text: string }[] = [];
      const response = Array.isArray(responseVariable.correctResponse)
        ? responseVariable.correctResponse
        : [responseVariable.correctResponse];

      if (response) {
        matches = response.map(x => {
          const split = x.split(' ');
          return { text: split[0] };
        });
      }

      const gaps = this.querySelectorAll('qti-simple-choice');
      gaps.forEach((gap, i) => {
        const identifier = gap.getAttribute('identifier');
        const textIdentifier = matches.find(x => x.text === identifier)?.text;
        const text = this.querySelector(`qti-simple-choice[identifier="${textIdentifier}"]`)?.textContent.trim();
        if (textIdentifier && text) {
          if (!gap.nextElementSibling?.classList.contains('correct-option')) {
            const textSpan = document.createElement('span');
            textSpan.classList.add('correct-option');
            textSpan.textContent = text;

            // Apply styles
            textSpan.style.border = '1px solid var(--qti-correct)';
            textSpan.style.borderRadius = '4px';
            textSpan.style.padding = '2px 4px';
            textSpan.style.display = 'inline-block';

            const relativeDrop = this.shadowRoot.querySelector(`drop-list[identifier="droplist${i}"]`);
            relativeDrop.insertAdjacentElement('afterend', textSpan);
          }
        } else {
          const relativeDrop = this.shadowRoot.querySelector(`drop-list[identifier="droplist${i}"]`);

          if (relativeDrop.nextElementSibling?.classList.contains('correct-option')) {
            gap.nextElementSibling.remove();
          }
        }
      });
    } else {
      const correctOptions = this.shadowRoot.querySelectorAll('.correct-option');
      correctOptions.forEach(option => {
        option.remove();
      });
    }
  }

  // some interactions have a different way of getting the response
  // this is called from the drag and drop mixin class
  // you have to implement your own getResponse method in the superclass
  // cause they are different for some interactions.
  getValue(val: string[]) {
    return val.map((v, i) => `${v} droplist${i}`);
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

  override async firstUpdated(changedProps) {
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
