import { expect, test, describe } from 'vitest';

import { positionShapes } from './hotspot';

/**
 * positionShapes turns QTI `coords` into the inline geometry a hotspot renders with. The one piece
 * worth asserting in isolation is the poly outline mask: a `clip-path` box has no border-box edge
 * for a CSS border, so a polygon's selection ring is an SVG stroke published as --qti-shape-outline.
 * That path is invisible to the box-shape stories, and the conformance story that has polys depends
 * on a fixture image loading — so it is pinned here, on the pure function.
 */
const img = () => {
  const el = document.createElement('img');
  el.setAttribute('width', '200');
  el.setAttribute('height', '100');
  return el;
};

describe('positionShapes', () => {
  test('a poly publishes thin and bold outline masks, clipped to the polygon', () => {
    const hotspot = document.createElement('div');
    positionShapes('poly', [10, 10, 90, 10, 50, 90], img(), hotspot);

    // The SVG is percent-encoded inside the data: URI; decode before matching its markup.
    const thin = decodeURIComponent(hotspot.style.getPropertyValue('--qti-shape-outline'));
    const bold = decodeURIComponent(hotspot.style.getPropertyValue('--qti-shape-outline-bold'));

    // An SVG stroke, uniform under resize.
    for (const outline of [thin, bold]) {
      expect(outline).toContain('svg');
      expect(outline).toContain('polygon');
      expect(outline).toContain('non-scaling-stroke');
    }
    // Bold is a wider stroke than thin.
    expect(thin).toContain("stroke-width='4'");
    expect(bold).toContain("stroke-width='8'");
    // clip-path stays — it is the click hit-area the mask layers over.
    expect(hotspot.style.clipPath).toContain('polygon');
  });

  test('box shapes publish no outline mask — they use a CSS border/box-shadow ring', () => {
    for (const [shape, coords] of [
      ['circle', [50, 50, 20]],
      ['rect', [10, 10, 90, 60]],
      ['ellipse', [50, 50, 30, 20]]
    ] as const) {
      const hotspot = document.createElement('div');
      positionShapes(shape, [...coords], img(), hotspot);
      expect(hotspot.style.getPropertyValue('--qti-shape-outline'), `${shape} sets no outline`).toBe('');
    }
  });
});
