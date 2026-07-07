import type { Decorator, Preview } from '@storybook/web-components-vite';

/**
 * Web-component inspect toolbar extension.
 *
 * Adds three independent toolbar toggles that draw a debug overlay on top of the live
 * story, one box per finding, without touching the story DOM itself:
 *
 * - Parts:  every element carrying a `part="…"` attribute (inside any shadow root),
 *           labelled with its part name. Useful for seeing what a theme can `::part()`.
 * - States: custom-element instances whose `ElementInternals.states` (the CustomStateSet
 *           set via `attachInternals()`, e.g. `--checked`) is non-empty, labelled with the
 *           live state list. These are what `:state(--checked)` selectors hook onto.
 * - Roles:  custom-element instances exposing an `ElementInternals.role` / `aria*` value
 *           (also from `attachInternals()`), labelled with the computed a11y semantics.
 *
 * The toggles compose freely (they read like three checkboxes). Enable any combination.
 *
 * ElementInternals is per-instance and private to the element, so we can only read it when
 * the component exposes it. This repo standardises on a public `internals` accessor across
 * the component hierarchy (ActiveElementMixin, qti-base Interaction, qti-test components),
 * so every internals-bearing element is reachable here.
 *
 * Each toggle is a two-item (off / on) toolbar control, so the three read as independent
 * checkboxes that compose freely.
 */
const OVERLAY_ID = 'wc-inspect-overlay';

const COLORS = {
  parts: '#e5488a', // pink
  states: '#1f883d', // green
  roles: '#0969da' // blue
};

// ARIA reflection properties exposed on ElementInternals (ARIAMixin). Enumerated explicitly
// because they are accessor properties, not own-enumerable keys, so a spread/loop misses them.
const ARIA_PROPS = [
  'ariaChecked',
  'ariaSelected',
  'ariaDisabled',
  'ariaExpanded',
  'ariaPressed',
  'ariaHidden',
  'ariaLabel',
  'ariaDescription',
  'ariaRequired',
  'ariaInvalid',
  'ariaReadOnly',
  'ariaMultiSelectable',
  'ariaOrientation',
  'ariaValueNow',
  'ariaValueMin',
  'ariaValueMax',
  'ariaValueText',
  'ariaSort',
  'ariaLive',
  'ariaCurrent',
  'ariaPosInSet',
  'ariaSetSize',
  'ariaHasPopup',
  'ariaLevel',
  'ariaBusy'
] as const;

type Flags = { parts: boolean; states: boolean; roles: boolean };

/** Walk every element under `root`, descending into open shadow roots. */
const eachElement = (root: ParentNode, cb: (el: HTMLElement) => void) => {
  root.querySelectorAll('*').forEach(el => {
    cb(el as HTMLElement);
    const sr = (el as HTMLElement).shadowRoot;
    if (sr) eachElement(sr, cb);
  });
};

/** Public ElementInternals handle, if the component exposes one. */
const getInternals = (el: HTMLElement): ElementInternals | undefined =>
  (el as unknown as { internals?: ElementInternals }).internals;

const chipStyle = (color: string) =>
  `display:inline-block;background:${color};color:#fff;padding:0 4px;border-radius:2px;` +
  `white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.35);`;

/** One outlined box pinned to an element's viewport rect, with a stack of labels above it. */
const drawBox = (overlay: HTMLElement, el: HTMLElement, color: string, labels: { text: string; color: string }[]) => {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  const box = document.createElement('div');
  // position:fixed → rect coords map 1:1 to the viewport, so scrolling stays aligned.
  box.style.cssText =
    `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;` +
    `box-sizing:border-box;border:1px solid ${color};pointer-events:none;`;

  const stack = document.createElement('div');
  stack.style.cssText =
    'position:absolute;left:-1px;bottom:100%;display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding-bottom:1px;';
  for (const label of labels) {
    const chip = document.createElement('span');
    chip.textContent = label.text;
    chip.style.cssText = chipStyle(label.color);
    stack.appendChild(chip);
  }
  box.appendChild(stack);
  overlay.appendChild(box);
};

const render = (flags: Flags) => {
  document.getElementById(OVERLAY_ID)?.remove();

  // Never paint into an addon-vitest capture — the overlay is a human review tool only.
  if ((globalThis as { __vitest_browser__?: unknown }).__vitest_browser__) return;
  if (!flags.parts && !flags.states && !flags.roles) return;

  const root = document.getElementById('storybook-root') ?? document.body;

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:2147483646;pointer-events:none;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;';
  document.body.appendChild(overlay);

  eachElement(root, el => {
    // Parts live on (possibly non-custom) shadow-internal elements.
    if (flags.parts && el.hasAttribute('part')) {
      drawBox(overlay, el, COLORS.parts, [{ text: `part="${el.getAttribute('part')}"`, color: COLORS.parts }]);
    }

    // States + roles hang off the custom-element host via ElementInternals.
    if ((flags.states || flags.roles) && el.tagName.includes('-')) {
      const internals = getInternals(el);
      if (!internals) return;

      const labels: { text: string; color: string }[] = [];

      if (flags.states) {
        const states = internals.states ? (Array.from(internals.states as Iterable<string>) as string[]) : [];
        if (states.length) labels.push({ text: `:state ${states.join(' ')}`, color: COLORS.states });
      }

      if (flags.roles) {
        const bits: string[] = [];
        if (internals.role) bits.push(`role=${internals.role}`);
        for (const prop of ARIA_PROPS) {
          const value = (internals as unknown as Record<string, string | null>)[prop];
          if (value != null && value !== '') bits.push(`${prop.replace(/^aria/, '').toLowerCase()}=${value}`);
        }
        if (bits.length) labels.push({ text: bits.join(' '), color: COLORS.roles });
      }

      if (labels.length) {
        // Prefer the highest-priority category colour for the box outline.
        const outline = flags.states && labels[0]?.color === COLORS.states ? COLORS.states : COLORS.roles;
        drawBox(overlay, el, outline, labels);
      }
    }
  });
};

// Re-run the overlay (glued to elements, re-reading live internals) while it is active.
let activeFlags: Flags = { parts: false, states: false, roles: false };
let scheduled = false;
const refresh = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    if (activeFlags.parts || activeFlags.states || activeFlags.roles) render(activeFlags);
  });
};

// CustomStateSet fires no change event, so we can't observe `internals.states` directly.
// Instead we refresh off the *causes* of state changes. In this codebase every transition is
// downstream of a user interaction (`--checked` on click/keyup) or an attribute flip
// (`show-correct-response` etc.) — all of which surface here as composed, bubbling events.
// The rAF in refresh() runs after the component's own handlers, so states are already settled.
const STATE_TRIGGERS = ['click', 'keyup', 'input', 'change'] as const;
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', refresh, true);
  window.addEventListener('resize', refresh);
  for (const type of STATE_TRIGGERS) window.addEventListener(type, refresh, true);
}

const isOn = (v: unknown) => v === 'on';

export const webComponentInspectDecorator: Decorator = (story, context) => {
  activeFlags = {
    parts: isOn(context.globals.inspectParts),
    states: isOn(context.globals.inspectStates),
    roles: isOn(context.globals.inspectRoles)
  };
  // Re-evaluate after the story has painted so internals/states reflect the rendered state.
  requestAnimationFrame(() => render(activeFlags));
  return story();
};

type ToggleConfig = NonNullable<Preview['globalTypes']>[string];
type ToolbarIcon = NonNullable<NonNullable<ToggleConfig['toolbar']>['icon']>;

const toggle = (name: string, description: string, icon: ToolbarIcon): ToggleConfig => ({
  name,
  description,
  defaultValue: 'off',
  toolbar: {
    icon,
    items: [
      { value: 'off', title: `${name}: off` },
      { value: 'on', title: `${name}: on` }
    ],
    dynamicTitle: true
  }
});

export const webComponentInspectGlobalTypes: Preview['globalTypes'] = {
  inspectParts: toggle('Parts', 'Outline every [part] element in the shadow DOM', 'component'),
  inspectStates: toggle('States', 'Show ElementInternals custom states (e.g. --checked)', 'lightning'),
  inspectRoles: toggle('Roles', 'Show ElementInternals role / aria semantics', 'accessibility')
};
