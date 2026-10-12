/**
 * Every test plugin in one import:
 *
 *   import '@qti-components/test/plugins';
 *
 * A convenience for hosts that use several plugins: it registers print, scoring, stamp, text-to-speech
 * and view. A host that cares about bundle size imports the plugins it uses one by one
 * (`@qti-components/test/stamp`, …). A plugin added later is picked up here. `/plugins/elements`
 * gives the `{ tag, ctor }` entries of all of them without defining anything.
 */
import '../print/register.js';
import '../scoring/register.js';
import '../stamp/register.js';
import '../tts/register.js';
import '../view/register.js';

export { pluginElements } from './elements.js';
