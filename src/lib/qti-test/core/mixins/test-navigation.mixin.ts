import { property } from 'lit/decorators.js';

import { qtiTransformItem } from '../../../qti-transformers';

import type { QtiAssessmentStimulusRefConnectedEvent } from '../../../qti-components/qti-assessment-stimulus-ref/qti-assessment-stimulus-ref';
import type { transformItemApi, transformTestApi } from '../../../qti-transformers';
import type { QtiAssessmentItemRef, QtiAssessmentSection, QtiAssessmentTest } from '../qti-assessment-test';
import type { TestBase } from '../test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type PostLoadTransformCallback = (
  transformer: transformItemApi,
  itemRef: QtiAssessmentItemRef
) => transformItemApi | Promise<transformItemApi>;

export type PostLoadTestTransformCallback = (
  transformer: transformTestApi,
  testElement: QtiAssessmentTest
) => transformTestApi | Promise<transformTestApi>;

export interface NavigationError {
  message: string;
  details?: any;
  itemId?: string;
  sectionId?: string;
}

declare class TestNavigationInterface {}
export const TestNavigationMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestNavigationClass extends superClass implements TestNavigationInterface {
    @property({ type: String }) navigate: 'item' | 'section' | null = null;
    @property({ type: Boolean, attribute: 'cache-transform' }) cacheTransform: boolean = false;
    @property({ type: Number }) requestTimeout: number = 30000;
    @property({ attribute: false }) postLoadTransformCallback: PostLoadTransformCallback | null = null;
    @property({ attribute: false }) postLoadTestTransformCallback: PostLoadTestTransformCallback | null = null;

    protected _testElement: QtiAssessmentTest;
    private _activeController: AbortController | null = null;
    private _stimulusToBeLoaded: Array<{ identifier: string; href: string; itemIdentifier: string }> = [];
    private _pendingStimulusLoads: Set<Promise<void>> = new Set();
    private _loadResults: any[] = [];
    private _pendingItemConnections = new Set<string>();

    constructor(...args: any[]) {
      super(...args);

      this.addEventListener('qti-request-navigation', this._handleNavigationRequest.bind(this));
      this.addEventListener('qti-assessment-test-connected', this._handleTestConnected.bind(this));

      this.addEventListener('qti-assessment-item-connected', this._handleItemConnected.bind(this));
      this.addEventListener('qti-assessment-stimulus-ref-connected', this._handleStimulusRefConnected.bind(this));
    }

    private _handleItemConnected(e: CustomEvent<QtiAssessmentItemRef>) {
      // check the doc for a <qti-assessment-stimulus-ref> and add the information of the stimulus to an array
      // so that the stimulus can be loaded later when the <qti-assessment-stimulus-ref> element is connected
      const itemRef = e.detail;
      const stimulusRefs = itemRef.querySelectorAll('qti-assessment-stimulus-ref');
      // if the pushed stimulus has the same href and identifier as an existing one, do not add it again
      stimulusRefs?.forEach(stimulusRef => {
        // const existingStimulus = this._stimulusToBeLoaded.find(s => s.href === stimulusRef.getAttribute('href'));

        // if (!existingStimulus) {
        this._stimulusToBeLoaded.push({
          identifier: stimulusRef.getAttribute('identifier'),
          href: stimulusRef.getAttribute('href'),
          itemIdentifier: itemRef.identifier
        });
        // }
      });

      // Mark this item as connected and remove from pending connections
      this._pendingItemConnections.delete(itemRef.identifier);
    }

    /**
     * Handle navigation requests
     */
    private async _handleNavigationRequest({ detail }: CustomEvent<{ type: 'item' | 'section'; id: string }>) {
      if (!detail?.id) return;

      // Cancel any previous navigation request
      this._cancelPreviousNavigation();

      try {
        this._dispatchLoadingStarted(detail.type, detail.id);
        this._activeController = new AbortController();

        if (detail.type === 'item') {
          await this._navigateToItem(detail.id);
        } else {
          await this._navigateToSection(detail.id);
        }
      } catch (error) {
        // Only dispatch error if it's not an abort error
        if (error.name !== 'AbortError') {
          this._dispatchError(this._createNavigationError(error, detail.type, detail.id));
        }
      } finally {
        this._activeController = null;
        this._dispatchLoadingEnded(detail.type, detail.id);
      }
    }

    /**
     * Handle test connection
     */
    private _handleTestConnected(e: CustomEvent<QtiAssessmentTest>) {
      this._testElement = e.detail;
      this._initializeNavigation();
    }

    private async _handleStimulusRefConnected(e: QtiAssessmentStimulusRefConnectedEvent) {
      e.preventDefault();

      const { element, item } = e;

      // Check if this is an expected stimulus ref
      const expectedStimulus = this._stimulusToBeLoaded.find(
        s => s.identifier === element.identifier && s.itemIdentifier === item.identifier && s.href === element.href
      );

      if (!expectedStimulus) {
        console.info('Stimulus ref not expected, aborting loading:', {
          identifier: element.identifier,
          itemIdentifier: item.identifier,
          href: element.href
        });
        return;
      }

      // Remove stimulus from the load queue
      this._stimulusToBeLoaded = this._stimulusToBeLoaded.filter(
        s => !(s.identifier === element.identifier && s.itemIdentifier === item.identifier && s.href === element.href)
      );

      // Create promise for stimulus loading and track it
      const stimulusLoadPromise = this._loadStimulus(element.href)
        .then(stimulus => {
          if (stimulus) {
            const elements = stimulus.querySelectorAll('qti-stimulus-body, qti-stylesheet');
            // Find the target element for the stimulus content
            const targetInItem = item.querySelector(`[data-stimulus-idref="${element.identifier}"]`);
            const targetInTest = this.querySelector(`[data-stimulus-idref]`);

            const target = targetInItem || targetInTest;

            if (target) {
              target.innerHTML = '';
              target.append(...elements);
            }
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.info(`Stimulus load for ${element.identifier} was aborted`);
          } else {
            console.warn(`Failed to load stimulus ${element.identifier}:`, error);
          }
        })
        .finally(() => {
          // Remove from pending loads when complete
          this._pendingStimulusLoads.delete(stimulusLoadPromise);
        });

      // Track this stimulus load
      this._pendingStimulusLoads.add(stimulusLoadPromise);
    }

    /**
     * Initialize navigation when test is first connected
     */
    private _initializeNavigation(): void {
      if (!this.navigate) return;

      let id: string | undefined;

      if (this.navigate === 'section') {
        id = this._testElement.querySelector<QtiAssessmentSection>('qti-assessment-section')?.identifier;
      } else {
        id =
          this.sessionContext.navItemRefId ??
          this._testElement.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref')?.identifier;
      }

      if (id) {
        this.navigateTo(this.navigate, id);
      }
    }

    /**
     * Public method to navigate to an item or section
     */
    public navigateTo(type: 'item' | 'section', id?: string): void {
      if (!id) {
        id =
          type === 'section'
            ? this._testElement?.querySelector<QtiAssessmentSection>('qti-assessment-section')?.identifier
            : this._testElement?.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref')?.identifier;
      }

      if (id) {
        this.dispatchEvent(
          new CustomEvent('qti-request-navigation', {
            detail: { type, id },
            bubbles: true,
            composed: true
          })
        );
      }
    }

    /**
     * Navigate to a specific item
     */
    private async _navigateToItem(itemId: string): Promise<void> {
      const itemRefEl = this._findItemRef(itemId);
      this._updateSessionContext(itemRefEl, itemId);
      await this._loadItems([itemId]);
      // Wait for all items to connect (this triggers stimulus discovery)
      await this._waitForAllItemConnections();
      // Wait for all stimulus loads to complete before navigation is considered done
      await this._waitForAllStimulusLoads();
      // Now dispatch the loaded event
      this._dispatchTestLoaded(this._loadResults);
    }

    /**
     * Navigate to a specific section
     */
    private async _navigateToSection(sectionId: string): Promise<void> {
      const sectionEl = this._findSection(sectionId);
      const navPartId = sectionEl.closest('qti-test-part')?.identifier;

      this.sessionContext = {
        ...this.sessionContext,
        navPartId,
        navSectionId: sectionId,
        navItemRefId: null
      };

      const itemIds = this._getSectionItemIds(sectionId);
      await this._loadItems(itemIds);
      // Wait for all items to connect (this triggers stimulus discovery)
      await this._waitForAllItemConnections();
      // Wait for all stimulus loads to complete before navigation is considered done
      await this._waitForAllStimulusLoads();
      // Now dispatch the loaded event
      this._dispatchTestLoaded(this._loadResults);
    }

    /**
     * Find item reference element
     */
    private _findItemRef(itemId: string): QtiAssessmentItemRef {
      const itemRefEl = this._testElement?.querySelector<QtiAssessmentItemRef>(
        `qti-assessment-item-ref[identifier="${itemId}"]`
      );

      if (!itemRefEl) {
        throw new Error(`Item with identifier "${itemId}" not found`);
      }

      return itemRefEl;
    }

    /**
     * Find section element
     */
    private _findSection(sectionId: string): QtiAssessmentSection {
      const sectionEl = this._testElement?.querySelector<QtiAssessmentSection>(
        `qti-assessment-section[identifier="${sectionId}"]`
      );

      return sectionEl;
    }

    /**
     * Update session context for item navigation
     */
    private _updateSessionContext(itemRefEl: QtiAssessmentItemRef, itemId: string): void {
      const navPartId = itemRefEl.closest('qti-test-part')?.identifier;
      const navSectionId = itemRefEl.closest('qti-assessment-section')?.identifier;

      this.sessionContext = {
        ...this.sessionContext,
        navPartId,
        navSectionId,
        navItemRefId: itemId
      };
    }

    /**
     * Load items with timeout handling and abort support
     */
    private async _loadItems(itemIds: string[]): Promise<void> {
      if (!this._testElement || itemIds.length === 0) return;

      const itemRefEls = itemIds.map(id => this._findItemRef(id));
      this._clearLoadedItems();
      this._clearStimulusRef();

      // Track which items we're expecting to connect
      itemIds.forEach(id => this._pendingItemConnections.add(id));

      const results = await Promise.all(itemRefEls.map(itemRef => this._loadSingleItem(itemRef)));

      const validResults = results.filter(Boolean);

      validResults.forEach(({ itemRef, doc }) => {
        if (itemRef && doc) itemRef.xmlDoc = doc;
      });

      // Store results for later use when dispatching loaded event
      this._loadResults = validResults;
    }

    private _clearStimulusRef() {
      this.querySelectorAll('[data-stimulus-idref]').forEach(el => (el.innerHTML = ''));
    }

    /**
     * Wait for all item connections to complete
     */
    private async _waitForAllItemConnections(): Promise<void> {
      while (this._pendingItemConnections.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to allow connections
      }
    }

    /**
     * Wait for all stimulus loads to complete
     */
    private async _waitForAllStimulusLoads(): Promise<void> {
      while (this._pendingStimulusLoads.size > 0) {
        await Promise.all([...this._pendingStimulusLoads]);
      }
    }

    /**
     * Cancel previous navigation request
     */
    private _cancelPreviousNavigation(): void {
      if (this._activeController) {
        this._activeController.abort();
        console.info('Previous navigation request cancelled');
      }

      // Clear all loaded items and pending stimulus loads when cancelling
      this._clearLoadedItems();
      this._pendingStimulusLoads.clear();
      this._pendingItemConnections.clear();
      this._loadResults = [];
    }

    /**
     * Load stimulus with abort support
     */
    private async _loadStimulus(href: string): Promise<DocumentFragment | null> {
      const transformer = await qtiTransformItem().load(href, this._activeController?.signal);
      return transformer.htmlDoc();
    }

    /**
     * Load a single item with abort support
     */
    private async _loadSingleItem(itemRef: QtiAssessmentItemRef) {
      try {
        let transformer = await qtiTransformItem(this.cacheTransform).load(
          itemRef.href,
          this._activeController?.signal
        );

        if (this.postLoadTransformCallback) {
          transformer = await this.postLoadTransformCallback(transformer, itemRef);
        }

        return {
          itemRef,
          doc: transformer.htmlDoc()
        };
      } catch (error) {
        if (error.name === 'AbortError') {
          console.info(`Item load for ${itemRef.identifier} was aborted`);
          throw error; // Re-throw abort errors
        }
        console.warn(`Failed to load item ${itemRef.identifier}:`, error);
        return null;
      }
    }

    /**
     * Get all item IDs in a section
     */
    private _getSectionItemIds(sectionId: string): string[] {
      return Array.from(
        this._testElement.querySelectorAll<QtiAssessmentItemRef>(
          `qti-assessment-section[identifier="${sectionId}"] > qti-assessment-item-ref`
        )
      ).map(itemRef => itemRef.identifier);
    }

    /**
     * Clear all loaded items
     */
    private _clearLoadedItems(): void {
      const itemRefEls = this._testElement?.querySelectorAll<QtiAssessmentItemRef>('qti-assessment-item-ref');
      Array.from(itemRefEls || []).forEach(itemElement => {
        itemElement.xmlDoc = null;
      });
    }

    /**
     * Create a navigation error object
     */
    private _createNavigationError(error: any, type: string, id: string): NavigationError {
      return {
        message: error.message || `Failed to load ${type}: ${id}`,
        details: error,
        itemId: type === 'item' ? id : undefined,
        sectionId: type === 'section' ? id : undefined
      };
    }

    /**
     * Dispatch loading started event
     */
    private _dispatchLoadingStarted(type: string, id: string): void {
      this.dispatchEvent(
        new CustomEvent('qti-navigation-loading-started', {
          detail: { type, id },
          bubbles: true,
          composed: true
        })
      );
    }

    /**
     * Dispatch loading ended event
     */
    private _dispatchLoadingEnded(type: string, id: string): void {
      this.dispatchEvent(
        new CustomEvent('qti-navigation-loading-ended', {
          detail: { type, id },
          bubbles: true,
          composed: true
        })
      );
    }

    /**
     * Dispatch error event
     */
    private _dispatchError(error: NavigationError): void {
      this.dispatchEvent(
        new CustomEvent('qti-navigation-error', {
          detail: error,
          bubbles: true,
          composed: true
        })
      );
    }

    /**
     * Dispatch test loaded event
     */
    private _dispatchTestLoaded(results: any[]): void {
      requestAnimationFrame(() => {
        this.dispatchEvent(
          new CustomEvent('qti-test-loaded', {
            detail: results.map(({ itemRef }) => ({
              identifier: itemRef?.identifier,
              element: itemRef
            })),
            bubbles: true,
            composed: true
          })
        );
      });
    }
  }

  return TestNavigationClass as Constructor<TestNavigationInterface> & T;
};
