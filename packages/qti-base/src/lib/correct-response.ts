/**
 * Canonical `correct-response="..."` attribute codec.
 *
 * Authors put a single string on an interaction element. This module is the
 * single source of truth for how that string parses into the runtime's
 * internal value AND how an editor serializes the internal value back to the
 * attribute. Both `@qti-components/*` interactions and `@citolab/prose-qti`
 * (the editor) import from here — no per-codebase parsers, no drift.
 *
 * ---
 *
 * Format reference (per interaction):
 *
 * | Interaction          | base-type     | cardinality          | attribute value           |
 * |----------------------|---------------|----------------------|---------------------------|
 * | choice               | identifier    | single / multiple    | "A"  /  "A,B,C"           |
 * | inline-choice        | identifier    | single               | "Y"                       |
 * | hottext              | identifier    | single / multiple    | "h1"  /  "h1,h2"          |
 * | hotspot              | identifier    | single / multiple    | "spot1"  /  "spot1,spot2" |
 * | order                | identifier    | ordered              | "a,b,c"  (order matters)  |
 * | graphic-order        | identifier    | ordered              | "spot1,spot2,spot3"       |
 * | match                | directedPair  | multiple             | "src1 tgt1,src2 tgt2"     |
 * | associate            | directedPair  | multiple             | "A B,C D"                 |
 * | gap-match            | directedPair  | multiple             | "gtext1 gap1,..."         |
 * | graphic-associate    | directedPair  | multiple             | "spot1 spot2,..."         |
 * | graphic-gap-match    | directedPair  | multiple             | "gimg1 spot1,..."         |
 * | select-point         | point         | single / multiple    | "100 150"  /  "100 150,…" |
 * | slider               | integer       | single               | "50"                      |
 * | text-entry           | string        | single               | "paris"                   |
 *
 * Rules:
 *  - Comma `,` separates VALUES (different identifiers / pairs / points).
 *  - Space ` ` separates PARTS within one value (pair members or point coords).
 *  - Each value is trimmed on parse.
 *  - No escape mechanism. Identifiers that contain commas cannot round-trip.
 */

// ─── parsed shape ────────────────────────────────────────────────────────────

/** Canonical parsed value of `correct-response`. */
export type CorrectResponseValue = string | string[] | null;

// ─── per-shape branded types (advisory at compile time) ──────────────────────

/** Identifier literal — opaque QTI identifier (e.g. `"choice1"`). */
export type Identifier = string;

/** Directed pair literal — `"sourceId targetId"`. Used by match / associate / gap-match. */
export type DirectedPair = `${string} ${string}`;

/** Point literal — `"x y"` integer coordinates. Used by select-point / graphic-*. */
export type Point = `${number} ${number}`;

// ─── attribute-level parser / serializer ─────────────────────────────────────

/**
 * Parse a raw `correct-response` attribute string into the canonical value.
 *
 *  - `null` / `undefined` / empty → `null`
 *  - no comma                     → trimmed string
 *  - one or more commas           → trimmed array (single-element collapses to a string)
 */
export function parseCorrectResponseAttribute(raw: string | null | undefined): CorrectResponseValue {
  if (raw == null) return null;
  if (!raw.includes(',')) {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  const tokens = raw
    .split(',')
    .map(token => token.trim())
    .filter(token => token.length > 0);
  if (tokens.length === 0) return null;
  if (tokens.length === 1) return tokens[0];
  return tokens;
}

/**
 * Serialize a canonical value back to the attribute string. Returns `null` for
 * empty inputs so a Lit `@property({ reflect: true })` drops the attribute.
 */
export function serializeCorrectResponseAttribute(value: CorrectResponseValue): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    const tokens = value.map(token => token.trim()).filter(token => token.length > 0);
    return tokens.length > 0 ? tokens.join(',') : null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// ─── value-shape helpers (per interaction type) ──────────────────────────────

/**
 * Iterate over the comma-separated entries in a correct-response value,
 * regardless of whether the caller has the raw string, the parsed string, or
 * a string[]. Yields trimmed non-empty entries.
 */
export function* iterCorrectResponseValues(raw: CorrectResponseValue): Generator<string> {
  if (raw == null) return;
  if (Array.isArray(raw)) {
    for (const v of raw) {
      const t = v.trim();
      if (t) yield t;
    }
    return;
  }
  if (!raw.includes(',')) {
    const t = raw.trim();
    if (t) yield t;
    return;
  }
  for (const v of raw.split(',')) {
    const t = v.trim();
    if (t) yield t;
  }
}

/** Parse a directed-pair value into `{ source, target }`. Throws on malformed input. */
export function parsePair(value: string): { source: string; target: string } {
  const [source, target, ...rest] = value.trim().split(/\s+/);
  if (!source || !target || rest.length > 0) {
    throw new Error(`malformed directed-pair value: "${value}" (expected "source target")`);
  }
  return { source, target };
}

/** Serialize a directed pair to canonical `"source target"` form. */
export function serializePair(source: string, target: string): DirectedPair {
  return `${source} ${target}`;
}

/** Parse a point value into `{ x, y }`. Throws on malformed input. */
export function parsePoint(value: string): { x: number; y: number } {
  const [xStr, yStr, ...rest] = value.trim().split(/\s+/);
  const x = Number(xStr);
  const y = Number(yStr);
  if (!Number.isFinite(x) || !Number.isFinite(y) || rest.length > 0) {
    throw new Error(`malformed point value: "${value}" (expected "x y" numeric coords)`);
  }
  return { x, y };
}

/** Serialize a point to canonical `"x y"` form. */
export function serializePoint(x: number, y: number): Point {
  return `${x} ${y}`;
}
