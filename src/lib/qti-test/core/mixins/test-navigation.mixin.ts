import { property } from 'lit/decorators.js';

import { qtiTransformItem } from '../../../qti-transformers';

import type { transformItemApi } from '../../../qti-transformers';
import type { QtiAssessmentItemRef, QtiAssessmentSection, QtiAssessmentTest } from '../qti-assessment-test';
import type { TestBase } from '../test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;
export type PostLoadTransformCallback = (
  transformer: transformItemApi,
  itemRef: QtiAssessmentItemRef
) => transformItemApi | Promise<transformItemApi>;

// Define error types for better error handling
enum NavigationErrorType {
  ITEM_NOT_FOUND = 'item-not-found',
  SECTION_NOT_FOUND = 'section-not-found',
  LOAD_ERROR = 'load-error',
  NETWORK_ERROR = 'network-error',
  TIMEOUT_ERROR = 'timeout-error'
}

interface NavigationError {
  type: NavigationErrorType;
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
    @property({ type: Number }) requestTimeout: number = 30000; // Default timeout of 30 seconds
    @property({ type: Boolean }) showLoadingIndicators: boolean = true;
    @property({ type: Function }) postLoadTransformCallback: PostLoadTransformCallback | null = null;

    protected _testElement: QtiAssessmentTest;
    protected _navigationInProgress: boolean = false;
    private _activeRequests: XMLHttpRequest[] = [];

    private _lastError: NavigationError | null = null;
    private _lastNavigationRequestId: string | null = null;
    private _targetNavigation: { type: 'item' | 'section'; id: string } | null = null;

    constructor(...args: any[]) {
      super(...args);

      // Handle navigation requests
      this.addEventListener(
        'qti-request-navigation',
        async ({ detail }: CustomEvent<{ type: 'item' | 'section'; id: string }>) => {
          if (!detail?.id) return;

          // Track this navigation request's unique identifier
          // Using timestamp and a counter for uniqueness
          const navigationRequestId = `nav_${Date.now()}_${Math.random()}`;
          this._lastNavigationRequestId = navigationRequestId;

          try {
            // Set navigation in progress and clear errors
            this._navigationInProgress = true;
            this._lastError = null;
            this._dispatchStatusEvent({ loading: true, type: detail.type, id: detail.id });

            // Cancel any pending requests before starting new ones
            this._cancelActiveRequests();

            // Store the navigation target for quick navigation
            this._targetNavigation = { type: detail.type, id: detail.id };

            if (detail.type === 'item') {
              await this._navigateToItem(detail.id);
            } else if (detail.type === 'section') {
              await this._navigateToSection(detail.id);
            }

            // Verify this is still the most recent navigation request
            // If not, we don't need to do anything more as a newer request superseded this one
            if (this._lastNavigationRequestId !== navigationRequestId) {
              console.log('Navigation was superseded by a newer request');
              return;
            }
          } catch (error) {
            // Only process error if this is still the most recent navigation
            if (this._lastNavigationRequestId === navigationRequestId) {
              // Convert error to NavigationError if it's not already
              const navError = this._normalizeError(error, detail.type, detail.id);
              this._lastError = navError;

              // Dispatch the error event
              this._dispatchErrorEvent(navError);

              console.error(`Navigation error (${navError.type}):`, navError.message, navError.details);
            }
          } finally {
            // Only update navigation status if this is still the active request
            if (this._lastNavigationRequestId === navigationRequestId) {
              // Always mark navigation as completed
              this._navigationInProgress = false;
              this._dispatchStatusEvent({ loading: false, type: detail.type, id: detail.id });
            }
          }
        }
      );

      // Handle test connection
      this.addEventListener('qti-assessment-test-connected', (e: CustomEvent<QtiAssessmentTest>) => {
        this._testElement = e.detail;
        this._initializeNavigation();
      });
    }

    /**
     * Initialize navigation when test is first connected
     */
    private _initializeNavigation(): void {
      let id: string | undefined;

      if (this.navigate === 'section') {
        id = this._testElement.querySelector<QtiAssessmentSection>('qti-assessment-section')?.identifier;
      }
      if (this.navigate === 'item') {
        id =
          this.sessionContext.navItemRefId ??
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
    }

    public navigateTo(type: 'item' | 'section', id?: string): void {
      // if no id, take the first qti-assessment-item-ref
      if (!id) {
        if (type === 'section') {
          id = this._testElement?.querySelector<QtiAssessmentSection>('qti-assessment-section')?.identifier;
        }
        if (type === 'item') {
          id = this._testElement?.querySelector<QtiAssessmentItemRef>('qti-assessment-item-ref')?.identifier;
        }
      }
      this.dispatchEvent(
        new CustomEvent('qti-request-navigation', {
          detail: { type, id },
          bubbles: true,
          composed: true
        })
      );
    }
    /**
     * Navigates to a specific item
     */
    private async _navigateToItem(itemId: string): Promise<void> {
      const itemRefEl = this._testElement?.querySelector<QtiAssessmentItemRef>(
        `qti-assessment-item-ref[identifier="${itemId}"]`
      );

      if (!itemRefEl) {
        throw {
          type: NavigationErrorType.ITEM_NOT_FOUND,
          message: `Item with identifier "${itemId}" not found.`,
          itemId
        };
      }

      // Update the session context immediately to record navigation intent
      // This ensures we remember the target item even if loading is interrupted
      const navPartId = itemRefEl.closest('qti-test-part')?.identifier;
      const navSectionId = itemRefEl.closest('qti-assessment-section')?.identifier;

      // Set loading state and update navigation context first
      this.sessionContext = {
        ...this.sessionContext,
        navPartId,
        navSectionId,
        navItemRefId: itemId,
        navItemLoading: true
      };

      // console.log('Navigating to item:', itemId);

      // Then attempt to load the item content
      try {
        await this._loadItems([itemId]);
      } finally {
        // Even if loading fails or is interrupted, update loading state
        // This ensures we don't get stuck in a loading state
        this.sessionContext = {
          ...this.sessionContext,
          navItemLoading: false
        };
      }
    }

    /**
     * Navigates to a specific section
     */
    private async _navigateToSection(sectionId: string): Promise<void> {
      const sectionRefEl = this._testElement?.querySelector<QtiAssessmentSection>(
        `qti-assessment-section[identifier="${sectionId}"]`
      );

      if (!sectionRefEl) {
        throw {
          type: NavigationErrorType.SECTION_NOT_FOUND,
          message: `Section with identifier "${sectionId}" not found.`,
          sectionId
        };
      }

      // Get navigation context first
      const navPartId = sectionRefEl.closest('qti-test-part')?.identifier;

      // Update navigation state before loading items
      this.sessionContext = {
        ...this.sessionContext,
        navPartId,
        navSectionId: sectionId,
        navItemRefId: null,
        navItemLoading: true
      };

      // Then attempt to load the section's items
      try {
        const itemIds = this._getSectionItemIds(sectionId);
        await this._loadItems(itemIds);
      } finally {
        // Update loading state even if loading fails or is interrupted
        this.sessionContext = {
          ...this.sessionContext,
          navItemLoading: false
        };
      }
    }

    /**
     * Normalize different error types into a consistent NavigationError format
     */
    private _normalizeError(error: any, navigationType: string, id: string): NavigationError {
      // If it's already a NavigationError, return it
      if (error && error.type && Object.values(NavigationErrorType).includes(error.type)) {
        return error as NavigationError;
      }

      // For XMLHttpRequest related errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          type: NavigationErrorType.NETWORK_ERROR,
          message: 'Navigation was cancelled because a new navigation was requested.',
          details: error
        };
      }

      // For timeout errors
      if (error.name === 'TimeoutError' || (error.message && error.message.includes('timeout'))) {
        return {
          type: NavigationErrorType.TIMEOUT_ERROR,
          message: 'Request timed out. Please check your network connection.',
          details: error
        };
      }

      // For network errors
      if (error instanceof TypeError && error.message.includes('network')) {
        return {
          type: NavigationErrorType.NETWORK_ERROR,
          message: 'A network error occurred. Please check your connection.',
          details: error
        };
      }

      // Default to load error for anything else
      return {
        type: NavigationErrorType.LOAD_ERROR,
        message: `Failed to load ${navigationType}: ${id}`,
        details: error,
        itemId: navigationType === 'item' ? id : undefined,
        sectionId: navigationType === 'section' ? id : undefined
      };
    }

    /**
     * Dispatch error event to notify the UI
     */
    private _dispatchErrorEvent(error: NavigationError): void {
      this.dispatchEvent(
        new CustomEvent('qti-navigation-error', {
          detail: error,
          bubbles: true,
          composed: true
        })
      );
    }

    /**
     * Dispatch status event to indicate loading state
     */
    private _dispatchStatusEvent(status: { loading: boolean; type: string; id: string }): void {
      if (this.showLoadingIndicators) {
        this.dispatchEvent(
          new CustomEvent('qti-navigation-status', {
            detail: status,
            bubbles: true,
            composed: true
          })
        );
      }
    }

    /**
     * Cancels all active HTTP requests
     */
    private _cancelActiveRequests(): void {
      if (this._activeRequests.length > 0) {
        console.info(`Cancelling ${this._activeRequests.length} pending requests`);
        this._activeRequests.forEach(request => {
          if (request && request.readyState !== 4) {
            // 4 is DONE
            request.abort();
          }
        });
        this._activeRequests = [];
      }
    }

    /**
     * Load items with improved error handling and timeout
     */
    private async _loadItems(
      itemIds: string[]
    ): Promise<{ itemRef: QtiAssessmentItemRef; doc: any; request: XMLHttpRequest }[]> {
      if (!this._testElement || itemIds.length === 0) return;

      const itemRefEls = itemIds.map(id =>
        this._testElement!.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${id}"]`)
      );

      // Check for missing items
      const missingItems = itemRefEls.reduce((missing, el, index) => {
        if (!el) missing.push(itemIds[index]);
        return missing;
      }, [] as string[]);

      if (missingItems.length > 0) {
        const error: NavigationError = {
          type: NavigationErrorType.ITEM_NOT_FOUND,
          message: `One or more items not found: ${missingItems.join(', ')}`,
          details: { missingItems }
        };
        throw error;
      }

      this._clearLoadedItems();
      // Note: We no longer update navItemLoading here since it's handled in the navigation methods

      const itemLoadPromises = itemRefEls.map(async itemRef => {
        if (!itemRef) return null;

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject({
              name: 'TimeoutError',
              message: `Request for item ${itemRef.identifier} timed out after ${this.requestTimeout}ms`
            });
          }, this.requestTimeout);
        });

        try {
          const { promise, request } = qtiTransformItem(this.cacheTransform).load(itemRef.href);

          // Track the request so it can be cancelled if needed
          if (request instanceof XMLHttpRequest) {
            this._activeRequests.push(request);
          }

          // Race the item loading against the timeout
          const loadedTransformer = (await Promise.race([promise, timeoutPromise])) as transformItemApi;
          // Apply external transformation if provided
          let finalTransformer = loadedTransformer;

          if (this.postLoadTransformCallback) {
            finalTransformer = await this.postLoadTransformCallback(loadedTransformer, itemRef);
          }
          return {
            itemRef,
            doc: finalTransformer.htmlDoc(),
            request
          };
        } catch (error) {
          // If this is a cancellation or timeout, don't rethrow
          if (
            (error instanceof DOMException && error.name === 'AbortError') ||
            (error && error.name === 'TimeoutError')
          ) {
            console.log(
              `Request for item ${itemRef.identifier} was ${error.name === 'TimeoutError' ? 'timed out' : 'aborted'}`
            );
            return null;
          }

          // For other errors, add item context and rethrow
          error.itemId = itemRef.identifier;
          throw error;
        }
      });

      try {
        const results = await Promise.all(itemLoadPromises);

        // Filter out any null results (from aborted or timed out requests)
        const validResults = results.filter(result => result !== null);

        // Apply loaded docs to item refs
        validResults.forEach(({ itemRef, doc }) => {
          if (itemRef && doc) itemRef.xmlDoc = doc;
        });

        // Clear the active requests list after all are complete
        this._activeRequests = [];

        // Dispatch test loaded event
        requestAnimationFrame(() => {
          this.dispatchEvent(
            new CustomEvent('qti-test-loaded', {
              detail: validResults.map(({ itemRef }) => ({
                identifier: itemRef?.identifier,
                element: itemRef
              })),
              bubbles: true,
              composed: true
            })
          );
        });

        // If no valid results but we had items to load, this is an error
        if (validResults.length === 0 && itemIds.length > 0) {
          throw {
            type: NavigationErrorType.LOAD_ERROR,
            message: 'All item requests failed to load',
            details: { itemIds }
          };
        }

        return validResults;
      } catch (error) {
        console.error('Error loading items:', error);
        throw error;
      }
    }

    /**
     * Gets all item IDs in a section
     */
    private _getSectionItemIds(navSectionId: string): string[] {
      const sectionRefEl = this._testElement?.querySelector<QtiAssessmentSection>(
        `qti-assessment-section[identifier="${navSectionId}"]`
      );

      if (!sectionRefEl) {
        throw {
          type: NavigationErrorType.SECTION_NOT_FOUND,
          message: `Section with identifier "${navSectionId}" not found.`,
          sectionId: navSectionId
        };
      }

      return Array.from(
        this._testElement!.querySelectorAll<QtiAssessmentItemRef>(
          `qti-assessment-section[identifier="${navSectionId}"] > qti-assessment-item-ref`
        )
      ).map(itemRef => itemRef.identifier);
    }

    /**
     * Clears all loaded items
     */
    private _clearLoadedItems(): void {
      const itemRefEls = this._testElement?.querySelectorAll<QtiAssessmentItemRef>(
        `qti-assessment-test qti-assessment-item-ref`
      );
      Array.from(itemRefEls || []).forEach(itemElement => {
        itemElement.xmlDoc = null;
      });
    }

    /**
     * Retry the last failed navigation
     */
    public retryNavigation(): void {
      if (this._lastError) {
        const type = this._lastError.itemId ? 'item' : 'section';
        const id = this._lastError.itemId || this._lastError.sectionId;

        if (id) {
          this.dispatchEvent(
            new CustomEvent('qti-request-navigation', {
              detail: { type, id },
              bubbles: true,
              composed: true
            })
          );
        }
      } else if (this._targetNavigation) {
        // If we have a target navigation but no error, we can retry that
        this.dispatchEvent(
          new CustomEvent('qti-request-navigation', {
            detail: this._targetNavigation,
            bubbles: true,
            composed: true
          })
        );
      }
    }
  }

  return TestNavigationClass as Constructor<TestNavigationInterface> & T;
};
