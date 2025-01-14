import type { ResponseInteraction } from '../../exports/expression-result';

export interface OutcomeChangedDetails {
  item: string;
  outcomeIdentifier: string;
  value: Readonly<string | string[]>;
}
export type InteractionChangedDetails = ResponseInteraction & { item: string };
