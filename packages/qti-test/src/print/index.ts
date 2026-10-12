/**
 * Print helpers for `qti-test`, as an opt-in plugin:
 *
 *   import '@qti-components/test/print';
 *
 * Importing this registers `test-print-context` and `test-print-item-variables`, which print the test's computed context for debugging. They read only `computedContext`.
 * Nothing outside this folder refers to them. `/print/elements` gives the classes without defining them.
 */
import './register.js';

export * from './test-print-context.js';
export * from './test-print-item-variables.js';
export { printElements } from './elements.js';
