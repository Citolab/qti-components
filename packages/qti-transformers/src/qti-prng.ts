/**
 * Small, dependency-free seeded PRNG used for deterministic QTI shuffling
 * (sections and interactions). The same `seedKey` always yields the same stream,
 * so a restarted session reproduces the same order.
 *
 * xmur3 (string hash) seeds mulberry32 (fast 32-bit generator).
 */
export function createSeededRandom(seedKey: string): () => number {
  // xmur3 string hash -> 32-bit seed
  let h = 1779033703 ^ seedKey.length;
  for (let i = 0; i < seedKey.length; i++) {
    h = Math.imul(h ^ seedKey.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  let a = (h ^= h >>> 16) >>> 0;

  // mulberry32
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
