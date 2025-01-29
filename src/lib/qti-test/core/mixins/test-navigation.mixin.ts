import { property } from 'lit/decorators.js';

import type { QtiAssessmentItemRef, QtiAssessmentTest } from '../qti-assessment-test';
import type { TestBase } from '../test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestNavigationInterface {}
export const TestNavigationMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestNavigationClass extends superClass {
    @property({ type: String }) navigate: 'item' | 'section' = 'item';

    protected _testElement?: QtiAssessmentTest;

    constructor(...args: any[]) {
      super(...args);

      // Load either a single item or all items in a section
      this.addEventListener(
        'qti-request-navigation',
        ({ detail }: CustomEvent<{ type: 'item' | 'section'; id: string }>) => {
          if (!detail?.id) return;
          this._clearLoadedItems();

          if (detail.type === 'item') {
            this._loadSingleItem(detail.id);
          } else if (detail.type === 'section') {
            this._loadSectionItems(detail.id);
          }
        }
      );

      this.addEventListener('qti-assessment-test-connected', (e: CustomEvent<QtiAssessmentTest>) => {
        this._testElement = e.detail;

        let id = this._testElement.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref').identifier;
        if (this.navigate === 'section') {
          id = this._testElement.querySelector<QtiAssessmentItemRef>('qti-assessment-section').identifier;
        }
        if (id) {
          this.dispatchEvent(
            new CustomEvent('qti-request-navigation', {
              detail: { type: this.navigate === 'section' ? this.navigate : 'item', id },
              bubbles: true,
              composed: true
            })
          );
        }
      });
    }

    private _loadSingleItem(navItemId: string, cancelPreviousRequest = true): Promise<void> {
      return new Promise((resolve, reject) => {
        const itemRefEl = this._testElement?.querySelector<QtiAssessmentItemRef>(
          `qti-assessment-item-ref[identifier="${navItemId}"]`
        );

        if (!itemRefEl) {
          console.warn(`Item with identifier "${navItemId}" not found.`);
          return reject(new Error(`Item not found: ${navItemId}`));
        }

        const href = itemRefEl.href;
        const navPartId = itemRefEl.closest('qti-test-part')?.identifier;
        const navSectionId = itemRefEl.closest('qti-assessment-section')?.identifier;

        this.sessionContext = { ...this.sessionContext, navPartId, navSectionId, navItemId, navItemLoading: true };
        const promise = this._loadItemRequest(href, cancelPreviousRequest);

        promise
          ?.then(doc => {
            itemRefEl.xmlDoc = doc;
            requestAnimationFrame(() =>
              this.dispatchEvent(
                new CustomEvent('qti-test-connected', {
                  detail: [{ identifier: navItemId, element: itemRefEl }],
                  bubbles: true,
                  composed: true
                })
              )
            );
            this.sessionContext = { ...this.sessionContext, navItemLoading: false };
            resolve();
          })
          .catch(error => {
            console.error('Failed to load item:', error);
            reject(error);
          });
      });
    }

    private _loadSectionItems(navSectionId: string): void {
      const sectionRefEl = this._testElement?.querySelector<QtiAssessmentItemRef>(
        `qti-assessment-section[identifier="${navSectionId}"]`
      );

      if (!sectionRefEl) {
        console.warn(`Section with identifier "${navSectionId}" not found.`);
        return;
      }

      const itemRefEls = this._testElement?.querySelectorAll<QtiAssessmentItemRef>(
        `qti-assessment-section[identifier="${navSectionId}"] > qti-assessment-item-ref`
      );

      const navPartId = sectionRefEl.closest('qti-test-part')?.identifier;
      this.sessionContext = { ...this.sessionContext, navPartId, navSectionId, navItemId: null };

      const items = Array.from(itemRefEls || []).map(itemRef => itemRef.identifier);

      const promises = items.map(itemId => this._loadSingleItem(itemId, false));

      Promise.all(promises)
        .then(results => {
          console.info('All items in section loaded successfully.');
        })
        .catch(error => {
          console.error('One or more items failed to load:', error);
        });
    }

    private _clearLoadedItems(): void {
      const itemRefEls = this._testElement?.querySelectorAll<QtiAssessmentItemRef>(
        `qti-assessment-test qti-assessment-item-ref`
      );
      Array.from(itemRefEls || []).forEach(itemElement => {
        itemElement.xmlDoc = null;
      });
    }

    private _loadItemRequest(href: string, cancelPreviousRequest: boolean = true): Promise<DocumentFragment> {
      const event = new CustomEvent('qti-load-item-request', {
        bubbles: true,
        composed: true,
        detail: {
          href,
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
