/**
 * FLIP (First, Last, Invert, Play) animation utilities
 *
 * Based on Paul Lewis's FLIP technique for performant layout animations.
 * @see https://css-tricks.com/animating-layouts-with-the-flip-technique/
 *
 * FLIP enables smooth animations by:
 * 1. First - capturing initial position/size
 * 2. Last - capturing final position/size after DOM changes
 * 3. Invert - applying inverse transform to make element appear at start position
 * 4. Play - animating from inverted state back to final position
 */

export interface FlipState {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FlipAnimationOptions {
  duration?: number;
  easing?: string;
  fill?: FillMode;
}

export const DEFAULT_FLIP_OPTIONS: Required<FlipAnimationOptions> = {
  duration: 300,
  easing: 'cubic-bezier(0.26, 0.86, 0.44, 0.985)',
  fill: 'both'
};

/**
 * Capture the current position and dimensions of an element
 */
export function captureFlipState(element: Element): FlipState {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}

/**
 * Capture FLIP states for multiple elements
 */
export function captureMultipleFlipStates(elements: Element[]): Map<Element, FlipState> {
  const states = new Map<Element, FlipState>();
  elements.forEach(element => {
    states.set(element, captureFlipState(element));
  });
  return states;
}

/**
 * Calculate the transform needed to invert an element back to its first state
 */
export function calculateInversion(first: FlipState, last: FlipState): {
  deltaX: number;
  deltaY: number;
  deltaW: number;
  deltaH: number;
} {
  return {
    deltaX: first.left - last.left,
    deltaY: first.top - last.top,
    deltaW: first.width / last.width,
    deltaH: first.height / last.height
  };
}

/**
 * Animate a single element using FLIP technique
 */
export function animateFlip(
  element: HTMLElement,
  first: FlipState,
  options: FlipAnimationOptions = {}
): Animation | null {
  // Capture the final (last) state
  const last = captureFlipState(element);

  // Calculate deltas
  const { deltaX, deltaY, deltaW, deltaH } = calculateInversion(first, last);

  // If no movement occurred, skip animation
  if (deltaX === 0 && deltaY === 0 && deltaW === 1 && deltaH === 1) {
    return null;
  }

  const { duration, easing, fill } = { ...DEFAULT_FLIP_OPTIONS, ...options };

  // Animate from inverted position back to final position
  const animation = element.animate(
    [
      {
        transformOrigin: 'top left',
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`
      },
      {
        transformOrigin: 'top left',
        transform: 'none'
      }
    ],
    {
      duration,
      easing,
      fill
    }
  );

  return animation;
}

/**
 * Animate multiple elements using their captured states
 * Returns a map of elements to their animations
 */
export function animateMultipleFlips(
  previousStates: Map<Element, FlipState>,
  options: FlipAnimationOptions = {}
): Map<Element, Animation> {
  const animations = new Map<Element, Animation>();

  previousStates.forEach((firstState, element) => {
    if (!(element instanceof HTMLElement)) return;

    const animation = animateFlip(element, firstState, options);
    if (animation) {
      animations.set(element, animation);
    }
  });

  return animations;
}

/**
 * Helper to perform a complete FLIP animation cycle
 *
 * @param elements - Elements to animate
 * @param mutationFn - Function that triggers DOM changes
 * @param options - Animation options
 *
 * @example
 * ```ts
 * performFlip(
 *   [...this.children],
 *   () => {
 *     // Reorder children
 *     this.appendChild(firstChild);
 *   },
 *   { duration: 400 }
 * );
 * ```
 */
export async function performFlip(
  elements: Element[],
  mutationFn: () => void | Promise<void>,
  options: FlipAnimationOptions = {}
): Promise<void> {
  // First - capture initial states
  const firstStates = captureMultipleFlipStates(elements);

  // Last - execute the mutation
  await mutationFn();

  // Invert & Play - animate elements
  const animations = animateMultipleFlips(firstStates, options);

  // Wait for all animations to complete
  await Promise.all(
    Array.from(animations.values()).map(animation => animation.finished)
  );
}
