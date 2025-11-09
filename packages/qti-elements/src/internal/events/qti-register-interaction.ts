type QtiRegisterInteraction = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-register-interaction': QtiRegisterInteraction;
  }
}

export default QtiRegisterInteraction;
