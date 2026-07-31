import { property } from 'lit/decorators.js';

import { applyDropzoneAutoSizing } from '../drag-drop-observables/utils/drag-drop.utils';

import type { LitElement } from 'lit';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

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

    #resizeObserver: ResizeObserver | null = null;
    #observed = new Set<Element>();
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
        hasChanged: measured => {
          const last = this.#lastWritten;
          if (last && last.height === measured.height && last.width === measured.width) return false;
          this.#lastWritten = measured;
          return true;
        }
      });

      this.#observeDraggables(draggables);
    }

    /**
     * Watch the chips, not the drops. A drop's size is downstream of a chip's, so observing drops
     * would be observing this mixin's own output — the loop the `#lastWritten` guard also defends.
     */
    #observeDraggables(draggables: HTMLElement[]): void {
      if (typeof ResizeObserver === 'undefined') return;

      this.#resizeObserver ??= new ResizeObserver(() => this.updateMinDimensionsForDropZones());

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
      // Not the written values: a re-connected element re-measures anyway, and clearing them would
      // only make the first pass after a move write properties that are already correct.
      super.disconnectedCallback();
    }
  }

  return DropzoneAutoSizeElement as Constructor<DropzoneAutoSize> & T;
};
