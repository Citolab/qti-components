import 'vitest';

interface CustomMatchers<R = unknown> {
  toEqualXml: (expected: string) => R;
  toBePositionedRelativeTo: (received, other, position: 'left' | 'right' | 'above' | 'below') => R;
}

interface Assertion<T = any> {
  toBePositionedRelativeTo(other: Element, position: 'left' | 'right' | 'above' | 'below'): void;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
