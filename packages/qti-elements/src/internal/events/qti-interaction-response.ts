import type { ResponseInteraction } from '@qti-components/base';

type QtiInteractionResponse = CustomEvent<ResponseInteraction>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-interaction-response': QtiInteractionResponse;
  }
}

export default QtiInteractionResponse;
