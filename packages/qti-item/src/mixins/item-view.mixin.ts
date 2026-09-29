import { property } from 'lit/decorators.js';

import type { LitElement, PropertyValues } from 'lit';
import type { View } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class ItemViewInterface {
  view: View;
  updateAssessmentItemView(assessmentItem: QtiAssessmentItem, view: View): void;
}

/**
 * The audience a standalone item is presented to — the item-level counterpart of
 * `TestViewMixin`.
 *
 * QTI tags view-specific content with a `view` attribute (`qti-rubric-block view="scorer"` is
 * the common one: the answer model a marker reads). The item stylesheet hides every `[view]`
 * element and reveals it again through a `.show` class, so something has to put that class on.
 * Inside a test `TestViewMixin` does it off `sessionContext.view`. An item delivered on its own
 * has no session, and before this mixin nothing at item level did it either — the hide shipped
 * in `item.css` without its matching show, so a rubric block in a standalone item could not be
 * displayed at all, by any public API. That is what this closes.
 *
 * Deliberately a plain property rather than a session context: a session is the thing a
 * standalone item does not have, and `<qti-item view="scorer">` is the whole API.
 *
 * The view is not itself a correction concept: it says which audience the item is for, and what
 * that implies about answer keys is a separate question with a different answer per audience. So
 * this mixin only resolves the view and paints nothing. Packages that add
 * view-dependent presentation hook in through {@link updateAssessmentItemView}; that is where
 * `@qti-components/corrections` pairs `scorer` with the answer key, exactly as
 * `QtiTestCorrection` does at test level.
 */
export const ItemViewMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  abstract class ItemViewClass extends superClass implements ItemViewInterface {
    /**
     * Not reflected, and never read back off the host: `[view]` in the item stylesheet is a
     * content marker, and a `view` attribute written onto the host would read as one.
     * `item-structure.css` excludes `qti-item` for the same reason.
     */
    @property({ type: String }) view: View = 'candidate';

    /**
     * Tracked here rather than taken from `QtiItem.assessmentItem` so the mixin composes onto
     * any host — the same reason `TestViewMixin` listens for this event itself instead of
     * reading the navigation's active item.
     */
    #assessmentItem?: QtiAssessmentItem;

    constructor(...args: any[]) {
      super(...args);

      this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
        this.#assessmentItem = e.detail;
        this.#updateElementView();
      });

      this.addEventListener('item-switch-view', (e: CustomEvent<View>) => {
        this.view = e.detail;
      });
    }

    override willUpdate(changedProperties: PropertyValues) {
      super.willUpdate(changedProperties);
      if (changedProperties.has('view')) {
        this.#updateElementView();
      }
    }

    /**
     * Scoped to the assessment item: a standalone item has no section or test part, so unlike
     * the test mixin there is nowhere else a `[view]` element can sit.
     */
    #updateElementView(): void {
      const assessmentItem = this.#assessmentItem;
      if (!assessmentItem) return;

      assessmentItem.querySelectorAll('[view]').forEach((element: Element) => {
        element.classList.toggle('show', element.getAttribute('view') === this.view);
      });

      this.updateAssessmentItemView(assessmentItem, this.view);
    }

    /** Extension point for packages that add view-dependent item presentation. */
    public updateAssessmentItemView(_assessmentItem: QtiAssessmentItem, _view: View): void {}
  }

  return ItemViewClass as Constructor<ItemViewInterface> & T;
};
