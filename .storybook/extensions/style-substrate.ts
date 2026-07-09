import itemCss from '../../packages/qti-theme/src/item.css?inline';
import minimalCss from '../../packages/qti-theme/src/minimal.css?inline';
import nativeCss from '../../packages/qti-theme/src/native.css?inline';
import kennisnetOverrideHref from '../../packages/qti-theme/src/kennisnet-override.scss?url';

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
 * - vanilla:   `native.css` + the minimal variable theme. The lightest styled baseline.
 * - citolab:   full qti-theme (`item.css`, which includes native) + minimal normalize reset.
 *   Default: the theme's own look, with no vendor stylesheet in the cascade.
 * - kennisnet: full qti-theme + single self-contained override file — pulls Bootstrap +
 *   Wikiwijs bridge + FontAwesome glyph CDN URLs internally (see kennisnet-override.scss).
 *   Not the default: its Bootstrap import restyles the item body and shifts layout, which
 *   perturbs layout-sensitive stories. Removing that dependency is tracked in
 *   `plans/css-contract-audit.md`.
 */
const OVERRIDE_LINK_CLASS = 'qti-vendor-override';
const THEME_STYLE_ID = 'qti-theme-style';
const vanillaMinimalCss = `${nativeCss}\n${minimalCss}`;

const SUBSTRATES: Record<string, { baseCss: string; overrides: string[] }> = {
  vanilla: { baseCss: vanillaMinimalCss, overrides: [] },
  citolab: { baseCss: itemCss, overrides: ['https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.css'] },
  kennisnet: { baseCss: itemCss, overrides: [kennisnetOverrideHref] }
};

/*
 * Resolution order:
 *   1. `globals.override` — the toolbar picker, whenever the user has made a choice.
 *   2. `parameters.styleSubstrate` — a story's preferred substrate (e.g. the Kennisnet VRT
 *      baselines). Use this rather than meta-level `globals`, which since Storybook 8.3
 *      *locks* the toolbar control for that story and stops you switching themes.
 *   3. `citolab` — the theme's own look, no vendor stylesheet in the cascade.
 */
export const styleSubstrateDecorator: Decorator = (story, context) => {
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
  for (const href of wantHrefs) {
    if (existingHrefs.includes(href)) continue;
    const link = document.createElement('link');
    link.className = OVERRIDE_LINK_CLASS;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  return story();
};

export const styleSubstrateGlobalTypes: Preview['globalTypes'] = {
  override: {
    name: 'Style',
    description: 'Choose the style substrate: Vanilla minimal, Citolab, or Kennisnet',
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
        { value: 'citolab', title: 'Citolab' },
        { value: 'kennisnet', title: 'Kennisnet' }
      ],
      dynamicTitle: true
    }
  }
};
