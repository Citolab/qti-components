import type { ResponseInteraction } from '@qti-components/base';

export interface OutcomeChangedDetails {
  item: string;
  outcomeIdentifier: string;
  value: Readonly<string | string[]>;
}
export type InteractionChangedDetails = ResponseInteraction & { item: string };
