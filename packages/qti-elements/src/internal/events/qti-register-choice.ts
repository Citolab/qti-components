type QtiRegisterChoice = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-register-choice': QtiRegisterChoice;
  }
}

export default QtiRegisterChoice;
