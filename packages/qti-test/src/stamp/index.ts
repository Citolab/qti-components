/**
 * Stamps for `qti-test`, as an opt-in plugin:
 *
 *   import '@qti-components/test/stamp';
 *
 * Importing this registers `test-stamp` (a template stamped with the test's computed context) and
 * the deprecated `test-paging-buttons-stamp` and `test-section-buttons-stamp`. They read only
 * `computedContext` and talk to the test through events, and nothing outside this folder refers to
 * them. `/stamp/elements` gives the classes without defining them.
 */
import './register.js';

export * from './test-stamp.js';
export * from './test-paging-buttons-stamp.js';
export * from './test-section-buttons-stamp.js';
export { stampElements } from './elements.js';
