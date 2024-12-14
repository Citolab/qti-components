import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { ShuffleMixin } from '../internal/shuffle/shuffle-mixin'; // Import the mixin
import { QtiSimpleChoice } from '../qti-simple-choice';
import { Interaction } from '../internal/interaction/interaction';
import styles from './qti-order-interaction.styles';
@customElement('qti-order-interaction')
export class QtiOrderInteraction extends ShuffleMixin(
  DragDropInteractionMixin(Interaction, `qti-simple-choice`, 'drop-list', `slot[part='drags']`),
  'qti-simple-choice'
) {
  static styles = styles;
  childrenMap: Element[];

  @state() nrChoices: number = 0;
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
          ${Array.from(Array(this.nrChoices)).map(
            (_, i) =>
              html`<drop-list part="drop-list" identifier="droplist${i}"></drop-list>${this.showCorrectResponses &&
                this.correctResponses.length > i
                  ? unsafeHTML(`<span part='correct-response'>${this.correctResponses[i]}</span>`)
                  : ''}`
          )}
        </div>
      </div>`;
  }

  set correctResponse(value: string | string[]) {
    if (value === '') {
      this.showCorrectResponses = false;
      return;
    }

    if (this.correctResponses.length === 0) {
      const responses = Array.isArray(value) ? value : [value];

      responses.forEach(response => {
        let simpleChoice = this.querySelector(`qti-simple-choice[identifier="${response}"]`);
        if (!simpleChoice) {
          simpleChoice = this.shadowRoot.querySelector(`qti-simple-choice[identifier="${response}"]`);
        }

        const text = simpleChoice?.textContent.trim();
        this.correctResponses = [...this.correctResponses, text];
      });
    }

    this.showCorrectResponses = true;
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
