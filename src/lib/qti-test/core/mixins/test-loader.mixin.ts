import { property } from 'lit/decorators.js';

import { qtiTransformItem } from '../../../qti-transformers';

import type { TestContext } from '..';
import type { TestBase } from '../test-base';

const setSessionData = <T>(key: string, value?: T): void => sessionStorage.setItem(key, JSON.stringify(value));
const getSessionData = <T>(key: string): T | null =>
  sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null;

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestLoaderInterface {}
export const TestLoaderMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestLoaderClass extends superClass {
    /** Items will be scored on everyinteraction when `qti-assessment-item` is not set to adaptive, and the `SCORE` outcome identifier is not set to be "human" | "externalMachine" */

    /** TestContext will be stored in sessionStorage with given attribute value if provided */
    @property({ type: String, attribute: 'auto-store-restore' }) autoStoreRestoreContext: string | null = null;

    @property({ type: String, attribute: 'nav-item-id' }) navItemId: string | null = null;

    constructor(...args: any[]) {
      super(...args);

      this.addEventListener('qti-load-item-request' /* 5. Request the item */, ({ detail }: CustomEvent) => {
        detail.promise = (async () => {
          const api = await qtiTransformItem().load(`${detail.href}`, detail.cancelPreviousRequest);
          return api.htmlDoc();
        })();
      });
    }

    async connectedCallback(): Promise<void> {
      super.connectedCallback();
      if (this.navItemId) {
        this.sessionContext = { ...this.sessionContext, navItemId: this.navItemId };
      }
      if (this.autoStoreRestoreContext) {
        const testContext = getSessionData<TestContext>(this.autoStoreRestoreContext);
        if (testContext) {
          this.testContext = testContext;
        }
      }
    }

    willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
      if (changedProperties.has('navItemId')) {
        this.sessionContext = { ...this.sessionContext, navItemId: this.navItemId };
      }
      if (changedProperties.has('testContext')) {
        if (this.autoStoreRestoreContext) {
          setSessionData<Readonly<TestContext>>(this.autoStoreRestoreContext, this.testContext);
        }
      }
    }
  }

  return TestLoaderClass as Constructor<TestLoaderInterface> & T;
};
