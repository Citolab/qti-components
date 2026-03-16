// export { DragDropSlottedMixin as DragDropInteractionMixin } from './drag-drop-slotted.mixin';

export { DragDropCoreMixin } from './drag-drop-core.mixin';
export { DragDropSlottedMixin } from './drag-drop-slotted.mixin';
export { DragDropSortableMixin } from './drag-drop-sortable.mixin';
export { DragDropSlottedSortableMixin } from './drag-drop-slotted-sortable.mixin';

export type { DragDropSlotted } from './drag-drop-slotted.mixin';
export type { DragDropSlottedSortable } from './drag-drop-slotted-sortable.mixin';

export {
  VerticalListSortingStrategy,
  HorizontalListSortingStrategy,
  defaultSortingStrategy
} from './strategies/sorting.strategy';
export type { SortingStrategy, InsertPosition } from './strategies/sorting.strategy';

export {
  captureFlipState,
  captureMultipleFlipStates,
  calculateInversion,
  animateFlip,
  animateMultipleFlips,
  performFlip,
  DEFAULT_FLIP_OPTIONS
} from './utils/flip.utils';
export type { FlipState, FlipAnimationOptions } from './utils/flip.utils';

// Sortable utilities for composition
export {
  createSortableDragContext,
  resetSortableDragContext,
  createDropPlaceholder,
  placePlaceholderAtPosition,
  finalizeSortableDrop,
  cancelSortableDrag,
  reorderDOMByIdentifiers,
  collectIdentifiersInOrder,
  isElementInContainer
} from './utils/sortable.utils';
export type {
  SortableDragContext,
  PlaceholderConfig,
  PlacePlaceholderOptions,
  FinalizeSortableDropOptions
} from './utils/sortable.utils';
