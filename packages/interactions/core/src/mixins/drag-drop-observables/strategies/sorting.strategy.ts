/**
 * Sorting strategies for different layouts.
 */

export interface InsertPosition {
  index: number;
  placeAfter: boolean;
}

export interface SortingStrategy {
  /**
   * Calculate where to insert an item based on pointer position
   * @param elements - Array of sortable elements
   * @param activeElement - The element being dragged
   * @param targetElement - The element being hovered over
   * @param clientX - Pointer X coordinate
   * @param clientY - Pointer Y coordinate
   * @returns Insert position information
   */
  getInsertPosition(
    elements: HTMLElement[],
    activeElement: HTMLElement,
    targetElement: HTMLElement,
    clientX: number,
    clientY: number
  ): InsertPosition | null;
}

export class VerticalListSortingStrategy implements SortingStrategy {
  getInsertPosition(
    elements: HTMLElement[],
    _activeElement: HTMLElement,
    targetElement: HTMLElement,
    _clientX: number,
    clientY: number
  ): InsertPosition | null {
    const targetIndex = elements.indexOf(targetElement);
    if (targetIndex === -1) return null;

    const rect = targetElement.getBoundingClientRect();
    const relative = (clientY - rect.top) / rect.height;
    const clampedRelative = Math.min(1, Math.max(0, relative));

    // Use 50% threshold - simpler and more intuitive
    // If pointer is in top half, place before; if in bottom half, place after
    const placeAfter = clampedRelative > 0.5;

    return {
      index: targetIndex,
      placeAfter
    };
  }
}

export class HorizontalListSortingStrategy implements SortingStrategy {
  getInsertPosition(
    elements: HTMLElement[],
    _activeElement: HTMLElement,
    targetElement: HTMLElement,
    clientX: number,
    _clientY: number
  ): InsertPosition | null {
    const targetIndex = elements.indexOf(targetElement);
    if (targetIndex === -1) return null;

    const rect = targetElement.getBoundingClientRect();
    const relative = (clientX - rect.left) / rect.width;
    const clampedRelative = Math.min(1, Math.max(0, relative));

    // Check if this is the last item in the list
    const isLastItem = targetIndex === elements.length - 1;

    // For the last item, use a 33% threshold to make it easier to place items after it
    // For other items, use 50% threshold for balanced behavior
    const threshold = isLastItem ? 0.33 : 0.5;
    const placeAfter = clampedRelative > threshold;

    return {
      index: targetIndex,
      placeAfter
    };
  }
}

/**
 * Default sorting strategy (vertical)
 * Use VerticalListSortingStrategy or HorizontalListSortingStrategy explicitly
 * for better control over orientation.
 */
export const defaultSortingStrategy = new VerticalListSortingStrategy();
