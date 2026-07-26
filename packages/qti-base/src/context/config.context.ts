import { createContext } from '@lit/context';

export type ValidationDisplayMode = 'inline' | 'native' | 'both' | 'none';

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
   * Controls how validation feedback is displayed by interactions:
   * - 'inline': render message in #validation-message (default behavior)
   * - 'native': use browser-native reportValidity popup behavior
   * - 'both': show both inline and native feedback
   * - 'none': keep validity state only, without visual feedback
   */
  validationDisplayMode?: ValidationDisplayMode;

  /**
   * If true, disables further user actions when an interaction reaches its configured maximum.
   * Applies to both choice-based and drag/drop interactions.
   */
  disableAfterMaxReached?: boolean;

  /**
   * If false, chips already placed in a drop target cannot be reordered or moved between targets in
   * drag/drop sortable interactions (order, match, gap-match). Defaults to true. A per-interaction
   * `allowReorder` property overrides this.
   */
  allowReorder?: boolean;

  /**
   * If true, disables further selection in choice interactions after the maximum number of choices is reached.
   * @deprecated Legacy alias for choice interactions. Prefer disableAfterMaxReached.
   */
  disableAfterIfMaxChoicesReached?: boolean;

  /**
   * Optional prompt text to display in inline choice interactions when no option is selected.
   * Example: "Select an answer..."
   */
  inlineChoicePrompt?: string;

  /**
   * If true, the inline choice interaction automatically measures the widest option and sizes the
   * trigger button to match. Defaults to false.
   * When a `qti-input-width-*` class is present on the interaction, that class width always takes
   * precedence and autosizing is skipped regardless of this setting.
   */
  inlineChoiceAutosize?: boolean;
}

export const configContext = createContext<Readonly<ConfigContext>>(Symbol('configContext'));
