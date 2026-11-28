import type { OutcomeChangedDetails } from './../event-types';
/** The detail of `qc-item-outcome-changed`; `qti-outcome-changed` is no longer sent. */
export type QtiOutcomeChanged = CustomEvent<OutcomeChangedDetails>;

export default QtiOutcomeChanged;
