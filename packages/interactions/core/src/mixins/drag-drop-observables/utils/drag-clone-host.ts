/**
 * Where a drag clone has to live to be painted, and in which coordinate space it is positioned.
 *
 * The mixin's preferred host is the *interaction's* root node: item-container adopts the theme's
 * item.css into its shadow root, so a clone parked on `document.body` sits in a tree those rules
 * cannot reach - `[data-drag-clone]` goes inert and the chip's grip, a `::before` and so the one
 * thing a computed-style copy cannot carry, disappears the moment the chip is picked up.
 *
 * That preference cannot be unconditional, because of the **Fullscreen API** (exam lockdown /
 * kiosk): the browser paints only the fullscreen element's subtree, in the top layer, which no
 * `z-index` can reach past. A clone outside that subtree is not painted at all, so the dragged
 * element simply disappears while it is held. When the preferred host is *inside* the fullscreen
 * element - the usual case, a player that fullscreens its own wrapper around item-container - it is
 * kept, and the theme still reaches the clone. Only when it is not does the fullscreen element take
 * over as host, trading scoped styling for being visible at all; `createDragClone` inlines the
 * source's computed styles either way.
 *
 * What no host may be is the tree the clone was dragged *out of*: that tree belongs to the
 * interaction, which queries and observes it, and a clone living there is picked up as one of its
 * own elements. The order-interaction press/release conformance test fails exactly that way. The
 * interaction's root sits one level above a placed chip's gap or hotspot shadow root, and the
 * interaction's own queries exclude `[data-drag-clone]`, so it is safe as a host.
 */

type FullscreenDocument = Document & { webkitFullscreenElement?: Element | null };
type FullscreenRoot = ShadowRoot & { fullscreenElement?: Element | null };

/** A node a clone can be appended to. A shadow root is used when its host cannot slot the clone. */
export type DragCloneHost = HTMLElement | ShadowRoot;

/**
 * The coordinate space a `position: fixed` clone is laid out in.
 *
 * `fixed` is relative to the viewport only while no ancestor establishes a containing block
 * (`transform`, `filter`, `backdrop-filter`, `perspective`, `contain`, `will-change`, `zoom`).
 * Above item-container that is the integrator's choice, not ours - and a player scaling an item to
 * fit the screen is exactly where such a wrapper appears - so the frame is measured, not assumed.
 */
export interface FixedFrame {
  origin: { x: number; y: number };
  scale: { x: number; y: number };
}

/** Viewport coordinates, no scaling: the frame of a clone hosted by `document.body`. */
export const IDENTITY_FIXED_FRAME: FixedFrame = { origin: { x: 0, y: 0 }, scale: { x: 1, y: 1 } };

const PROBE_SIZE = 100;

/**
 * `document.fullscreenElement` is retargeted against the document: when the element that went
 * fullscreen lives inside a shadow tree, the document reports that tree's host instead. Walk down
 * the shadow trees to find the element that is really fullscreen, otherwise the clone is appended
 * to a host that never renders it.
 */
const deepestFullscreenElement = (ownerDocument: FullscreenDocument): HTMLElement | null => {
  let current = (ownerDocument.fullscreenElement ?? ownerDocument.webkitFullscreenElement ?? null) as Element | null;

  while (current instanceof HTMLElement) {
    const nested = (current.shadowRoot as FullscreenRoot | null)?.fullscreenElement ?? null;
    if (!nested || nested === current) break;
    current = nested;
  }

  return current instanceof HTMLElement ? current : null;
};

/**
 * Light-DOM children of a shadow host are only painted when the shadow tree has a slot to put them
 * in. Without a default slot the clone would be invisible again, so it goes into the shadow tree.
 */
const hostFor = (element: HTMLElement): DragCloneHost => {
  const shadowRoot = element.shadowRoot;
  if (!shadowRoot) return element;
  return shadowRoot.querySelector('slot:not([name])') ? element : shadowRoot;
};

/**
 * Whether `node` is painted as part of `ancestor`'s subtree. Crosses shadow boundaries upward -
 * `parentNode` is null on a shadow root, where the walk continues through its host.
 */
const isInSubtreeOf = (ancestor: Node, node: Node | null): boolean => {
  let current: Node | null = node;

  while (current) {
    if (current === ancestor) return true;
    current = current.parentNode ?? (current as ShadowRoot).host ?? null;
  }

  return false;
};

/**
 * Resolves the host for a clone of `dragSource`: `preferredHost` while the browser still paints it,
 * the fullscreen element when it does not, and `document.body` when there is no preferred host.
 */
export const resolveDragCloneHost = (dragSource: Node, preferredHost?: DragCloneHost | null): DragCloneHost => {
  const ownerDocument = (dragSource.ownerDocument ?? document) as FullscreenDocument;
  const host = preferredHost ?? ownerDocument.body;

  const fullscreenElement = deepestFullscreenElement(ownerDocument);
  if (fullscreenElement && !isInSubtreeOf(fullscreenElement, host)) return hostFor(fullscreenElement);

  return host;
};

/**
 * Measures the frame a `position: fixed` child of `host` is laid out in, using a throwaway probe so
 * the clone's own `transform` / `rotate` cannot skew the reading. Costs one layout per drag start.
 */
export const measureFixedFrame = (host: DragCloneHost): FixedFrame => {
  const ownerDocument = host.ownerDocument ?? document;
  const probe = ownerDocument.createElement('div');
  probe.style.cssText =
    `position:fixed;left:0;top:0;width:${PROBE_SIZE}px;height:${PROBE_SIZE}px;` +
    'margin:0;padding:0;border:0;visibility:hidden;pointer-events:none;';

  host.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();

  return {
    origin: { x: rect.left, y: rect.top },
    scale: { x: rect.width / PROBE_SIZE || 1, y: rect.height / PROBE_SIZE || 1 }
  };
};

/** Converts a viewport coordinate into the host's fixed-positioning space. */
export const toFrameCoordinates = (frame: FixedFrame, x: number, y: number): { x: number; y: number } => ({
  x: (x - frame.origin.x) / frame.scale.x,
  y: (y - frame.origin.y) / frame.scale.y
});
