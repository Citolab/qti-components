/**
 * DragDrop Slotted Sortable Mixin
 *
 * Enhances a DragDropSlotted interaction with visual sortable feedback.
 * 
 * Behavior:
 * - When dragging FROM a slot: show placeholder, items shift based on hover position
 * - When dragging FROM inventory: fully handled by slotted mixin (no sortable behavior)
 * - Items swap to make room when hovering over occupied slots
 * - Drop logic delegated to slotted mixin
 */

import {
  createSortableDragContext,
  resetSortableDragContext,
  createDropPlaceholder,
  isElementInContainer,
  type SortableDragContext,
  type PlaceholderConfig
} from './utils/sortable.utils';
import { captureMultipleFlipStates, animateMultipleFlips, type FlipAnimationOptions } from './utils/flip.utils';
import { detectCollision, type CollisionDetectionAlgorithm } from './utils/collision.utils';

import type { DragDropSlotted } from './drag-drop-slotted.mixin';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type DragDropSlottedSortable = DragDropSlotted & {
  /** Whether sortable reordering is enabled */
  allowReorder: boolean;
  /** Whether the current drag originated from a slot */
  readonly isDraggingFromSlot: boolean;
  /** Configuration for sortable placeholders */
  sortablePlaceholderConfig: PlaceholderConfig;
};

/**
 * Shift state for tracking which items have been visually shifted
 */
interface ShiftState {
  /** The slot currently being hovered */
  hoveredSlot: HTMLElement | null;
  /** Original positions before any shifts: item -> originalSlot */
  originalPositions: Map<HTMLElement, HTMLElement>;
}

/**
 * Enhances a DragDropSlotted mixin with visual sortable feedback.
 *
 * For QTI Order interaction with match-max=1 per slot:
 * - Shows placeholder in source slot during drag
 * - Items visually swap when hovering over occupied slots
 * - Delegates all drop handling to parent slotted mixin
 *
 * @param superClass - A class that has been mixed with DragDropSlottedMixin
 * @param sortableItemSelector - Selector for sortable items
 */
export const DragDropSlottedSortableMixin = <T extends Constructor<DragDropSlotted>>(
  superClass: T,
  sortableItemSelector = '[qti-draggable="true"]'
) => {
  abstract class DragDropSlottedSortableElement extends superClass {
    /** Source slot when dragging from within a slot */
    #sourceSlot: HTMLElement | null = null;

    /** Sortable drag context for placeholder management */
    #sortableContext: SortableDragContext = createSortableDragContext();

    /** Visual shift state */
    #shiftState: ShiftState = {
      hoveredSlot: null,
      originalPositions: new Map()
    };
    /** Tracks slots temporarily re-enabled during reorder drags */
    #temporarilyEnabledSlots = new Set<HTMLElement>();

    /** Whether reordering within slots is enabled */
    public allowReorder = true;

    /** Placeholder styling configuration */
    public sortablePlaceholderConfig: PlaceholderConfig = {};

    /** Animation configuration for sortable operations */
    public sortableAnimationConfig: FlipAnimationOptions = {
      duration: 150,
      easing: 'ease'
    };

    /** Whether the current drag originated from a slot */
    get isDraggingFromSlot(): boolean {
      return this.#sourceSlot !== null;
    }

    /**
     * Determines if an element is inside a tracked droppable (slot).
     * Returns the containing droppable, or null if in inventory.
     */
    protected findContainingDroppable(element: HTMLElement): HTMLElement | null {
      return isElementInContainer(element, this.trackedDroppables);
    }

    /**
     * Get the item in a slot (if any)
     */
    #getItemInSlot(slot: HTMLElement): HTMLElement | null {
      return slot.querySelector(sortableItemSelector) as HTMLElement | null;
    }

    /**
     * Reset shift state
     */
    #resetShiftState(): void {
      this.#shiftState = {
        hoveredSlot: null,
        originalPositions: new Map()
      };
    }

    /**
     * Perform visual swap when hovering over an occupied slot
     * The item in the target slot moves to the source slot (swap preview)
     */
    #performVisualSwap(targetSlot: HTMLElement): void {
      if (!this.#sourceSlot || targetSlot === this.#sourceSlot) {
        // Hovering over source slot - revert any swaps
        this.#revertVisualSwaps();
        return;
      }

      // If already hovering this slot, no need to re-swap
      if (this.#shiftState.hoveredSlot === targetSlot) {
        return;
      }

      // Revert previous swaps first
      this.#revertVisualSwaps();

      const targetItem = this.#getItemInSlot(targetSlot);
      if (!targetItem) {
        // Target slot is empty, just move placeholder there
        if (this.#sortableContext.placeholder) {
          targetSlot.appendChild(this.#sortableContext.placeholder);
        }
        this.#shiftState.hoveredSlot = targetSlot;
        return;
      }

      // Capture FLIP state before swap
      const itemsToAnimate = [targetItem];
      const flipStates = captureMultipleFlipStates(itemsToAnimate);

      // Store original position
      this.#shiftState.originalPositions.set(targetItem, targetSlot);
      
      // Move target item to source slot (swap visualization)
      // First remove placeholder from source to make room
      if (this.#sortableContext.placeholder && this.#sortableContext.placeholder.parentElement) {
        this.#sortableContext.placeholder.remove();
      }
      
      // Move item to source slot
      this.#sourceSlot.appendChild(targetItem);
      
      // Put placeholder in target slot
      if (this.#sortableContext.placeholder) {
        targetSlot.appendChild(this.#sortableContext.placeholder);
      }

      this.#shiftState.hoveredSlot = targetSlot;

      // Animate the swap
      animateMultipleFlips(flipStates, this.sortableAnimationConfig);
    }

    /**
     * Revert all visual swaps back to original positions
     */
    #revertVisualSwaps(): void {
      if (this.#shiftState.originalPositions.size === 0 && this.#shiftState.hoveredSlot === null) {
        return;
      }

      // Capture FLIP state before reverting
      const itemsToAnimate = Array.from(this.#shiftState.originalPositions.keys());
      const flipStates = itemsToAnimate.length > 0 ? captureMultipleFlipStates(itemsToAnimate) : null;

      // Move items back to original positions
      for (const [item, originalSlot] of this.#shiftState.originalPositions) {
        originalSlot.appendChild(item);
      }

      // Move placeholder back to source slot
      if (this.#sortableContext.placeholder && this.#sourceSlot) {
        this.#sourceSlot.appendChild(this.#sortableContext.placeholder);
      }

      // Animate the revert
      if (flipStates) {
        animateMultipleFlips(flipStates, this.sortableAnimationConfig);
      }

      this.#shiftState.originalPositions.clear();
      this.#shiftState.hoveredSlot = null;
    }

    /**
     * Override initiateDrag to set up placeholder for slot-originated drags.
     */
    public override initiateDrag(
      dragElement: HTMLElement,
      startX: number,
      startY: number,
      inputType: 'mouse' | 'touch',
      ...rest: [eventSource?: 'pointer' | 'mouse' | 'touch']
    ): void {
      // Reset sortable state
      this.#sourceSlot = null;
      this.#sortableContext = createSortableDragContext();
      this.#resetShiftState();

      // Check if the drag originates from within a droppable slot
      const containingDroppable = this.findContainingDroppable(dragElement);

      if (containingDroppable && this.allowReorder) {
        // This drag started from within a slot
        this.#sourceSlot = containingDroppable;
        this.#sortableContext.sortContainer = containingDroppable;
        
        // Create placeholder with same dimensions as dragged element
        const rect = dragElement.getBoundingClientRect();
        this.#sortableContext.placeholder = createDropPlaceholder(
          dragElement,
          rect,
          this.sortablePlaceholderConfig
        );
        
        // Insert placeholder in the source slot immediately
        // The parent's initiateDrag will remove the actual element
        containingDroppable.appendChild(this.#sortableContext.placeholder);

        // While reordering from a slot, temporarily enable other slots so drag end can drop onto them.
        this.trackedDroppables.forEach(slot => {
          if (slot !== containingDroppable && slot.hasAttribute('disabled')) {
            slot.removeAttribute('disabled');
            this.#temporarilyEnabledSlots.add(slot);
          }
        });
      }

      // CRITICAL: Always call parent - handles all drag mechanics
      const [eventSource] = rest;
      (super.initiateDrag as any)(dragElement, startX, startY, inputType, eventSource);
    }

    /**
     * Clean up sortable-specific state.
     */
    protected cleanupSortableState(revertSwaps = true): void {
      if (revertSwaps) {
        // Revert any visual swaps (without animation for instant cleanup)
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

    /**
     * Process drag move for sortable behavior.
     * Called from the drag move observable.
     */
    public onSortableDragMove(clientX: number, clientY: number): void {
      // Only do sortable logic when dragging from a slot
      if (!this.isDraggingFromSlot) return;

      // Use collision detection to find hovered target
      const dropTarget = detectCollision(
        this.trackedDroppables,
        clientX,
        clientY,
        this.dragState.dragClone,
        this.collisionDetectionAlgorithm
      );

      // Only process if hovering over a droppable slot (not inventory)
      if (dropTarget) {
        this.#performVisualSwap(dropTarget);
      } else {
        // Hovering over inventory or outside - revert swaps
        this.#revertVisualSwaps();
      }
    }

    /**
     * Extend base drag move with sortable hover/swap behavior for slot-originated drags.
     */
    protected handleDragMove(clientX: number, clientY: number): void {
      const baseProto = Object.getPrototypeOf(DragDropSlottedSortableElement.prototype) as {
        handleDragMove?: (x: number, y: number) => void;
      };
      baseProto.handleDragMove?.call(this, clientX, clientY);
      this.onSortableDragMove(clientX, clientY);
    }

    /**
     * Allow reordering from slot to slot even when slots are marked disabled due to max rules.
     */
    public override allowDrop(draggable: HTMLElement, droppable: HTMLElement): boolean {
      if (this.isDraggingFromSlot && this.trackedDroppables.includes(droppable)) {
        return true;
      }
      return super.allowDrop(draggable, droppable);
    }

    /**
     * Override handleDrop to clean up sortable state after drop.
     */
    public override handleDrop(draggable: HTMLElement, droppable: HTMLElement): void {
      super.handleDrop(draggable, droppable);
      // Parent has committed DOM placement; keep swap result and just clear placeholder/state.
      this.cleanupSortableState(false);
    }

    /**
     * Override handleInvalidDrop to clean up sortable state.
     */
    public override handleInvalidDrop(dragSource: HTMLElement | null): void {
      this.cleanupSortableState();
      super.handleInvalidDrop(dragSource);
    }
  }

  return DragDropSlottedSortableElement as Constructor<DragDropSlottedSortable> & T;
};

export type { PlaceholderConfig };
