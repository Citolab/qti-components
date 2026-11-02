/**
 * What a plugin in another package builds on, with no registration side effect: the public events
 * and their helpers, the typed read of plugin state, the state types, and the look of the test
 * controls. `@qti-components/extended` is the consumer; a plugin of your own may use it too.
 */
export { dispatchPublic, listenPublic, PUBLIC_EVENTS } from './public-events.js';
export type { NavigationFailure, NavigationTarget, PublicEventMap, PublicEventName } from './public-events.js';
export { pluginState } from './plugin-state.js';
export type { QtiTestPluginState, QtiTestState } from './types/qti-test-state.js';
export * as controlStyles from './components/styles.js';
