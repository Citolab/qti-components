import {
  createSortableDragContext,
  resetSortableDragContext,
  createDropPlaceholder,
  isElementInContainer,
  type SortableDragContext,
  type PlaceholderConfig
} from './utils/sortable.utils';
import { captureMultipleFlipStates, animateMultipleFlips, type FlipAnimationOptions } from './utils/flip.utils';
import { detectCollision } from './utils/collision.utils';

import type { DragDropSlotted } from './drag-drop-slotted.mixin';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type DragDropSlottedSortable = DragDropSlotted & {
  allowReorder: boolean;
  readonly isDraggingFromSlot: boolean;
  sortablePlaceholderConfig: PlaceholderConfig;
};

interface ShiftState {
  hoveredSlot: HTMLElement | null;
  originalPositions: Map<HTMLElement, HTMLElement>;
}

export const DragDropSlottedSortableMixin = <T extends Constructor<DragDropSlotted>>(
  superClass: T,
  sortableItemSelector = '[qti-draggable="true"]'
) => {
  abstract class DragDropSlottedSortableElement extends superClass {
    #sourceSlot: HTMLElement | null = null;
    #sortableContext: SortableDragContext = createSortableDragContext();
    #shiftState: ShiftState = {
      hoveredSlot: null,
      originalPositions: new Map()
    };
    #temporarilyEnabledSlots = new Set<HTMLElement>();

    public allowReorder = true;
    public sortablePlaceholderConfig: PlaceholderConfig = {};
    public sortableAnimationConfig: FlipAnimationOptions = {
      duration: 150,
      easing: 'ease'
    };

    get isDraggingFromSlot(): boolean {
      return this.#sourceSlot !== null;
    }

    protected findContainingDroppable(element: HTMLElement): HTMLElement | null {
      return isElementInContainer(element, this.trackedDroppables);
    }

    #getItemInSlot(slot: HTMLElement): HTMLElement | null {
      return slot.querySelector(sortableItemSelector) as HTMLElement | null;
    }

    #slotAllowsMultiple(slot: HTMLElement): boolean {
      const matchMax = this.#getSlotMatchMax(slot);
      return matchMax === 0 || matchMax > 1;
    }

    #getSlotMatchMax(slot: HTMLElement): number {
      const parsedMatchMax = parseInt(slot.getAttribute('match-max') || '1', 10);
      return Number.isNaN(parsedMatchMax) ? 1 : parsedMatchMax;
    }

    #getSlotItemCount(slot: HTMLElement): number {
      return slot.querySelectorAll(sortableItemSelector).length;
    }

    #isSlotAtCapacity(slot: HTMLElement): boolean {
      const matchMax = this.#getSlotMatchMax(slot);
      if (matchMax === 0) return false;
      return this.#getSlotItemCount(slot) >= matchMax;
    }

    #resetShiftState(): void {
      this.#shiftState = {
        hoveredSlot: null,
        originalPositions: new Map()
      };
    }

    #performVisualSwap(targetSlot: HTMLElement): void {
      if (!this.#sourceSlot || targetSlot === this.#sourceSlot) {
        this.#revertVisualSwaps();
        return;
      }

      if (this.#shiftState.hoveredSlot === targetSlot) {
        return;
      }

      this.#revertVisualSwaps();

      const targetItem = this.#getItemInSlot(targetSlot);
      if (!targetItem) {
        if (this.#sortableContext.placeholder) {
          targetSlot.appendChild(this.#sortableContext.placeholder);
        }
        this.#shiftState.hoveredSlot = targetSlot;
        return;
      }

      // For multi-capacity slots we preview append semantics, not swap semantics.
      if (this.#slotAllowsMultiple(targetSlot)) {
        if (this.#isSlotAtCapacity(targetSlot)) {
          if (this.#sortableContext.placeholder && this.#sourceSlot) {
            this.#sourceSlot.appendChild(this.#sortableContext.placeholder);
          }
          this.#shiftState.hoveredSlot = null;
          return;
        }
        if (this.#sortableContext.placeholder) {
          targetSlot.appendChild(this.#sortableContext.placeholder);
        }
        this.#shiftState.hoveredSlot = targetSlot;
        return;
      }

      const itemsToAnimate = [targetItem];
      const flipStates = captureMultipleFlipStates(itemsToAnimate);

      this.#shiftState.originalPositions.set(targetItem, targetSlot);

      if (this.#sortableContext.placeholder && this.#sortableContext.placeholder.parentElement) {
        this.#sortableContext.placeholder.remove();
      }

      this.#sourceSlot.appendChild(targetItem);

      if (this.#sortableContext.placeholder) {
        targetSlot.appendChild(this.#sortableContext.placeholder);
      }

      this.#shiftState.hoveredSlot = targetSlot;

      animateMultipleFlips(flipStates, this.sortableAnimationConfig);
    }

    #revertVisualSwaps(): void {
      if (this.#shiftState.originalPositions.size === 0 && this.#shiftState.hoveredSlot === null) {
        return;
      }

      const itemsToAnimate = Array.from(this.#shiftState.originalPositions.keys());
      const flipStates = itemsToAnimate.length > 0 ? captureMultipleFlipStates(itemsToAnimate) : null;

      for (const [item, originalSlot] of this.#shiftState.originalPositions) {
        originalSlot.appendChild(item);
      }

      if (this.#sortableContext.placeholder && this.#sourceSlot) {
        this.#sourceSlot.appendChild(this.#sortableContext.placeholder);
      }

      if (flipStates) {
        animateMultipleFlips(flipStates, this.sortableAnimationConfig);
      }

      this.#shiftState.originalPositions.clear();
      this.#shiftState.hoveredSlot = null;
    }

    public override initiateDrag(
      dragElement: HTMLElement,
      startX: number,
      startY: number,
      inputType: 'mouse' | 'touch',
      ...rest: [eventSource?: 'pointer' | 'mouse' | 'touch']
    ): void {
      this.#sourceSlot = null;
      this.#sortableContext = createSortableDragContext();
      this.#resetShiftState();

      const containingDroppable = this.findContainingDroppable(dragElement);

      if (containingDroppable && this.allowReorder) {
        this.#sourceSlot = containingDroppable;
        this.#sortableContext.sortContainer = containingDroppable;

        const rect = dragElement.getBoundingClientRect();
        this.#sortableContext.placeholder = createDropPlaceholder(
          dragElement,
          rect,
          this.sortablePlaceholderConfig
        );
        // Copy the slot attribute from the dragged element so the placeholder
        // renders in the same named slot (e.g. slot="drags" in qti-gap), preserving
        // the droppable's dimensions when the drag element is removed.
        // Use visibility:hidden instead of display:none so it occupies space but
        // remains invisible, preventing inline layout shift of surrounding text.
        const slotAttr = dragElement.getAttribute('slot');
        if (slotAttr) {
          this.#sortableContext.placeholder.setAttribute('slot', slotAttr);
        }
        this.#sortableContext.placeholder.style.visibility = 'hidden';

        containingDroppable.appendChild(this.#sortableContext.placeholder);

        // Temporarily enable peer slots so slot-origin drags can still land on max-gated targets.
        this.trackedDroppables.forEach(slot => {
          if (slot !== containingDroppable && slot.hasAttribute('disabled')) {
            if (this.#slotAllowsMultiple(slot) && this.#isSlotAtCapacity(slot)) {
              return;
            }
            slot.removeAttribute('disabled');
            this.#temporarilyEnabledSlots.add(slot);
          }
        });
      }

      const [eventSource] = rest;
      (super.initiateDrag as any)(dragElement, startX, startY, inputType, eventSource);
    }

    protected cleanupSortableState(revertSwaps = true): void {
      if (revertSwaps) {
        for (const [item, originalSlot] of this.#shiftState.originalPositions) {
          originalSlot.appendChild(item);
        }
      }

      if (this.#sortableContext.placeholder) {
        this.#sortableContext.placeholder.remove();
      }

      resetSortableDragContext(this.#sortableContext);
      this.#temporarilyEnabledSlots.clear();
      this.#sourceSlot = null;
      this.#resetShiftState();
    }

    public onSortableDragMove(clientX: number, clientY: number): void {
      if (!this.isDraggingFromSlot) return;

      const dropTarget = detectCollision(
        this.trackedDroppables,
        clientX,
        clientY,
        this.dragState.dragClone,
        this.collisionDetectionAlgorithm
      );

      if (dropTarget) {
        this.#performVisualSwap(dropTarget);
      } else {
        this.#revertVisualSwaps();
      }
    }

    protected handleDragMove(clientX: number, clientY: number): void {
      const baseProto = Object.getPrototypeOf(DragDropSlottedSortableElement.prototype) as {
        handleDragMove?: (x: number, y: number) => void;
      };
      baseProto.handleDragMove?.call(this, clientX, clientY);
      this.onSortableDragMove(clientX, clientY);
    }

    public override allowDrop(draggable: HTMLElement, droppable: HTMLElement): boolean {
      if (this.isDraggingFromSlot && this.trackedDroppables.includes(droppable)) {
        if (!this.#slotAllowsMultiple(droppable)) {
          return true;
        }
        return !this.#isSlotAtCapacity(droppable);
      }
      if (this.isDraggingFromSlot && this.trackedDragContainers.includes(droppable)) {
        return true;
      }
      return super.allowDrop(draggable, droppable);
    }

    public override handleDrop(draggable: HTMLElement, droppable: HTMLElement): void {
      super.handleDrop(draggable, droppable);
      this.cleanupSortableState(false);
    }

    public override handleInvalidDrop(dragSource: HTMLElement | null): void {
      this.cleanupSortableState();
      super.handleInvalidDrop(dragSource);
    }
  }

  return DragDropSlottedSortableElement as Constructor<DragDropSlottedSortable> & T;
};

export type { PlaceholderConfig };
