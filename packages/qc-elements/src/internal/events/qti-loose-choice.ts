type QtiLooseChoice = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-loose-choice': QtiLooseChoice;
  }
}

export default QtiLooseChoice;
