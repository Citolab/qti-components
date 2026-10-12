/**
 * Scoring controls for `qti-test`, as an opt-in plugin:
 *
 *   import '@qti-components/test/scoring';
 *
 * Importing this registers `test-scoring-buttons` (human scoring) and `test-scoring-feedback`. They read only `computedContext`; scoring goes back to the test as `cito-test-update-outcome`.
 * Nothing outside this folder refers to them. `/scoring/elements` gives the classes without defining them.
 */
import './register.js';

export * from './test-scoring-buttons.js';
export * from './test-scoring-feedback.js';
export { scoringElements } from './elements.js';
