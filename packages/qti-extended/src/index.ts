/**
 * Test plugins beyond the QTI specification, for a candidate's toolbar: bookmark, text-to-speech,
 * zoom and a character sheet. Each is a set of elements placed inside `<test-navigation>` that
 * reads `computedContext` and sends the public requests; the test does not know them.
 *
 * Importing this entry registers the plugins and nothing else: the test, items and interactions
 * come from `@citolab/qti-components` (or `/corrections`), which this package never registers
 * itself, so the two entries load in any order.
 */
import './register.js';

export * from './elements.js';
