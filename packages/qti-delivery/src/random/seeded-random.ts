export interface SeededRandomSource {
  random(): number;
}

/**
 * Small, dependency-free seeded PRNG used for deterministic QTI shuffling
 * (sections and interactions). It intentionally exposes a `random()` method,
 * matching the TC39 seeded-random proposal shape so this can be swapped when a
 * standard implementation is available.
 *
 * xmur3-style seed hashing feeds mulberry32 (fast 32-bit generator).
 */
export class SeededRandom implements SeededRandomSource {
  #state: number;

  constructor(seed: Uint8Array) {
    if (!(seed instanceof Uint8Array)) {
      throw new TypeError('SeededRandom seed must be a Uint8Array.');
    }
    if (seed.length > 32) {
      throw new RangeError('SeededRandom seed must be 32 bytes or less.');
    }

    const paddedSeed = new Uint8Array(32);
    paddedSeed.set(seed, 32 - seed.length);
    this.#state = hashBytes(paddedSeed);
  }

  static fromSeed(seed: Uint8Array): SeededRandom {
    if (seed.length !== 32) {
      throw new RangeError('SeededRandom.fromSeed requires a 32-byte seed.');
    }
    return new SeededRandom(seed);
  }

  static fromFixed(byte: number): SeededRandom {
    if (typeof byte !== 'number') {
      throw new TypeError('SeededRandom.fromFixed requires a number.');
    }
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
      throw new RangeError('SeededRandom.fromFixed requires an integer from 0 to 255.');
    }

    const seed = new Uint8Array(32);
    seed[31] = byte;
    return new SeededRandom(seed);
  }

  static fromSeedKey(seedKey: string | number): SeededRandom {
    const random = new SeededRandom(new Uint8Array());
    random.#state = hashString(`${seedKey}`);
    return random;
  }

  random(): number {
    this.#state |= 0;
    this.#state = (this.#state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.#state ^ (this.#state >>> 15), 1 | this.#state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export function createSeededRandom(seedKey: string | number): SeededRandomSource {
  return SeededRandom.fromSeedKey(seedKey);
}

function hashString(seedKey: string): number {
  let h = 1779033703 ^ seedKey.length;
  for (let i = 0; i < seedKey.length; i++) {
    h = Math.imul(h ^ seedKey.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return finalizeHash(h);
}

function hashBytes(seed: Uint8Array): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed[i], 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return finalizeHash(h);
}

function finalizeHash(hash: number): number {
  let h = Math.imul(hash ^ (hash >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}
