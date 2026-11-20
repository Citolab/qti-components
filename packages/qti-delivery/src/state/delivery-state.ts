/**
 * The one source of truth for one candidate in one test: what a resumed test, or a server taking
 * over, needs to carry on. Written only through commands; every context is an input or a view
 * derived from it, and anything derivable (done, can*, scores) is never stored here. Plain JSON,
 * versioned, so a stored state can be read back by a later release (or a .NET port) and refused
 * when it cannot.
 *
 * Experimental (0.x): roadmap 1 fills in the target fields, phase by phase; see
 * `plans/delivery-state.md`.
 */
export const DELIVERY_STATE_VERSION = 1;

/**
 * One item session. With `with-replacement` selection a single item-ref appears more than once,
 * so a session is keyed by its instance, never by the item-ref identifier alone.
 */
export type ItemInstanceId = string;

export interface ItemDeliveryState {
  /** The `identifier` of the `qti-assessment-item-ref` this instance was selected from. */
  itemRefIdentifier: string;
  /** 1 for the first time the item-ref was selected, 2 for its first clone, and so on. */
  occurrence: number;
}

export interface DeliveryState {
  version: typeof DELIVERY_STATE_VERSION;
  /**
   * The seed actually used for selection and ordering; the same seed gives the same test on every
   * runtime. On a first start it comes from the host (`qtiContext.seed`); on resume this one wins.
   */
  seed: string | null;
  /** When the test started, in milliseconds since the epoch, read from the injected clock. */
  startedAt: number;
  /** The item instance on screen, or null before the first navigation and after the end. */
  current: ItemInstanceId | null;
  items: Record<ItemInstanceId, ItemDeliveryState>;
}

/** The instance id of the `occurrence`th selection of an item-ref: `item-3`, `item-3#2`. */
export const itemInstanceId = (itemRefIdentifier: string, occurrence = 1): ItemInstanceId =>
  occurrence === 1 ? itemRefIdentifier : `${itemRefIdentifier}#${occurrence}`;

/**
 * Read a stored state back. Throws on a state this release cannot read (another version, or not a
 * state at all) rather than guessing, so a host never resumes from something half understood.
 */
export function parseDeliveryState(value: unknown): DeliveryState {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('A delivery state is an object.');
  }
  const { version } = value as { version?: unknown };
  if (version !== DELIVERY_STATE_VERSION) {
    throw new RangeError(
      `Delivery state version ${String(version)} is not supported; expected ${DELIVERY_STATE_VERSION}.`
    );
  }
  return value as DeliveryState;
}
