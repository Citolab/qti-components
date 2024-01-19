import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-inline-choice')
export class QtiInlineChoice extends LitElement {}

declare global {
  interface HTMLElementTagNameMap {
    'qti-inline-choice': QtiInlineChoice;
  }
}
