import { render } from 'lit';
import normalizeCss from 'modern-normalize/modern-normalize.css?inline';
import { storyNameFromExport, toId } from 'storybook/internal/csf';
import { expect, test } from 'vitest';
import { commands, page, server } from 'vitest/browser';

// The correction variants registered globally, as a host would: nothing else in this file
// registers elements first, so no scoped registry is needed — Chrome 120 has none.
import '../../../../../packages/qti-components/src/corrections';

import itemCss from '@qti-components/theme/item-css';

import kennisnetCss from './kennisnet.css?inline';
import meta, * as stories from './kennisnet.stories';
import { KENNISNET_STORY_WIDTH } from './story-width';

/**
 * The Kennisnet VRT stories as Chrome 120 renders them, for the Storybook overlay.
 *
 * Runs in the `legacy` project (`pnpm run test:legacy`): a browser without `:state()`, where the
 * custom-state shim and the theme's `[data-state~=…]` fallback arms do the work. Each story is
 * saved next to its VRT baseline as `<story>-legacy-chromium-darwin.png`; the overlay's
 * "Baseline source → Legacy Chrome 120" toolbar item lays it over the live story.
 *
 * Not a regression gate: every run overwrites the captures. It renders each story the way its
 * `withCorrection` decorator does — inside a shadow root carrying the item and Kennisnet sheets —
 * minus the scoped registry that decorator needs, which is why the decorator is not applied.
 */

const SCREENSHOT_DIR = 'apps/e2e/src/stories/kennisnet/__screenshots__/kennisnet.stories.ts';
const sanitizeStoryId = (id: string) => id.replace(/[^a-z0-9]+/gi, '-');

const sheet = (css: string) => {
  const s = new CSSStyleSheet();
  s.replaceSync(css);
  return s;
};
const sheets = [sheet(itemCss), sheet(kennisnetCss)];
// The document styles .storybook/preview.ts imports, so text and spacing match the baselines.
document.adoptedStyleSheets = [sheet(normalizeCss), sheet(itemCss)];

/** Every <img> under `node`, through shadow roots. */
const images = (node: ParentNode): HTMLImageElement[] => [
  ...Array.from(node.querySelectorAll('img')),
  ...Array.from(node.querySelectorAll('*')).flatMap(el => (el.shadowRoot ? images(el.shadowRoot) : []))
];

const settle = async (root: ParentNode) => {
  await document.fonts.ready;
  await Promise.all(
    images(root).map(async img => {
      if (!img.complete) {
        await new Promise(r => {
          img.addEventListener('load', r, { once: true });
          img.addEventListener('error', r, { once: true });
        });
      }
      await img.decode().catch(() => undefined);
    })
  );
  await new Promise(r => setTimeout(r, 0));
  await new Promise<void>(r =>
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r())))
  );
};

const entries = Object.entries(stories).filter(
  ([key, story]) => key !== 'default' && typeof (story as { render?: unknown }).render === 'function'
) as Array<[string, { render: () => unknown }]>;

test.each(entries.map(([key, story]) => [key, story] as const))('%s', async (key, story) => {
  expect(CSS.supports('selector(:state(x))'), 'captures must come from the legacy browser').toBe(false);

  document.body.innerHTML = '';
  const host = document.createElement('div');
  host.style.width = KENNISNET_STORY_WIDTH;
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.adoptedStyleSheets = sheets;
  const wrapper = document.createElement('div');
  shadow.appendChild(wrapper);
  render(story.render() as Parameters<typeof render>[0], wrapper);
  await settle(shadow);

  const target = shadow.querySelector('qti-item-body') as HTMLElement;
  expect(target, `${key} renders a qti-item-body`).toBeTruthy();

  const id = sanitizeStoryId(toId(meta.title!, storyNameFromExport(key)));
  // Captured the way .storybook/vitest.vrt.setup.ts captures the baselines.
  const shot = await page.elementLocator(target).screenshot({ base64: true, save: false });
  const base64 = typeof shot === 'string' ? shot : shot.base64;
  await commands.writeFile(
    `${server.config.root}/${SCREENSHOT_DIR}/${id}-legacy-${server.browser}-${server.platform}.png`,
    base64,
    'base64'
  );
});
