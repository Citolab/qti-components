import { InteractionChangedDetails } from './../EventTypes';

export type QtiInteractionChanged = CustomEvent<InteractionChangedDetails>;

declare global {
  interface GlobalEventHandlersEventMap {
    "qti-interaction-changed": QtiInteractionChanged;
  }
}

export default QtiInteractionChanged;
