import { createContext } from '@lit/context';

/**
 * A validated deterministic shuffle seed.
 *
 * Branded so that only values verified through {@link isSeed} (or constructed via
 * {@link asSeed}) can be assigned where a seed is expected. This prevents arbitrary
 * strings from silently being used as a seed.
 *
 * A usable seed is a non-empty string of letters, digits and hyphens (e.g. a GUID
 * "N" format like `8f14e45fceea167a5a36dedd4bea2543`, or a readable label like
 * `delivery-2026-06-05`). Whitespace and other characters are rejected.
 */
export type Seed = string & { readonly __seedBrand: 'Seed' };

/** Format a value must match to be usable as a {@link Seed}. */
const SEED_PATTERN = /^[A-Za-z0-9-]+$/;

/**
 * Runtime type guard that narrows an unknown value to a {@link Seed}.
 * Use this at boundaries (e.g. values coming from XML, a host application or a
 * backend) before treating a string as a seed.
 */
export const isSeed = (value: unknown): value is Seed => typeof value === 'string' && SEED_PATTERN.test(value);

/**
 * Validates and brands a value as a {@link Seed}, returning `undefined` when the
 * value is missing or not in a usable seed format.
 */
export const asSeed = (value: unknown): Seed | undefined => (isSeed(value) ? value : undefined);

export type QtiContextType = {
  testIdentifier: string;
  candidateIdentifier: string;
  environmentIdentifier: string;
  /**
   * Optional deterministic seed for shuffling.
   *
   * When set, it is used to reproduce a stable shuffle order across reloads/restarts:
   * - test ordering in `test-container` (`<qti-ordering shuffle="true">`),
   * - seeded item interaction shuffling in `item-container` and during test navigation.
   *
   * Typically generated once per session by the host/backend and passed in via
   * `QTI_CONTEXT`. When omitted, each item falls back to its own URI-derived seed.
   */
  seed?: Seed;
  [key: string]: string | string[]; // Allow for additional context variables
};

export interface QtiContext {
  QTI_CONTEXT: QtiContextType;
}

export const qtiContext = createContext<Readonly<QtiContext>>(Symbol('qtiContext'));
