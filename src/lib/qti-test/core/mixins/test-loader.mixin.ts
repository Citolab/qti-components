import { property } from 'lit/decorators.js';

import { qtiTransformItem } from '../../../qti-transformers';

// import type { TestContext } from '..';
import type { TestBase } from '../test-base';

// const setSessionData = <T>(key: string, value?: T): void => sessionStorage.setItem(key, JSON.stringify(value));
// const getSessionData = <T>(key: string): T | null =>
//   sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null;

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestLoaderInterface {}
export const TestLoaderMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestLoaderClass extends superClass {
    /** Items will be scored on everyinteraction when `qti-assessment-item` is not set to adaptive, and the `SCORE` outcome identifier is not set to be "human" | "externalMachine" */

    /** TestContext will be stored in sessionStorage with given attribute value if provided */
    // @property({ type: String, attribute: 'store-session' }) storeSession: string | null = null;

    @property({ type: Boolean, attribute: 'cache-transform' }) cacheTransform: boolean = false;

    constructor(...args: any[]) {
      super(...args);

      this.addEventListener('qti-load-item-request' /* 5. Request the item */, ({ detail }: CustomEvent) => {
        detail.promise = (async () => {
          const api = await qtiTransformItem(this.cacheTransform).load(detail.href, detail.cancelPreviousRequest);
          return api.htmlDoc();
        })();
      });

      // this.addEventListener('qti-assessment-test-connected', () => {
      //   if (this.storeSession) {
      //     const testContext = getSessionData<TestContext>(this.storeSession);
      //     if (testContext) {
      //       requestAnimationFrame(() => {
      //         this.testContext = testContext;
      //       });
      //     }
      //   }
      // });
    }

    // willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    //   if (changedProperties.has('testContext')) {
    //     if (this.storeSession) {
    //       setSessionData<Readonly<TestContext>>(this.storeSession, this.testContext);
    //     }
    //   }
    // }
  }

  return TestLoaderClass as Constructor<TestLoaderInterface> & T;
};
