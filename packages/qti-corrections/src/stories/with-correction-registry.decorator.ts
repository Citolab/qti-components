import { nothing, render } from 'lit';

// `@qti-components/theme` only exports its index; the raw stylesheet is a build-time asset.
// eslint-disable-next-line import/no-relative-packages
import itemCss from '../../../qti-theme/src/item.css?inline';
import { correctionRegistry } from '../registry';

import type { Decorator } from '@storybook/web-components-vite';

/**
 * A scoped custom element registry — see
 * https://developer.chrome.com/blog/scoped-registries.
 *
 * Inside a shadow root created with this registry, `qti-choice-interaction` resolves to
 * `QtiChoiceInteractionCorrection` instead of the standard class registered globally. Because
 * the mapping lives in a scoped registry rather than the global one, it stays local to
 * these stories and never affects other stories on the page.
 *
 * A scoped registry is fully isolated: elements it doesn't define do *not* fall back to
 * the global registry, so every tag the stories render has to be listed here. Classes are
 * imported directly rather than read out of `customElements`, so a tag can never silently
 * resolve to nothing because its module happened not to be loaded yet.
 */
export { correctionRegistry };

/** Parsed once — every story's shadow root adopts the same sheet. */
const itemSheet = new CSSStyleSheet();
itemSheet.replaceSync(itemCss);

/**
 * Render markup into a host whose shadow root is backed by the scoped correction registry.
 *
 * The markup is assigned via `innerHTML` on purpose: the browser parses it in the shadow
 * root's context, so its custom elements upgrade against the scoped registry. (lit's
 * `render()` clones through `importNode`, which binds elements to the global registry at
 * creation time — the scoped mapping would be ignored.) That is why stories using this
 * decorator return markup strings rather than lit templates.
 *
 * The document's theme/layout CSS can't cross the shadow boundary, so `item.css` is adopted
 * into the shadow root, mirroring how `<item-container>` styles its own item shadow DOM.
 */
export const renderInCorrectionRegistry = (markup: string): HTMLElement => {
  const host = document.createElement('div');
  const shadow = host.attachShadow({
    mode: 'open',
    customElementRegistry: correctionRegistry
  });

  shadow.adoptedStyleSheets = [itemSheet];

  // Wrapped in a container element on purpose: `show-full-correct-response` inserts its
  // clone through `interaction.parentElement`, which is null for a direct child of a
  // shadow root. Real items always nest the interaction inside `qti-item-body`.
  shadow.innerHTML = `<div>${markup}</div>`;

  for (const container of shadow.querySelectorAll<HTMLElement & { customElementRegistry: CustomElementRegistry }>(
    'item-container, test-container'
  )) {
    container.customElementRegistry = correctionRegistry;
  }

  return host;
};

/**
 * Storybook decorator that renders a story's markup against the correction registry.
 *
 * Stories opting in must `render` a **markup string**, not a lit template:
 * ```ts
 * const meta: Meta = { decorators: [withCorrectionRegistry] };
 * export const Example: Story = { render: () => `<qti-choice-interaction …>` };
 * ```
 *
 * Play functions have to reach through the shadow boundary — use
 * {@link correctionCanvas} to get a query root.
 */
export const withCorrectionRegistry: Decorator = story => {
  const result = story() as unknown;
  if (typeof result === 'string') {
    return renderInCorrectionRegistry(result);
  }

  // Serialize Lit-authored legacy stories before parsing them inside the scoped root.
  // Event bindings are intentionally not carried across; the correction components'
  // own listeners are installed when the serialized markup upgrades in that root.
  const scratch = document.createElement('div');
  render(result as Parameters<typeof render>[0], scratch);
  const markup = scratch.innerHTML;
  render(nothing, scratch);
  return renderInCorrectionRegistry(markup);
};

/** The shadow root the decorator rendered a story into — the query root for play functions. */
export const correctionCanvas = (canvasElement: HTMLElement): HTMLElement =>
  canvasElement.querySelector('div')!.shadowRoot!.querySelector('div')!;
