import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_FLIP_OPTIONS,
  animateFlip,
  animateMultipleFlips,
  calculateInversion,
  captureFlipState,
  captureMultipleFlipStates,
  performFlip
} from './flip.utils';

function mockRect(el: HTMLElement, rect: Partial<DOMRect>) {
  el.getBoundingClientRect = () =>
    ({
      x: rect.left ?? 0,
      y: rect.top ?? 0,
      width: rect.width ?? 0,
      height: rect.height ?? 0,
      left: rect.left ?? 0,
      top: rect.top ?? 0,
      right: (rect.left ?? 0) + (rect.width ?? 0),
      bottom: (rect.top ?? 0) + (rect.height ?? 0),
      toJSON: () => ({})
    } as DOMRect);
}

describe('flip.utils', () => {
  it('captures flip state from bounding rect', () => {
    const el = document.createElement('div');
    mockRect(el, { left: 10, top: 20, width: 30, height: 40 });

    const state = captureFlipState(el);
    expect(state).toEqual({ left: 10, top: 20, width: 30, height: 40 });
  });

  it('captures multiple flip states', () => {
    const a = document.createElement('div');
    mockRect(a, { left: 0, top: 0, width: 10, height: 10 });
    const b = document.createElement('div');
    mockRect(b, { left: 10, top: 10, width: 20, height: 20 });

    const states = captureMultipleFlipStates([a, b]);
    expect(states.get(a)).toEqual({ left: 0, top: 0, width: 10, height: 10 });
    expect(states.get(b)).toEqual({ left: 10, top: 10, width: 20, height: 20 });
  });

  it('calculates inversion deltas', () => {
    const deltas = calculateInversion(
      { left: 0, top: 0, width: 10, height: 10 },
      { left: 5, top: 5, width: 5, height: 5 }
    );
    expect(deltas).toEqual({ deltaX: -5, deltaY: -5, deltaW: 2, deltaH: 2 });
  });

  it('returns null animation when nothing changes', () => {
    const el = document.createElement('div');
    mockRect(el, { left: 0, top: 0, width: 10, height: 10 });
    const state = captureFlipState(el);
    const animation = animateFlip(el, state);
    expect(animation).toBeNull();
  });

  it('animates when position or size changes and uses default options', () => {
    const el = document.createElement('div');
    mockRect(el, { left: 0, top: 0, width: 10, height: 10 });
    const first = captureFlipState(el);

    mockRect(el, { left: 10, top: 10, width: 20, height: 20 });

    el.animate = vi.fn().mockReturnValue({ finished: Promise.resolve() } as unknown as Animation);
    const animateSpy = vi.spyOn(el, 'animate');
    const animation = animateFlip(el, first);
    expect(animation).not.toBeNull();
    expect(animateSpy).toHaveBeenCalledWith(
      [
        {
          transformOrigin: 'top left',
          transform: 'translate(-10px, -10px) scale(0.5, 0.5)'
        },
        {
          transformOrigin: 'top left',
          transform: 'none'
        }
      ],
      DEFAULT_FLIP_OPTIONS
    );
    animateSpy.mockRestore();
  });

  it('animateMultipleFlips returns animations for changed elements only', () => {
    const el = document.createElement('div');
    mockRect(el, { left: 0, top: 0, width: 10, height: 10 });
    el.animate = vi.fn().mockReturnValue({ finished: Promise.resolve() } as unknown as Animation);
    const states = captureMultipleFlipStates([el]);
    // change rect so animation happens
    mockRect(el, { left: 5, top: 0, width: 10, height: 10 });
    const result = animateMultipleFlips(states);
    expect(result.size).toBe(1);
    expect(el.animate).toHaveBeenCalled();
  });

  it('performFlip captures, mutates, and awaits animations', async () => {
    const el = document.createElement('div');
    mockRect(el, { left: 0, top: 0, width: 10, height: 10 });
    document.body.appendChild(el);

    const animateSpy = vi.spyOn(el, 'animate').mockImplementation(() => {
      return {
        finished: Promise.resolve(),
        cancel: vi.fn()
      } as unknown as Animation;
    });

    await performFlip(
      [el],
      () => {
        mockRect(el, { left: 20, top: 0, width: 10, height: 10 });
      },
      { duration: 100 }
    );

    expect(animateSpy).toHaveBeenCalled();
    animateSpy.mockRestore();
  });
});
