import { InteractionChangedDetails } from './../event-types';

export type QtiInteractionChanged = CustomEvent<InteractionChangedDetails>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-interaction-changed': QtiInteractionChanged;
  }
}

export default QtiInteractionChanged;
