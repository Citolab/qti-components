import type { ResponseInteraction } from './ExpressionResult';

export interface OutcomeChangedDetails {
  item: string;
  outcomeIdentifier: string;
  value: string | string[];
}
export type InteractionChangedDetails = ResponseInteraction & { item: string };
