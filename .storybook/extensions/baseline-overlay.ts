import type { Decorator, Preview } from '@storybook/web-components-vite';

/**
 * VRT baseline-overlay toolbar extension.
 *
 * Lays the committed reference screenshot over the live story for onion-skin review,
 * driven by the `baseline` (off / overlay / diff) and `baselineOpacity` toolbar controls.
 *
 * Baselines are served from apps/e2e/src/stories/kennisnet/__screenshots__ at /baselines (see
 * main.ts `staticDirs`). Vitest names each file `<sanitized-story-id>-<browser>-<platform>.png`,
 * where the story id has every non-alphanumeric run collapsed to a single '-'. The overlay
 * targets the same element the VRT setup captures (qti-item-body). Vitest's Playwright
 * locator screenshots are committed at 1450px for the fixed 906px item; review mode
 * fits that bitmap back onto the same fixed story item width.
 */
const BASELINE_OVERLAY_ID = 'vrt-baseline-overlay';
const BASELINE_URL_BASE = '/baselines';
const BASELINE_SUBFOLDER = 'kennisnet.stories.ts'; // v1: kennisnet-scoped
const BASELINE_PLATFORM = 'chromium-darwin'; // local capture platform (see plan A5)
const BASELINE_TARGET = 'qti-item-body'; // element captured by the VRT setup

const sanitizeStoryId = (id: string) => id.replace(/[^a-z0-9]+/gi, '-');

/**
 * The capture target, through open shadow roots: the Kennisnet stories mount their item inside the
 * `withCorrection` shadow host, where a light-DOM query misses it and the overlay used to stretch
 * over the whole story root instead.
 */
const findTarget = (node: ParentNode): HTMLElement | null => {
  const direct = node.querySelector<HTMLElement>(BASELINE_TARGET);
  if (direct) return direct;
  for (const el of Array.from(node.querySelectorAll('*'))) {
    const found = el.shadowRoot && findTarget(el.shadowRoot);
    if (found) return found;
  }
  return null;
};

const renderBaselineOverlay = (context: { id: string; globals: Record<string, unknown> }) => {
  // The overlay is a human review tool. It must not participate in addon-vitest renders,
  // otherwise an existing baseline can influence the next captured baseline.
  if ((globalThis as { __vitest_browser__?: unknown }).__vitest_browser__) return;

  document.getElementById(BASELINE_OVERLAY_ID)?.remove();
  const root = document.getElementById('storybook-root');
  if (!root) return;
  const target = findTarget(root) ?? root;
  const targetParent = target.parentElement;

  const mode = (context.globals.baseline as string) ?? 'off';
  if (mode === 'off') {
    return;
  }
  const opacity = Number(context.globals.baselineOpacity ?? 50) / 100;

  // Anchor the overlay INSIDE the story root so it tracks the root's origin regardless of
  // viewport, scroll, or image-load reflow — no page-level rect math.
  if (getComputedStyle(root).position === 'static') root.style.position = 'relative';

  const img = document.createElement('img');
  img.id = BASELINE_OVERLAY_ID;
  // `legacy` shows the capture from `pnpm run test:vrt:legacy`: the same story in Chrome 120, which
  // has no `:state()` and renders through the custom-state shim and the theme's fallback arms.
  const source = context.globals.baselineSource === 'legacy' ? 'legacy-' : '';
  img.src = `${BASELINE_URL_BASE}/${BASELINE_SUBFOLDER}/${sanitizeStoryId(context.id)}-${source}${BASELINE_PLATFORM}.png`;
  img.style.cssText = 'position:absolute;z-index:2147483647;pointer-events:none;opacity:0;';
  img.style.mixBlendMode = mode === 'diff' ? 'difference' : 'normal';
  // No baseline for this story → silently drop the overlay.
  img.onerror = () => img.remove();
  // Fit the screenshot back onto the exact CSS box Vitest captured. The PNG's physical
  // pixel width is not a browser DPR contract here: Playwright's locator screenshot is
  // 1450px wide for a 906px item on this setup, so dividing by 2 makes the overlay too
  // narrow even though the screenshot content itself spans the full captured box.
  img.onload = () => {
    const targetLayoutWidth = target.offsetWidth || target.getBoundingClientRect().width;
    if (targetParent?.classList.contains('kennisnet-item')) {
      targetParent.style.width = `${targetLayoutWidth}px`;
      targetParent.style.minWidth = `${targetLayoutWidth}px`;
    }

    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    img.style.top = `${targetRect.top - rootRect.top}px`;
    img.style.left = `${targetRect.left - rootRect.left}px`;
    img.style.width = `${targetRect.width}px`;
    img.style.height = `${targetRect.height}px`;
    img.style.opacity = String(opacity);
  };
  root.appendChild(img);
};

export const baselineOverlayDecorator: Decorator = (story, context) => {
  // Re-evaluate the overlay after the story has painted.
  requestAnimationFrame(() => renderBaselineOverlay(context));
  return story();
};

export const baselineOverlayGlobalTypes: Preview['globalTypes'] = {
  baseline: {
    name: 'Baseline',
    description: 'Overlay the committed VRT baseline screenshot over the live story for onion-skin review',
    defaultValue: 'off',
    toolbar: {
      icon: 'photo',
      items: [
        { value: 'off', title: 'Baseline off' },
        { value: 'overlay', title: 'Overlay baseline' },
        { value: 'diff', title: 'Difference blend' }
      ],
      dynamicTitle: true
    }
  },
  baselineSource: {
    name: 'Baseline source',
    description: 'Which capture the overlay shows: the committed baseline, or the same story in legacy Chrome 120',
    defaultValue: 'current',
    toolbar: {
      icon: 'browser',
      items: [
        { value: 'current', title: 'Current Chromium' },
        { value: 'legacy', title: 'Legacy Chrome 120' }
      ],
      dynamicTitle: true
    }
  },
  baselineOpacity: {
    name: 'Overlay opacity',
    description: 'Opacity of the baseline overlay',
    defaultValue: '50',
    toolbar: {
      icon: 'contrast',
      items: ['25', '50', '75', '100'].map(v => ({ value: v, title: `${v}%` })),
      dynamicTitle: true
    }
  }
};
