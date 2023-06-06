type QtiRegisterHotspot = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-register-hotspot': QtiRegisterHotspot;
  }
}

export default QtiRegisterHotspot;
