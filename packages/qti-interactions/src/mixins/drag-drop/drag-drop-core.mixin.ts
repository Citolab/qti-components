import { isSupported, apply } from 'observable-polyfill/fn';

import { findClosestDropzone, findDraggableTarget } from './utils/drag-drop.utils';

import type { Interaction } from '@qti-components/base';

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

export type DragDropCore = Interaction & {
  trackedDraggables: HTMLElement[];
  trackedDroppables: HTMLElement[];
  trackedDragContainers: HTMLElement[];
  allDropzones: HTMLElement[];
  dragState: DragState;
  get response(): string | string[] | null;
  set response(value: string | string[] | null);
  saveResponse(value?: string | string[]): void;
  validate(): boolean;
  reportValidity(): boolean;
  cacheInteractiveElements(): void;
  resetDragState(): void;
  afterCache(): void;
  allowDrop(draggable: HTMLElement, droppable: HTMLElement): boolean;
  handleDrop(draggable: HTMLElement, droppable: HTMLElement): void;
  handleInvalidDrop(dragSource: HTMLElement | null): void;
  initiateDrag(dragElement: HTMLElement, startX: number, startY: number, inputType: 'mouse' | 'touch'): void;
  createDragClone(element: HTMLElement, rect: DOMRect): HTMLElement;
  updateClonePosition(clientX: number, clientY: number): void;
  activateAllDroppables(): void;
  setupMoveObservables(inputType: 'mouse' | 'touch'): void;
};

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

export const DragDropCoreMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  droppablesSelector: string,
  dragContainersSelector = 'slot[part="drags"]'
) => {
  abstract class DragDropCoreElement extends superClass {
    protected trackedDraggables: HTMLElement[] = [];
    protected trackedDroppables: HTMLElement[] = [];
    protected trackedDragContainers: HTMLElement[] = [];
    protected allDropzones: HTMLElement[] = [];

    protected dragState: DragState = {
      dragging: false,
      dragSource: null,
      dragClone: null,
      startOffset: { x: 0, y: 0 },
      currentTarget: null,
      inputType: null
    };

    private subscriptions: Array<{ unsubscribe: () => void }> = [];
    private dragSubscriptions: Array<{ unsubscribe: () => void }> = [];

    abstract saveResponse(value?: string | string[]): void;

    override connectedCallback(): void {
      super.connectedCallback();
      patchWindow(this.ownerDocument?.defaultView);
      this.setupDragDrop();
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this.cleanup();
    }

    protected async setupDragDrop(): Promise<void> {
      await this.updateComplete;

      this.cacheInteractiveElements();
      this.afterCache();
      this.setupDragObservables();
    }

    public afterCache(): void {
      // Extension hook
    }

    public cacheInteractiveElements(): void {
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

    protected setupDragObservables(): void {
      const shadowRoot = this.shadowRoot;
      if (!shadowRoot) {
        console.error('❌ [Observable DnD] No shadow root found!');
        return;
      }

      const pointerDragSub = (shadowRoot as any)
        .when('pointerdown')
        .filter((e: PointerEvent) => {
          const target = findDraggableTarget(e, draggablesSelector);
          return target && e.isPrimary !== false && e.button === 0;
        })
        .subscribe((downEvent: PointerEvent) => {
          const dragTarget = findDraggableTarget(downEvent, draggablesSelector);
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

      let keyboardState = {
        dragging: false,
        dragElement: null as HTMLElement | null,
        dragIndex: 0,
        dropIndex: 0,
        dropElement: null as HTMLElement | null
      };

      const keyboardStream = (shadowRoot as any).when('keydown').subscribe((e: KeyboardEvent) => {
        const draggables = this.trackedDraggables.filter(d => d.style.opacity !== '0');
        const dropTargets = [...this.trackedDroppables, ...this.trackedDragContainers];

        // Start drag
        if (!keyboardState.dragging) {
          const target = findDraggableTarget(e, draggablesSelector);
          if (target && ['Space', 'Enter'].includes(e.code)) {
            e.preventDefault();
            target.setAttribute('data-keyboard-dragging', 'true');
            keyboardState = {
              dragging: true,
              dragElement: target,
              dragIndex: draggables.indexOf(target),
              dropIndex: 0,
              dropElement: dropTargets[0]
            };
          }
        } else {
          // Navigation and drop/cancel
          switch (e.code) {
            case 'ArrowRight':
            case 'ArrowDown': {
              e.preventDefault();
              const nextDropIndex = (keyboardState.dropIndex + 1) % dropTargets.length;
              keyboardState = { ...keyboardState, dropIndex: nextDropIndex, dropElement: dropTargets[nextDropIndex] };
              break;
            }
            case 'ArrowLeft':
            case 'ArrowUp': {
              e.preventDefault();
              const prevDropIndex = (keyboardState.dropIndex - 1 + dropTargets.length) % dropTargets.length;
              keyboardState = { ...keyboardState, dropIndex: prevDropIndex, dropElement: dropTargets[prevDropIndex] };
              break;
            }
            case 'Space':
            case 'Enter':
            case 'Tab': {
              e.preventDefault();
              if (keyboardState.dragElement && keyboardState.dropElement) {
                const canDrop =
                  this.allowDrop(keyboardState.dragElement, keyboardState.dropElement) ||
                  this.trackedDragContainers.includes(keyboardState.dropElement);

                if (canDrop) {
                  this.handleDrop(keyboardState.dragElement, keyboardState.dropElement);
                } else {
                  this.handleInvalidDrop(keyboardState.dragElement);
                }
              }
              this.trackedDraggables.forEach(d => d.removeAttribute('data-keyboard-dragging'));
              this.saveResponse();
              keyboardState = {
                dragging: false,
                dragElement: null,
                dragIndex: 0,
                dropIndex: 0,
                dropElement: null
              };
              break;
            }
            case 'Escape': {
              e.preventDefault();
              this.trackedDraggables.forEach(d => d.removeAttribute('data-keyboard-dragging'));
              keyboardState = {
                dragging: false,
                dragElement: null,
                dragIndex: 0,
                dropIndex: 0,
                dropElement: null
              };
              break;
            }
          }
        }

        this.allDropzones.forEach(zone => zone.removeAttribute('hover'));
        if (keyboardState.dragging && keyboardState.dropElement) {
          keyboardState.dropElement.setAttribute('hover', '');
          if (
            keyboardState.dropElement.hasAttribute('tabindex') &&
            keyboardState.dropElement.getAttribute('tabindex') !== '-1'
          ) {
            keyboardState.dropElement.focus();
          }
        }
      });

      this.subscriptions.push(pointerDragSub, keyboardStream);
    }

    protected initiateDrag(
      dragElement: HTMLElement,
      startX: number,
      startY: number,
      inputType: 'mouse' | 'touch'
    ): void {
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
        dragSource: dragElement,
        dragClone: this.createDragClone(dragElement, rect),
        startOffset: {
          x: startX - rect.left,
          y: startY - rect.top
        },
        currentTarget: null,
        inputType: inputType
      };

      if (isCloneInDroppable) {
        dragElement.remove();
        this.cacheInteractiveElements();
      } else {
        dragElement.style.opacity = '0';
        dragElement.style.pointerEvents = 'none';
      }

      this.updateClonePosition(startX, startY);
      this.activateAllDroppables();
      this.setupMoveObservables(inputType);
    }

    protected setupMoveObservables(inputType: 'mouse' | 'touch'): void {
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

    protected handleDragMove(clientX: number, clientY: number): void {
      if (!this.dragState.dragging || !this.dragState.dragClone) return;

      this.updateClonePosition(clientX, clientY);

      const dropTarget = findClosestDropzone(this.allDropzones, clientX, clientY);

      if (dropTarget !== this.dragState.currentTarget) {
        this.allDropzones.forEach(zone => zone.removeAttribute('hover'));
        if (dropTarget) {
          dropTarget.setAttribute('hover', '');
        }
        this.dragState.currentTarget = dropTarget;
      }
    }

    protected handleDragEnd(): void {
      if (!this.dragState.dragging) return;

      const { dragSource, dragClone, currentTarget } = this.dragState;

      const canDrop =
        !!dragSource &&
        !!currentTarget &&
        this.allowDrop(dragSource, currentTarget) &&
        !currentTarget.hasAttribute('disabled');

      if (canDrop && dragSource && currentTarget) {
        this.handleDrop(dragSource, currentTarget);
      } else {
        this.handleInvalidDrop(dragSource);
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

    public allowDrop(_draggable: HTMLElement, droppable: HTMLElement): boolean {
      return this.trackedDroppables.includes(droppable);
    }

    public abstract handleDrop(draggable: HTMLElement, droppable: HTMLElement): void;

    public handleInvalidDrop(dragSource: HTMLElement | null): void {
      if (dragSource) {
        dragSource.style.opacity = '1.0';
        dragSource.style.pointerEvents = 'auto';
      }
    }

    protected createDragClone(element: HTMLElement, rect: DOMRect): HTMLElement {
      const clone = element.cloneNode(true) as HTMLElement;

      const computedStyles = window.getComputedStyle(element);
      for (let i = 0; i < computedStyles.length; i++) {
        const property = computedStyles[i];
        clone.style.setProperty(property, computedStyles.getPropertyValue(property));
      }

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
      clone.setAttribute('data-drag-clone', 'true');

      document.body.appendChild(clone);
      return clone;
    }

    protected updateClonePosition(clientX: number, clientY: number): void {
      if (!this.dragState.dragClone) return;

      const { startOffset } = this.dragState;
      const x = clientX - startOffset.x;
      const y = clientY - startOffset.y;

      this.dragState.dragClone.style.left = `${x}px`;
      this.dragState.dragClone.style.top = `${y}px`;
    }

    protected activateAllDroppables(): void {
      this.setInternalsState('--dragzone-enabled', true);
      this.setInternalsState('--dragzone-active', true);

      this.allDropzones.forEach(zone => {
        zone.setAttribute('enabled', '');
        zone.setAttribute('active', '');
      });
    }

    protected deactivateAllDroppables(): void {
      this.setInternalsState('--dragzone-enabled', false);
      this.setInternalsState('--dragzone-active', false);

      this.allDropzones.forEach(zone => {
        zone.removeAttribute('enabled');
        zone.removeAttribute('active');
        zone.removeAttribute('hover');
      });
    }

    public resetDragState(): void {
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

    protected setInternalsState(state: string, enabled: boolean): void {
      const internals = (this as any)._internals;
      if (!internals?.states) return;

      if (enabled) {
        internals.states.add(state);
      } else {
        internals.states.delete(state);
      }
    }

    protected cleanup(): void {
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

  return DragDropCoreElement as unknown as Constructor<DragDropCore> & T;
};
