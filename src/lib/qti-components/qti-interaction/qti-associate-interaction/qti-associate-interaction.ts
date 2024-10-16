import { CSSResultGroup, LitElement, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop';
import { QtiSimpleAssociableChoice } from '../qti-simple-associable-choice';
import styles from './qti-associate-interaction.styles';
@customElement('qti-associate-interaction')
export class QtiAssociateInteraction extends DragDropInteractionMixin(
  LitElement,
  'qti-simple-associable-choice',
  true,
  '.dl'
) {
  @state() private _childrenMap: Element[] = [];

  static styles: CSSResultGroup = styles;
  // dragDropApi: TouchDragAndDrop;

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
      </div>`;
  }

  // async connectedCallback(): Promise<void> {
  //   super.connectedCallback();
  //   await this.updateComplete;
  //   this.dragDropApi = new TouchDragAndDrop();
  //   this.dragDropApi.addDraggableElements(this.querySelectorAll('qti-simple-associable-choice'));
  //   this.dragDropApi.addDroppableElements(this.shadowRoot.querySelectorAll('.dl'));
  // }

  constructor() {
    super();
    this.addEventListener('register-qti-simple-associable-choice', (event: CustomEvent) => {
      const choice = event.target as QtiSimpleAssociableChoice;
      this._childrenMap.push(choice);
    });

    // this.addEventListener('unregister-qti-simple-associable-choice', (event: CustomEvent) => {
    //   console.log('test');
    //   const choice = event.target as QtiSimpleAssociableChoice;
    //   const index = this._childrenMap.indexOf(choice);
    //   if (index !== -1) {
    //     this._childrenMap.splice(index, 1);
    //   }
    // });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-associate-interaction': QtiAssociateInteraction;
  }
}
