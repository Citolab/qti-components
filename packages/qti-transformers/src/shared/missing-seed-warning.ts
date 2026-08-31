/**
 * The missing-seed warning is advice about configuration, not about the document being
 * transformed — say it once per session, shared by the item and test transformers since
 * both are pointing at the same missing `QTI_CONTEXT.seed`.
 *
 * Deliberately not re-exported from the package entry: `resetMissingSeedWarning` exists so
 * tests can restore the once-per-session state, not as public API.
 */
let missingSeedWarned = false;

export function warnMissingSeed(scope: string, fallbackSeed: string): void {
  if (missingSeedWarned) return;
  missingSeedWarned = true;
  console.warn(`[${scope}] No QTI_CONTEXT.seed provided; using "${fallbackSeed}" as deterministic fallback seed.`);
}

export function resetMissingSeedWarning(): void {
  missingSeedWarned = false;
}
