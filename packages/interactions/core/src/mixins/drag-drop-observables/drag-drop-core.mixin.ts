import { isSupported, apply } from 'observable-polyfill/fn';

import { interactionContext, setState } from '@qti-components/base';

import {
  clearDragChipStates,
  detectCollision,
  findDraggableTarget,
  findInventoryItems,
  isDragChipHidden,
  isDraggableDisabled,
  setDragChipState,
  setDropFlag,
  setDropFull
} from './utils/drag-drop.utils';
import {
  IDENTITY_FIXED_FRAME,
  measureFixedFrame,
  resolveDragCloneHost,
  toFrameCoordinates
} from './utils/drag-clone-host';

import type { Interaction } from '@qti-components/base';
import type { CollisionDetectionAlgorithm } from './utils/drag-drop.utils';
import type { DragCloneHost, FixedFrame } from './utils/drag-clone-host';

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
  isDragDropEnabled(): boolean;
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
  removeChipFromDroppable(droppable: HTMLElement | null, chip: HTMLElement): void;
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
  activateAllDroppables(fromDroppable?: boolean): void;
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
  returnAnchorItems?: HTMLElement[];
  /** Last pointer position, so the clone can be repositioned after it is re-hosted mid-drag. */
  lastCoordinates?: { x: number; y: number };
}

type DragEventSource = 'pointer' | 'mouse' | 'touch';

type StatefulElement = HTMLElement & { internals: ElementInternals };

const hasStates = (el: HTMLElement): el is StatefulElement =>
  !!(el as { internals?: ElementInternals }).internals?.states;

export const DragDropCoreMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  droppablesSelector: string,
  dragContainersSelector = 'slot[part~="bank"]',
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
      inputType: null,
      returnAnchorItems: []
    };

    /** Coordinate space of the current clone's host; identity while nothing above it scales. */
    private cloneFrame: FixedFrame = IDENTITY_FIXED_FRAME;

    /** The current clone's own `zoom`, e.g. a graphic-gap-match chip scaled with its graphic. */
    /** The page's own cursor, put back when a pointer drag ends. */
    private cursorBeforeDrag: string | null = null;
    private cloneZoom = 1;

    private subscriptions: Array<{ unsubscribe: () => void }> = [];
    private dragSubscriptions: Array<{ unsubscribe: () => void }> = [];
    private lastPointerDownAt = 0;
    private lastTouchStartAt = 0;
    #statefulRoleElements = new Set<StatefulElement>();

    abstract saveResponse(value?: string | string[]): void;

    /**
     * Whether drag-and-drop is live for this interaction. `qti-match-interaction` turns it off
     * in tabular mode, where the choices are a radio/checkbox grid rather than chips.
     */
    public isDragDropEnabled(): boolean {
      return true;
    }

    /**
     * Publish how a chip recognises itself. Draggability is positional in match-interaction —
     * the same tag is a source in one match-set and a drop target in the other — so each element
     * tests itself against this selector rather than being told.
     */
    protected publishDraggablesSelector(): void {
      const selector = this.isDragDropEnabled() ? draggablesSelector : null;
      if (this._interactionContext.draggablesSelector !== selector) {
        this._interactionContext = { ...this._interactionContext, draggablesSelector: selector };
      }
    }

    override connectedCallback(): void {
      super.connectedCallback();
      // Capture phase: @lit/context's provider stops the event in the bubble phase.
      this.addEventListener('context-request', this.#onContextRequest, { capture: true });
      patchWindow(this.ownerDocument?.defaultView);
      this.publishDraggablesSelector();
      this.setupDragDrop();
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this.removeEventListener('context-request', this.#onContextRequest, { capture: true });
      this.#contextConsumers.clear();
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

    /**
     * Detach a chip from the target holding it.
     *
     * Default: the chip is a DOM child of the target, so removing the node is enough. A target that
     * renders its own chips from `dragDropContext` overrides this — see `DragDropSlottedMixin`.
     */
    public removeChipFromDroppable(_droppable: HTMLElement | null, chip: HTMLElement): void {
      chip.remove();
    }

    /**
     * Every element that has asked this interaction for `interactionContext`.
     *
     * A chip announces itself: `ContextConsumer` dispatches `context-request` with
     * `bubbles: true, composed: true`, so the event crosses shadow boundaries that
     * `querySelectorAll` cannot. That is what makes a chip rendered *inside a drop target's shadow
     * root* discoverable at all — `this.querySelectorAll(draggablesSelector)` stops at the
     * boundary, and so does `droppable.contains(chip)`.
     *
     * Two details of @lit/context decide the shape of this:
     *
     *   - the provider calls `stopPropagation()` once it satisfies a request, so this listener has
     *     to run in the **capture** phase to see the event at all;
     *   - `event.target` is retargeted to the shadow host and is useless here. The event carries
     *     `contextTarget`, the real requester, which is what the provider itself reads.
     *
     * There is no counterpart "consumer disconnected" event — @lit/context unsubscribes through a
     * closure — so entries are pruned lazily by `isConnected`.
     */
    #contextConsumers = new Set<HTMLElement>();

    #onContextRequest = (event: Event): void => {
      const request = event as Event & { context?: unknown; contextTarget?: Element };
      if (request.context !== interactionContext) return;
      const consumer = request.contextTarget;
      if (consumer instanceof HTMLElement) this.#contextConsumers.add(consumer);
    };

    /** Registered consumers matching `selector`, minus the ones that have since left the DOM. */
    protected registeredMatching(selector: string): HTMLElement[] {
      for (const el of this.#contextConsumers) {
        if (!el.isConnected) this.#contextConsumers.delete(el);
      }
      return [...this.#contextConsumers].filter(el => el.matches(selector));
    }

    public cacheInteractiveElements(): void {
      const collect = (selector: string, scope: ParentNode | ShadowRoot | null | undefined) =>
        Array.from(scope?.querySelectorAll<HTMLElement>(selector) ?? []);

      const lightDraggables = collect(draggablesSelector, this);
      const shadowDraggables = collect(draggablesSelector, this.shadowRoot);

      const lightClones = collect('[data-draggable="true"]:not([data-drag-clone])', this);
      const shadowClones = collect('[data-draggable="true"]:not([data-drag-clone])', this.shadowRoot);

      // The registry finds chips a query cannot reach — one shadow root deeper, inside a drop
      // target that renders its own contents. It is a union, not a replacement: an element that
      // never consumed the context (qti-gap-img has no ActiveElementMixin) is still found by query.
      const registeredDraggables = this.registeredMatching(draggablesSelector);

      this.trackedDraggables = Array.from(
        new Set([...lightDraggables, ...shadowDraggables, ...lightClones, ...shadowClones, ...registeredDraggables])
      );

      const lightDroppables = collect(droppablesSelector, this);
      const shadowDroppables = collect(droppablesSelector, this.shadowRoot);
      this.trackedDroppables = Array.from(new Set([...lightDroppables, ...shadowDroppables]));

      const lightDragContainers = collect(dragContainersSelector, this);
      const shadowDragContainers = collect(dragContainersSelector, this.shadowRoot);

      this.trackedDragContainers = Array.from(new Set([...lightDragContainers, ...shadowDragContainers]));

      this.allDropzones = [...this.trackedDroppables, ...this.trackedDragContainers];

      const dragDropEnabled = this.isDragDropEnabled();

      const draggableSet = new Set(this.trackedDraggables);
      const droppableSet = new Set(this.trackedDroppables);
      /*
       * The `chip` role state is NOT filtered by isDragChipHidden.
       *
       * `chip` is a noun: it says what an element *is*, not what is happening to it. One that has
       * been lifted or used is still a chip, and has to keep saying so — the theme draws its box
       * from `:state(chip)` and only repaints it from `:state(used)` / `:state(lifted)`. Filter
       * the role and those stop
       * composing: the base rule stops matching the moment it is placed, the box collapses, and the
       * bank reflows around a hole 20px narrower than the thing that left it.
       *
       * Measured in drag-drop.invariance.spec.ts, "a spent drag keeps its footprint". Restore the
       * filter and those five assertions fail.
       *
       * Pickability is the separate question, and still filtered: isDragChipHidden is consulted
       * directly at the drag-start and keyboard-navigation sites below, and a spent drag still loses
       * `data-draggable` and its tabindex.
       */
      const dragRoleSet = dragDropEnabled ? draggableSet : new Set<HTMLElement>();
      const effectiveDroppableSet = dragDropEnabled ? droppableSet : new Set<HTMLElement>();
      const currentStateful = new Set<StatefulElement>([...draggableSet, ...droppableSet].filter(hasStates));

      // Clear stale drag/drop role states from elements that are no longer tracked.
      for (const el of this.#statefulRoleElements) {
        if (currentStateful.has(el)) continue;
        setState(el.internals.states, 'chip', false);
        setState(el.internals.states, 'drop', false);
      }

      /*
       * Drag-drop ownership of the drag/droppable role states.
       *
       * `droppable` is the drop-side twin of `data-draggable`, and it is the ONLY marker. Three of
       * the five drop targets are light-DOM elements authored in the item body (`qti-gap`,
       * `qti-associable-hotspot`, `qti-simple-associable-choice`), so no part can name them — a part
       * only exists inside the shadow tree that declares it — and a stylesheet needs some way to say
       * "this element is a drop target, whichever interaction it belongs to".
       *
       * It used to be said twice: this state, spelled `drop`, plus a `qti-droppable="true"`
       * attribute stamped on `trackedDroppables` just below. Two spellings meant every drop-side
       * rule was written twice, and they did not even agree — the attribute reached elements this
       * loop skips (see the two notes below). The attribute is gone; a host that cannot write
       * attributes uses the state, which is what the editor already did. ElementInternals states are
       * invisible to a mutation observer, which is why that host can use it: ProseMirror reverts any
       * attribute outside its schema, and the revert re-triggers the observer that wrote it.
       *
       * Two consequences of the state being the survivor, both deliberate:
       *
       *   - `currentStateful` is filtered by `hasStates`, so order's and associate's shadow
       *     `<div part="drop">` get nothing — `attachInternals()` throws on a plain div. Those two
       *     are reachable as `::part(drop)` from their own interaction, which is the hook they
       *     actually use; the attribute on them was never read by anything.
       *   - `isDrop` is `!isDrag && …`, so an element that is somehow both is a drag only. The
       *     attribute was unconditional. No shipped interaction has an element in both sets.
       *
       * Gated on `isDragDropEnabled()` through `effectiveDroppableSet`: match-interaction's tabular
       * mode is a radio grid, and its `qti-simple-associable-choice` elements are row and column
       * headers, not drop targets. They must not reserve a dropzone's worth of space.
       */
      for (const el of currentStateful) {
        const isDrag = dragRoleSet.has(el);
        const isDrop = !isDrag && effectiveDroppableSet.has(el);
        setState(el.internals.states, 'chip', isDrag);
        setState(el.internals.states, 'drop', isDrop);
      }

      this.#statefulRoleElements = currentStateful;

      this.trackedDraggables.forEach(draggable => {
        const draggableHidden = isDragChipHidden(draggable);
        const canStartDrag = dragDropEnabled && !draggableHidden;

        if (canStartDrag) {
          draggable.style.cursor = 'grab';
          draggable.style.userSelect = 'none';
          draggable.style.touchAction = 'none'; // Prevent ALL default touch behaviors
          draggable.style.webkitUserSelect = 'none'; // Safari compatibility
          (draggable.style as any).webkitTouchCallout = 'none'; // Prevent iOS callout
          draggable.setAttribute('data-draggable', 'true');
          draggable.setAttribute('tabindex', '0');
        } else {
          draggable.style.cursor = '';
          draggable.style.userSelect = '';
          draggable.style.touchAction = '';
          draggable.style.webkitUserSelect = '';
          (draggable.style as any).webkitTouchCallout = '';
          draggable.removeAttribute('data-draggable');
          if (draggable.getAttribute('tabindex') === '0') {
            draggable.removeAttribute('tabindex');
          }
        }
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
          // Refuse drag starts from chips that currently leave a hole in the bank.
          const targetDisabled = isDraggableDisabled(target) || isDragChipHidden(target);
          const touchHandledRecently = Date.now() - this.lastTouchStartAt < 50;
          return (
            target &&
            e.isPrimary !== false &&
            e.button === 0 &&
            !hostDisabled &&
            !targetDisabled &&
            !touchHandledRecently
          );
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
          // Refuse drag starts from chips that currently leave a hole in the bank.
          const targetDisabled = isDraggableDisabled(target) || isDragChipHidden(target);
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

          this.initiateDrag(
            dragTarget,
            downEvent.clientX,
            downEvent.clientY,
            'mouse',
            'mouse',
            undefined,
            downEvent.isTrusted
          );
        });

      const touchDragSub = (shadowRoot as any)
        .when('touchstart')
        .filter((e: TouchEvent) => {
          const target = findDraggableTarget(e, draggablesSelector);
          const hostDisabled = (this as any).disabled || (this as any).readonly;
          // Refuse drag starts from chips that currently leave a hole in the bank.
          const targetDisabled = isDraggableDisabled(target) || isDragChipHidden(target);
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
          this.initiateDrag(
            dragTarget,
            touch.clientX,
            touch.clientY,
            'touch',
            'touch',
            undefined,
            startEvent.isTrusted
          );
        });

      let keyboardState = {
        dragging: false,
        dragElement: null as HTMLElement | null,
        dragIndex: 0,
        dropIndex: 0,
        dropElement: null as HTMLElement | null
      };

      const keyboardStream = (shadowRoot as any).when('keydown').subscribe((e: KeyboardEvent) => {
        // Skip chips that currently leave a hole in the bank — dragging, or already placed.
        const draggables = this.trackedDraggables.filter(d => !isDragChipHidden(d));
        const dropTargets = [...this.trackedDroppables, ...this.trackedDragContainers];

        // Start drag
        if (!keyboardState.dragging) {
          const target = findDraggableTarget(e, draggablesSelector);
          const hostDisabled = (this as any).disabled || (this as any).readonly;
          // Refuse drag starts from chips that currently leave a hole in the bank.
          const targetDisabled = isDraggableDisabled(target) || isDragChipHidden(target);

          if (target && ['Space', 'Enter'].includes(e.code) && !hostDisabled && !targetDisabled) {
            e.preventDefault();
            target.setAttribute('data-keyboard-dragging', 'true');
            // Same states as a pointer drag (CONTRACT.md §3 rule 8): the chip is lifted, the host
            // and the targets are drag-active, and the candidate target is drag-over.
            setDragChipState(target, 'lifted', true);
            this.activateAllDroppables(
              this.trackedDroppables.some(d => d.contains(target) || !!d.shadowRoot?.contains(target))
            );
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
              this.endKeyboardDrag();
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
              this.endKeyboardDrag();
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

        this.allDropzones.forEach(zone => setDropFlag(zone, 'drag-over', false));
        if (keyboardState.dragging && keyboardState.dropElement) {
          setDropFlag(keyboardState.dropElement, 'drag-over', true);
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

      // `Node.contains` does not cross a shadow boundary, and a chip rendered by a drop target
      // lives in that target's shadow root. Ask both trees.
      const holds = (d: HTMLElement) => d.contains(dragElement) || !!d.shadowRoot?.contains(dragElement);
      const isCloneInDroppable = this.trackedDroppables.some(holds);
      const sourceDroppable = this.trackedDroppables.find(holds) || null;

      // A chip grabbed while it is still flying home has a transform on it, and
      // `getBoundingClientRect` reports the transformed box, not the layout box. The drag would
      // then start from wherever the animation happened to be, `createDragClone` would copy the
      // half-applied transform into the clone, and the drop would resolve against a rect that is
      // still moving. Land it first: `cancel()` drops the fill and the chip snaps to where it
      // really lives.
      dragElement.getAnimations().forEach(animation => animation.cancel());

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
        initialCoordinates: { x: startX, y: startY },
        returnAnchorItems: []
      };

      if (isCloneInDroppable) {
        this.dragState.dragClone?.setAttribute('data-drag-origin', 'droppable');
        // A chip a target renders from data cannot be `remove()`d — the node would come straight
        // back on the next render. The target has to be told to stop holding it.
        this.removeChipFromDroppable(sourceDroppable, dragElement);
        this.cacheInteractiveElements();
        // The chip has left, so the target is no longer at capacity: `full` goes, and with it the
        // theme's not-allowed cursor over the spot the chip was lifted from. The drop recomputes it.
        setDropFull(sourceDroppable, false);

        // Mark the source droppable so it won't be disabled during drag
        if (sourceDroppable) {
          sourceDroppable.setAttribute('data-drag-source', 'true');
        }

        // Mark the exact source placeholder(s) this chip would return to on invalid drop.
        const identifier = dragElement.getAttribute('identifier');
        if (identifier) {
          const anchors = findInventoryItems(this.trackedDragContainers, identifier);
          anchors.forEach(item => setDragChipState(item, 'return-target', true));
          this.dragState.returnAnchorItems = anchors;
        }
      } else {
        this.dragState.dragClone?.setAttribute('data-drag-origin', 'inventory');
        // The clone is already made, so it does not inherit this state. CSS hides the source.
        setDragChipState(dragElement, 'lifted', true);
      }

      this.updateClonePosition(startX, startY);
      this.activateAllDroppables(isCloneInDroppable);
      this.watchDragCloneHost();
      // The clone is transparent to the pointer (`pointer-events: none`, so targets see the pointer),
      // which means the cursor is whatever lies under it: a pointer over a target, an arrow over
      // the page. A grabbed chip keeps a grabbing hand for the whole drag; restored when it ends.
      if (eventSource === 'pointer') {
        const root = this.ownerDocument.documentElement;
        this.cursorBeforeDrag = root.style.cursor;
        root.style.cursor = 'grabbing';
      }
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

      const moveEventName =
        eventSource === 'mouse' ? 'mousemove' : eventSource === 'touch' ? 'touchmove' : 'pointermove';
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

      // Hysteresis, so the `hover` outline does not flicker between adjacent zones. It governs
      // only what is highlighted; `handleDragEnd` resolves the drop from where the chip actually
      // comes to rest, never from this latched value.
      const now = Date.now();
      const timeSinceLastChange = now - (this.dragState.lastTargetChangeTime || 0);
      const MIN_TARGET_SWITCH_INTERVAL = 50; // milliseconds

      if (dropTarget !== this.dragState.currentTarget) {
        // Allow immediate switch to null (leaving a zone) or if enough time has passed
        if (dropTarget === null || timeSinceLastChange >= MIN_TARGET_SWITCH_INTERVAL) {
          this.allDropzones.forEach(zone => setDropFlag(zone, 'drag-over', false));
          if (dropTarget) {
            setDropFlag(dropTarget, 'drag-over', true);
          }
          this.dragState.currentTarget = dropTarget;
          this.dragState.lastTargetChangeTime = now;
        }
      }
    }

    protected handleDragEnd(): void {
      if (!this.dragState.dragging) return;

      const { dragSource, dragClone, currentTarget, sourceDroppable } = this.dragState;

      // Resolve the drop from where the chip came to rest.
      //
      // `currentTarget` is the hover highlight, and handleDragMove latches it for
      // MIN_TARGET_SWITCH_INTERVAL to keep that highlight from flickering. Dropping into it made
      // the latch decide the outcome: a flick whose every move falls inside one 50ms window keeps
      // the first zone its path happened to cross, however far away the chip was released.
      //
      // The fallback it replaces was worse in a quieter way — it probed from
      // `initialCoordinates`, which is where the drag *started*, so a drag that never produced a
      // move event resolved against the chip's original position in the bank.
      let dropTarget = currentTarget;
      if (dragClone) {
        const rect = dragClone.getBoundingClientRect();
        const resolved = detectCollision(
          this.allDropzones,
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          dragClone,
          this.collisionDetectionAlgorithm,
          this.trackedDragContainers
        );
        // Null means the chip rests over nothing. Keep the hovered zone then, so releasing a hair
        // outside a zone still drops into it.
        dropTarget = resolved ?? currentTarget;
      }

      // `allowDrop` already decides `disabled` — including the cases that override it: returning to
      // the droppable a chip came from, and swapping into a full one. Re-testing the attribute here
      // vetoed a drop that had just been allowed.
      const canDrop = !!dragSource && !!dropTarget && this.allowDrop(dragSource, dropTarget);

      if (canDrop && dragSource && dropTarget) {
        this.handleDrop(dragSource, dropTarget);
        // The clone has landed, so the source is no longer mid-drag. `handleDrop` has already
        // decided whether it becomes a `placeholder`; only the transient state is cleared here.
        // (`handleInvalidDrop` clears both.) This used to be implicit: the inventory refresh
        // reset `style.opacity = '1.0'`, undoing the mid-drag hiding as a side effect.
        setDragChipState(dragSource, 'lifted', false);
      } else {
        this.handleInvalidDrop(dragSource);
      }

      if (dragClone) {
        dragClone.remove();
      }

      (this.dragState.returnAnchorItems || []).forEach(item => {
        setDragChipState(item, 'return-target', false);
      });

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
      clearDragChipStates(dragSource);
    }

    protected createDragClone(element: HTMLElement, rect: DOMRect): HTMLElement {
      const clone = element.cloneNode(true) as HTMLElement;

      const computedStyles = window.getComputedStyle(element);
      for (let i = 0; i < computedStyles.length; i++) {
        const property = computedStyles[i];
        clone.style.setProperty(property, computedStyles.getPropertyValue(property));
      }
      // The chip's resting shadow would be copied inline with the rest and outrank the theme, which
      // gives a chip in flight its own elevation (`[data-drag-clone]`, --qti-drag-elevation).
      clone.style.removeProperty('box-shadow');

      // Where the clone can live: the interaction's root while the browser paints it, the
      // fullscreen element when it does not. See utils/drag-clone-host.ts for why each is needed —
      // the root carries the theme, the fullscreen element carries the paint — and why the tree the
      // chip was dragged out of is never a candidate.
      //
      // `this.getRootNode()`, deliberately, not `element.getRootNode()`. A bank chip's root is the
      // item's shadow root either way, but a PLACED chip being re-dragged lives in its gap's or its
      // hotspot's own shadow root, and cloning it there would append the clone inside the very
      // element it is being dragged out of. The interaction's root is the same node for both.
      const host = resolveDragCloneHost(element.isConnected ? element : this, this.dragCloneRoot());
      this.cloneZoom = parseFloat(computedStyles.zoom) || 1;
      this.cloneFrame = measureFixedFrame(host, this.cloneZoom);

      clone.style.position = 'fixed';
      // `rect` is in viewport pixels; the host may lay its fixed children out in a scaled space.
      clone.style.width = `${rect.width / this.cloneFrame.scale.x}px`;
      clone.style.height = `${rect.height / this.cloneFrame.scale.y}px`;
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none'; // Critical: never capture events
      clone.style.touchAction = 'none'; // Prevent touch interactions
      clone.style.userSelect = 'none'; // Prevent selection

      clone.removeAttribute('data-draggable');
      clone.removeAttribute('tabindex');
      clone.setAttribute('data-drag-clone', 'true');
      // Which interaction this chip came from, for theme rules that need to tell one in flight from
      // another (graphic-gap-match chips take no card styling). An attribute rather than an ancestor
      // selector because the clone is a sibling of the interaction, not a descendant.
      clone.setAttribute('data-drag-interaction', this.tagName.toLowerCase());

      host.appendChild(clone);
      return clone;
    }

    /**
     * The interaction's own tree, and the clone's preferred home.
     *
     * A stylesheet can only see its own tree. item-container adopts item.css into its shadow root
     * (item-container.ts), so a clone parked on document.body sat in a tree the theme could not
     * reach: every `[data-drag-clone]` rule was inert, and the chip's grip — a ::before, and so the
     * one thing a computed-style copy cannot carry — went missing the moment you picked a chip up.
     * Measured: with the theme in a shadow root, a body clone reports `content: none` for its grip
     * while the chip it was cloned from reports the glyph. It only ever looked right in Storybook,
     * whose preview.ts also injects item.css at document level.
     *
     * Null when that tree is the document, which leaves the choice of `document.body` to the
     * resolver: a document-level clone gains nothing from being hosted anywhere in particular.
     */
    private dragCloneRoot(): DragCloneHost | null {
      const root = this.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }

    protected updateClonePosition(clientX: number, clientY: number): void {
      this.dragState.lastCoordinates = { x: clientX, y: clientY };

      if (!this.dragState.dragClone) return;

      // `startOffset` is in viewport pixels, so the target position is resolved there and only then
      // converted into the host's space.
      const { startOffset } = this.dragState;
      const { x, y } = toFrameCoordinates(this.cloneFrame, clientX - startOffset.x, clientY - startOffset.y);

      this.dragState.dragClone.style.left = `${x}px`;
      this.dragState.dragClone.style.top = `${y}px`;
    }

    /**
     * Keeps the clone in a host the browser still paints when the page enters or leaves fullscreen
     * mid-drag — otherwise it is stranded in a container that is no longer rendered. Re-parenting
     * reconnects the clone's custom elements, which is why it only happens on an actual change.
     */
    private watchDragCloneHost(): void {
      const ownerDocument = this.ownerDocument ?? document;

      const rehost = () => {
        const { dragClone, dragSource, lastCoordinates } = this.dragState;
        if (!dragClone) return;

        const anchor = dragSource?.isConnected ? dragSource : this;
        const host = resolveDragCloneHost(anchor, this.dragCloneRoot());
        if (host === dragClone.parentNode) return;

        host.appendChild(dragClone);
        this.cloneFrame = measureFixedFrame(host, this.cloneZoom);
        if (lastCoordinates) {
          this.updateClonePosition(lastCoordinates.x, lastCoordinates.y);
        }
      };

      ownerDocument.addEventListener('fullscreenchange', rehost);
      ownerDocument.addEventListener('webkitfullscreenchange', rehost);

      this.dragSubscriptions.push({
        unsubscribe: () => {
          ownerDocument.removeEventListener('fullscreenchange', rehost);
          ownerDocument.removeEventListener('webkitfullscreenchange', rehost);
        }
      });
    }

    /**
     * A drag is in progress: the host and every target carry `drag-active` (CONTRACT.md §3). The
     * bank carries it only when the chip comes from a target: then the bank can take it back, and
     * lights up as a place to drop. A chip lifted out of the bank itself gives the bank nothing to
     * say. The host's old pair `dragzone-enabled` + `dragzone-active` is set alongside for one major.
     */
    protected activateAllDroppables(fromDroppable = false): void {
      this.setDragActive(true);
      this.allDropzones.forEach(zone => {
        const isBank = this.trackedDragContainers.includes(zone);
        setDropFlag(zone, 'drag-active', fromDroppable || !isBank);
      });
    }

    protected deactivateAllDroppables(): void {
      this.setDragActive(false);
      this.allDropzones.forEach(zone => {
        setDropFlag(zone, 'drag-active', false);
        setDropFlag(zone, 'drag-over', false);
      });
    }

    /** The keyboard drag is over, dropped or cancelled: clear what the pick-up set. */
    private endKeyboardDrag(): void {
      this.trackedDraggables.forEach(d => {
        if (d.hasAttribute('data-keyboard-dragging')) setDragChipState(d, 'lifted', false);
        d.removeAttribute('data-keyboard-dragging');
      });
      this.deactivateAllDroppables();
    }

    private setDragActive(on: boolean): void {
      setState((this as any)._internals?.states, 'drag-active', on, ['dragzone-active', 'dragzone-enabled']);
    }

    public resetDragState(): void {
      if (this.dragState.activationTimeout) {
        clearTimeout(this.dragState.activationTimeout);
      }

      (this.dragState.returnAnchorItems || []).forEach(item => {
        setDragChipState(item, 'return-target', false);
      });

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
      this.cloneFrame = IDENTITY_FIXED_FRAME;
      this.cloneZoom = 1;
      if (this.cursorBeforeDrag !== null) {
        this.ownerDocument.documentElement.style.cursor = this.cursorBeforeDrag;
        this.cursorBeforeDrag = null;
      }

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
        touchCleanup: undefined,
        returnAnchorItems: []
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

      for (const el of this.#statefulRoleElements) {
        if (!hasStates(el)) continue;
        setState(el.internals.states, 'chip', false);
        setState(el.internals.states, 'drop', false);
      }
      this.#statefulRoleElements.clear();

      this.resetDragState();
    }
  }

  return DragDropCoreElement as unknown as Constructor<DragDropCore> & T;
};
