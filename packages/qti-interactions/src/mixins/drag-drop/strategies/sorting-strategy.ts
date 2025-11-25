/**
 * Sorting strategies for different layouts.
 */

export type SortOrientation = 'vertical' | 'horizontal';

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

  /**
   * Determine the orientation of the sortable container
   */
  getOrientation(container: HTMLElement): SortOrientation;
}

export class VerticalListSortingStrategy implements SortingStrategy {
  getOrientation(container: HTMLElement): SortOrientation {
    const styles = getComputedStyle(container);
    const flexDir = styles.flexDirection;
    const gridFlow = styles.gridAutoFlow;

    // Check if explicitly horizontal
    if (flexDir?.startsWith('row') || gridFlow?.includes('column')) {
      return 'horizontal';
    }

    return 'vertical';
  }

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
  getOrientation(_container: HTMLElement): SortOrientation {
    return 'horizontal';
  }

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

    // Use 50% threshold
    // If pointer is in left half, place before; if in right half, place after
    const placeAfter = clampedRelative > 0.5;

    return {
      index: targetIndex,
      placeAfter
    };
  }
}

/**
 * Adaptive sorting strategy
 * Automatically detects container orientation and applies appropriate logic
 */
export class AdaptiveSortingStrategy implements SortingStrategy {
  private verticalStrategy = new VerticalListSortingStrategy();
  private horizontalStrategy = new HorizontalListSortingStrategy();

  getOrientation(container: HTMLElement): SortOrientation {
    return this.verticalStrategy.getOrientation(container);
  }

  getInsertPosition(
    elements: HTMLElement[],
    activeElement: HTMLElement,
    targetElement: HTMLElement,
    clientX: number,
    clientY: number
  ): InsertPosition | null {
    const container = elements[0]?.parentElement;
    if (!container) return null;

    const orientation = this.getOrientation(container);

    if (orientation === 'horizontal') {
      return this.horizontalStrategy.getInsertPosition(elements, activeElement, targetElement, clientX, clientY);
    } else {
      return this.verticalStrategy.getInsertPosition(elements, activeElement, targetElement, clientX, clientY);
    }
  }
}

/**
 * Default sorting strategy (adaptive)
 */
export const defaultSortingStrategy = new AdaptiveSortingStrategy();
