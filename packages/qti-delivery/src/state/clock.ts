/**
 * Where `delivery` reads the time. Passed in, never read from the runtime, so a server can be the
 * only clock a high-stakes test trusts, and a spec can fix the time.
 */
export interface Clock {
  /** Milliseconds since the epoch. */
  now(): number;
}

/** The runtime's own clock, for a browser or server that trusts itself. */
export const systemClock: Clock = { now: () => Date.now() };

/** A clock that always answers `time`; for specs and test vectors. */
export const fixedClock = (time: number): Clock => ({ now: () => time });
