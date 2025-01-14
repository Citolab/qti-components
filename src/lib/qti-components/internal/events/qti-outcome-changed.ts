import type { OutcomeChangedDetails } from './../event-types';
export type QtiOutcomeChanged = CustomEvent<OutcomeChangedDetails>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-outcome-changed': QtiOutcomeChanged;
  }
}

export default QtiOutcomeChanged;
