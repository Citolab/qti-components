import { ResponseInteraction } from "../ExpressionResult";

type QtiInteractionResponse = CustomEvent<ResponseInteraction>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-interaction-response': QtiInteractionResponse;
  }
}

export default QtiInteractionResponse;
