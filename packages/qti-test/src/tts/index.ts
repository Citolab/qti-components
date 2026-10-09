/**
 * Text-to-speech for `qti-test`, as an opt-in plugin:
 *
 *   import '@qti-components/test/tts';
 *
 * Importing this registers `test-item-to-speech` and the `test-tts-*` controls. It uses only
 * public API of the test (`computedContext` and the navigation request), and
 * nothing outside this folder refers to it — delete the folder and its `exports` entries and no
 * trace of text-to-speech is left. `/tts/elements` gives the classes without defining them.
 */
import './register.js';

export * from './test-item-to-speech.js';
export { ttsElements } from './elements.js';
