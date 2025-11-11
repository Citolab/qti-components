import 'storybook/test';

declare global {
  namespace jest {
    interface Matchers<R, T = {}> {
      toBePositionedRelativeTo(other: Element, position: 'left' | 'right' | 'above' | 'below'): R;
    }
  }
}
