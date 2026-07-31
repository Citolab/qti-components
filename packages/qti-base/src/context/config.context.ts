import { createContext } from '@lit/context';

export type ValidationDisplayMode = 'inline' | 'native' | 'both' | 'none';

/**
 * Configuration context for QTI components. Provides runtime options for assessment item and
 * interaction behavior.
 *
 * ── Three ways to set it, in the order you should reach for them ─────────────────────────────
 *
 * 1. **On a provider**, for real delivery. `qti-test` and `qti-item` both provide it, so setting
 *    `item.configContext = {…}` configures every interaction inside.
 *
 * 2. **On one interaction, directly** — the development-time route, and the reason
 *    `Interaction.configContext` is public:
 *
 *        orderInteraction.configContext = { allowReorder: false };
 *
 *    or, in a lit-html template, as a property binding — which lands before `connectedCallback`:
 *
 *        html`<qti-order-interaction .configContext=${{ allowReorder: false }}>…`
 *
 *    An interaction has to work standalone, so in a story or a spec there is usually no provider
 *    above it, and then nothing ever overwrites what you set. Where a provider DOES exist it wins on
 *    its next emit, because `@consume` writes that same field.
 *
 *    A `qti-config-test-provider` element used to exist for scoping config to a subtree. It is gone:
 *    it was test-only yet registered itself into every consumer's element registry via an unguarded
 *    `@customElement`, which threw whenever two copies of this package ended up in one module graph.
 *    Bind the property on each interaction instead, or provide from `qti-item`.
 *
 * There is no merging at any level: @lit/context resolves to the nearest provider and that object
 * replaces the ancestor's wholesale. A deeper provider therefore has to restate anything from above
 * that it still wants.
 *
 * Note what is NOT here. Options an item author chooses per question are attributes on the
 * interaction (`auto-size-dropzones`, `max-associations`, `disable-animations`); options only a
 * developer chooses are mixin factory arguments or method overrides. This context is for what a
 * delivery environment decides across items. `interactionContext` and `dragDropContext` are neither
 * — they publish derived state (what a choice IS, what a drop HOLDS), never configuration.
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
