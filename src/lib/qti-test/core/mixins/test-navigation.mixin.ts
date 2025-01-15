import type { QtiAssessmentItemRef } from '../qti-assessment-test';
import type { TestBase } from '../test-base';

declare module '../context/test.context' {
  interface TestContext {
    navPartId?: string | null;
    navSectionId?: string | null;
    navItemId?: string | null;
    navItemLoading?: boolean;
    navTestLoading?: boolean;
  }
}

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestNavigationInterface {}
export const TestNavigationMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestNavigationClass extends superClass {
    constructor(...args: any[]) {
      super(...args);

      // load an item
      this.addEventListener('qti-request-test-item', ({ detail: navItemId }: CustomEvent<string>) => {
        if (!navItemId) return;
        this._clearLoadedItems();

        const itemRefEl = this.testElement.querySelector<QtiAssessmentItemRef>(
          `qti-assessment-item-ref[identifier="${navItemId}"]`
        );

        const promise = this._loadItemRequest(itemRefEl.href, false);

        const navPartId = itemRefEl.closest('qti-test-part').identifier;
        const navSectionId = itemRefEl.closest('qti-assessment-section').identifier;
        this._testContext = { ...this._testContext, navPartId, navSectionId, navItemId, navItemLoading: true };

        if (promise) {
          promise
            .then(doc => {
              itemRefEl.xmlDoc = doc;
              requestAnimationFrame(() =>
                this.dispatchEvent(new CustomEvent('qti-item-connected', { bubbles: true, composed: true }))
              );
              this._testContext = { ...this._testContext, navItemLoading: false };
            })
            .catch(error => console.error('Failed to load item:', error));
        } else {
          console.info('Load item request was not handled:', itemRefEl.href);
        }
      });

      this.addEventListener('qti-assessment-test-connected', () => {
        let navItemId = this._testContext.navItemId;
        if (!navItemId) {
          const itemRefEl = this.testElement.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref');
          navItemId = itemRefEl.identifier;
        }
        this.dispatchEvent(
          new CustomEvent('qti-request-test-item', { detail: navItemId, bubbles: true, composed: true })
        );
      });
    }

    private _clearLoadedItems(): void {
      const itemRefEls = this.testElement.querySelectorAll(`qti-assessment-test qti-assessment-item-ref`);
      Array.from(itemRefEls).forEach((itemElement: QtiAssessmentItemRef) => {
        itemElement.xmlDoc = null;
      });
    }

    private _loadItemRequest(href: string, cancelPreviousRequest: boolean = true): Promise<DocumentFragment> {
      const event = new CustomEvent('qti-load-item-request', {
        bubbles: true,
        composed: true,
        detail: {
          href: href,
          promise: null,
          cancelPreviousRequest
        }
      });
      this.dispatchEvent(event);

      return event.detail.promise;
    }
  }

  return TestNavigationClass as Constructor<TestNavigationInterface> & T;
};
