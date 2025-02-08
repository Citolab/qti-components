import { property } from 'lit/decorators.js';

import type { QtiAssessmentItemRef, QtiAssessmentSection, QtiAssessmentTest } from '../qti-assessment-test';
import type { TestBase } from '../test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestNavigationInterface {}
export const TestNavigationMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestNavigationClass extends superClass {
    @property({ type: String }) navigate: 'item' | 'section' = 'item';

    protected _testElement?: QtiAssessmentTest;

    constructor(...args: any[]) {
      super(...args);

      this.addEventListener(
        'qti-request-navigation',
        async ({ detail }: CustomEvent<{ type: 'item' | 'section'; id: string }>) => {
          if (!detail?.id) return;

          if (detail.type === 'item') {
            await this._loadItems([detail.id]);

            const navItemId = detail.id;
            const itemRefEl = this._testElement?.querySelector<QtiAssessmentItemRef>(
              `qti-assessment-item-ref[identifier="${detail.id}"]`
            );
            const navPartId = itemRefEl.closest('qti-test-part')?.identifier;
            const navSectionId = itemRefEl.closest('qti-assessment-section')?.identifier;

            this.sessionContext = { ...this.sessionContext, navPartId, navSectionId, navItemId, navItemLoading: false };
          } else if (detail.type === 'section') {
            const itemIds = this._getSectionItemIds(detail.id);
            await this._loadItems(itemIds);

            const navSectionId = detail.id;
            const sectionRefEl = this._testElement?.querySelector<QtiAssessmentSection>(
              `qti-assessment-section[identifier="${navSectionId}"]`
            );
            const navPartId = sectionRefEl.closest('qti-test-part')?.identifier;

            this.sessionContext = {
              ...this.sessionContext,
              navPartId,
              navSectionId,
              navItemId: null,
              navItemLoading: false
            };
          }
        }
      );

      this.addEventListener('qti-assessment-test-connected', (e: CustomEvent<QtiAssessmentTest>) => {
        this._testElement = e.detail;
        let id: string | undefined;

        if (this.navigate === 'section') {
          id = this._testElement.querySelector<QtiAssessmentSection>('qti-assessment-section')?.identifier;
        } else {
          id =
            this.sessionContext.navItemId ??
            this._testElement.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref')?.identifier;
        }

        if (id) {
          this.dispatchEvent(
            new CustomEvent('qti-request-navigation', {
              detail: { type: this.navigate === 'section' ? 'section' : 'item', id },
              bubbles: true,
              composed: true
            })
          );
        }
      });
    }

    private async _loadItems(itemIds: string[]): Promise<void> {
      let results;
      if (!this._testElement || itemIds.length === 0) return;

      const itemRefEls = itemIds.map(id =>
        this._testElement!.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${id}"]`)
      );

      if (itemRefEls.includes(null)) {
        console.warn(`One or more items not found: ${itemIds}`);
        return;
      }

      this._clearLoadedItems();
      this.sessionContext = { ...this.sessionContext, navItemLoading: true };

      const itemLoadPromises = itemRefEls.map(async itemRef => {
        if (!itemRef) return null;
        return { itemRef, doc: await this._loadItemRequest(itemRef.href) };
      });

      try {
        results = await Promise.all(itemLoadPromises);

        results.forEach(({ itemRef, doc }) => {
          if (itemRef && doc) itemRef.xmlDoc = doc;
        });

        requestAnimationFrame(() => {
          this.dispatchEvent(
            new CustomEvent('qti-test-connected', {
              detail: results.map(({ itemRef }) => ({ identifier: itemRef?.identifier, element: itemRef })),
              bubbles: true,
              composed: true
            })
          );
        });
      } catch (error) {
        console.error('Error loading items:', error);
      }
      return results;
    }

    private _getSectionItemIds(navSectionId: string): string[] {
      const sectionRefEl = this._testElement?.querySelector<QtiAssessmentSection>(
        `qti-assessment-section[identifier="${navSectionId}"]`
      );

      if (!sectionRefEl) {
        console.warn(`Section with identifier "${navSectionId}" not found.`);
        return [];
      }

      return Array.from(
        this._testElement!.querySelectorAll<QtiAssessmentItemRef>(
          `qti-assessment-section[identifier="${navSectionId}"] > qti-assessment-item-ref`
        )
      ).map(itemRef => itemRef.identifier);
    }

    private _clearLoadedItems(): void {
      const itemRefEls = this._testElement?.querySelectorAll<QtiAssessmentItemRef>(
        `qti-assessment-test qti-assessment-item-ref`
      );
      Array.from(itemRefEls || []).forEach(itemElement => {
        itemElement.xmlDoc = null;
      });
    }

    private _loadItemRequest(href: string): Promise<DocumentFragment> {
      const event = new CustomEvent('qti-load-item-request', {
        bubbles: true,
        composed: true,
        detail: { href, promise: null }
      });
      this.dispatchEvent(event);
      return event.detail.promise;
    }
  }

  return TestNavigationClass as Constructor<TestNavigationInterface> & T;
};
