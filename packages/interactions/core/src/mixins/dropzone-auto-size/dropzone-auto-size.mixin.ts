import { property } from 'lit/decorators.js';

import type { LitElement } from 'lit';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

/**
 * Measure the chips and publish the result as `--qti-dropzone-min-height` / `--qti-dropzone-min-width`.
 *
 * Lives here rather than in `drag-drop.utils` because this mixin is its only caller, and because
 * keeping it here is what makes the mixin an abstraction rather than a wiring layer: EVERYTHING that
 * knows how a dropzone gets its size is in this file, and the rest of the library knows only the two
 * custom properties. Drop the mixin from an interaction and its drops fall back to the theme's
 * declared defaults — see the note on both names in qti-variables.css — so nothing breaks and an
 * author can set the two properties by hand to size the drops themselves.
 *
 * JavaScript owns the *measurement*; CSS owns the *properties*. Each droppable's stylesheet reads
 * `min-height: var(--qti-dropzone-min-height)`, so nothing is written to a droppable's `style` and a
 * theme overrides by setting the variable closer.
 *
 * That also removes a precedence trap: when both `min-width` and `width` were written inline,
 * `min-width` silently won, discarding an authored `data-choices-container-width`.
 *
 * Exported for its spec only — the folder's `index.ts` names just the mixin, so this does not reach
 * the package's public surface.
 */
export function applyDropzoneAutoSizing(
  host: HTMLElement,
  draggables: HTMLElement[],
  droppables: HTMLElement[],
  dragContainers: HTMLElement[],
  options: {
    hostWindow?: Window | null;
    /**
     * Called with the measurement before anything is written; return false to skip the write. The
     * mixin uses it to suppress a no-op write, which is what keeps its `ResizeObserver` from feeding
     * itself.
     */
    hasChanged?: (measured: { height: number; width: number }) => boolean;
    /**
     * Publish the measured width. False when something else owns that axis — an authored
     * `data-choices-container-width` — in which case the height is still measured and published and
     * the width is simply never written.
     *
     * Not writing is deliberate, and replaces a "write then undo" arrangement that had the caller
     * zero the property afterwards. That only held while this ran exactly once and wrote to exactly
     * one element; re-measurement and a second write target each broke it independently.
     */
    publishWidth?: boolean;
  } = {}
): void {
  const publishWidth = options.publishWidth ?? true;
  const hostWindow = options.hostWindow ?? (typeof window !== 'undefined' ? window : null);
  if (!draggables.length || !droppables.length || !hostWindow) return;

  let maxDraggableHeight = 0;
  let maxDraggableWidth = 0;

  /*
   * Measure each chip at its INTRINSIC width, with any minimum this pass previously gave it
   * neutralised — otherwise the measurement reads its own output and the result is a one-way ratchet.
   *
   * `@mixin drag` gives a chip `min-width: var(--qti-dropzone-min-width)`, which is what makes a chip
   * and its slot the same size. It also means that once the widest chip has set the reservation,
   * every chip is at least that wide — so shortening the longest one can never bring the number back
   * down. Measured: a chip edited from 191px of text back to 106px left the reservation at 191px
   * forever, and with it every chip and every drop.
   *
   * Growing was never the problem; not being able to shrink was. Nothing paints between the
   * neutralise and the restore, so this is invisible.
   *
   * The neutralise goes on the SLOT — never as an inline `min-width` on each chip, and never on the
   * host — and that is load-bearing under ProseMirror. A chip is a light-DOM node the editor's
   * document owns, and ProseMirror's DOMObserver runs with `attributes: true` over its subtree: a
   * `style` attribute it did not author marks the node dirty, it re-renders from the doc, and the
   * re-render re-triggers whatever measured. That loop freezes the tab. Pointing
   * `dropzonePropertyTarget()` at a shadow node is not enough on its own, because that only moves
   * where the RESULT lands, not where the measurement pokes.
   *
   * A slot is always inside the shadow root and is the chips' parent in the flat tree, so setting the
   * property to 0 there reaches exactly the chips being measured, by the same inheritance that
   * delivers the reservation itself — `@mixin drag` is the only rule that gives a chip a min-width,
   * it reads exactly this property, and nothing sets it closer. `MenuAutoSizeMixin` writes to a
   * shadow node for the same reason; this is that rule applied to the measurement, not just the
   * result.
   *
   * `dragContainers` is the slot list the caller already collected (and already writes a min-height
   * to). With none supplied there is nothing between here and the chips, so fall back to the target.
   */
  const neutraliseOn: HTMLElement[] = dragContainers.length ? dragContainers : [host];
  const restore = neutraliseOn.map(el => ({
    el,
    reservation: el.style.getPropertyValue('--qti-drag-min-width'),
    hadStyleAttribute: el.hasAttribute('style')
  }));
  // --qti-drag-min-width, because that is the name `@mixin drag` reads. Zeroing the dropzone name
  // here would leave the chips at whatever the theme's default gives them and measure that instead.
  neutraliseOn.forEach(el => el.style.setProperty('--qti-drag-min-width', '0px'));

  draggables.forEach(draggable => {
    const rect = draggable.getBoundingClientRect();
    maxDraggableHeight = Math.max(maxDraggableHeight, rect.height);
    maxDraggableWidth = Math.max(maxDraggableWidth, rect.width);
  });

  /*
   * Put it back before the early return below, so a pass that changes nothing leaves no trace.
   *
   * "No trace" includes the attribute itself: removing the last property off `style` leaves an empty
   * `style=""` behind, and an empty attribute is still an attribute — still a mutation record for
   * ProseMirror, and still a broken invariant for the spec that asserts a skipped pass writes
   * nothing at all.
   */
  restore.forEach(({ el, reservation, hadStyleAttribute }) => {
    if (reservation) el.style.setProperty('--qti-drag-min-width', reservation);
    else el.style.removeProperty('--qti-drag-min-width');
    if (!hadStyleAttribute && el.getAttribute('style') === '') el.removeAttribute('style');
  });

  if (options.hasChanged?.({ height: maxDraggableHeight, width: maxDraggableWidth }) === false) return;

  /*
   * Measured values go on `host` as custom properties; each droppable's own stylesheet reads them.
   *
   * `host` is not necessarily the interaction: custom properties inherit down the flat tree, so any
   * ancestor of the drops will do, and a host whose own attributes are policed (the editor, under
   * ProseMirror) passes a node inside its shadow root instead.
   *
   * Both axes, for every dropzone. `--qti-dropzone-min-width` used to reach only gaps and the match
   * grid, so order's and associate's drops were tall enough for the largest chip but not wide enough
   * for it, and a drop grew sideways the moment one landed.
   */
  host.style.setProperty('--qti-dropzone-min-height', `${maxDraggableHeight}px`);
  if (publishWidth) {
    // Both width names get the same measured value. They exist as two names only so their
    // UNMEASURED defaults can differ — a chip keeps its natural width, a drops-grid track must not
    // collapse — and writing both here is what keeps a chip the same size as its slot.
    host.style.setProperty('--qti-dropzone-min-width', `${maxDraggableWidth}px`);
    host.style.setProperty('--qti-drag-min-width', `${maxDraggableWidth}px`);
  }

  dragContainers.forEach(dragContainer => {
    dragContainer.style.minHeight = `var(--qti-drag-container-min-height, ${maxDraggableHeight}px)`;

    /*
     * The reservation lands here as well, and that is what lets a host keep every write inside its
     * shadow root.
     *
     * A chip reads `--qti-dropzone-min-width` (`@mixin drag`) and its parent in the flat tree is this
     * slot, so publishing here reaches the chips without needing an ancestor that also contains the
     * drops. gap-match and associate have no such ancestor — their drags slot and their drops are
     * siblings under the shadow root — so before this they had to publish on the interaction host to
     * reach both, which is a light-DOM node the editor's ProseMirror document owns. Now they point
     * `dropzonePropertyTarget()` at the DROPS and the chips are still covered from here.
     *
     * In the runtime nothing changes: the value is the same one the host publishes, so a chip that
     * used to inherit it from the host now inherits the identical value from a closer element.
     */
    dragContainer.style.setProperty('--qti-dropzone-min-height', `${maxDraggableHeight}px`);
    if (publishWidth) {
      dragContainer.style.setProperty('--qti-dropzone-min-width', `${maxDraggableWidth}px`);
      dragContainer.style.setProperty('--qti-drag-min-width', `${maxDraggableWidth}px`);
    }
  });
}

/** The elements a measurement pass looks at. */
export interface DropzoneAutoSizeTargets {
  /** Measured. The largest of these decides the reservation. */
  draggables: HTMLElement[];
  /** Not measured — only their presence gates the pass (nothing to reserve for, nothing to do). */
  droppables: HTMLElement[];
  /** The chip banks, which get a matching `min-height` so an emptied bank does not collapse. */
  dragContainers: HTMLElement[];
}

export type DropzoneAutoSize = LitElement & {
  autoSizeDropzones: boolean;
  /**
   * False when something else owns the width axis — see the class below.
   *
   * Declared as an accessor, not a `readonly` property. The class implements it as a getter and
   * `DragDropSlottedMixin` overrides it with another getter; a property here makes that override a
   * TS2611 ("defined as a property in the base, overridden as an accessor").
   */
  get autoSizeDropzoneWidth(): boolean;
  updateMinDimensionsForDropZones(): void;
  /** Overridable hooks — see the class below. Public because a subclass has to be able to say
   *  `override`, which the house style already does for `afterCache` and `isDragDropEnabled`. */
  collectAutoSizeTargets(): DropzoneAutoSizeTargets;
  dropzonePropertyTarget(): HTMLElement;
};

/**
 * Publishes `--qti-dropzone-min-height` / `--qti-dropzone-min-width` from the measured chips, and
 * keeps them up to date as the chips change size.
 *
 * ── Why this is a mixin of its own ───────────────────────────────────────────────────────────
 *
 * It used to be two members of `DragDropSlottedMixin`, reachable only by inheriting the whole
 * drag-drop stack. The editor needs exactly this and none of the rest: it renders the same
 * elements, imports the same stylesheets — so its drops already read
 * `min-height: var(--qti-dropzone-min-height, 0)` — but it does its own drag handling inside a
 * ProseMirror document. Splitting the measurement out means both sides run the same code instead of
 * the editor growing a parallel copy that drifts.
 *
 * ── When it runs ─────────────────────────────────────────────────────────────────────────────
 *
 * On mount, and then whenever a chip changes size. The second half is new: the only trigger used to
 * be `connectedCallback → setupDragDrop → afterCache`, so a chip that changed size after first paint
 * never re-measured and its drop stayed the wrong size. That bites an author typing into a chip in
 * the editor, and it bites a delivered item too — a late-loading image or a web-font swap does the
 * same thing.
 *
 * A `ResizeObserver` over the chips is the trigger, because it catches all three causes (text
 * reflow, image load, font swap) in one mechanism. A `MutationObserver` would need
 * `characterData: true` and would still miss the image. The dead legacy mixin at
 * `mixins/drag-drop/drag-drop-interaction-mixin.ts` used both and still caught neither reliably.
 *
 * ── Where the properties land ────────────────────────────────────────────────────────────────
 *
 * On `dropzonePropertyTarget()`, which defaults to the host. Custom properties inherit down the flat
 * tree, so any element that is an ancestor of the drops works — and the editor needs that, because
 * writing `style` on a ProseMirror-managed host is reverted by its mutation observer, and the revert
 * re-triggers the observer that wrote it. There it returns a node inside the shadow root instead,
 * which a mutation observer on the document cannot see.
 */
export const DropzoneAutoSizeMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  draggablesSelector: string,
  droppablesSelector: string,
  dragContainersSelector = 'slot[part="drags"]'
) => {
  abstract class DropzoneAutoSizeElement extends superClass {
    @property({ type: Boolean, attribute: 'auto-size-dropzones' })
    /**
     * Size the dropzones from the chips they will hold.
     *
     * On by default: a drop that is already as big as the largest chip does not resize when one
     * lands in it — the invariant `drag-drop.invariance.spec.ts` calls "an empty drop is already the
     * size of the chip it will hold". With it off, a dropzone falls back to whatever floor its own
     * stylesheet declares.
     */
    public autoSizeDropzones = true;

    /**
     * Size the dropzones' WIDTH from the chips. Separate from `autoSizeDropzones` because the two
     * axes can have different owners: `data-choices-container-width` is an explicit authoring
     * instruction about width alone, and the height should still be measured under it.
     *
     * A subclass that overrides this to false gets no `--qti-dropzone-min-width` written at all —
     * rather than one written and then zeroed by whoever runs next. That distinction is the point.
     * The old arrangement held only while this pass ran exactly once, and wrote to exactly one
     * element; re-measurement broke the first assumption and publishing on the drag containers
     * broke the second, each time by silently discarding the authored width.
     */
    public get autoSizeDropzoneWidth(): boolean {
      return true;
    }

    #resizeObserver: ResizeObserver | null = null;
    #observed = new Set<Element>();
    #contentObserver: MutationObserver | null = null;
    #pendingFrame = 0;
    /**
     * The last values written, so a measurement that changed nothing writes nothing.
     *
     * Without this the observer feeds itself: setting a min-height changes layout, layout change
     * fires the observer, and the browser reports `ResizeObserver loop limit exceeded`. The editor
     * has a note about a chatty observer causing exactly this in tabular match.
     */
    #lastWritten: { height: number; width: number } | null = null;

    /**
     * The elements to measure. Overridden by a host that already tracks them — the drag-drop stack
     * caches these on every `cacheInteractiveElements()`, and re-querying would be a second, slightly
     * different answer to the same question.
     */
    public collectAutoSizeTargets(): DropzoneAutoSizeTargets {
      const collect = (selector: string, scope: ParentNode | null | undefined): HTMLElement[] =>
        Array.from(scope?.querySelectorAll<HTMLElement>(selector) ?? []);

      return {
        draggables: [...collect(draggablesSelector, this), ...collect(draggablesSelector, this.shadowRoot)],
        droppables: [...collect(droppablesSelector, this), ...collect(droppablesSelector, this.shadowRoot)],
        dragContainers: [...collect(dragContainersSelector, this), ...collect(dragContainersSelector, this.shadowRoot)]
      };
    }

    /**
     * Where the measured custom properties are written. The host, unless a subclass says otherwise —
     * see the note on ProseMirror in this file's header.
     */
    public dropzonePropertyTarget(): HTMLElement {
      return this;
    }

    public updateMinDimensionsForDropZones(): void {
      if (!this.autoSizeDropzones) return;

      const { draggables, droppables, dragContainers } = this.collectAutoSizeTargets();
      if (draggables.length === 0) return;

      applyDropzoneAutoSizing(this.dropzonePropertyTarget(), draggables, droppables, dragContainers, {
        publishWidth: this.autoSizeDropzoneWidth,
        hasChanged: measured => {
          const last = this.#lastWritten;
          if (last && last.height === measured.height && last.width === measured.width) return false;
          this.#lastWritten = measured;
          return true;
        }
      });

      this.#observeDraggables(draggables);
      this.#observeContent();
    }

    /**
     * Re-measure when the CHIPS THEMSELVES change — one added, removed, or its text edited.
     *
     * The ResizeObserver below cannot see any of that. It only knows the chips it was handed on the
     * last pass, so a chip that did not exist then is not observed, and nothing brings it to
     * attention. In a delivered item that barely matters — the set is fixed by the markup. In an
     * editor it is the normal case: an author adds a drag by pressing Enter, and types into it.
     *
     * `characterData` and `subtree` as well as `childList`, so editing the text of an existing chip
     * counts and not only adding one.
     *
     * This cannot feed itself: it observes the light DOM under this element, and the measurements
     * are written to `dropzonePropertyTarget()` — the host's own style in the runtime, a shadow node
     * in the editor. A MutationObserver does not cross into a shadow root, and a host's `style`
     * attribute is not in its own observed subtree.
     *
     * Coalesced to one measurement per frame: both observers can fire for the same edit, and a
     * measurement forces layout.
     *
     * Caveat worth knowing: this measures whatever `collectAutoSizeTargets()` returns. The drag-drop
     * stack overrides that with its cached lists, which a bare DOM insertion does not refresh — so
     * there a brand-new chip is measured on the next pass that re-caches, not on this one. A host
     * using the default, query-based implementation (the editor) always sees the current DOM.
     */
    #observeContent(): void {
      if (typeof MutationObserver === 'undefined' || this.#contentObserver) return;

      this.#contentObserver = new MutationObserver(() => this.#scheduleMeasure());
      this.#contentObserver.observe(this, { childList: true, subtree: true, characterData: true });
    }

    #scheduleMeasure(): void {
      if (this.#pendingFrame) return;
      this.#pendingFrame = requestAnimationFrame(() => {
        this.#pendingFrame = 0;
        this.updateMinDimensionsForDropZones();
      });
    }

    /**
     * Watch the chips, not the drops. A drop's size is downstream of a chip's, so observing drops
     * would be observing this mixin's own output — the loop the `#lastWritten` guard also defends.
     */
    #observeDraggables(draggables: HTMLElement[]): void {
      if (typeof ResizeObserver === 'undefined') return;

      this.#resizeObserver ??= new ResizeObserver(() => this.#scheduleMeasure());

      const next = new Set<Element>(draggables);
      for (const el of this.#observed) {
        if (!next.has(el)) this.#resizeObserver.unobserve(el);
      }
      for (const el of next) {
        if (!this.#observed.has(el)) this.#resizeObserver.observe(el);
      }
      this.#observed = next;
    }

    public override disconnectedCallback(): void {
      this.#resizeObserver?.disconnect();
      this.#resizeObserver = null;
      this.#observed.clear();
      this.#contentObserver?.disconnect();
      this.#contentObserver = null;
      if (this.#pendingFrame) cancelAnimationFrame(this.#pendingFrame);
      this.#pendingFrame = 0;
      // Not the written values: a re-connected element re-measures anyway, and clearing them would
      // only make the first pass after a move write properties that are already correct.
      super.disconnectedCallback();
    }
  }

  return DropzoneAutoSizeElement as Constructor<DropzoneAutoSize> & T;
};
