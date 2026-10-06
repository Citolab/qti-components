import type { VariableDeclaration } from '../../lib/variables';

export interface ItemContext {
  identifier?: string;
  href?: string;
  variables?: ReadonlyArray<VariableDeclaration<string | string[] | null>>;
  /**
   * Optional per-interaction opaque state, keyed by responseIdentifier.
   * Used for interactions that support state save/restore (e.g. PCI).
   */
  state?: Record<string, string | null>;
  /** The item is shown for reading only. Interactions follow it; see `qti-assessment-item`'s `readonly`. */
  readonly?: boolean;
  /** The item is locked, for example after it was submitted. Interactions follow it; see `qti-assessment-item`'s `disabled`. */
  disabled?: boolean;
  /**
   * Whether the interactions in the item are valid right now (a required answer is given, a limit is
   * respected). Published by the item whenever it checks, so a reader never has to ask the item.
   * Unset until the item has checked once.
   */
  valid?: boolean;
}

export const itemContextVariables = [
  {
    identifier: 'completionStatus',
    cardinality: 'single',
    baseType: 'string',
    value: 'unknown',
    type: 'outcome'
  },
  {
    identifier: 'numAttempts',
    cardinality: 'single',
    baseType: 'integer',
    value: '0',
    type: 'response'
  }
] as VariableDeclaration<string | string[]>[];
