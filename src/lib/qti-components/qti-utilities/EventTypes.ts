import type { ResponseInteraction } from './ExpressionResult';

export interface OutcomeChangedDetails {
  item: string;
  outcomeIdentifier: string;
  value: number;
}
export type InteractionChangedDetails = ResponseInteraction & { item: string };
