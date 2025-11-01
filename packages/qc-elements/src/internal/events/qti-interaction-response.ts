import type { ResponseInteraction } from '@qti-components/shared';

type QtiInteractionResponse = CustomEvent<ResponseInteraction>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-interaction-response': QtiInteractionResponse;
  }
}

export default QtiInteractionResponse;
