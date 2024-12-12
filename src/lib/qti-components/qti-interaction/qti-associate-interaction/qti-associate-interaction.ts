import { CSSResultGroup, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop';
import { QtiSimpleAssociableChoice } from '../qti-simple-associable-choice';
import styles from './qti-associate-interaction.styles';
import { Interaction } from '../internal/interaction/interaction';
@customElement('qti-associate-interaction')
export class QtiAssociateInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-simple-associable-choice',
  true,
  '.dl'
) {
  @state() private _childrenMap: Element[] = [];

  static styles: CSSResultGroup = styles;
  // dragDropApi: TouchDragAndDrop;

  private _registerChoiceHandler: (event: CustomEvent) => void;

  constructor() {
    super();
    this._registerChoiceHandler = this._registerChoice.bind(this);
    this.addEventListener('register-qti-simple-associable-choice', this._registerChoiceHandler);
  }

  private _registerChoice(event: CustomEvent) {
    const choice = event.target as QtiSimpleAssociableChoice;
    this._childrenMap.push(choice);
  }

  override render() {
    return html` <slot name="prompt"></slot>
      <slot name="qti-simple-associable-choice"></slot>
      <div part="drop-container">
        ${this._childrenMap.length > 0 &&
        Array.from(Array(Math.ceil(this._childrenMap.length / 2)).keys()).map(
          (_, index) =>
            html`<div part="associables-container">
                <div name="left${index}" part="drop-list" class="dl" identifier="droplist${index}_left"></div>
                <div name="right${index}" part="drop-list" class="dl" identifier="droplist${index}_right"></div>
              </div>
              <div role="alert" id="validationMessage"></div>`
        )}
      </div>`;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('register-qti-simple-associable-choice', this._registerChoiceHandler);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-associate-interaction': QtiAssociateInteraction;
  }
}
