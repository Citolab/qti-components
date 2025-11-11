import { QtiSubtract } from './qti-subtract';
customElements.define('qti-subtract', QtiSubtract);

export * from './qti-subtract';

declare global {
  interface HTMLElementTagNameMap {
    'qti-subtract': QtiSubtract;
  }
}
