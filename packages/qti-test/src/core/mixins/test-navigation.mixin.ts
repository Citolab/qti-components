import { property } from 'lit/decorators.js';

import { qtiTransformItem } from '@qti-components/transformers';

import type { QtiAssessmentStimulusRefConnectedEvent } from '@qti-components/elements';
import type { transformItemApi, transformTestApi } from '@qti-components/transformers';
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

/**
 * Navigation mixin for QTI test components
 *
 * Provides comprehensive navigation functionality with:
 * - Efficient item/section loading with AbortController support
 * - Stimulus reference coordination and duplicate prevention
 * - Proper event timing and state management
 * - Error handling and edge case coverage
 */
export const TestNavigationMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestNavigationClass extends superClass implements TestNavigationInterface {
    @property({ type: String }) navigate: 'item' | 'section' | null = null;
    @property({ type: Boolean, attribute: 'cache-transform' }) cacheTransform: boolean = false;
    @property({ type: Number }) requestTimeout: number = 30000;
    @property({ attribute: false }) postLoadTransformCallback: PostLoadTransformCallback | null = null;
    @property({ attribute: false }) postLoadTestTransformCallback: PostLoadTestTransformCallback | null = null;

    protected override _testElement: QtiAssessmentTest;

    // Navigation state tracking
    private _activeController: AbortController | null = null;
    private _loadResults: any[] = [];

    // Simple loading progress tracking
    private _loadingState = {
      expectedItems: 0,
      connectedItems: 0,
      expectedStimulus: 0,
      loadedStimulus: 0,
      isComplete: false
    };

    // Track loaded/loading stimulus hrefs to prevent duplicates
    private _loadedStimulusHrefs = new Set<string>();
    private _loadingStimulusHrefs = new Set<string>();

    constructor(...args: any[]) {
      super(...args);
      this._bindEventHandlers();
    }

    // ===========================================
    // PUBLIC API
    // ===========================================

    /**
     * Navigate to a specific item or section
     * @param type - Navigation type ('item' or 'section')
     * @param id - Target identifier (optional, falls back to first available)
     */
    public navigateTo(type: 'item' | 'section', id?: string): void {
      const targetId = id || this._getDefaultNavigationId(type);

      if (targetId) {
        this.dispatchEvent(
          new CustomEvent('qti-request-navigation', {
            detail: { type, id: targetId },
            bubbles: true,
            composed: true
          })
        );
      }
    }

    // ===========================================
    // EVENT HANDLER SETUP
    // ===========================================

    private _bindEventHandlers(): void {
      this.addEventListener('qti-request-navigation', this._handleNavigationRequest.bind(this));
      this.addEventListener('qti-assessment-test-connected', this._handleTestConnected.bind(this));
      this.addEventListener('qti-assessment-item-connected', this._handleItemConnected.bind(this));
      this.addEventListener('qti-assessment-stimulus-ref-connected', this._handleStimulusRefConnected.bind(this));
    }

    private _handleTestConnected(e: CustomEvent<QtiAssessmentTest>): void {
      this._testElement = e.detail;
      this._initializeNavigation();
    }

    /**
     * Handle item connection events - track connected items and discover stimulus references
     */
    private _handleItemConnected(e: CustomEvent<QtiAssessmentItemRef>): void {
      const itemRef = e.detail;

      // Increment connected items count
      this._loadingState.connectedItems++;

      // Count stimulus references in this item and add to expected
      const stimulusRefs = itemRef.querySelectorAll('qti-assessment-stimulus-ref');
      this._loadingState.expectedStimulus += stimulusRefs.length;

      this._checkLoadingComplete();
    }

    /**
     * Handle stimulus reference connection events with duplicate prevention
     */
    private async _handleStimulusRefConnected(e: QtiAssessmentStimulusRefConnectedEvent): Promise<void> {
      e.preventDefault();

      const { element, item } = e;
      console.info('Stimulus ref connected:', {
        identifier: element.identifier,
        href: element.href,
        item: item.identifier
      });

      // Check if this stimulus href is already loaded or currently loading
      if (this._loadedStimulusHrefs.has(element.href)) {
        console.info('Stimulus already loaded, skipping:', element.href);
        this._loadingState.loadedStimulus++;
        this._checkLoadingComplete();
        return;
      }

      if (this._loadingStimulusHrefs.has(element.href)) {
        console.info('Stimulus already loading, skipping duplicate:', element.href);
        this._loadingState.loadedStimulus++;
        this._checkLoadingComplete();
        return;
      }

      // Mark as currently loading
      this._loadingStimulusHrefs.add(element.href);
      console.info('Starting stimulus load:', element.href);

      try {
        await this._loadStimulusRef(element, item);
        this._loadedStimulusHrefs.add(element.href);
        this._loadingState.loadedStimulus++;
        console.info('Stimulus loaded successfully:', element.href);
        this._checkLoadingComplete();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn(`Failed to load stimulus ${element.identifier}:`, error);
        }
        // Still count as "processed" even if failed to avoid hanging
        this._loadingState.loadedStimulus++;
        this._checkLoadingComplete();
      } finally {
        // Remove from loading set regardless of outcome
        this._loadingStimulusHrefs.delete(element.href);
      }
    }

    // ===========================================
    // NAVIGATION FLOW
    // ===========================================

    private _getDefaultNavigationId(type: 'item' | 'section'): string | undefined {
      if (type === 'section') {
        return this._testElement?.querySelector<QtiAssessmentSection>('qti-assessment-section')?.identifier;
      }
      return (
        this.sessionContext?.navItemRefId ??
        this._testElement?.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref')?.identifier
      );
    }

    private _initializeNavigation(): void {
      if (!this.navigate) return;

      const id = this._getDefaultNavigationId(this.navigate);
      if (id) {
        this.navigateTo(this.navigate, id);
      }
    }

    /**
     * Main navigation request handler with proper lifecycle management
     */
    private async _handleNavigationRequest({ detail }: CustomEvent<{ type: 'item' | 'section'; id: string }>) {
      if (!detail?.id) return;

      this._cancelPreviousNavigation();

      try {
        this._dispatchLoadingStarted(detail.type, detail.id);
        this._activeController = new AbortController();

        await this._executeNavigation(detail.type, detail.id);
      } catch (error) {
        this._handleNavigationError(error, detail.type, detail.id);
      } finally {
        this._activeController = null;
        this._dispatchLoadingEnded(detail.type, detail.id);
      }
    }

    private _handleNavigationError(error: any, type: string, id: string): void {
      if (error.name !== 'AbortError') {
        this._dispatchError(this._createNavigationError(error, type, id));
      }
    }

    private async _executeNavigation(type: 'item' | 'section', id: string): Promise<void> {
      if (type === 'item') {
        await this._navigateToItem(id);
      } else {
        await this._navigateToSection(id);
      }
    }

    /**
     * Navigate to specific item with simple state tracking
     */
    private async _navigateToItem(itemId: string): Promise<void> {
      const itemRef = this._findItemRef(itemId);
      this._updateSessionContext(itemRef, itemId);

      this._resetLoadingState();
      this._loadingState.expectedItems = 1;

      await this._loadItems([itemId]);
      await this._waitForLoadingComplete();

      this._dispatchTestLoaded(this._loadResults);
    }

    /**
     * Navigate to section with simple state tracking
     */
    private async _navigateToSection(sectionId: string): Promise<void> {
      const sectionEl = this._findSection(sectionId);
      const navPartId = sectionEl?.closest('qti-test-part')?.identifier;

      this.sessionContext = {
        ...this.sessionContext,
        navPartId,
        navSectionId: sectionId,
        navItemRefId: null
      };

      const itemIds = this._getSectionItemIds(sectionId);

      this._resetLoadingState();
      this._loadingState.expectedItems = itemIds.length;

      await this._loadItems(itemIds);
      await this._waitForLoadingComplete();

      this._dispatchTestLoaded(this._loadResults);
    }

    // ===========================================
    // LOADING STATE MANAGEMENT
    // ===========================================

    /**
     * Reset loading state for new navigation
     */
    private _resetLoadingState(): void {
      this._loadingState = {
        expectedItems: 0,
        connectedItems: 0,
        expectedStimulus: 0,
        loadedStimulus: 0,
        isComplete: false
      };

      // Clear stimulus tracking - start fresh for new navigation
      this._loadedStimulusHrefs.clear();
      this._loadingStimulusHrefs.clear();
    }

    /**
     * Check if loading is complete and dispatch events accordingly
     */
    private _checkLoadingComplete(): void {
      const allItemsConnected = this._loadingState.connectedItems >= this._loadingState.expectedItems;
      const allStimulusLoaded = this._loadingState.loadedStimulus >= this._loadingState.expectedStimulus;

      if (allItemsConnected && allStimulusLoaded && !this._loadingState.isComplete) {
        this._loadingState.isComplete = true;
      }
    }

    /**
     * Wait for loading to complete with simple polling
     */
    private async _waitForLoadingComplete(): Promise<void> {
      while (!this._loadingState.isComplete) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    /**
     * Get current loading progress for external consumption
     */
    public getLoadingProgress() {
      return { ...this._loadingState };
    }

    /**
     * Load stimulus reference with simple tracking
     */
    private async _loadStimulusRef(
      element: { identifier: string; href: string },
      item: { identifier: string }
    ): Promise<void> {
      console.info('Loading stimulus:', element.href);
      const stimulus = await this._loadStimulus(element.href);
      console.info('Stimulus loaded, applying content:', stimulus ? 'has content' : 'no content');
      this._applyStimulusContent(stimulus, element, item);
    }

    private _applyStimulusContent(
      stimulus: DocumentFragment | null,
      element: { identifier: string },
      item: { identifier: string }
    ): void {
      if (!stimulus) {
        console.warn('No stimulus content to apply');
        return;
      }

      const elements = stimulus.querySelectorAll('qti-stimulus-body, qti-stylesheet');
      console.info(`Found ${elements.length} stimulus elements to apply for ${element.identifier}`);

      if (elements.length === 0) {
        console.warn('No qti-stimulus-body or qti-stylesheet elements found in stimulus');
        return;
      }

      // Try multiple target selection strategies
      let targets: Element[] = [];

      // Strategy 1: Specific item and identifier
      const specificTarget = document.querySelector(
        `qti-assessment-item[identifier="${item.identifier}"] [data-stimulus-idref="${element.identifier}"]`
      );

      if (specificTarget) {
        targets.push(specificTarget);
        console.info('Found specific target:', specificTarget);
      } else {
        // Strategy 2: Any element with matching stimulus idref
        const allTargetsWithId = Array.from(this.querySelectorAll(`[data-stimulus-idref="${element.identifier}"]`));

        if (allTargetsWithId.length > 0) {
          targets = allTargetsWithId;
          console.info('Found targets by identifier:', allTargetsWithId.length);
        } else {
          // Strategy 3: Any stimulus idref target (fallback)
          const allStimulusTargets = Array.from(this.querySelectorAll('[data-stimulus-idref]'));
          targets = allStimulusTargets;
          console.info('Using fallback targets:', allStimulusTargets.length);
        }
      }

      if (targets.length === 0) {
        console.warn('No targets found for stimulus content');
        return;
      }

      // Apply content to all targets
      targets.forEach((target, index) => {
        target.innerHTML = '';
        const clonedElements = Array.from(elements).map(el => el.cloneNode(true) as Element);
        target.append(...clonedElements);
        console.info(`Applied stimulus content to target ${index + 1}/${targets.length}`);
      });
    } // ===========================================
    // LOADING INFRASTRUCTURE
    // ===========================================

    /**
     * Cancel previous navigation and clean up all state
     */
    private _cancelPreviousNavigation(): void {
      if (this._activeController) {
        this._activeController.abort();
        console.info('Previous navigation request cancelled');
      }

      this._clearNavigationState();
    }

    private _clearNavigationState(): void {
      this._clearLoadedItems();
      this._resetLoadingState();
      this._loadResults = [];
    }

    /**
     * Load items with simple tracking
     */
    private async _loadItems(itemIds: string[]): Promise<void> {
      if (!this._testElement || itemIds.length === 0) return;

      const itemRefs = itemIds.map(id => this._findItemRef(id));
      this._clearLoadedItems();
      this._clearStimulusRef();

      const results = await Promise.all(itemRefs.map(ref => this._loadSingleItem(ref)));
      const validResults = results.filter(Boolean);

      validResults.forEach(({ itemRef, doc }) => {
        if (itemRef && doc) itemRef.xmlDoc = doc;
      });

      this._loadResults = validResults;
    }

    private async _loadSingleItem(itemRef: QtiAssessmentItemRef) {
      try {
        let transformer = await qtiTransformItem(this.cacheTransform).load(
          itemRef.href,
          this._activeController?.signal
        );

        if (this.postLoadTransformCallback) {
          transformer = await this.postLoadTransformCallback(transformer, itemRef);
        }

        return { itemRef, doc: transformer.htmlDoc() };
      } catch (error) {
        if (error.name === 'AbortError') {
          console.info(`Item load for ${itemRef.identifier} was aborted`);
          throw error;
        }
        console.warn(`Failed to load item ${itemRef.identifier}:`, error);
        return null;
      }
    }

    private async _loadStimulus(href: string): Promise<DocumentFragment | null> {
      const transformer = await qtiTransformItem().load(href, this._activeController?.signal);
      return transformer.htmlDoc();
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    private _findItemRef(itemId: string): QtiAssessmentItemRef {
      const itemRef = this._testElement?.querySelector<QtiAssessmentItemRef>(
        `qti-assessment-item-ref[identifier="${itemId}"]`
      );

      if (!itemRef) {
        throw new Error(`Item with identifier "${itemId}" not found`);
      }

      return itemRef;
    }

    private _findSection(sectionId: string): QtiAssessmentSection | null {
      return (
        this._testElement?.querySelector<QtiAssessmentSection>(`qti-assessment-section[identifier="${sectionId}"]`) ||
        null
      );
    }

    private _updateSessionContext(itemRef: QtiAssessmentItemRef, itemId: string): void {
      const navPartId = itemRef.closest('qti-test-part')?.identifier;
      const navSectionId = itemRef.closest('qti-assessment-section')?.identifier;

      this.sessionContext = {
        ...this.sessionContext,
        navPartId,
        navSectionId,
        navItemRefId: itemId
      };
    }

    private _getSectionItemIds(sectionId: string): string[] {
      return Array.from(
        this._testElement.querySelectorAll<QtiAssessmentItemRef>(
          `qti-assessment-section[identifier="${sectionId}"] > qti-assessment-item-ref`
        )
      )
        .map(ref => ref.identifier)
        .filter(Boolean);
    }

    private _clearLoadedItems(): void {
      const itemRefs = this._testElement?.querySelectorAll<QtiAssessmentItemRef>('qti-assessment-item-ref');
      Array.from(itemRefs || []).forEach(element => {
        element.xmlDoc = null;
      });
    }

    private _clearStimulusRef(): void {
      this.querySelectorAll('[data-stimulus-idref]').forEach(el => (el.innerHTML = ''));
    }

    private _createNavigationError(error: any, type: string, id: string): NavigationError {
      return {
        message: error.message || `Failed to load ${type}: ${id}`,
        details: error,
        itemId: type === 'item' ? id : undefined,
        sectionId: type === 'section' ? id : undefined
      };
    }

    // ===========================================
    // EVENT DISPATCHING
    // ===========================================

    private _dispatchLoadingStarted(type: string, id: string): void {
      this.dispatchEvent(
        new CustomEvent('qti-navigation-loading-started', {
          detail: { type, id },
          bubbles: true,
          composed: true
        })
      );
    }

    private _dispatchLoadingEnded(type: string, id: string): void {
      this.dispatchEvent(
        new CustomEvent('qti-navigation-loading-ended', {
          detail: { type, id },
          bubbles: true,
          composed: true
        })
      );
    }

    private _dispatchError(error: NavigationError): void {
      this.dispatchEvent(
        new CustomEvent('qti-navigation-error', {
          detail: error,
          bubbles: true,
          composed: true
        })
      );
    }

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
