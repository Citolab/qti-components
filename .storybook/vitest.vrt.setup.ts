import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { beforeAll, expect } from 'vitest';
import { commands, page, server } from 'vitest/browser';
import { setProjectAnnotations } from '@storybook/web-components-vite';

import * as previewAnnotations from './preview';

/**
 * Visual-regression (VRT) capture project.
 *
 * This setup file is used ONLY by the `vrt` Vitest project (see vitest.config.ts), which is
 * gated to stories tagged `vrt`. It composes the normal Storybook preview annotations and
 * adds a screenshot `afterEach` that captures each story's `qti-item-body` and compares it
 * against a committed reference image.
 *
 * Screenshots are named by the Storybook story id so the in-canvas overlay decorator
 * (see .storybook/extensions/baseline-overlay.ts) can address the resulting PNG on disk.
 */

const CAPTURE_TARGET = 'qti-item-body';
const SCREENSHOT_DIR = 'apps/e2e/src/stories/__screenshots__/kennisnet-all-items.stories.ts';
const PIXEL_CHANNEL_THRESHOLD = 51; // roughly pixelmatch threshold 0.2 on an 8-bit channel
const ALLOWED_MISMATCHED_PIXEL_RATIO = 0.01;

const sanitizeStoryId = (id: string) => id.replace(/[^a-z0-9]+/gi, '-');

const screenshotPathFor = (id: string) =>
  `${server.config.root}/${SCREENSHOT_DIR}/${sanitizeStoryId(id)}-${server.browser}-${server.platform}.png`;

const pngSizeFromBase64 = (base64: string) => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};

const canUpdateSnapshot = (exists: boolean) => {
  const updateState = server.config.snapshotOptions.updateSnapshot;
  return updateState === 'all' || (updateState === 'new' && !exists);
};

const imageDataFromBase64 = async (base64: string) => {
  const img = new Image();
  img.src = `data:image/png;base64,${base64}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create canvas context for VRT image comparison.');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const countMismatchedPixels = (actual: ImageData, expected: ImageData) => {
  let mismatched = 0;
  for (let index = 0; index < actual.data.length; index += 4) {
    const red = Math.abs(actual.data[index] - expected.data[index]);
    const green = Math.abs(actual.data[index + 1] - expected.data[index + 1]);
    const blue = Math.abs(actual.data[index + 2] - expected.data[index + 2]);
    const alpha = Math.abs(actual.data[index + 3] - expected.data[index + 3]);
    if (Math.max(red, green, blue, alpha) > PIXEL_CHANNEL_THRESHOLD) mismatched += 1;
  }
  return mismatched;
};

/** Zero out animations/transitions in the story's own document so captures are stable. */
const stabilizeStyles = (doc: Document) => {
  if (doc.querySelector('style[data-vrt-stabilize]')) return;
  const style = doc.createElement('style');
  style.setAttribute('data-vrt-stabilize', '');
  style.textContent = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      caret-color: transparent !important;
    }
  `;
  doc.head.appendChild(style);
};

const waitForStylesheets = async (doc: Document) => {
  const links = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
  await Promise.all(
    links.map(
      link =>
        new Promise<void>(res => {
          if (link.sheet) {
            res();
            return;
          }
          link.addEventListener('load', () => res(), { once: true });
          link.addEventListener('error', () => res(), { once: true });
        })
    )
  );
};

/** Wait for styles, fonts, and every image inside the story root to settle before capturing. */
const waitForRenderStable = async (root: ParentNode) => {
  const doc = root instanceof Document ? root : root.ownerDocument;
  if (doc) await waitForStylesheets(doc);
  if (doc?.fonts?.ready) await doc.fonts.ready;
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(async img => {
      // First wait for the network fetch to finish (load or error).
      if (!img.complete) {
        await new Promise<void>(res => {
          img.addEventListener('load', () => res(), { once: true });
          img.addEventListener('error', () => res(), { once: true });
        });
      }
      // Then wait for the bitmap to be fully decoded and paintable — a loaded-but-
      // still-decoding image keeps repainting and defeats the screenshot stability loop.
      try {
        await img.decode();
      } catch {
        /* broken/404 images reject decode(); nothing to wait for */
      }
    })
  );
  // Yield two animation frames so the final decoded paint has flushed.
  await new Promise<void>(res => requestAnimationFrame(() => requestAnimationFrame(() => res())));
};

const vrtAnnotations = {
  async afterEach(context: { id: string; canvasElement: HTMLElement }) {
    const root = context.canvasElement ?? document.getElementById('storybook-root') ?? document.body;
    // The capture target may be a descendant OR the canvasElement itself (addon-vitest
    // sometimes mounts the story straight into qti-item-body).
    const target =
      ((root as HTMLElement).matches?.(CAPTURE_TARGET)
        ? (root as HTMLElement)
        : (root.querySelector(CAPTURE_TARGET) as HTMLElement)) ?? (root as HTMLElement);
    stabilizeStyles(target.ownerDocument);
    await waitForRenderStable(root);
    const locator = page.elementLocator(target);
    const screenshot = await locator.screenshot({ base64: true, save: false });
    const actual = typeof screenshot === 'string' ? screenshot : screenshot.base64;
    const path = screenshotPathFor(context.id);
    let expected: string | undefined;
    try {
      expected = await commands.readFile(path, 'base64');
    } catch {
      expected = undefined;
    }

    if (canUpdateSnapshot(Boolean(expected))) {
      await commands.writeFile(path, actual, 'base64');
      return;
    }

    if (!expected) {
      throw new Error(`Missing VRT screenshot: ${path}. Re-run with --update to create it.`);
    }

    const actualSize = pngSizeFromBase64(actual);
    const expectedSize = pngSizeFromBase64(expected);
    expect(actualSize).toEqual(expectedSize);

    const actualData = await imageDataFromBase64(actual);
    const expectedData = await imageDataFromBase64(expected);
    const mismatchedPixels = countMismatchedPixels(actualData, expectedData);
    const mismatchedPixelRatio = mismatchedPixels / (actualSize.width * actualSize.height);
    expect(
      mismatchedPixelRatio,
      `VRT screenshot mismatch for ${context.id}: ${mismatchedPixels} pixels (${(mismatchedPixelRatio * 100).toFixed(
        3
      )}%) differed above channel threshold ${PIXEL_CHANNEL_THRESHOLD}.`
    ).toBeLessThanOrEqual(ALLOWED_MISMATCHED_PIXEL_RATIO);
  }
};

const annotations = setProjectAnnotations([a11yAddonAnnotations, previewAnnotations, vrtAnnotations]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);
