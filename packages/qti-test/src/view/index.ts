/**
 * View controls for `qti-test`, as an opt-in plugin:
 *
 *   import '@qti-components/test/view';
 *
 * Importing this registers `test-view-toggle`, `test-view` and `test-check-item`. They switch the session view with `cito-test-switch-view`; the test applies it.
 * Nothing outside this folder refers to them. `/view/elements` gives the classes without defining them.
 */
import './register.js';

export * from './test-view-toggle.js';
export * from './test-view.js';
export * from './test-check-item.js';
export { viewElements } from './elements.js';
