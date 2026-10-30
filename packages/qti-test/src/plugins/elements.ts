import { TestSubmit } from '../components/test-submit/test-submit';

export { TestSubmit };

/**
 * The plugins' `{ tag, ctor }` pairs, so a scoped registry (an item-ref template is stamped into
 * `test-container`'s shadow root) can define them with the rest. `elements.ts` spreads these into
 * `qtiTestElements`; this is the one place that composes the plugins. The other plugins are in
 * `@qti-components/extended`.
 */
export const pluginElements = [{ tag: 'test-submit', ctor: TestSubmit }] as const;
