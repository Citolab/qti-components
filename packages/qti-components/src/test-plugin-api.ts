/**
 * What a plugin outside this package builds on, with no registration side effect: the public test
 * events and their helpers, the typed read of plugin state, the state types and `controlStyles`, the
 * look of the test controls. `@qti-components/extended` imports it from here, so it shares this
 * package's single copy of the test and its contexts.
 *
 *   import { dispatchPublic, controlStyles } from '@citolab/qti-components/qti-test/plugin-api';
 */
export * from '@qti-components/test/plugin-api';
