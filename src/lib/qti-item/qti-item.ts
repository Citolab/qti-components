import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { QtiItemMixin } from './qti-item.mixin';

@customElement('qti-item')
export class QtiItem extends QtiItemMixin(LitElement) {}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}