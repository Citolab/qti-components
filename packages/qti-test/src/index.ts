import './register.js';

export * from './components/index.js';
export * from './types/iqti-test.js';
export * from './types/qti-test-state.js';

/** @deprecated Import `@qti-components/test/tts` instead. No longer re-exported from here in the next major. */
export * from './tts/index.js'; // tts-plugin: Step-A compatibility

/** @deprecated Import `@qti-components/test/stamp` instead. No longer re-exported from here in the next major. */
export * from './stamp/index.js'; // stamp-plugin: Step-A compatibility

/** @deprecated Import `@qti-components/test/print` instead. No longer re-exported from here in the next major. */
export * from './print/index.js'; // print-plugin: Step-A compatibility
