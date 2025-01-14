import type { ResponseInteraction } from '../../../exports/expression-result';

type QtiInteractionResponse = CustomEvent<ResponseInteraction>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-interaction-response': QtiInteractionResponse;
  }
}

export default QtiInteractionResponse;
