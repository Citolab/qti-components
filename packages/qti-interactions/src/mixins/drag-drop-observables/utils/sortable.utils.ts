/**
 * Shared utilities for sortable drag-and-drop behavior.
 * Used by both DragDropSortableMixin (standalone) and SlotSortableEnhancerMixin (composition).
 */

import { captureMultipleFlipStates, animateMultipleFlips, type FlipAnimationOptions } from './flip.utils';

import type { SortingStrategy, InsertPosition } from '../strategies/sorting.strategy';

/**
 * Configuration for drop placeholder styling
 */
export interface PlaceholderConfig {
  borderStyle?: string;
  borderColor?: string;
  background?: string;
  transitionDuration?: number;
}

const defaultPlaceholderConfig: PlaceholderConfig = {
  borderStyle: '2px dashed',
  borderColor: 'var(--qti-drop-placeholder, #c1c1c1)',
  background: 'transparent',
  transitionDuration: 150
};

/**
 * State tracking for sortable drag operations
 */
export interface SortableDragContext {
  /** The placeholder element shown during drag */
  placeholder: HTMLElement | null;
  /** Last element that was hovered over */
  lastHoverTarget: HTMLElement | null;
  /** Last calculated placement to avoid redundant DOM operations */
  lastPlacement: { target: HTMLElement; after: boolean } | null;
  /** Container where sorting is occurring */
  sortContainer: HTMLElement | null;
}

/**
 * Creates a new sortable drag context
 */
export function createSortableDragContext(): SortableDragContext {
  return {
    placeholder: null,
    lastHoverTarget: null,
    lastPlacement: null,
    sortContainer: null
  };
}

/**
 * Resets the sortable drag context, cleaning up any DOM elements
 */
export function resetSortableDragContext(context: SortableDragContext): void {
  context.placeholder?.remove();
  context.placeholder = null;
  context.lastHoverTarget = null;
  context.lastPlacement = null;
  context.sortContainer = null;
}

/**
 * Creates a placeholder element that matches the dimensions of the dragged element
 */
export function createDropPlaceholder(
  source: HTMLElement,
  rect: DOMRect,
  config: PlaceholderConfig = {}
): HTMLElement {
  const mergedConfig = { ...defaultPlaceholderConfig, ...config };
  const placeholder = document.createElement('div');

  placeholder.setAttribute('data-drop-placeholder', 'true');
  placeholder.style.width = `${rect.width}px`;
  placeholder.style.height = `${rect.height}px`;
  placeholder.style.margin = window.getComputedStyle(source).margin;
  placeholder.style.boxSizing = 'border-box';
  placeholder.style.border = `${mergedConfig.borderStyle} ${mergedConfig.borderColor}`;
  placeholder.style.borderRadius = getComputedStyle(source).borderRadius;
  placeholder.style.background = mergedConfig.background!;
  placeholder.style.transition = `transform ${mergedConfig.transitionDuration}ms ease`;
  placeholder.style.pointerEvents = 'none';

  return placeholder;
}

/**
 * Options for placeholder positioning
 */
export interface PlacePlaceholderOptions {
  /** The sortable drag context */
  context: SortableDragContext;
  /** Selector to find sortable items */
  itemSelector: string;
  /** Sorting strategy to use */
  strategy: SortingStrategy;
  /** The element being dragged (to exclude from sibling calculations) */
  dragSource: HTMLElement | null;
  /** Target element under the pointer */
  dropTarget: HTMLElement | null;
  /** Pointer X coordinate */
  clientX: number;
  /** Pointer Y coordinate */
  clientY: number;
  /** Whether to animate sibling movements */
  enableAnimations: boolean;
  /** Animation configuration */
  animationConfig?: FlipAnimationOptions;
}

/**
 * Places the placeholder at the appropriate position within the sort container.
 * Uses FLIP animations for smooth sibling transitions.
 *
 * @returns The calculated insert position, or null if placement was skipped
 */
export function placePlaceholderAtPosition(options: PlacePlaceholderOptions): InsertPosition | null {
  const {
    context,
    itemSelector,
    strategy,
    dragSource,
    dropTarget,
    clientX,
    clientY,
    enableAnimations,
    animationConfig = { duration: 150, easing: 'ease' }
  } = options;

  if (!context.placeholder || !context.sortContainer) return null;

  const target = dropTarget || context.lastHoverTarget;
  if (!target || target === dragSource) return null;

  // Ensure placeholder is in the container
  if (context.placeholder.parentElement !== context.sortContainer) {
    context.sortContainer.appendChild(context.placeholder);
  }

  // Get visible siblings (exclude placeholder and hidden elements)
  const siblings = Array.from(context.sortContainer.querySelectorAll<HTMLElement>(itemSelector)).filter(
    el => el !== context.placeholder && el.style.display !== 'none'
  );

  if (!dragSource || siblings.indexOf(target) === -1) return null;

  // Use strategy to determine insertion position
  const insertPosition = strategy.getInsertPosition(siblings, dragSource, target, clientX, clientY);
  if (!insertPosition) return null;

  const { placeAfter } = insertPosition;

  // Check if this placement is the same as the last one
  if (context.lastPlacement && context.lastPlacement.target === target && context.lastPlacement.after === placeAfter) {
    return insertPosition;
  }

  // FLIP: First - capture positions of all visible siblings before moving placeholder
  const visibleSiblings = Array.from(context.sortContainer.children).filter(
    child => child !== context.placeholder && (child as HTMLElement).style.display !== 'none'
  ) as HTMLElement[];

  const flipStates = enableAnimations ? captureMultipleFlipStates(visibleSiblings) : null;

  // Calculate the reference node for insertion
  const referenceNode = placeAfter ? target.nextElementSibling : target;

  // FLIP: Last - perform the DOM mutation
  context.sortContainer.insertBefore(context.placeholder, referenceNode);
  context.lastPlacement = { target, after: placeAfter };

  // FLIP: Invert & Play - animate siblings to their new positions
  if (flipStates && enableAnimations) {
    animateMultipleFlips(flipStates, animationConfig);
  }

  return insertPosition;
}

/**
 * Options for finalizing a sortable drop
 */
export interface FinalizeSortableDropOptions {
  /** The sortable drag context */
  context: SortableDragContext;
  /** The element being dropped */
  draggable: HTMLElement;
  /** Callback after the element is placed */
  onPlaced?: (draggable: HTMLElement, container: HTMLElement) => void;
}

/**
 * Finalizes a sortable drop by replacing the placeholder with the actual element
 */
export function finalizeSortableDrop(options: FinalizeSortableDropOptions): boolean {
  const { context, draggable, onPlaced } = options;

  if (context.placeholder?.parentElement) {
    context.placeholder.parentElement.replaceChild(draggable, context.placeholder);

    // Restore draggable styles
    draggable.style.opacity = '1.0';
    draggable.style.display = '';
    draggable.style.pointerEvents = 'auto';

    if (onPlaced && context.sortContainer) {
      onPlaced(draggable, context.sortContainer);
    }

    // Cleanup
    context.placeholder = null;
    context.lastPlacement = null;

    return true;
  }

  return false;
}

/**
 * Cancels a sortable drag, cleaning up the placeholder
 */
export function cancelSortableDrag(context: SortableDragContext, dragSource: HTMLElement | null): void {
  if (dragSource) {
    dragSource.style.opacity = '1.0';
    dragSource.style.display = '';
    dragSource.style.pointerEvents = 'auto';
  }

  resetSortableDragContext(context);
}

/**
 * Reorders DOM elements according to a list of identifiers.
 * Uses FLIP animation for smooth transitions.
 */
export function reorderDOMByIdentifiers(
  container: HTMLElement,
  draggables: HTMLElement[],
  identifiers: string[],
  enableAnimations: boolean,
  animationConfig: FlipAnimationOptions = { duration: 250, easing: 'ease' }
): void {
  if (!container) return;

  const byId = new Map(
    draggables
      .map(el => [el.getAttribute('identifier') ?? '', el] as const)
      .filter(([id]) => Boolean(id))
  );

  // FLIP: First - capture initial positions before DOM changes
  const flipStates = enableAnimations ? captureMultipleFlipStates(draggables) : null;

  // FLIP: Last - perform the DOM mutation
  identifiers.forEach(id => {
    const el = byId.get(id);
    if (el) {
      container.appendChild(el);
    }
  });

  // Append any elements not in the identifiers list at the end
  draggables
    .filter(el => {
      const id = el.getAttribute('identifier') ?? '';
      return id && !identifiers.includes(id);
    })
    .forEach(el => container.appendChild(el));

  // FLIP: Invert & Play - animate elements to their new positions
  if (flipStates && enableAnimations) {
    animateMultipleFlips(flipStates, animationConfig);
  }
}

/**
 * Collects identifiers from elements in DOM order
 */
export function collectIdentifiersInOrder(elements: HTMLElement[]): string[] {
  return elements.map(el => el.getAttribute('identifier')).filter((id): id is string => Boolean(id));
}

/**
 * Checks if an element is inside a slot/droppable container
 */
export function isElementInContainer(element: HTMLElement, containers: HTMLElement[]): HTMLElement | null {
  for (const container of containers) {
    if (container.contains(element) && container !== element) {
      return container;
    }
  }
  return null;
}
