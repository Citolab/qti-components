import { createContext } from '@lit/context';

export type CorrectResponseMode = 'internal' | 'full';

/**
 * Configuration context for QTI components. Provides runtime options for assessment item and interaction behavior.
 */
export interface ConfigContext {
  /**
   * Optional category label for info items, used for reporting or display purposes.
   * Example: "General Information", "Instructions".
   */
  infoItemCategory?: string;

  /**
   * If true, calls reportValidity() on interactions after scoring to show validation feedback.
   * Used to trigger UI validation after a scoring event.
   */
  reportValidityAfterScoring?: boolean;

  /**
   * If true, disables further selection in choice interactions after the maximum number of choices is reached.
   * Used in multiple-choice and similar interactions to enforce maxChoices.
   */
  disableAfterIfMaxChoicesReached?: boolean;

  /**
   * Controls the mode for showing correct responses:
   * - 'internal': Only show correct responses for the current interaction.
   * - 'full': Show all correct responses for the item.
   */
  correctResponseMode?: CorrectResponseMode;

  /**
   * Optional prompt text to display in inline choice interactions when no option is selected.
   * Example: "Select an answer..."
   */
  inlineChoicePrompt?: string;

  /**
   * If true, only show the full correct response when the candidate's response is incorrect.
   * Used to control feedback visibility in review/correction modes.
   */
  fullCorrectResponseOnlyWhenIncorrect?: boolean;
}

export const configContext = createContext<Readonly<ConfigContext>>(Symbol('configContext'));
