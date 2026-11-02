import { css, html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { property } from 'lit/decorators.js';
import { computedContext } from '@citolab/qti-components/qti-base';
import { controlStyles as styles, dispatchPublic } from '@citolab/qti-components/qti-test/plugin-api';

import type { ComputedContext } from '@citolab/qti-components/qti-base';

/**
 * The zoom level of the items, 1 is 100%: the plugin's entry in the test's state
 * (`session.plugins.zoom`, absent at 100%). For a host that shows it, or scales something of its own
 * with it.
 */
export const zoomLevel = (context: Pick<ComputedContext, 'plugins'> | undefined): number => {
  const level = context?.plugins?.zoom;
  return typeof level === 'number' ? level : 1;
};

/** Rounded to a tenth, so a step up and a step down meet again. */
const round = (level: number) => Math.round(level * 100) / 100;

/**
 * Scales the rendered items with the CSS `zoom` property. Every item the context knows and that is on the
 * page gets the level, so it holds for one item at a time and for a whole section on screen; the item that is
 * rendered next gets it too, because the context updates when it has rendered.
 */
const applyZoom = (context: ComputedContext | undefined) => {
  if (!context?.itemElement) return;
  const level = zoomLevel(context);
  for (const part of context.testParts ?? [])
    for (const section of part.sections)
      for (const item of section.items) {
        const element = context.itemElement(item.identifier);
        if (!element) continue;
        if (level === 1) element.style.removeProperty('zoom');
        else element.style.setProperty('zoom', String(level));
      }
};

/**
 * The zoom plugin: three buttons that scale the items (`zoom-in`, `zoom-out`, `zoom-reset`), for a
 * candidate who wants the text and the pictures larger. The level lives in the test's state under `zoom`
 * (`session.plugins.zoom`), so a host that stores `state` stores it and a reloaded test shows the items at
 * the same size. At 100% the entry is removed.
 *
 * The items are scaled with the CSS `zoom` property on each rendered `qti-assessment-item`, so the layout
 * of the page around them does not move. A host that wants to scale something of its own reads the level
 * with `zoomLevel(computedContext)`, or as `test.plugins.zoom` in a stamp template.
 *
 * Put the buttons inside `<test-navigation>`. Each is a button (`role="button"`) with its content as the
 * label; `test-zoom-reset` shows the level (`100%`) when it has no content of its own. `step`, `min` and
 * `max` on a button set how far it goes (defaults 0.1, 0.5 and 2); it is `disabled` at its end.
 */
abstract class TestZoomControl extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  @property({ attribute: false })
  protected computedContext?: ComputedContext;

  /** How much one press changes the level. */
  @property({ type: Number }) step = 0.1;

  /** The smallest level `zoom-out` reaches. */
  @property({ type: Number }) min = 0.5;

  /** The largest level `zoom-in` reaches. */
  @property({ type: Number }) max = 2;

  @property({ type: Boolean, reflect: true }) disabled = false;

  static override styles = [styles.button];

  constructor() {
    super();
    this.addEventListener('click', () => this.#press());
    this.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      this.#press();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'button');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
  }

  protected get level(): number {
    return zoomLevel(this.computedContext);
  }

  /** The level this button goes to, or `undefined` when it is at its end. */
  protected abstract next(): number | undefined;

  protected override willUpdate(): void {
    this.disabled = this.next() === undefined;
  }

  protected override updated(): void {
    this.setAttribute('aria-disabled', String(this.disabled));
    applyZoom(this.computedContext);
  }

  #press(): void {
    const level = this.next();
    if (level === undefined) return;
    // 100% is the default, so the state keeps no entry for it.
    dispatchPublic(this, 'qc-test-update-plugin-state', { plugin: 'zoom', value: level === 1 ? null : level });
  }

  override render() {
    return styles.control;
  }
}

/** @attr step - How much one press adds to the level (default 0.1). @attr max - The largest level (default 2). */
export class TestZoomIn extends TestZoomControl {
  protected next(): number | undefined {
    const level = round(this.level + this.step);
    return this.level < this.max ? Math.min(level, this.max) : undefined;
  }
}

/** @attr step - How much one press takes off the level (default 0.1). @attr min - The smallest level (default 0.5). */
export class TestZoomOut extends TestZoomControl {
  protected next(): number | undefined {
    const level = round(this.level - this.step);
    return this.level > this.min ? Math.max(level, this.min) : undefined;
  }
}

/** Back to 100%. Shows the level when it has no content of its own; never disabled, so the level always reads well. */
export class TestZoomReset extends TestZoomControl {
  static override styles = [
    styles.button,
    css`
      .control {
        font-variant-numeric: tabular-nums;
      }
    `
  ];

  protected next(): number {
    return 1;
  }

  override render() {
    return html`<span class="control" part="button"><slot>${Math.round(this.level * 100)}%</slot></span>`;
  }
}

/** The zoom elements, for registering them yourself (e.g. in a scoped registry). Defines nothing. */
export const zoomElements = [
  { tag: 'test-zoom-in', ctor: TestZoomIn },
  { tag: 'test-zoom-out', ctor: TestZoomOut },
  { tag: 'test-zoom-reset', ctor: TestZoomReset }
] as const;

declare global {
  interface HTMLElementTagNameMap {
    'test-zoom-in': TestZoomIn;
    'test-zoom-out': TestZoomOut;
    'test-zoom-reset': TestZoomReset;
  }
}
