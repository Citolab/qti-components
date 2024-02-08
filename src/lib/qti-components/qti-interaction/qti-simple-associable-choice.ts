import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-simple-associable-choice')
// tslint:disable: indent
export class QtiSimpleAssociableChoice extends LitElement {
  // pk: This needs some explanation
  // in the associate interaction there is a special slot for these qti-simple-associable-choices
  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('slot', 'qti-simple-associable-choice');
    this.setAttribute('part', 'qti-simple-associable-choice');
  }

  // pk: This needs some explanation
  // in qti-match-interaction, qti-simple-associable-choice is used to denote the
  // draggable, but also the droppable. WEIRD.. but lets deal with it.
  // So we have a slot for whenever another qti-simple-associable-choice is dropped in here.
  // And we have slot for content like in this associate interaction
  override render() {
    return html`
      <slot></slot>
      <slot name="qti-simple-associable-choice"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-associable-choice': QtiSimpleAssociableChoice;
  }
}
