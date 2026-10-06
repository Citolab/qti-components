import { createContext } from '@lit/context';

import type { QtiContext } from '@qti-components/base';
import type { PostLoadTestTransformCallback } from '../mixins/test-navigation.mixin';

/**
 * What the components inside a test need from the `qti-test` that contains them: the things a host
 * put on it, and the element to query. Provided by `qti-test` about itself.
 *
 * It is context and not `closest('qti-test')` because a request crosses shadow roots and `closest`
 * stops at the first one, so a navigation or container a host renders inside its own component
 * would never find its test. Internal on purpose: not exported from the package, and not API.
 */
export interface TestHost extends HTMLElement {
  qtiContext: QtiContext;
  postLoadTestTransformCallback: PostLoadTestTransformCallback | null;
}

export const testHostContext = createContext<TestHost>(Symbol('testHost'));
