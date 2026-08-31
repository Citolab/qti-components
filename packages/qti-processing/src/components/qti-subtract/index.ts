import type { QtiSubtract } from './qti-subtract';

export * from './qti-subtract';

declare global {
  interface HTMLElementTagNameMap {
    'qti-subtract': QtiSubtract;
  }
}
