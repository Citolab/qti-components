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
  duration: 250,
  easing: 'ease',
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
 * A chip's last on-screen position, as a FLIP "first" state.
 *
 * The drag clone is `position: fixed` and is destroyed the moment the pointer is released, so the
 * only record of where the chip was is the rect taken just before it goes. Handing that rect to
 * `animateFlip` as the "first" state is what lets a chip fly home rather than blink home.
 */
export function flipStateFromRect(rect: DOMRect): FlipState {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
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
export function calculateInversion(
  first: FlipState,
  last: FlipState
): {
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
 * The interaction's motion budget: the computed `--qti-motion` custom property — a unitless
 * multiplier, default 1 — forced to 0 when the OS requests reduced motion. `0` means "no motion":
 * FLIP is skipped entirely. A positive value scales the configured FLIP duration, so a theme (or a
 * PNP profile) can slow motion down (`0.5`) or switch it off (`0`) from CSS, the single source of
 * truth the drag-drop engine reads. `--qti-motion` inherits from the interaction down to the items
 * it animates, so reading it off any animated element is representative.
 *
 * Every FLIP path funnels through `animateFlip`, so gating here covers slotted, slotted-sortable,
 * sortable reorder and return animations in one place.
 */
export function resolveMotionScale(element: Element | null | undefined): number {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 0;
  }
  if (!element) return 1;
  const raw = getComputedStyle(element).getPropertyValue('--qti-motion').trim();
  if (raw === '') return 1; // token absent (e.g. theme CSS not loaded) → motion on
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Whether FLIP should run for this element, honouring `--qti-motion` and `prefers-reduced-motion`. */
export function motionEnabled(element: Element | null | undefined): boolean {
  return resolveMotionScale(element) > 0;
}

/**
 * Animate a single element using FLIP technique
 */
export function animateFlip(
  element: HTMLElement,
  first: FlipState,
  options: FlipAnimationOptions = {}
): Animation | null {
  const motionScale = resolveMotionScale(element);
  if (motionScale <= 0) return null; // --qti-motion: 0 or reduced-motion → snap, no animation

  const last = captureFlipState(element);
  const { deltaX, deltaY, deltaW, deltaH } = calculateInversion(first, last);

  if (deltaX === 0 && deltaY === 0 && deltaW === 1 && deltaH === 1) {
    return null;
  }

  const { duration, easing, fill } = { ...DEFAULT_FLIP_OPTIONS, ...options };

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
      duration: duration * motionScale, // scaled by --qti-motion (1 = configured speed)
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
  await Promise.all(Array.from(animations.values()).map(animation => animation.finished));
}
