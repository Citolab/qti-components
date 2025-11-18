import { property } from 'lit/decorators.js';
import { isSupported, apply } from 'observable-polyfill/fn';

import type { Interaction, IInteraction } from '@qti-components/base';

if (!isSupported()) apply();

// Global setup for iOS Safari touch events
const patchedWindows = new WeakSet<Window>();

function patchWindow(window?: Window | null) {
  if (!window || patchedWindows.has(window)) {
    return;
  }
  // This noop touchmove listener with passive: false allows preventDefault() calls
  // to work properly in dynamically added touchmove handlers (iOS Safari fix)
  window.addEventListener('touchmove', () => {}, { capture: false, passive: false });
  patchedWindows.add(window);
}

type Constructor<T = {}> = abstract new (...args: any[]) => T;

interface InteractionConfiguration {
  copyStylesDragClone: boolean;
  dragCanBePlacedBack: boolean;
  dragOnClick: boolean;
}

interface DragState {
  dragging: boolean;
  dragSource: HTMLElement | null;
  dragClone: HTMLElement | null;
  startOffset: { x: number; y: number };
  currentTarget: HTMLElement | null;
  inputType: 'mouse' | 'touch' | null;
  pointerId?: number;
  initialCoordinates?: { x: number; y: number };
  activationTimeout?: number;
  touchCleanup?: () => void;
}

export const ObservableDragDropMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  droppablesSelector: string,
  dragContainersSelector = 'slot[part="drags"]'
) => {
  abstract class ObservableDragDropElement extends superClass implements IInteraction {
    @property({ attribute: false, type: Object }) protected configuration: InteractionConfiguration = {
      copyStylesDragClone: true,
      dragCanBePlacedBack: true,
      dragOnClick: false
    };
    @property({ type: Number, reflect: true, attribute: 'min-associations' }) minAssociations = 1;
    @property({ type: Number, reflect: true, attribute: 'max-associations' }) maxAssociations = 0;

    private trackedDraggables: HTMLElement[] = [];
    private trackedDroppables: HTMLElement[] = [];
    private trackedDragContainers: HTMLElement[] = [];
    private allDropzones: HTMLElement[] = [];

    private dragState: DragState = {
      dragging: false,
      dragSource: null,
      dragClone: null,
      startOffset: { x: 0, y: 0 },
      currentTarget: null,
      inputType: null
    };

    private subscriptions: Array<{ unsubscribe: () => void }> = [];
    private dragSubscriptions: Array<{ unsubscribe: () => void }> = [];

    abstract get response(): string;
    abstract set response(value: string);
    abstract validate(): boolean | null;

    override connectedCallback(): void {
      super.connectedCallback();
      patchWindow(this.ownerDocument?.defaultView);
      this.setupDragDrop();
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this.cleanup();
    }

    private async setupDragDrop(): Promise<void> {
      await this.updateComplete;

      this.cacheInteractiveElements();
      this.setupDragObservables();
    }

    private cacheInteractiveElements(): void {
      const collect = (selector: string, scope: ParentNode | ShadowRoot | null | undefined) =>
        Array.from(scope?.querySelectorAll<HTMLElement>(selector) ?? []);

      const lightDraggables = collect(draggablesSelector, this);
      const shadowDraggables = collect(draggablesSelector, this.shadowRoot);

      const lightClones = collect('[qti-draggable="true"]:not([data-drag-clone])', this);
      const shadowClones = collect('[qti-draggable="true"]:not([data-drag-clone])', this.shadowRoot);

      this.trackedDraggables = Array.from(
        new Set([...lightDraggables, ...shadowDraggables, ...lightClones, ...shadowClones])
      );

      const lightDroppables = collect(droppablesSelector, this);
      const shadowDroppables = collect(droppablesSelector, this.shadowRoot);
      this.trackedDroppables = Array.from(new Set([...lightDroppables, ...shadowDroppables]));

      const lightDragContainers = collect(dragContainersSelector, this);
      const shadowDragContainers = collect(dragContainersSelector, this.shadowRoot);
      this.trackedDragContainers = Array.from(new Set([...lightDragContainers, ...shadowDragContainers]));

      this.allDropzones = [...this.trackedDroppables, ...this.trackedDragContainers];

      this.trackedDraggables.forEach(draggable => {
        draggable.style.cursor = 'grab';
        draggable.style.userSelect = 'none';
        draggable.style.touchAction = 'none'; // Prevent ALL default touch behaviors
        draggable.style.webkitUserSelect = 'none'; // Safari compatibility
        (draggable.style as any).webkitTouchCallout = 'none'; // Prevent iOS callout
        draggable.setAttribute('qti-draggable', 'true');
        draggable.setAttribute('tabindex', '0');
      });
    }

    private setupDragObservables(): void {
      const shadowRoot = this.shadowRoot;
      if (!shadowRoot) {
        console.error('❌ [Observable DnD] No shadow root found!');
        return;
      }

      const pointerDragSub = (shadowRoot as any)
        .when('pointerdown')
        .filter((e: PointerEvent) => {
          const target = this.findDraggableTarget(e);
          return target && e.isPrimary !== false && e.button === 0;
        })
        .subscribe((downEvent: PointerEvent) => {
          const dragTarget = this.findDraggableTarget(downEvent);
          if (!dragTarget) {
            console.warn('⚠️ [Observable DnD] No draggable target found');
            return;
          }

          if (downEvent.pointerType === 'touch') {
            downEvent.preventDefault();
            downEvent.stopPropagation();
          }

          const delay = downEvent.pointerType === 'touch' ? 100 : 10;
          setTimeout(() => {
            if (!this.dragState.dragging) {
              this.initiateDrag(
                dragTarget,
                downEvent.clientX,
                downEvent.clientY,
                downEvent.pointerType as 'mouse' | 'touch'
              );
            }
          }, delay);
        });

      const keyboardStream = (shadowRoot as any)
        .when('keydown')
        .map((e: KeyboardEvent) => {
          const draggables = this.trackedDraggables.filter(d => d.style.opacity !== '0');
          const allDropTargets = [...this.trackedDroppables, ...this.trackedDragContainers];
          return { e, draggables, dropTargets: allDropTargets };
        })
        .scan((state, { e, draggables, dropTargets }) => {
          if (!state) {
            state = {
              dragging: false,
              dragElement: null,
              dragIndex: 0,
              dropIndex: 0,
              dropElement: null
            };
          }
          // Start drag
          if (!state.dragging) {
            const target = this.findDraggableTarget(e);
            if (target && ['Space', 'Enter'].includes(e.code)) {
              e.preventDefault();
              target.setAttribute('data-keyboard-dragging', 'true');
              return {
                dragging: true,
                dragElement: target,
                dragIndex: draggables.indexOf(target),
                dropIndex: 0,
                dropElement: dropTargets[0]
              };
            }
            return state;
          }
          // Navigation and drop/cancel
          switch (e.code) {
            case 'ArrowRight':
            case 'ArrowDown': {
              e.preventDefault();
              const nextDropIndex = (state.dropIndex + 1) % dropTargets.length;
              return { ...state, dropIndex: nextDropIndex, dropElement: dropTargets[nextDropIndex] };
            }
            case 'ArrowLeft':
            case 'ArrowUp': {
              e.preventDefault();
              const prevDropIndex = (state.dropIndex - 1 + dropTargets.length) % dropTargets.length;
              return { ...state, dropIndex: prevDropIndex, dropElement: dropTargets[prevDropIndex] };
            }
            case 'Space':
            case 'Enter':
            case 'Tab': {
              e.preventDefault();
              if (state.dragElement && state.dropElement) {
                const identifier = state.dragElement.getAttribute('identifier');
                const isDroppingToInventory = this.trackedDragContainers.includes(state.dropElement);

                if (isDroppingToInventory) {
                  // Return item to inventory
                  state.dragElement.remove();
                  if (identifier) {
                    this.restoreOriginalInInventory(identifier);
                  }
                  this.cacheInteractiveElements();
                  this.checkAllMaxAssociations();
                } else {
                  // Drop into a droppable zone
                  if (identifier) {
                    this.trackedDroppables.forEach(zone => {
                      const existing = zone.querySelector(`[identifier="${identifier}"]`);
                      if (existing) existing.remove();
                    });
                    this.findInventoryItems(identifier).forEach(item => {
                      if (item !== state.dragElement) item.remove();
                    });
                  }
                  this.dropDraggableInDroppable(state.dragElement, state.dropElement);
                }

                this.trackedDraggables.forEach(d => d.removeAttribute('data-keyboard-dragging'));
                this.saveResponse();
              }
              return {
                dragging: false,
                dragElement: null,
                dragIndex: 0,
                dropIndex: 0,
                dropElement: null
              };
            }
            case 'Escape': {
              e.preventDefault();
              this.trackedDraggables.forEach(d => d.removeAttribute('data-keyboard-dragging'));
              return {
                dragging: false,
                dragElement: null,
                dragIndex: 0,
                dropIndex: 0,
                dropElement: null
              };
            }
            default:
              return state;
          }
        }, null)
        .subscribe((state: any) => {
          // Highlight dropzone if dragging
          this.allDropzones.forEach(zone => zone.removeAttribute('hover'));
          if (state && state.dragging && state.dropElement) {
            state.dropElement.setAttribute('hover', '');
            // Only focus the drop element if it's focusable and won't interfere with tab navigation
            // Don't steal focus from the currently focused element (the draggable being moved)
            if (state.dropElement.hasAttribute('tabindex') && state.dropElement.getAttribute('tabindex') !== '-1') {
              state.dropElement.focus();
            }
          }
        });

      this.subscriptions.push(pointerDragSub, keyboardStream);
    }

    private findDraggableTarget(e: Event): HTMLElement | null {
      const composedPath = e.composedPath ? e.composedPath() : [e.target];

      for (const element of composedPath) {
        if (element instanceof HTMLElement && element.tagName !== 'SLOT') {
          if (this.isDraggableTarget(element)) {
            return element;
          }
        }
      }

      return null;
    }

    private isDraggableTarget(element: HTMLElement): boolean {
      if (!element) return false;

      if (element.matches(draggablesSelector) || element.hasAttribute('qti-draggable')) {
        return true;
      }

      return !!element.closest(draggablesSelector) || !!element.closest('[qti-draggable="true"]');
    }

    private initiateDrag(dragElement: HTMLElement, startX: number, startY: number, inputType: 'mouse' | 'touch'): void {
      if (this.dragState.dragging) {
        console.warn('⚠️ [Observable DnD] Already dragging, ignoring initiateDrag');
        return;
      }
      if (dragElement.hasAttribute('data-drag-clone')) {
        console.warn('⚠️ [Observable DnD] Attempted to drag visual clone, ignoring');
        return;
      }

      const isCloneInDroppable = this.trackedDroppables.some(d => d.contains(dragElement));
      const rect = dragElement.getBoundingClientRect();

      this.dragState = {
        dragging: true,
        dragSource: dragElement, // Keep it simple - this is what we clicked
        dragClone: this.createDragClone(dragElement, rect),
        startOffset: {
          x: startX - rect.left,
          y: startY - rect.top
        },
        currentTarget: null,
        inputType: inputType
      };

      if (isCloneInDroppable) {
        // If dragging from a droppable, remove the clone completely
        dragElement.remove();
        this.cacheInteractiveElements();
      } else {
        // If dragging from inventory, hide the original during drag
        dragElement.style.opacity = '0';
        dragElement.style.pointerEvents = 'none';
      }

      this.updateClonePosition(startX, startY);
      this.activateAllDroppables();
      this.setupMoveObservables(inputType);
    }

    private setupMoveObservables(inputType: 'mouse' | 'touch'): void {
      // Enhanced touch handling - use pointer capture to maintain touch session
      if (inputType === 'touch') {
        document.body.setPointerCapture(1); // Use a generic pointer ID for touch

        const preventAllTouch = (e: TouchEvent) => {
          if (e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
          }
        };

        document.addEventListener('touchmove', preventAllTouch, { passive: false, capture: true });
        document.addEventListener('touchstart', preventAllTouch, { passive: false, capture: true });
        document.addEventListener('touchend', preventAllTouch, { passive: false, capture: true });
        document.addEventListener('gesturestart', preventAllTouch, { passive: false });
        document.addEventListener('gesturechange', preventAllTouch, { passive: false });
        document.addEventListener('gestureend', preventAllTouch, { passive: false });

        const cleanup = () => {
          document.removeEventListener('touchmove', preventAllTouch);
          document.removeEventListener('touchstart', preventAllTouch);
          document.removeEventListener('touchend', preventAllTouch);
          document.removeEventListener('gesturestart', preventAllTouch);
          document.removeEventListener('gesturechange', preventAllTouch);
          document.removeEventListener('gestureend', preventAllTouch);
          try {
            document.body.releasePointerCapture(1);
          } catch (e) {
            // Ignore errors if capture was already released
          }
        };

        this.dragState.touchCleanup = cleanup;
      }

      const moveSub = (document as any)
        .when('pointermove')
        .takeUntil((document as any).when('pointerup'))
        .subscribe({
          next: (e: PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();

            this.handleDragMove(e.clientX, e.clientY);
          }
        });

      const endSub = (document as any).when('pointerup').subscribe({
        next: (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();

          this.handleDragEnd();
        }
      });

      // Handle pointer cancel (important for touch)
      const cancelSub = (document as any).when('pointercancel').subscribe({
        next: () => {
          this.handleDragEnd();
        }
      });

      const escapeSub = (document as any)
        .when('keydown')
        .filter((e: KeyboardEvent) => e.key === 'Escape')
        .subscribe({
          next: () => {
            this.handleDragEnd();
          }
        });

      this.dragSubscriptions.push(moveSub, endSub, cancelSub, escapeSub);
    }

    private handleDragMove(clientX: number, clientY: number): void {
      if (!this.dragState.dragging || !this.dragState.dragClone) return;

      this.updateClonePosition(clientX, clientY);

      const dropTarget = this.findClosestDropzone(clientX, clientY);

      if (dropTarget !== this.dragState.currentTarget) {
        this.allDropzones.forEach(zone => zone.removeAttribute('hover'));
        if (dropTarget) {
          dropTarget.setAttribute('hover', '');
        }
        this.dragState.currentTarget = dropTarget;
      }
    }

    private handleDragEnd(): void {
      if (!this.dragState.dragging) return;

      const { dragSource, dragClone, currentTarget } = this.dragState;

      if (currentTarget && dragSource && this.trackedDroppables.includes(currentTarget)) {
        this.dropDraggableInDroppable(dragSource, currentTarget);
        const identifier = dragSource.getAttribute('identifier');

        if (identifier) {
          this.updateInventoryBasedOnMatchMax(identifier);
        }
      } else {
        if (dragSource && dragSource.style.opacity === '0') {
          this.restoreInventoryItem(dragSource);
        }

        this.returnToInventory(dragSource);
      }

      if (dragClone) {
        dragClone.remove();
      }

      if (this.dragState.touchCleanup) {
        this.dragState.touchCleanup();
      }

      this.resetDragState();
      this.deactivateAllDroppables();
      this.saveResponse();
    }

    private createDragClone(element: HTMLElement, rect: DOMRect): HTMLElement {
      const clone = element.cloneNode(true) as HTMLElement;

      const computedStyles = window.getComputedStyle(element);
      for (let i = 0; i < computedStyles.length; i++) {
        const property = computedStyles[i];
        clone.style.setProperty(property, computedStyles.getPropertyValue(property));
      }

      // Set clone positioning and ensure it never interferes with pointer events
      clone.style.position = 'fixed';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none'; // Critical: never capture events
      clone.style.touchAction = 'none'; // Prevent touch interactions
      clone.style.userSelect = 'none'; // Prevent selection
      clone.style.opacity = '0.8';

      clone.removeAttribute('qti-draggable');
      clone.removeAttribute('tabindex');

      // Mark as clone to avoid confusion in element tracking
      clone.setAttribute('data-drag-clone', 'true');

      document.body.appendChild(clone);
      return clone;
    }

    private updateClonePosition(clientX: number, clientY: number): void {
      if (!this.dragState.dragClone) return;

      const { startOffset } = this.dragState;
      const x = clientX - startOffset.x;
      const y = clientY - startOffset.y;

      this.dragState.dragClone.style.left = `${x}px`;
      this.dragState.dragClone.style.top = `${y}px`;
    }

    private findClosestDropzone(clientX: number, clientY: number): HTMLElement | null {
      const activeZones = this.allDropzones.filter(zone => !zone.hasAttribute('disabled'));

      for (const zone of activeZones) {
        const rect = zone.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          return zone;
        }
      }

      return null;
    }

    private restoreInventoryItem(dragSource: HTMLElement): void {
      dragSource.style.opacity = '1.0';
      dragSource.style.display = '';
      dragSource.style.position = '';
      dragSource.style.pointerEvents = 'auto';
    }

    private dropDraggableInDroppable(draggable: HTMLElement, droppable: HTMLElement): void {
      const isDragContainer = this.trackedDragContainers.includes(droppable);
      if (isDragContainer) {
        console.warn('⚠️ [Observable DnD] Attempted to drop into drag container via dropDraggableInDroppable');
        const identifier = draggable.getAttribute('identifier');
        draggable.remove();

        if (identifier) {
          this.restoreOriginalInInventory(identifier);
        }

        this.cacheInteractiveElements();
        this.checkAllMaxAssociations();

        return;
      }

      // Remove existing item in droppable and return it to inventory
      const existing = droppable.querySelector(draggablesSelector) || droppable.querySelector('[qti-draggable="true"]');
      if (existing) {
        const existingId = existing.getAttribute('identifier');
        existing.remove();

        if (existingId) {
          this.restoreOriginalInInventory(existingId);
        }
      }

      const cleanClone = draggable.cloneNode(true) as HTMLElement;
      cleanClone.removeAttribute('style'); // Remove inline styles from the clone
      cleanClone.removeAttribute('data-keyboard-dragging'); // Remove keyboard dragging indicator
      cleanClone.setAttribute('qti-draggable', 'true');
      cleanClone.setAttribute('tabindex', '0');

      droppable.appendChild(cleanClone);

      const identifier = draggable.getAttribute('identifier');
      if (identifier) {
        this.updateInventoryBasedOnMatchMax(identifier);
      }

      this.cacheInteractiveElements();
      this.checkAllMaxAssociations();
    }

    private returnToInventory(element: HTMLElement): void {
      const identifier = element.getAttribute('identifier');
      if (identifier) {
        this.restoreOriginalInInventory(identifier);
      }
      this.cacheInteractiveElements();
      this.checkAllMaxAssociations();
    }

    private restoreOriginalInInventory(identifier: string): void {
      const inventoryItems = this.findInventoryItems(identifier);
      console.log('restoreOriginalInInventory called for identifier:', identifier, inventoryItems);
      inventoryItems.forEach(item => {
        item.style.opacity = '1.0';
        item.style.pointerEvents = 'auto';
        item.style.display = '';
        item.style.visibility = 'visible';

        item.style.setProperty('opacity', '1.0', 'important');
        item.style.setProperty('pointer-events', 'auto', 'important');
      });
    }

    private updateInventoryBasedOnMatchMax(identifier: string): void {
      const inventoryItems = this.findInventoryItems(identifier);
      const matchMax = this.getMatchMaxValue(identifier);
      const currentDraggables = this.trackedDraggables.filter(d => d.getAttribute('identifier') === identifier);

      inventoryItems.forEach(item => {
        if (matchMax !== 0 && currentDraggables.length >= matchMax) {
          item.style.opacity = '0.0';
          item.style.pointerEvents = 'none';
        } else {
          item.style.opacity = '1.0';
          item.style.pointerEvents = 'auto';
        }
      });
    }

    private findInventoryItems(identifier: string): HTMLElement[] {
      const items: HTMLElement[] = [];

      this.trackedDragContainers.forEach((container, index) => {
        let matches: Element[] = [];

        if (container.tagName.toLowerCase() === 'slot') {
          const slotElement = container as HTMLSlotElement;
          const assignedElements = slotElement.assignedElements({ flatten: true });

          console.log(`🎰 [Observable DnD] Slot ${index} assigned elements:`, {
            assignedCount: assignedElements.length,
            assigned: assignedElements.map(el => ({
              tag: el.tagName,
              id: el.getAttribute('id'),
              identifier: el.getAttribute('identifier')
            }))
          });

          matches = assignedElements.filter(el => el.getAttribute('identifier') === identifier);
        } else {
          matches = Array.from(container.querySelectorAll(`[identifier="${identifier}"]`));
        }

        items.push(...(matches as HTMLElement[]));
      });

      return items;
    }

    private getMatchMaxValue(identifier: string): number {
      const element = this.trackedDraggables.find(el => el.getAttribute('identifier') === identifier);
      if (!element) return 1;

      const matchMax = element.getAttribute('match-max');
      return matchMax ? parseInt(matchMax, 10) || 0 : 1;
    }

    private activateAllDroppables(): void {
      this.setInternalsState('--dragzone-enabled', true);
      this.setInternalsState('--dragzone-active', true);

      this.allDropzones.forEach(zone => {
        zone.setAttribute('enabled', '');
        zone.setAttribute('active', '');
      });
    }

    private deactivateAllDroppables(): void {
      this.setInternalsState('--dragzone-enabled', false);
      this.setInternalsState('--dragzone-active', false);

      this.allDropzones.forEach(zone => {
        zone.removeAttribute('enabled');
        zone.removeAttribute('active');
        zone.removeAttribute('hover');
      });
    }

    private checkAllMaxAssociations(): void {
      const totalAssociations = this.trackedDroppables.reduce((total, droppable) => {
        return total + droppable.querySelectorAll(draggablesSelector).length;
      }, 0);

      const maxReached = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;

      this.trackedDroppables.forEach(droppable => {
        const isAtCapacity = this.isDroppableAtCapacity(droppable);
        if (maxReached || isAtCapacity) {
          droppable.setAttribute('disabled', '');
        } else {
          droppable.removeAttribute('disabled');
        }
      });
    }

    private isDroppableAtCapacity(droppable: HTMLElement): boolean {
      const matchMax = parseInt(droppable.getAttribute('match-max') || '1', 10) || 1;
      if (matchMax === 0) return false;

      const current = droppable.querySelectorAll(draggablesSelector).length;
      return current >= matchMax;
    }

    private resetDragState(): void {
      if (this.dragState.activationTimeout) {
        clearTimeout(this.dragState.activationTimeout);
      }

      this.dragSubscriptions.forEach(sub => {
        try {
          if (sub && typeof sub.unsubscribe === 'function') {
            sub.unsubscribe();
          }
        } catch (error) {
          console.warn('⚠️ [Observable DnD] Error unsubscribing:', error);
        }
      });
      this.dragSubscriptions = [];

      this.dragState = {
        dragging: false,
        dragSource: null,
        dragClone: null,
        startOffset: { x: 0, y: 0 },
        currentTarget: null,
        inputType: null
      };
    }

    private setInternalsState(state: string, enabled: boolean): void {
      const internals = (this as any)._internals;
      if (!internals?.states) return;

      if (enabled) {
        internals.states.add(state);
      } else {
        internals.states.delete(state);
      }
    }

    private collectResponseData(): string[] {
      this.cacheInteractiveElements();

      return this.trackedDroppables
        .map(droppable => {
          const draggablesInDroppable = Array.from(droppable.querySelectorAll<HTMLElement>(draggablesSelector));
          const identifiers = draggablesInDroppable
            .map(element => element.getAttribute('identifier'))
            .filter((identifier): identifier is string => Boolean(identifier));
          const droppableIdentifier = droppable.getAttribute('identifier');
          return identifiers.map(id => `${id} ${droppableIdentifier}`);
        })
        .flat();
    }

    public override saveResponse(): void {
      const getResponse = (this as unknown as { getResponse?: () => unknown }).getResponse;
      const candidate = typeof getResponse === 'function' ? getResponse.call(this) : undefined;
      const responseData = Array.isArray(candidate) ? candidate : this.collectResponseData();

      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          bubbles: true,
          composed: true,
          detail: {
            responseIdentifier: (this as unknown as { responseIdentifier?: string }).responseIdentifier,
            response: responseData
          }
        })
      );

      this.requestUpdate();
    }

    override reset(save = true): void {
      this.trackedDroppables.forEach(droppable => {
        const items = Array.from(droppable.querySelectorAll(draggablesSelector));
        items.forEach(item => item.remove());
      });

      this.trackedDraggables.forEach(draggable => {
        const identifier = draggable.getAttribute('identifier');
        if (identifier) {
          this.restoreOriginalInInventory(identifier);
        }
      });

      this.resetDragState();
      this.cacheInteractiveElements();

      if (save) {
        this.saveResponse();
      }
    }

    private cleanup(): void {
      this.subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      this.subscriptions = [];

      if (this.dragState.dragClone) {
        this.dragState.dragClone.remove();
      }
      this.resetDragState();
    }
  }

  return ObservableDragDropElement as Constructor<IInteraction> & T;
};
