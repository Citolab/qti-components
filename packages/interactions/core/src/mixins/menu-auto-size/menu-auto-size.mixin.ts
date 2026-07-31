import type { LitElement } from 'lit';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type MenuAutoSize = LitElement & {
  updateMenuWidth(): void;
  shouldAutoSizeMenu(): boolean;
  menuAutoSizeExtraWidth(): number;
  menuAutoSizePropertyTarget(): HTMLElement | null;
  menuAutoSizeRows(): HTMLElement[];
  withMenuMeasurable<T>(measure: () => T): T;
};

/**
 * Sizes a closed combobox to the widest thing in its menu.
 *
 * A dropdown that is only as wide as the option currently showing jumps every time the candidate
 * picks a longer one, and in running prose that reflows the sentence around it. Measuring the menu
 * once and giving the trigger that width as a floor makes the control a constant box.
 *
 * ── Why this is a mixin ──────────────────────────────────────────────────────────────────────
 *
 * Same reason as `DropzoneAutoSizeMixin`, which this deliberately mirrors: the editor renders the
 * same control and wants the same behaviour, but does its own everything-else. It used to be two
 * private methods on `qti-inline-choice-interaction`, so the editor's copy was commented out and
 * rotting (`#estimateOptimalWidth`, disabled because it wrote to the host — see below).
 *
 * ── Where the width is written ───────────────────────────────────────────────────────────────
 *
 * On `menuAutoSizePropertyTarget()`, which defaults to the trigger INSIDE THE SHADOW ROOT — not on
 * the host, which is what the runtime used to do (`this.style.setProperty(...)`).
 *
 * That is the whole reason the editor could not reuse it. `style` is an attribute, ProseMirror's
 * mutation observer reverts any attribute its schema does not know, and the revert re-triggers the
 * observer that wrote it — a loop that hard-freezes the tab. A node inside a shadow root is
 * invisible to that observer, because MutationObserver does not cross shadow boundaries.
 *
 * Writing on the trigger rather than the host also happens to be the more honest target: the trigger
 * is the element whose `min-width` reads the property. Nothing inherits it that should not.
 *
 * ── Precedence ───────────────────────────────────────────────────────────────────────────────
 *
 * An inline style on the trigger outranks the `:host(.qti-input-width-*)` rules that also set this
 * property, so cascade order alone would let a measurement beat an author's explicit width class.
 * It does not, because the gate is in JS: `shouldAutoSizeMenu()` returns false when such a class is
 * present, and nothing is written at all. Keep that check there — do not try to express it in CSS.
 *
 * ── When it re-measures ──────────────────────────────────────────────────────────────────────
 *
 * On demand (the options changed), and whenever the menu changes size WHILE OPEN, via a
 * `ResizeObserver`. Open is the condition that matters: a popover is `display: none` when closed, so
 * the observer also fires with a 0x0 box on every open and close, and acting on those would both
 * write nonsense and feed itself. Reading only while open means the measurement pass below — which
 * opens the menu invisibly — cannot loop: the one observation it provokes reports the size that was
 * just written, and the changed-value guard drops it.
 */
export const MenuAutoSizeMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  menuSelector = "[part='menu']",
  triggerSelector = "[part='trigger']",
  customProperty = '--qti-inline-choice-width'
) => {
  abstract class MenuAutoSizeElement extends superClass {
    #resizeObserver: ResizeObserver | null = null;
    #observedMenu: Element | null = null;
    #contentObserver: MutationObserver | null = null;
    #pendingFrame = 0;
    /** Last width written, so an unchanged measurement writes nothing. See the observer note above. */
    #lastWritten: number | null = null;

    /**
     * Opt in. Off by default, so mixing this in changes nothing until the host says so.
     *
     * The host is also where the "an explicit width class wins" check belongs — see Precedence.
     */
    public shouldAutoSizeMenu(): boolean {
      return false;
    }

    /**
     * Anything the trigger shows beside the option text, which the menu does not have and therefore
     * does not contribute to the measurement — the dropdown chevron, in the shipped control.
     */
    public menuAutoSizeExtraWidth(): number {
      return 0;
    }

    /** Where the measured width is written. Inside the shadow root — see the header. */
    public menuAutoSizePropertyTarget(): HTMLElement | null {
      return this.renderRoot?.querySelector<HTMLElement>(triggerSelector) ?? null;
    }

    /**
     * The menu's rows, which is what actually gets measured — one at a time.
     *
     * Flat tree, so a `<slot>` is replaced by the elements assigned to it: in the shipped control the
     * prompt is rendered in the shadow root and the author's options are slotted light DOM, and both
     * are rows of the same list.
     */
    public menuAutoSizeRows(): HTMLElement[] {
      const menu = this.renderRoot?.querySelector<HTMLElement>(menuSelector);
      if (!menu) return [];

      return Array.from(menu.children).flatMap(child =>
        child instanceof HTMLSlotElement
          ? child.assignedElements().filter((el): el is HTMLElement => el instanceof HTMLElement)
          : child instanceof HTMLElement
            ? [child]
            : []
      );
    }

    /**
     * Make the rows measurable, run `measure`, and put everything back.
     *
     * A hook, because hosts hide their menu differently and a measurement needs layout. The default
     * covers the shipped control, whose menu is always in the DOM as a popover: open it invisibly if
     * it is closed. A host that renders the menu ONLY while open — the editor does exactly that, so
     * there is no element to open — overrides this to reveal whatever it hides instead.
     *
     * Synchronous, deliberately: the browser does not paint between the reveal and the restore, so
     * nothing flickers however the host implements it.
     */
    public withMenuMeasurable<T>(measure: () => T): T {
      const menu = this.renderRoot?.querySelector<HTMLElement>(menuSelector);
      if (!menu) return measure();

      const wasOpen = menu.matches(':popover-open');
      const prevVisibility = menu.style.visibility;
      const prevDisplay = menu.style.display;

      if (!wasOpen) {
        menu.style.visibility = 'hidden';
        menu.style.display = 'block';
        menu.showPopover?.();
      }
      try {
        return measure();
      } finally {
        if (!wasOpen) {
          menu.hidePopover?.();
          menu.style.visibility = prevVisibility;
          menu.style.display = prevDisplay;
        }
      }
    }

    public updateMenuWidth(): void {
      if (!this.isConnected || !this.shouldAutoSizeMenu()) return;

      const target = this.menuAutoSizePropertyTarget();
      if (!target) return;

      const menu = this.renderRoot?.querySelector<HTMLElement>(menuSelector);
      if (menu) this.#observeMenu(menu);
      this.#observeContent();

      const width = this.#measure() + this.menuAutoSizeExtraWidth();
      if (width <= 0 || width === this.#lastWritten) return;

      this.#lastWritten = width;
      target.style.setProperty(customProperty, `${width}px`);
    }

    /**
     * The width of the WIDEST ROW, plus whatever box the menu wraps around it. Opens the menu
     * invisibly if it is closed, because a closed popover has no layout to measure.
     *
     * Per row, deliberately, and NOT `width: max-content` on the menu as a whole. That was tried and
     * is wrong here: the option rows are inline-level (`display: inline-flex`, see
     * qti-inline-choice.styles.ts), so a max-content menu lays them all out ON ONE LINE and its
     * intrinsic width becomes the SUM of every option. Measured on a two-option control: rows of
     * 53.33 and 283.91 gave a menu of 343.42 instead of 283.91, so the trigger came out ~60px too
     * wide with a hole between the value and the chevron — and it would grow with every option
     * added. A row is only ever as wide as itself, so the max over rows is the number wanted.
     *
     * Measuring rows rather than the menu box also removes the feedback loop for free. The menu is
     * anchor-positioned with `min-width: anchor-size(width)`, i.e. never narrower than the trigger,
     * so reading the MENU and writing the result back to the trigger is a cycle that grows by
     * `menuAutoSizeExtraWidth()` on every pass — visibly, on every open, forever. A row does not
     * read the trigger, so nothing here can feed itself.
     */
    #measure(): number {
      return this.withMenuMeasurable(() => {
        let widest = 0;
        for (const row of this.menuAutoSizeRows()) {
          // max-content asks the one question with a single answer: how wide is this row if nothing
          // wraps. Without it a row reports whatever width the menu currently happens to give it —
          // the rows are `width: 100%` — which is another way of measuring our own output.
          const prevWidth = row.style.width;
          row.style.width = 'max-content';
          widest = Math.max(widest, row.getBoundingClientRect().width);
          row.style.width = prevWidth;
        }
        if (widest <= 0) return 0;

        // The rows sit inside the menu's own padding and border, and the trigger has to be wide
        // enough for the whole box, not just the text in it.
        const menu = this.renderRoot?.querySelector<HTMLElement>(menuSelector);
        if (!menu) return widest;

        const menuStyle = getComputedStyle(menu);
        return (
          widest +
          parseFloat(menuStyle.paddingLeft) +
          parseFloat(menuStyle.paddingRight) +
          parseFloat(menuStyle.borderLeftWidth) +
          parseFloat(menuStyle.borderRightWidth)
        );
      });
    }

    /**
     * Re-measure when the OPTIONS themselves change — a row added, removed, or its text edited.
     *
     * The ResizeObserver below cannot see any of that, because it only reads while the menu is open
     * and a closed popover is `display: none`: no box, no resize, no signal. That is fine in the
     * runtime, whose own slot observer rebuilds the options and calls updateMenuWidth() as part of
     * it — and useless in an editor, where an author adds a row by pressing Enter with the menu shut.
     * Relying on the host to remember is what left the editor's previous attempt at this dead.
     *
     * `characterData` as well as `childList`, so typing inside an existing option counts too, and
     * `subtree` because an option's text is a descendant, not a child.
     *
     * Coalesced to one measurement per frame. Both observers can fire for the same edit, and a
     * measurement forces layout — the write is already idempotent via #lastWritten, this keeps the
     * reads down too.
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
        this.updateMenuWidth();
      });
    }

    #observeMenu(menu: HTMLElement): void {
      if (typeof ResizeObserver === 'undefined' || this.#observedMenu === menu) return;

      this.#resizeObserver ??= new ResizeObserver(() => {
        // Only while open: a closed popover reports 0x0, and reacting to that would write a zero
        // width and then re-fire on the way back up.
        if (!(this.#observedMenu as HTMLElement | null)?.matches(':popover-open')) return;

        // Deliberately the same path as everything else, rather than a cheaper inline read: only
        // #measure knows to measure rows instead of the menu box, and a shortcut here would
        // reintroduce the cycle and the sum-of-all-options bug that method exists to avoid.
        this.#scheduleMeasure();
      });

      if (this.#observedMenu) this.#resizeObserver.unobserve(this.#observedMenu);
      this.#resizeObserver.observe(menu);
      this.#observedMenu = menu;
    }

    public override disconnectedCallback(): void {
      this.#resizeObserver?.disconnect();
      this.#resizeObserver = null;
      this.#observedMenu = null;
      this.#contentObserver?.disconnect();
      this.#contentObserver = null;
      if (this.#pendingFrame) cancelAnimationFrame(this.#pendingFrame);
      this.#pendingFrame = 0;
      super.disconnectedCallback();
    }
  }

  return MenuAutoSizeElement as Constructor<MenuAutoSize> & T;
};
