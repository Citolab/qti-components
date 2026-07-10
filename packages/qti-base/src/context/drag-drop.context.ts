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

  /**
   * Target identifier -> the chip nodes it holds, for targets that render their own chips.
   *
   * This is the authoritative half. A target that opts in (`acceptsDeclarativeDrops`) renders
   * `repeat(nodesByTarget[id])` into its own shadow root, and the interaction never appends into
   * it. The nodes are cloned **once, when the drop happens**, and the same node reference is
   * passed on every render -- Lit renders a `Node` by reference, so a stable node is moved, never
   * recreated. Cloning inside `render()` would mint a new element per update: focus loss,
   * restarted transitions, a half-built shadow root.
   *
   * Today it is still *derived* from the DOM alongside `dragsByTarget`. It becomes authoritative
   * when the first target opts in to rendering its own chips.
   */
  readonly nodesByTarget: Readonly<Record<string, readonly HTMLElement[]>>;
}

export const dragDropContext = createContext<Readonly<DragDropState>>(Symbol('dragDropContext'));
