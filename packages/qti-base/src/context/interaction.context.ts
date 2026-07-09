import { createContext } from '@lit/context';

/**
 * What a choice element should render and behave as. The same element — `qti-simple-choice`,
 * `qti-hottext` — is a radio in one interaction, a checkbox in another, and a drag chip in a
 * third. It cannot know this by itself.
 */
export type ChoiceRole = 'radio' | 'checkbox' | 'drag';

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
}

export const interactionContext = createContext<Readonly<InteractionContext>>(Symbol('interactionContext'));
