import { isSupported, apply } from 'observable-polyfill/fn';

import { detectCollision, findDraggableTarget } from './utils/drag-drop.utils';

import type { Interaction } from '@qti-components/base';
import type { CollisionDetectionAlgorithm } from './utils/drag-drop.utils';

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
  collisionDetectionAlgorithm: CollisionDetectionAlgorithm;
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
  initiateDrag(
    dragElement: HTMLElement,
    startX: number,
    startY: number,
    inputType: 'mouse' | 'touch',
    eventSource?: 'pointer' | 'mouse' | 'touch',
    pointerId?: number,
    startedFromTrustedEvent?: boolean
  ): void;
  createDragClone(element: HTMLElement, rect: DOMRect): HTMLElement;
  updateClonePosition(clientX: number, clientY: number): void;
  activateAllDroppables(): void;
  setupMoveObservables(inputType: 'mouse' | 'touch', eventSource?: 'pointer' | 'mouse' | 'touch'): void;
};

interface DragState {
  dragging: boolean;
  dragSource: HTMLElement | null;
  dragClone: HTMLElement | null;
  startOffset: { x: number; y: number };
  currentTarget: HTMLElement | null;
  sourceDroppable: HTMLElement | null;
  inputType: 'mouse' | 'touch' | null;
  pointerId?: number;
  startedFromTrustedEvent?: boolean;
  initialCoordinates?: { x: number; y: number };
  activationTimeout?: number;
  touchCleanup?: () => void;
  lastTargetChangeTime?: number;
}

type DragEventSource = 'pointer' | 'mouse' | 'touch';

export const DragDropCoreMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  droppablesSelector: string,
  dragContainersSelector = 'slot[part="drags"]',
  defaultCollisionAlgorithm: CollisionDetectionAlgorithm = 'pointerWithin'
) => {
  abstract class DragDropCoreElement extends superClass {
    protected trackedDraggables: HTMLElement[] = [];
    protected trackedDroppables: HTMLElement[] = [];
    protected trackedDragContainers: HTMLElement[] = [];
    protected allDropzones: HTMLElement[] = [];

    /**
     * The collision detection algorithm to use for drag and drop
     * Can be overridden by subclasses or configured per interaction type
     */
    public collisionDetectionAlgorithm: CollisionDetectionAlgorithm = defaultCollisionAlgorithm;

    protected dragState: DragState = {
      dragging: false,
      dragSource: null,
      dragClone: null,
      startOffset: { x: 0, y: 0 },
      currentTarget: null,
      sourceDroppable: null,
      inputType: null
    };

    private subscriptions: Array<{ unsubscribe: () => void }> = [];
    private dragSubscriptions: Array<{ unsubscribe: () => void }> = [];
    private lastPointerDownAt = 0;
    private lastTouchStartAt = 0;

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
          // Ignore synthetic pointerdown events generated by test helpers.
          // Storybook drag helpers dispatch synthetic mouse events, and browsers may
          // synthesize pointer compatibility events from them. Handling both pointer
          // and mouse streams can create duplicate drag starts and stale ghost clones.
          if (!e.isTrusted) {
            return false;
          }
          const target = findDraggableTarget(e, draggablesSelector);
          const hostDisabled = (this as any).disabled || (this as any).readonly;
          const targetDisabled = target?.hasAttribute('disabled') || target?.getAttribute('aria-disabled') === 'true';
          const touchHandledRecently = Date.now() - this.lastTouchStartAt < 50;
          return target && e.isPrimary !== false && e.button === 0 && !hostDisabled && !targetDisabled && !touchHandledRecently;
        })
        .subscribe((downEvent: PointerEvent) => {
          this.lastPointerDownAt = Date.now();
          const dragTarget = findDraggableTarget(downEvent, draggablesSelector);
          if (!dragTarget) {
            console.warn('⚠️ [Observable DnD] No draggable target found');
            return;
          }

          if (downEvent.pointerType === 'touch') {
            downEvent.preventDefault();
            downEvent.stopPropagation();
          }

          // Keep a small activation delay for real user input, but avoid delay/cancellation
          // machinery for synthetic events (storybook/play) to reduce flaky cross-input races.
          const delay = downEvent.isTrusted ? (downEvent.pointerType === 'touch' ? 100 : 10) : 0;
          if (this.dragState.activationTimeout) {
            clearTimeout(this.dragState.activationTimeout);
          }

          if (delay === 0) {
            if (!this.dragState.dragging) {
              this.initiateDrag(
                dragTarget,
                downEvent.clientX,
                downEvent.clientY,
                downEvent.pointerType as 'mouse' | 'touch',
                'pointer',
                downEvent.pointerId,
                downEvent.isTrusted
              );
            }
            return;
          }

          const cancelPendingActivation = () => {
            if (this.dragState.activationTimeout) {
              clearTimeout(this.dragState.activationTimeout);
              this.dragState.activationTimeout = undefined;
            }
            document.removeEventListener('pointerup', cancelPendingActivation, true);
            document.removeEventListener('pointercancel', cancelPendingActivation, true);
          };

          document.addEventListener('pointerup', cancelPendingActivation, { once: true, capture: true });
          document.addEventListener('pointercancel', cancelPendingActivation, { once: true, capture: true });

          this.dragState.activationTimeout = window.setTimeout(() => {
            this.dragState.activationTimeout = undefined;
            document.removeEventListener('pointerup', cancelPendingActivation, true);
            document.removeEventListener('pointercancel', cancelPendingActivation, true);
            if (!this.dragState.dragging) {
              this.initiateDrag(
                dragTarget,
                downEvent.clientX,
                downEvent.clientY,
                downEvent.pointerType as 'mouse' | 'touch',
                'pointer',
                downEvent.pointerId,
                downEvent.isTrusted
              );
            }
          }, delay);
        });

      const mouseDragSub = (shadowRoot as any)
        .when('mousedown')
        .filter((e: MouseEvent) => {
          const target = findDraggableTarget(e, draggablesSelector);
          const hostDisabled = (this as any).disabled || (this as any).readonly;
          const targetDisabled = target?.hasAttribute('disabled') || target?.getAttribute('aria-disabled') === 'true';
          const isLeftButton = e.button === 0;
          const pointerHandledRecently = Date.now() - this.lastPointerDownAt < 50;
          return target && isLeftButton && !hostDisabled && !targetDisabled && !pointerHandledRecently;
        })
        .subscribe((downEvent: MouseEvent) => {
          const dragTarget = findDraggableTarget(downEvent, draggablesSelector);
          if (!dragTarget || this.dragState.dragging) {
            return;
          }

          downEvent.preventDefault();

          this.initiateDrag(dragTarget, downEvent.clientX, downEvent.clientY, 'mouse', 'mouse', undefined, downEvent.isTrusted);
        });

      const touchDragSub = (shadowRoot as any)
        .when('touchstart')
        .filter((e: TouchEvent) => {
          const target = findDraggableTarget(e, draggablesSelector);
          const hostDisabled = (this as any).disabled || (this as any).readonly;
          const targetDisabled = target?.hasAttribute('disabled') || target?.getAttribute('aria-disabled') === 'true';
          const hasTouchPoint = Boolean(e.touches?.[0] || e.changedTouches?.[0]);
          const pointerHandledRecently = Date.now() - this.lastPointerDownAt < 50;
          return target && hasTouchPoint && !hostDisabled && !targetDisabled && !pointerHandledRecently;
        })
        .subscribe((startEvent: TouchEvent) => {
          const dragTarget = findDraggableTarget(startEvent, draggablesSelector);
          const touch = startEvent.touches?.[0] || startEvent.changedTouches?.[0];
          if (!dragTarget || !touch || this.dragState.dragging) {
            return;
          }

          this.lastTouchStartAt = Date.now();
          startEvent.preventDefault();
          startEvent.stopPropagation();
          this.initiateDrag(dragTarget, touch.clientX, touch.clientY, 'touch', 'touch', undefined, startEvent.isTrusted);
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
          const hostDisabled = (this as any).disabled || (this as any).readonly;
          const targetDisabled = target?.hasAttribute('disabled') || target?.getAttribute('aria-disabled') === 'true';

          if (target && ['Space', 'Enter'].includes(e.code) && !hostDisabled && !targetDisabled) {
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

      this.subscriptions.push(pointerDragSub, mouseDragSub, touchDragSub, keyboardStream);
    }

    protected initiateDrag(
      dragElement: HTMLElement,
      startX: number,
      startY: number,
      inputType: 'mouse' | 'touch',
      eventSource: DragEventSource = 'pointer',
      pointerId?: number,
      startedFromTrustedEvent?: boolean
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
      const sourceDroppable = this.trackedDroppables.find(d => d.contains(dragElement)) || null;
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
        sourceDroppable: sourceDroppable,
        inputType: inputType,
        pointerId,
        startedFromTrustedEvent,
        initialCoordinates: { x: startX, y: startY }
      };

      if (isCloneInDroppable) {
        this.dragState.dragClone?.setAttribute('data-drag-origin', 'droppable');
        dragElement.remove();
        this.cacheInteractiveElements();

        // Mark the source droppable so it won't be disabled during drag
        if (sourceDroppable) {
          sourceDroppable.setAttribute('data-drag-source', 'true');
        }
      } else {
        this.dragState.dragClone?.setAttribute('data-drag-origin', 'inventory');
        dragElement.style.opacity = '0';
        dragElement.style.pointerEvents = 'none';
      }

      this.updateClonePosition(startX, startY);
      this.activateAllDroppables();
      this.setupMoveObservables(inputType, eventSource);
    }

    protected setupMoveObservables(inputType: 'mouse' | 'touch', eventSource: DragEventSource = 'pointer'): void {
      if (inputType === 'touch') {
        if (eventSource === 'pointer') {
          try {
            const captureTarget = this.dragState.dragSource;
            const activePointerId = this.dragState.pointerId;
            if (captureTarget && activePointerId !== undefined && captureTarget.setPointerCapture) {
              captureTarget.setPointerCapture(activePointerId);
            }
          } catch (e) {
            // Ignore if pointer capture is unavailable for this event source.
          }
        }

        const preventAllTouch = (e: TouchEvent) => {
          if (e.cancelable) {
            e.preventDefault();
            // Keep propagation for synthetic touch fallback so document-level
            // observable listeners still receive touchmove/touchend.
            if (eventSource === 'pointer') {
              e.stopPropagation();
            }
          }
        };

        document.addEventListener('touchmove', preventAllTouch, { passive: false, capture: true });
        document.addEventListener('touchstart', preventAllTouch, { passive: false, capture: true });
        document.addEventListener('touchend', preventAllTouch, { passive: false, capture: true });
        document.addEventListener('gesturestart', preventAllTouch, { passive: false });
        document.addEventListener('gesturechange', preventAllTouch, { passive: false });
        document.addEventListener('gestureend', preventAllTouch, { passive: false });

        const cleanup = () => {
          document.removeEventListener('touchmove', preventAllTouch, { capture: true });
          document.removeEventListener('touchstart', preventAllTouch, { capture: true });
          document.removeEventListener('touchend', preventAllTouch, { capture: true });
          document.removeEventListener('gesturestart', preventAllTouch);
          document.removeEventListener('gesturechange', preventAllTouch);
          document.removeEventListener('gestureend', preventAllTouch);
          if (eventSource === 'pointer') {
            try {
              const captureTarget = this.dragState.dragSource;
              const activePointerId = this.dragState.pointerId;
              if (captureTarget && activePointerId !== undefined && captureTarget.releasePointerCapture) {
                captureTarget.releasePointerCapture(activePointerId);
              }
            } catch (e) {
              // Ignore errors if capture was already released
            }
          }
        };

        this.dragState.touchCleanup = cleanup;
      }

      const moveEventName = eventSource === 'mouse' ? 'mousemove' : eventSource === 'touch' ? 'touchmove' : 'pointermove';
      const upEventName = eventSource === 'mouse' ? 'mouseup' : eventSource === 'touch' ? 'touchend' : 'pointerup';
      const trustMatchesCurrentDrag = (evt: Event) => {
        const expected = this.dragState.startedFromTrustedEvent;
        return expected === undefined || evt.isTrusted === expected;
      };

      const moveSub = (document as any)
        .when(moveEventName)
        .takeUntil((document as any).when(upEventName))
        .subscribe({
          next: (e: MouseEvent | PointerEvent | TouchEvent) => {
            if (!trustMatchesCurrentDrag(e)) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();

            if (eventSource === 'touch') {
              const touch = (e as TouchEvent).touches?.[0] || (e as TouchEvent).changedTouches?.[0];
              if (!touch) return;
              this.handleDragMove(touch.clientX, touch.clientY);
              return;
            }

            // For mouse-driven drags, only react while primary button is held.
            // This prevents passive user cursor movement from interfering with
            // an active synthetic/storybook drag sequence.
            if (eventSource === 'mouse') {
              const mouseEvent = e as MouseEvent;
              if (typeof mouseEvent.buttons === 'number' && (mouseEvent.buttons & 1) !== 1) {
                return;
              }
            }

            this.handleDragMove((e as MouseEvent | PointerEvent).clientX, (e as MouseEvent | PointerEvent).clientY);
          }
        });

      const endSub = (document as any).when(upEventName).subscribe({
        next: (e: MouseEvent | PointerEvent | TouchEvent) => {
          if (!trustMatchesCurrentDrag(e)) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();

          this.handleDragEnd();
        }
      });

      const cancelSub =
        eventSource === 'touch'
          ? (document as any).when('touchcancel').subscribe({
              next: (e: Event) => {
                if (!trustMatchesCurrentDrag(e)) {
                  return;
                }
                this.handleDragEnd();
              }
            })
          : eventSource === 'mouse'
            ? null
            : (document as any).when('pointercancel').subscribe({
                next: (e: Event) => {
                  if (!trustMatchesCurrentDrag(e)) {
                    return;
                  }
                  this.handleDragEnd();
                }
              });

      const escapeSub = (document as any)
        .when('keydown')
        .filter((e: KeyboardEvent) => e.key === 'Escape')
        .subscribe({
          next: (e: KeyboardEvent) => {
            if (!trustMatchesCurrentDrag(e)) {
              return;
            }
            this.handleDragEnd();
          }
        });

      const nextSubscriptions = [moveSub, endSub, escapeSub];
      if (cancelSub) {
        nextSubscriptions.push(cancelSub);
      }
      this.dragSubscriptions.push(...nextSubscriptions);
    }

    protected handleDragMove(clientX: number, clientY: number): void {
      if (!this.dragState.dragging || !this.dragState.dragClone) return;

      this.updateClonePosition(clientX, clientY);

      const dropTarget = detectCollision(
        this.allDropzones,
        clientX,
        clientY,
        this.dragState.dragClone,
        this.collisionDetectionAlgorithm,
        this.trackedDragContainers
      );

      // Add hysteresis: only switch targets if enough time has passed (reduces flickering)
      const now = Date.now();
      const timeSinceLastChange = now - (this.dragState.lastTargetChangeTime || 0);
      const MIN_TARGET_SWITCH_INTERVAL = 50; // milliseconds

      if (dropTarget !== this.dragState.currentTarget) {
        // Allow immediate switch to null (leaving a zone) or if enough time has passed
        if (dropTarget === null || timeSinceLastChange >= MIN_TARGET_SWITCH_INTERVAL) {
          this.allDropzones.forEach(zone => zone.removeAttribute('hover'));
          if (dropTarget) {
            dropTarget.setAttribute('hover', '');
          }
          this.dragState.currentTarget = dropTarget;
          this.dragState.lastTargetChangeTime = now;
        }
      }
    }

    protected handleDragEnd(): void {
      if (!this.dragState.dragging) return;

      const { dragSource, dragClone, currentTarget, sourceDroppable } = this.dragState;
      let dropTarget = currentTarget;
      if (!dropTarget && dragClone) {
        const rect = dragClone.getBoundingClientRect();
        const probeX = this.dragState.initialCoordinates?.x ?? rect.left + rect.width / 2;
        const probeY = this.dragState.initialCoordinates?.y ?? rect.top + rect.height / 2;
        dropTarget = detectCollision(
          this.allDropzones,
          probeX,
          probeY,
          dragClone,
          this.collisionDetectionAlgorithm,
          this.trackedDragContainers
        );
      }

      // Allow dropping into the source droppable even if it's marked as disabled
      // The data-drag-source marker indicates this droppable should accept the item being returned
      const isDisabledButSource =
        dropTarget?.hasAttribute('disabled') && dropTarget.hasAttribute('data-drag-source');

      const canDrop =
        !!dragSource &&
        !!dropTarget &&
        this.allowDrop(dragSource, dropTarget) &&
        (!dropTarget.hasAttribute('disabled') || isDisabledButSource);

      if (canDrop && dragSource && dropTarget) {
        this.handleDrop(dragSource, dropTarget);
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

      // Clear the drag-source marker AFTER saveResponse to ensure it's not disabled during drop processing
      if (sourceDroppable) {
        sourceDroppable.removeAttribute('data-drag-source');
      }

      // Re-sync dropzone capacity/disabled states after removing the drag-source marker.
      this.cacheInteractiveElements();
      const syncDropzones = (this as unknown as { checkAllMaxAssociations?: () => void }).checkAllMaxAssociations;
      if (typeof syncDropzones === 'function') {
        syncDropzones.call(this);
      }
    }

    public allowDrop(_draggable: HTMLElement, droppable: HTMLElement): boolean {
      // Allow drops into both regular droppables and drag containers (inventory)
      return this.trackedDroppables.includes(droppable) || this.trackedDragContainers.includes(droppable);
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

      if (this.dragState.touchCleanup) {
        try {
          this.dragState.touchCleanup();
        } catch (error) {
          console.warn('⚠️ [Observable DnD] Error during touch cleanup:', error);
        }
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
        sourceDroppable: null,
        inputType: null,
        pointerId: undefined,
        startedFromTrustedEvent: undefined,
        touchCleanup: undefined
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
