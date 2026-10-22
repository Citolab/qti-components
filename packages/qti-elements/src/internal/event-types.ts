import type { ResponseInteraction } from '@qti-components/base';

export interface OutcomeEntry {
  identifier: string;
  value: Readonly<string | string[] | null | undefined>;
}

/** The outcomes one update applied, sent after the item context is published. */
export interface OutcomesChangedDetails {
  item: string;
  outcomes: OutcomeEntry[];
}

/**
 * Outcomes for the item to apply in one update: the result of its own response processing, or what
 * a backend returned. `responseProcessed` says an attempt ended, as it does after `processResponse`.
 */
export interface SetOutcomesDetails {
  outcomes: OutcomeEntry[];
  responseProcessed?: boolean;
}
export type InteractionChangedDetails = ResponseInteraction & { item: string };
