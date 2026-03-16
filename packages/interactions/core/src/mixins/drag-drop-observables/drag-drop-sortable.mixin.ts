import { DragDropCoreMixin } from './drag-drop-core.mixin';
import { defaultSortingStrategy } from './strategies/sorting.strategy';
import { type FlipAnimationOptions } from './utils/flip.utils';
import {
  createSortableDragContext,
  resetSortableDragContext,
  createDropPlaceholder,
  placePlaceholderAtPosition,
  finalizeSortableDrop,
  cancelSortableDrag,
  reorderDOMByIdentifiers,
  collectIdentifiersInOrder,
  type SortableDragContext
} from './utils/sortable.utils';

import type { DragDropCore } from './drag-drop-core.mixin';
import type { Interaction } from '@qti-components/base';
import type { SortingStrategy } from './strategies/sorting.strategy';
import type { CollisionDetectionAlgorithm } from './utils/drag-drop.utils';

type Constructor<T = {}> = abstract new (...args: any[]) => T;
type DragEventSource = 'pointer' | 'mouse' | 'touch';

/**
 * Drag/drop mixin that keeps a single list of sortable draggables.
 * Draggables are treated as both the draggable items and the drop targets.
 * A response is the ordered list of `identifier` attributes for all draggables.
 */
export const DragDropSortableMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  dragContainersSelector = 'slot[part="drags"]',
  sortingStrategy: SortingStrategy = defaultSortingStrategy,
  collisionAlgorithm: CollisionDetectionAlgorithm = 'closestCenter'
) => {
  // Use 'closestCenter' by default for sortable lists as recommended by dnd-kit
  const Core = DragDropCoreMixin(
    superClass,
    draggablesSelector,
    draggablesSelector,
    dragContainersSelector,
    collisionAlgorithm
  );

  abstract class DragDropSortableElement extends Core {
    protected _response: string[] = [];
    protected _initialOrder: string[] = [];
    protected sortableContainer: HTMLElement | null = null;
    protected sortableContext: SortableDragContext = createSortableDragContext();
    protected strategy: SortingStrategy = sortingStrategy;

    // FLIP animation configuration
    public flipAnimationConfig: FlipAnimationOptions = {
      duration: 250,
      easing: 'ease'
    };
    public enableFlipAnimations = true;

    public get response(): string | string[] | null {
      return [...this._response];
    }

    public set response(value: string | string[] | null) {
      const next = Array.isArray(value) ? [...value] : value ? [value] : [];
      this._response = next;
      this._internals.setFormValue(JSON.stringify(this._response));

      this.reorderDOMByIdentifiersLocal(next);
      this.cacheInteractiveElements();
    }

    /**
     * Reorder DOM elements to match a given array of identifiers.
     * Uses FLIP animation technique for smooth transitions.
     *
     * @param identifiers - Ordered array of identifier strings
     * @param animate - Whether to animate the reordering (default: true)
     */
    protected reorderDOMByIdentifiersLocal(identifiers: string[], animate = true): void {
      const container =
        this.sortableContainer ??
        this.trackedDraggables[0]?.parentElement ??
        this.trackedDragContainers[0] ??
        (this as unknown as HTMLElement);

      if (!container) return;

      reorderDOMByIdentifiers(
        container,
        this.trackedDraggables,
        identifiers,
        animate && this.enableFlipAnimations,
        this.flipAnimationConfig
      );
    }

    public override afterCache(): void {
      this.sortableContainer =
        this.trackedDraggables[0]?.parentElement ?? this.trackedDragContainers[0] ?? (this as unknown as HTMLElement);

      // Also set the container in the sortable context
      this.sortableContext.sortContainer = this.sortableContainer;

      if (this._initialOrder.length === 0) {
        this._initialOrder = this.collectResponse();
      }
    }

    public override initiateDrag(
      dragElement: HTMLElement,
      startX: number,
      startY: number,
      inputType: 'mouse' | 'touch',
      eventSource: DragEventSource = 'pointer'
    ): void {
      if (this.dragState.dragging) {
        console.warn('⚠️ [Observable DnD] Already dragging, ignoring initiateDrag');
        return;
      }
      if (dragElement.hasAttribute('data-drag-clone')) {
        console.warn('⚠️ [Observable DnD] Attempted to drag visual clone, ignoring');
        return;
      }

      const rect = dragElement.getBoundingClientRect();

      // Initialize sortable context
      this.sortableContext = createSortableDragContext();
      this.sortableContext.sortContainer = this.sortableContainer;
      this.sortableContext.placeholder = createDropPlaceholder(dragElement, rect);

      const container =
        this.sortableContainer ??
        this.trackedDraggables[0]?.parentElement ??
        this.trackedDragContainers[0] ??
        dragElement.parentElement;

      if (this.sortableContext.placeholder && container) {
        // Insert the placeholder immediately so the layout doesn't collapse before movement
        container.insertBefore(this.sortableContext.placeholder, dragElement);
      }

      this.dragState = {
        dragging: true,
        dragSource: dragElement,
        dragClone: this.createDragClone(dragElement, rect),
        startOffset: {
          x: startX - rect.left,
          y: startY - rect.top
        },
        currentTarget: null,
        sourceDroppable: null,
        inputType: inputType
      };

      dragElement.style.display = 'none';
      dragElement.style.pointerEvents = 'none';

      this.updateClonePosition(startX, startY);
      this.activateAllDroppables();
      this.setupMoveObservables(inputType, eventSource);
    }

    /**
     * Place the placeholder element at the appropriate position.
     * Uses the sorting strategy to calculate insertion position.
     * Applies FLIP animations to siblings when they move.
     */
    protected placePlaceholder(dropTarget: HTMLElement | null, clientX: number, clientY: number): void {
      placePlaceholderAtPosition({
        context: this.sortableContext,
        itemSelector: draggablesSelector,
        strategy: this.strategy,
        dragSource: this.dragState.dragSource,
        dropTarget,
        clientX,
        clientY,
        enableAnimations: this.enableFlipAnimations,
        animationConfig: { duration: 150, easing: 'ease' }
      });
    }

    protected handleDragMove(clientX: number, clientY: number): void {
      const baseProto = Object.getPrototypeOf(DragDropSortableElement.prototype) as {
        handleDragMove?: (x: number, y: number) => void;
      };
      baseProto.handleDragMove?.call(this, clientX, clientY);
      if (this.dragState.currentTarget && this.dragState.currentTarget !== this.sortableContext.placeholder) {
        this.sortableContext.lastHoverTarget = this.dragState.currentTarget;
      }
      this.placePlaceholder(this.dragState.currentTarget ?? this.sortableContext.lastHoverTarget, clientX, clientY);
    }

    public override allowDrop(_draggable: HTMLElement, droppable: HTMLElement): boolean {
      return this.trackedDraggables.includes(droppable) || this.trackedDragContainers.includes(droppable);
    }

    public override handleDrop(draggable: HTMLElement, droppable: HTMLElement): void {
      const placed = finalizeSortableDrop({
        context: this.sortableContext,
        draggable,
        onPlaced: () => {
          this.cacheInteractiveElements();
        }
      });

      if (!placed) {
        // For keyboard navigation, insert relative to the droppable target
        const container = this.sortableContainer ?? draggable.parentElement;
        if (container) {
          // If droppable is one of the draggables, insert after it
          if (this.trackedDraggables.includes(droppable) && droppable !== draggable) {
            const nextSibling = droppable.nextElementSibling;
            container.insertBefore(draggable, nextSibling);
          } else {
            // Otherwise append to container
            container.appendChild(draggable);
          }
        }
        draggable.style.opacity = '1.0';
        draggable.style.display = '';
        draggable.style.pointerEvents = 'auto';
      }

      this.cacheInteractiveElements();
    }

    public override handleInvalidDrop(dragSource: HTMLElement | null): void {
      cancelSortableDrag(this.sortableContext, dragSource);
    }

    protected collectResponse(): string[] {
      return collectIdentifiersInOrder(this.trackedDraggables);
    }

    public override saveResponse(): void;
    public override saveResponse(value: string | string[]): void;
    public override saveResponse(value?: string | string[]): void {
      const responseData = Array.isArray(value) ? value : typeof value === 'string' ? [value] : this.collectResponse();

      this._response = [...responseData];
      this._internals.setFormValue(JSON.stringify(this._response));

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

    public override reset(): void;
    public override reset(save: boolean): void;
    public override reset(save = true): void {
      if (this._initialOrder.length > 0) {
        this.response = [...this._initialOrder];
      }

      this.resetDragState();
      resetSortableDragContext(this.sortableContext);
      this.cacheInteractiveElements();

      if (save) {
        this.saveResponse();
      }
    }

    public override validate(): boolean {
      this._internals.setValidity({});
      return true;
    }

    public override reportValidity(): boolean {
      return this._internals.reportValidity();
    }
  }

  return DragDropSortableElement as unknown as Constructor<DragDropCore> & T;
};
