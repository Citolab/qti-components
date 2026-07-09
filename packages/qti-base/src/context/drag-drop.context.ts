import { createContext } from '@lit/context';

/**
 * What each drop target currently holds, published by the drag-drop interaction.
 *
 * Today this is *derived* from the DOM in one place (`DragDropSlottedMixin`), replacing nine
 * separate `querySelectorAll` readbacks scattered across capacity checks, association counts and
 * response serialisation. It is the seam for the next step: once drop targets render their own
 * chips from this context, the map becomes authoritative and the DOM becomes derived from it.
 *
 * Provided by the `qti-*-interaction`, never by `qti-assessment-item` — interactions must work
 * standalone. Consumers read `this.ctx?.dragsByTarget?.[id] ?? []`.
 *
 * Reassign, never mutate: an in-place change does not notify consumers.
 */
export interface DragDropState {
  /**
   * Target identifier → the drag identifiers it holds, in DOM order.
   * Matched with the interaction's `draggablesSelector`, which is what the response is built from.
   */
  readonly dragsByTarget: Readonly<Record<string, readonly string[]>>;

  /**
   * Target identifier → how many chips it holds for capacity purposes.
   *
   * Deliberately *not* `dragsByTarget[id].length`. Capacity counts
   * `max(draggablesSelector matches, [qti-draggable] matches)`, because a dropped clone may not
   * match the interaction's structural selector (match-interaction's nested choices do; a bare
   * clone elsewhere may only carry the attribute). Response serialisation uses the selector
   * only. Collapsing the two would silently change `matchMax` behaviour.
   */
  readonly countByTarget: Readonly<Record<string, number>>;
}

export const dragDropContext = createContext<Readonly<DragDropState>>(Symbol('dragDropContext'));
