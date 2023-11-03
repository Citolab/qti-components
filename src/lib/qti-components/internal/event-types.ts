import type { ResponseInteraction } from './expression-result';

export interface OutcomeChangedDetails {
  item: string;
  outcomeIdentifier: string;
  value: Readonly<string | string[]>;
}
export type InteractionChangedDetails = ResponseInteraction & { item: string };
