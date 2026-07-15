import itemCss from '../../packages/qti-theme/src/item.css?inline';
import minimalCss from '../../packages/qti-theme/src/minimal.css?inline';
import nativeCss from '../../packages/qti-theme/src/native.css?inline';

import type { Decorator, Preview } from '@storybook/web-components-vite';

/**
 * Style-substrate toolbar extension.
 *
 * Adds a "Style" toolbar control that swaps which stylesheet substrate the story iframe
 * loads, and a decorator that applies the choice by toggling the qti-theme baseline
 * (`item.css`, injected as processed CSS via Vite `?inline`) and any vendor override
 * `<link>`s at runtime.
 *
 * Each substrate declares which base stylesheet loads (injected as processed CSS via Vite
 * `?inline`) plus an ordered list of vendor override stylesheet URLs layered on top. Add a
 * vendor by adding (a) an entry here and (b) an item in
 * `styleSubstrateGlobalTypes.override.toolbar.items`.
 *
 * Every substrate sits on the shared `modern-normalize` reset imported in preview.ts.
 *
 * - vanilla:   `native.css` + the minimal variable theme. The lightest styled baseline.
 * - citolab:   full qti-theme (`item.css`, which includes native). Default: the theme's own
 *   look, with no vendor stylesheet in the cascade.
 */

const OVERRIDE_LINK_CLASS = 'qti-vendor-override';
const THEME_STYLE_ID = 'qti-theme-style';
const vanillaMinimalCss = `${nativeCss}\n${minimalCss}`;

const SUBSTRATES: Record<string, { baseCss: string; overrides: string[] }> = {
  vanilla: { baseCss: vanillaMinimalCss, overrides: [] },
  citolab: { baseCss: itemCss, overrides: [] }
};

/*
 * Resolution order:
 *   1. `globals.override` — the toolbar picker, whenever the user has made a choice.
 *   2. `parameters.styleSubstrate` — a story's preferred substrate (e.g. the Kennisnet VRT
 *      baselines). Use this rather than meta-level `globals`, which since Storybook 8.3
 *      *locks* the toolbar control for that story and stops you switching themes.
 *   3. `citolab` — the theme's own look, no vendor stylesheet in the cascade.
 */
/**
 * Applies the substrate and resolves only once its stylesheets are actually in the cascade.
 *
 * This is a loader rather than a decorator because a decorator cannot be awaited, and a vendor
 * override arrives as a `<link>` — asynchronously. A story that renders before its link lands
 * lays out against a half-styled tree, then reflows when the CSS applies. For a `play()` that
 * drags, the reflow happens *mid-drag*: the chip grows by its theme's padding, the drag bank
 * rewraps, and the gap the pointer was aimed at moves a line up, so the drop lands in the
 * neighbouring gap. That was Q6-L2-D1, and only under Kennisnet — the only substrate with a
 * `<link>` to lose the race. Citolab inlines its CSS and never showed it.
 */
const applySubstrate = async (context: {
  parameters: Record<string, unknown>;
  globals: Record<string, unknown>;
}): Promise<void> => {
  const preferred = context.parameters.styleSubstrate as string | undefined;
  const choice = (context.globals.override as string) || preferred || 'citolab';
  const substrate = SUBSTRATES[choice] ?? SUBSTRATES.citolab;

  // Base stylesheet as an updatable <style> (processed CSS via Vite `?inline`): native.css
  // for vanilla, the full qti-theme for the others.
  const existingTheme = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
  if (existingTheme) {
    if (existingTheme.textContent !== substrate.baseCss) existingTheme.textContent = substrate.baseCss;
  } else {
    const style = document.createElement('style');
    style.id = THEME_STYLE_ID;
    style.textContent = substrate.baseCss;
    // Keep the base first so vendor overrides win the cascade.
    document.head.insertBefore(style, document.head.firstChild);
  }

  // Vendor override <link>s, layered on top of the theme.
  const wantHrefs = substrate.overrides;
  const existing = Array.from(document.getElementsByClassName(OVERRIDE_LINK_CLASS)) as HTMLLinkElement[];
  const existingHrefs = existing.map(l => l.getAttribute('href'));
  const wantSet = new Set(wantHrefs);
  // Drop links no longer wanted.
  for (const link of existing) {
    if (!wantSet.has(link.getAttribute('href') || '')) link.remove();
  }
  // Add links not yet present, preserving order so the cascade stays predictable.
  const loading: Promise<void>[] = [];
  for (const href of wantHrefs) {
    if (existingHrefs.includes(href)) continue;
    const link = document.createElement('link');
    link.className = OVERRIDE_LINK_CLASS;
    link.rel = 'stylesheet';
    link.href = href;
    loading.push(
      new Promise<void>(resolve => {
        link.addEventListener('load', () => resolve(), { once: true });
        // A stylesheet that 404s must not hang the story forever; it will simply look wrong.
        link.addEventListener('error', () => resolve(), { once: true });
      })
    );
    document.head.appendChild(link);
  }

  await Promise.all(loading);
  // The <link> has applied, but the layout it implies has not been computed yet. One frame, and
  // a font pass, and the tree the story sees is the tree the user would see.
  await document.fonts.ready;
  await new Promise(requestAnimationFrame);
};

/** Runs before decorators, and Storybook awaits it. */
export const styleSubstrateLoader = (context: {
  parameters: Record<string, unknown>;
  globals: Record<string, unknown>;
}): Promise<void> => applySubstrate(context);

export const styleSubstrateDecorator: Decorator = story => story();

export const styleSubstrateGlobalTypes: Preview['globalTypes'] = {
  override: {
    name: 'Style',
    description: 'Choose the style substrate: Vanilla minimal or Citolab',
    /*
     * Deliberately no `defaultValue`. It would seed `globals.override` for every story, which
     * always outranks `parameters.styleSubstrate` and would render the Kennisnet VRT stories
     * with the wrong theme. Unset means "use the story's preferred substrate, else citolab" —
     * see the decorator above.
     */
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'vanilla', title: 'Vanilla minimal' },
        { value: 'citolab', title: 'Citolab' }
      ],
      dynamicTitle: true
    }
  }
};
