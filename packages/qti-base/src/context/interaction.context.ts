import { createContext } from '@lit/context';

/**
 * What a choice element should render and behave as. The same element — `qti-simple-choice`,
 * `qti-hottext` — is a radio in one interaction and a checkbox in another. It cannot know this
 * by itself.
 *
 * Note "drag" is deliberately *not* a choiceRole. In `qti-match-interaction` the same element
 * type is a drag in one match-set and a drop target in the other, so draggability is positional,
 * not a property of the interaction. It is derived from `draggablesSelector` instead. It is also
 * not a valid ARIA role, so it may only ever be a custom state.
 */
export type ChoiceRole = 'radio' | 'checkbox';

/**
 * State an interaction publishes to the choice elements inside it.
 *
 * Provided by the `qti-*-interaction`, never by `qti-assessment-item`: interactions must work
 * standalone — in a plain form, in a story, in a vendor's app — with no QTI ancestor. Consumers
 * must therefore tolerate its absence and fall back to a sensible default:
 *
 *   const role = this.interactionContext?.choiceRole ?? null;
 */
export interface InteractionContext {
  /** `null` when the interaction assigns no particular role to its choices. */
  choiceRole: ChoiceRole | null;

  /**
   * The selector this interaction uses to recognise its draggable chips. An element tests
   * itself with `this.matches(draggablesSelector)` and takes `:state(drag)` if it matches.
   *
   * Published rather than pushed because draggability can be positional: match-interaction's
   * selector distinguishes the source match-set from the target one, so two elements of the
   * same tag get different answers.
   */
  draggablesSelector: string | null;
}

export const interactionContext = createContext<Readonly<InteractionContext>>(Symbol('interactionContext'));
