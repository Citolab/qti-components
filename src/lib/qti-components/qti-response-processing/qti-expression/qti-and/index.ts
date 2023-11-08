import { QtiAnd } from './qti-and';
customElements.define('qti-and', QtiAnd);

export * from './qti-and';

declare global {
  interface HTMLElementTagNameMap {
    'qti-and': QtiAnd;
  }
}
