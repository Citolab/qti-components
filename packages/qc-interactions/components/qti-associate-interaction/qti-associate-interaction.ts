import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { DragDropInteractionMixin } from '../internal/drag-drop';
import styles from './qti-associate-interaction.styles';
import { Interaction } from '../../../exports/interaction';

import type { QtiSimpleAssociableChoice } from '../qti-simple-associable-choice';
import type { CSSResultGroup } from 'lit';

@customElement('qti-associate-interaction')
export class QtiAssociateInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-simple-associable-choice',
  '.dl',
  `slot[name='qti-simple-associable-choice']`
) {
  static styles: CSSResultGroup = styles;
  @state() protected _childrenMap: Element[] = [];

  protected _registerChoiceHandler: (event: CustomEvent) => void;

  constructor() {
    super();
    this._registerChoiceHandler = this._registerChoice.bind(this);
    this.addEventListener('register-qti-simple-associable-choice', this._registerChoiceHandler);
  }

  protected _registerChoice(event: CustomEvent) {
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
            </div>`
        )}

        <div role="alert" part="message" id="validation-message"></div>
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
