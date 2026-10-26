import type { InteractionChangedDetails } from './../event-types';

/** The detail of `qc-item-response-changed`; `qti-interaction-changed` is no longer sent. */
export type QtiInteractionChanged = CustomEvent<InteractionChangedDetails>;

export default QtiInteractionChanged;
