/**
 * Custom-state support shim for browsers this library cannot use natively.
 *
 * Interactions track selection and correct/incorrect marking through
 * `internals.states`, with bare state names (`checked`, `radio`,
 * `correct-response`, …). Two browser profiles cannot service that:
 *
 * - Safari 16.4–17.3 implement `ElementInternals` but not `CustomStateSet`, so
 *   `internals.states` is `undefined` and reading it throws — "undefined is not
 *   an object (evaluating 'internals.states.has')".
 * - Chrome and Edge before the CSS custom-state spec change expose `states` but
 *   reject names that do not start with `--`, so `states.add('radio')` throws
 *   "The specified value 'radio' must start with '--'".
 *
 * On both, picking a choice throws rather than registering. `attachInternals`
 * itself is unguarded throughout the interaction base classes, which puts the
 * hard support floor at Safari 16.4 — inside the range that breaks.
 *
 * The shim replaces `states` with a permissive `Set` and mirrors its contents to
 * a space-separated `data-state` attribute on the host, because these browsers'
 * CSS parsers also drop any selector list containing `:state()`. The theme's
 * built stylesheets pair every `:state(x)` with a `[data-state~='x']` arm (see
 * `tools/postcss/custom-state-fallback.mjs`), so styling survives too.
 *
 * Support is classified by behaviour rather than by browser version, and the
 * shim is not installed at all where `states` works.
 */

/** A permissive `CustomStateSet` that mirrors its contents to `data-state`. */
export class CustomStateSetShim extends Set<string> {
  readonly #host: HTMLElement;

  constructor(host: HTMLElement) {
    super();
    this.#host = host;
  }

  override add(state: string): this {
    super.add(state);
    this.#reflect();
    return this;
  }

  override delete(state: string): boolean {
    const deleted = super.delete(state);
    this.#reflect();
    return deleted;
  }

  override clear(): void {
    super.clear();
    this.#reflect();
  }

  #reflect(): void {
    // A custom element must not gain attributes while it is upgrading, so defer
    // the write until the element is connected.
    if (this.#host.isConnected) this.#write();
    else queueMicrotask(() => this.#write());
  }

  #write(): void {
    if (this.size === 0) this.#host.removeAttribute('data-state');
    else this.#host.setAttribute('data-state', Array.from(this).join(' '));
  }
}

export type CustomStateSupport = 'missing' | 'legacy' | 'modern';

const PROBE_TAG = 'custom-state-support-probe';

/**
 * Classify native custom-state support by behaviour:
 *
 * - `missing`: `ElementInternals` carries no `states` at all.
 * - `legacy`: `states` exists but rejects a bare name.
 * - `modern`: `states` exists and accepts a bare name — no shim wanted.
 *
 * `attachInternals` only works on a custom element, so the probe registers a
 * throwaway one. That happens solely when `states` is present, so the `missing`
 * path never defines anything.
 */
export function classifyCustomStateSupport(
  attachInternals: (this: HTMLElement) => ElementInternals
): CustomStateSupport {
  if (!('states' in ElementInternals.prototype)) return 'missing';
  if (typeof customElements === 'undefined') return 'modern';

  try {
    if (!customElements.get(PROBE_TAG)) customElements.define(PROBE_TAG, class extends HTMLElement {});
    const states = attachInternals.call(document.createElement(PROBE_TAG)).states;
    if (!states) return 'missing';
    // A bare name throws SyntaxError under the legacy spec and never does under
    // the current one, so classify on the throw alone — not on whether the value
    // sticks, which some environments do not honour on a detached element.
    states.add('probe');
    states.delete('probe');
    return 'modern';
  } catch {
    return 'legacy';
  }
}

let installed = false;

/**
 * Patch `HTMLElement.prototype.attachInternals` so every element's `states` is
 * the shim, on the two profiles that need it. Idempotent, and a no-op where
 * native support is usable.
 *
 * Returns the classification that was acted on, which is what the tests assert.
 */
export function installCustomStateSetFallback(): CustomStateSupport | 'already-installed' {
  if (installed) return 'already-installed';
  if (typeof HTMLElement === 'undefined' || typeof ElementInternals === 'undefined') return 'modern';

  const native = HTMLElement.prototype.attachInternals;
  if (!native) return 'modern';

  const support = classifyCustomStateSupport(native);
  if (support === 'modern') return support;

  installed = true;
  HTMLElement.prototype.attachInternals = function attachInternals(this: HTMLElement): ElementInternals {
    const internals = native.call(this);
    Object.defineProperty(internals, 'states', {
      configurable: true,
      enumerable: true,
      value: new CustomStateSetShim(this)
    });
    return internals;
  };

  return support;
}
