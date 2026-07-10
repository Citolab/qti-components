import { property } from 'lit/decorators.js';
import { provide } from '@lit/context';

import { dragDropContext, responseAttributeConverter } from '@qti-components/base';

import {
  clearDragChipStates,
  findInventoryItems,
  getMatchMaxValue,
  hasDragChipState,
  applyDropzoneAutoSizing,
  setDropFilled,
  setDragChipState
} from './utils/drag-drop.utils';
import { DragDropCoreMixin } from './drag-drop-core.mixin';
import {
  animateFlip,
  captureMultipleFlipStates,
  animateMultipleFlips,
  flipStateFromRect,
  type FlipAnimationOptions
} from './utils/flip.utils';

import type { ComplexAttributeConverter } from 'lit';
import type { CollisionDetectionAlgorithm } from './utils/drag-drop.utils';
import type { DragDropState, Interaction, IInteraction } from '@qti-components/base';
import type { DragDropCore } from './drag-drop-core.mixin';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export type DragDropSlotted = DragDropCore & {
  minAssociations: number;
  maxAssociations: number;
  disableAnimations: boolean;
  enableFlipAnimations: boolean;
  autoSizeDropzones: boolean;
  validate(): boolean;
  reportValidity(): boolean;
  reset(): void;
  saveResponse(value?: string | string[]): void;
  shouldTreatBlockedMaxAsInvalid(): boolean;
  shouldReturnToInventoryOnInventoryDrop(): boolean;

  /** Placement, published on `dragDropContext`. An interaction that renders its own drop targets
   *  reads `nodesByTarget` straight out of it. */
  _dragDrop: Readonly<DragDropState>;
  /** The chips a target holds — from the placement map, or the DOM, depending on the target. */
  chipsIn(droppable: HTMLElement): HTMLElement[];
  isDeclarativeTarget(el: HTMLElement | null | undefined): boolean;
};

interface InteractionConfiguration {
  copyStylesDragClone: boolean;
  dragCanBePlacedBack: boolean;
  dragOnClick: boolean;
}

export const DragDropSlottedMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  droppablesSelector: string,
  dragContainersSelector = 'slot[part="drags"]',
  collisionAlgorithm: CollisionDetectionAlgorithm = 'closestCornersWithInventoryPriority'
) => {
  // Use 'closestCorners' by default for associate interactions (better for multiple drop zones)
  const Core = DragDropCoreMixin(
    superClass,
    draggablesSelector,
    droppablesSelector,
    dragContainersSelector,
    collisionAlgorithm
  );

  abstract class DragDropSlottedElement extends Core implements IInteraction {
    @property({ attribute: false, type: Object }) protected configuration: InteractionConfiguration = {
      copyStylesDragClone: true,
      dragCanBePlacedBack: true,
      dragOnClick: false
    };
    @property({ type: Number, reflect: true, attribute: 'min-associations' }) minAssociations = 1;

    private _maxAssociations = 0;
    private _maxAssociationsDefaultApplied = false;

    @property({ type: Number, reflect: true, attribute: 'max-associations' })
    get maxAssociations(): number {
      // QTI compatibility: gap-match interactions default max-associations to 1
      // when the attribute is omitted.
      if (!this._maxAssociationsDefaultApplied) {
        this._maxAssociationsDefaultApplied = true;
        const tagName = this.tagName?.toLowerCase() || '';
        const isGapMatchInteraction =
          tagName === 'qti-graphic-gap-match-interaction' || tagName === 'qti-gap-match-interaction';
        if (isGapMatchInteraction && !this.hasAttribute('max-associations') && this._maxAssociations === 0) {
          this._maxAssociations = 1;
        }
      }
      return this._maxAssociations;
    }

    set maxAssociations(value: number) {
      const oldValue = this._maxAssociations;
      this._maxAssociations = value;
      this.requestUpdate('maxAssociations', oldValue);
    }

    protected _response: string[] = [];

    /**
     * What each drop target holds. Published to the drop targets, which will render themselves
     * from it once the DOM stops being the source of truth.
     *
     * Reassign, never mutate — an in-place change does not notify consumers.
     */
    @provide({ context: dragDropContext })
    public _dragDrop: Readonly<DragDropState> = { dragsByTarget: {}, countByTarget: {}, nodesByTarget: {} };

    /**
     * The one place that reads placement out of the DOM.
     *
     * Replaces nine scattered `querySelectorAll` readbacks (`collectResponseData`,
     * `countTotalAssociations`, `isDroppableAtCapacity`). The DOM is still authoritative here;
     * centralising it is what makes inverting that possible without touching nine call sites.
     */
    /**
     * What each declarative drop target holds. The DOM is derived from this, not the other way.
     *
     * A target opts in with `acceptsDeclarativeDrops`, consumes `dragDropContext`, and renders
     * `repeat(nodesByTarget[id])` into its own shadow root. The interaction never appends into it.
     * Everything else still takes an `appendChild` and is read back by query — the two live side by
     * side, and `chipsIn` hides which is which.
     *
     * Keyed by element, not identifier: the map is short-lived and element identity is exact.
     */
    #placement = new WeakMap<HTMLElement, HTMLElement[]>();

    /** Is this a full declarative target receiving a chip dragged out of a different target? */
    protected isSwapTarget(droppable: HTMLElement): boolean {
      const source = this.dragState.sourceDroppable;
      return (
        this.isDeclarativeTarget(droppable) &&
        !!source &&
        source !== droppable &&
        this.trackedDroppables.includes(source)
      );
    }

    /**
     * Does this target render its own chips?
     *
     * A custom element says so with a property (`qti-gap`, `qti-associable-hotspot`). Order's and
     * associate's targets are plain `<div part="drop">` in the interaction's own shadow root, and a
     * div cannot carry a property that survives a Lit re-render — it says so with an attribute, and
     * the *interaction* renders the chips into it. Same placement map either way.
     */
    public isDeclarativeTarget(el: HTMLElement | null | undefined): boolean {
      if (!el) return false;
      if ((el as unknown as { acceptsDeclarativeDrops?: boolean }).acceptsDeclarativeDrops === true) return true;
      return el.hasAttribute('data-declarative-drops');
    }

    /** The chips a target holds, whichever way it holds them. */
    public chipsIn(droppable: HTMLElement): HTMLElement[] {
      if (this.isDeclarativeTarget(droppable)) return [...(this.#placement.get(droppable) ?? [])];
      return Array.from(droppable.querySelectorAll<HTMLElement>(draggablesSelector));
    }

    /** The target currently holding this chip, across shadow boundaries. */
    protected droppableHolding(chip: HTMLElement): HTMLElement | null {
      return (
        this.trackedDroppables.find(
          d => this.chipsIn(d).includes(chip) || d.contains(chip) || !!d.shadowRoot?.contains(chip)
        ) ?? null
      );
    }

    private placeChip(droppable: HTMLElement, chip: HTMLElement): void {
      this.#placement.set(droppable, [...(this.#placement.get(droppable) ?? []), chip]);
    }

    public override removeChipFromDroppable(droppable: HTMLElement | null, chip: HTMLElement): void {
      const target = droppable ?? this.droppableHolding(chip);
      if (target && this.isDeclarativeTarget(target)) {
        const remaining = (this.#placement.get(target) ?? []).filter(node => node !== chip);
        this.#placement.set(target, remaining);
        if (remaining.length === 0) setDropFilled(target, false);
        this.syncDragDropState();
        return;
      }
      chip.remove();
    }

    private clearChips(droppable: HTMLElement): void {
      if (this.isDeclarativeTarget(droppable)) {
        this.#placement.set(droppable, []);
        // Emptying the map is not enough: nothing re-renders until placement is published.
        this.syncDragDropState();
      } else {
        this.chipsIn(droppable).forEach(chip => chip.remove());
      }
      setDropFilled(droppable, false);
    }

    protected syncDragDropState(): void {
      const dragsByTarget: Record<string, string[]> = {};
      const countByTarget: Record<string, number> = {};
      const nodesByTarget: Record<string, HTMLElement[]> = {};

      for (const droppable of this.trackedDroppables) {
        const targetId = droppable.getAttribute('identifier');
        if (!targetId) continue;

        const bySelector = this.chipsIn(droppable);
        const byAttribute = this.isDeclarativeTarget(droppable)
          ? bySelector
          : Array.from(droppable.querySelectorAll<HTMLElement>('[qti-draggable="true"]'));

        // Response uses the structural selector only; capacity uses whichever finds more.
        // These differ, and collapsing them would silently change matchMax behaviour.
        dragsByTarget[targetId] = bySelector
          .map(chip => chip.getAttribute('identifier'))
          .filter((id): id is string => Boolean(id));
        countByTarget[targetId] = Math.max(bySelector.length, byAttribute.length);
        nodesByTarget[targetId] = bySelector;
      }

      this._dragDrop = { dragsByTarget, countByTarget, nodesByTarget };
      // Consumers of the context re-render on reassignment. An interaction that renders its own
      // drop targets is not a consumer of its own context, so it has to be told.
      this.requestUpdate();
    }

    /** The response, derived from placement: `"<dragId> <targetId>"` per placed chip. */
    protected responseFromState(): string[] {
      this.syncDragDropState();
      const { dragsByTarget } = this._dragDrop;
      return this.trackedDroppables.flatMap(droppable => {
        const targetId = droppable.getAttribute('identifier');
        if (!targetId) return [];
        return (dragsByTarget[targetId] ?? []).map(dragId => `${dragId} ${targetId}`);
      });
    }

    protected totalAssociationsFromState(): number {
      this.syncDragDropState();
      return Object.values(this._dragDrop.countByTarget).reduce((total, count) => total + count, 0);
    }

    protected droppableAtCapacityFromState(droppable: HTMLElement): boolean {
      const parsed = parseInt(droppable.getAttribute('match-max') || '1', 10);
      const matchMax = Number.isNaN(parsed) ? 1 : parsed;
      if (matchMax === 0) return false;

      const targetId = droppable.getAttribute('identifier');
      const current = targetId ? (this._dragDrop.countByTarget[targetId] ?? 0) : 0;
      return current >= matchMax;
    }

    // Track when a drop was blocked due to max capacity
    private _dropBlockedDueToMax = false;

    // FLIP animation configuration
    public flipAnimationConfig: FlipAnimationOptions = {
      duration: 200, // Slightly faster for slotted interactions
      easing: 'ease' // Simple, browser-optimized easing
    };

    private _enableFlipAnimations = true;

    @property({ type: Boolean, attribute: 'disable-animations' })
    set disableAnimations(value: boolean) {
      this._enableFlipAnimations = !value;
    }
    get disableAnimations(): boolean {
      return !this._enableFlipAnimations;
    }

    get enableFlipAnimations(): boolean {
      return this._enableFlipAnimations;
    }

    @property({ type: Boolean, attribute: 'auto-size-dropzones' })
    /**
     * Size the dropzones from the chips they will hold.
     *
     * On by default: a drop that is already as big as the largest chip does not resize when one
     * lands in it. `qti-match-interaction` turns it off — a match target is a category, and should
     * look like it can hold several answers rather than hugging the widest one. With it off, a
     * dropzone falls back to the vendor floor, `--qti-drop-min-height` / `--qti-drop-min-width`.
     */
    public autoSizeDropzones = true;

    /**
     * Set via the `response="…"` attribute before the drag/drop machinery has
     * cached its dropzones (`setupDragDrop` awaits the first render). The
     * `afterCache` extension hook in this mixin applies it once dropzones exist.
     */
    private _pendingResponse: string[] | undefined = undefined;

    @property({
      attribute: 'response',
      reflect: false,
      noAccessor: true,
      converter: responseAttributeConverter({ emptyAs: [] }) as ComplexAttributeConverter<unknown, unknown>
    })
    get response(): string {
      const getResponse = (this as unknown as { getResponse?: () => unknown }).getResponse;
      const candidate = typeof getResponse === 'function' ? getResponse.call(this) : undefined;
      const computedResponse = Array.isArray(candidate)
        ? candidate
        : (() => {
            this.cacheInteractiveElements();
            return this.responseFromState();
          })();
      return computedResponse.join(',');
    }

    set response(value: string | string[]) {
      if (Array.isArray(value)) {
        // Dropzones haven't been cached yet — defer to `afterCache`.
        if (!this.trackedDroppables || this.trackedDroppables.length === 0) {
          this._pendingResponse = value;
          this._internals.setFormValue(JSON.stringify(value));
          return;
        }
        const getValue = (this as unknown as { getValue?: (v: string[]) => unknown }).getValue;
        const normalized = typeof getValue === 'function' ? getValue.call(this, value) : value;
        const responseEntries = Array.isArray(normalized)
          ? normalized
          : typeof normalized === 'string' && normalized.length > 0
            ? [normalized]
            : [];

        this.reset(false);
        responseEntries.forEach(entry => this.placeResponse(entry));

        const getResponse = (this as unknown as { getResponse?: () => unknown }).getResponse;
        const candidate = typeof getResponse === 'function' ? getResponse.call(this) : undefined;
        this._response = Array.isArray(candidate)
          ? candidate
          : (() => {
              this.cacheInteractiveElements();
              return this.responseFromState();
            })();
      } else {
        // Compatibility note:
        // legacy drag/drop behavior treats string response assignment as form-state only.
        // It does not replay placements into dropzones; only array-based input does.
        this._response = typeof value === 'string' && value.length > 0 ? [value] : [];
      }

      this._internals.setFormValue(JSON.stringify(this._response));
    }

    public override afterCache(): void {
      // Order matters: auto-sizing writes `min-width` from the widest chip, and `min-width`
      // beats `width`. The author's configured width must therefore be applied last, and clear
      // that min-width. Otherwise `data-choices-container-width` is silently discarded whenever
      // a theme makes chips wider than the authored gap.
      this.updateMinDimensionsForDropZones();
      this.applyConfiguredChoicesContainerWidth();
      if (this._pendingResponse !== undefined) {
        const pending = this._pendingResponse;
        this._pendingResponse = undefined;
        this.response = pending;
      }
      const interaction = this as unknown as {
        showCorrectResponse?: boolean;
        showCandidateCorrection?: boolean;
        showFullCorrectResponse?: boolean;
        toggleInternalCorrectResponse?: (show: boolean) => void;
        toggleCandidateCorrection?: (show: boolean) => void;
        toggleFullCorrectResponse?: (show: boolean) => void;
      };
      if (interaction.showCorrectResponse) interaction.toggleInternalCorrectResponse?.(true);
      if (interaction.showCandidateCorrection) interaction.toggleCandidateCorrection?.(true);
      if (interaction.showFullCorrectResponse) interaction.toggleFullCorrectResponse?.(true);
    }

    /**
     * `data-choices-container-width` is an explicit authoring instruction, so it wins over the
     * auto-sizing pass. Zeroing `--qti-dropzone-min-width` is the point: auto-sizing derives it
     * from the widest chip and `min-width` takes precedence over `width`, so a theme with roomy
     * chips would otherwise silently widen the gap past the authored value.
     *
     * Published as custom properties on the host rather than written to each droppable's
     * `style` attribute — the droppables' stylesheets own the actual properties.
     */
    private applyConfiguredChoicesContainerWidth(): void {
      const configuredWidth = this.dataset.choicesContainerWidth;
      if (!configuredWidth) return;

      // Zeroing the measured min-width is the fix: min-width beats width, so the auto-sizing
      // measurement would otherwise silently widen the dropzone past the authored value.
      this.style.setProperty('--qti-dropzone-min-width', '0');

      // `width` stays an inline style, deliberately. `qti-associable-hotspot` already carries an
      // inline width derived from its `coords`, and an authored container width must override
      // that — a custom property read from the element's own `:host` rule never could.
      this.trackedDroppables.forEach(droppable => {
        droppable.style.width = `${configuredWidth}px`;
        droppable.style.boxSizing = 'border-box';
      });
    }

    public shouldTreatBlockedMaxAsInvalid(): boolean {
      return true;
    }

    public shouldReturnToInventoryOnInventoryDrop(): boolean {
      return false;
    }

    private getFirstMessageAttribute(attributeNames: string[]): string | null {
      for (const name of attributeNames) {
        const direct = this.getAttribute(name);
        if (direct && direct.trim().length > 0) return direct;
      }

      const normalized = attributeNames.map(name => name.toLowerCase());
      for (const attr of Array.from(this.attributes)) {
        if (normalized.includes(attr.name.toLowerCase()) && attr.value.trim().length > 0) {
          return attr.value;
        }
      }

      return null;
    }

    public override allowDrop(_draggable: HTMLElement, droppable: HTMLElement): boolean {
      // Always allow dropping into drag containers (inventory).
      if (this.trackedDragContainers.includes(droppable)) {
        return true;
      }

      // Allow drop if:
      // 1. The droppable is tracked
      // 2. AND either: it's not disabled OR it has the data-drag-source marker (returning to source)
      const isTracked = this.trackedDroppables.includes(droppable);
      const isDisabled = droppable.hasAttribute('disabled');
      const isReturningToSource = droppable.hasAttribute('data-drag-source');

      // A full single-capacity target is still droppable when the chip comes from another target:
      // that is what a swap is. The sortable mixin used to arrange this implicitly, by moving the
      // occupant's DOM node out during the hover preview so the target stopped being at capacity.
      // A target that renders from data has no node to move, so the rule is stated outright.
      if (isDisabled && this.isSwapTarget(droppable)) {
        return true;
      }

      return isTracked && (!isDisabled || isReturningToSource);
    }

    public override handleDrop(draggable: HTMLElement, droppable: HTMLElement): void {
      // Capture the drag clone's position before it gets removed
      // The dragClone is the visual element being dragged
      const dragClonePosition = this.dragState.dragClone?.getBoundingClientRect();

      this.dropDraggableInDroppable(draggable, droppable, dragClonePosition);
      const identifier = draggable.getAttribute('identifier');

      if (identifier) {
        this.updateInventoryBasedOnMatchMax(identifier);
      }

      // After drop, check if we've exceeded max and auto-validate if so
      const totalAssociations = this.totalAssociationsFromState();
      const exceedsMax = this.maxAssociations > 0 && totalAssociations > this.maxAssociations;

      if (exceedsMax) {
        // Automatically show validation message when max is exceeded
        this._dropBlockedDueToMax = true;
        this.validate();
        this.reportValidity();
      }
    }

    public override handleInvalidDrop(dragSource: HTMLElement | null): void {
      const sourceDroppable = this.dragState.sourceDroppable;
      const currentTarget = this.dragState.currentTarget;
      const droppedOutsideKnownZones = !currentTarget;
      const inventoryReturnTarget = this.trackedDragContainers[0] || null;

      if (!dragSource) {
        return;
      }

      // Legacy compatibility:
      // If drag started from a dropzone and ended on host/background (no collision target),
      // interpret this as "return to inventory".
      if (
        sourceDroppable &&
        droppedOutsideKnownZones &&
        inventoryReturnTarget &&
        this.configuration.dragCanBePlacedBack !== false
      ) {
        this.dropDraggableInDroppable(dragSource, inventoryReturnTarget);
      }
      // If drag started from a dropzone and the drop is invalid, restore only this
      // dragged instance back to its source droppable.
      else if (sourceDroppable && this.trackedDroppables.includes(sourceDroppable)) {
        // Released over nothing, having come from a dropzone: the chip goes back where it was, and
        // it travels there. The clone is still alive at this point — `handleDragEnd` removes it
        // only after `handleInvalidDrop` returns — so its rect is the chip's last real position.
        this.dropDraggableInDroppable(dragSource, sourceDroppable, this.dragState.dragClone?.getBoundingClientRect());
      } else if (hasDragChipState(dragSource, 'dragging')) {
        // Drag started from inventory: simply restore inventory visual state.
        this.restoreInventoryItem(dragSource, this.dragState.dragClone?.getBoundingClientRect());
        this.cacheInteractiveElements();
        this.checkAllMaxAssociations();
      }

      // Only flag "blocked due to max" when the user attempted to drop on
      // a disabled non-source target while global max is reached.
      // This avoids showing max-capacity errors for unrelated invalid drops
      // (e.g. dropping outside any known dropzone).
      const totalAssociations = this.totalAssociationsFromState();
      const maxReached = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;
      const attemptedDisabledTarget =
        !!currentTarget && currentTarget.hasAttribute('disabled') && !currentTarget.hasAttribute('data-drag-source');

      this._dropBlockedDueToMax = attemptedDisabledTarget && maxReached;
      this.validate();
      this.reportValidity();
    }

    private updateMinDimensionsForDropZones(): void {
      if (!this.autoSizeDropzones) return;
      if (this.trackedDraggables.length === 0) return;

      applyDropzoneAutoSizing(this, this.trackedDraggables, this.trackedDroppables, this.trackedDragContainers);
    }

    /**
     * Fly a chip home from wherever it was last seen on screen.
     *
     * `from` is never read off `dragState` in here, and that is deliberate. Two different chips take
     * this path: the one the user dragged, whose origin is the drag clone, and the occupant a swap
     * evicted, whose origin is the dropzone it was sitting in. Reading the clone's rect for both
     * would launch the evicted chip out of the cursor, from a place it had never been.
     */
    private animateReturn(element: HTMLElement | undefined, from: DOMRect | undefined): void {
      if (!element || !from || !this.enableFlipAnimations) return;
      // A frame late, on purpose. A declarative target's chips are rendered by Lit on a microtask,
      // so measuring the chip's resting box straight after `placeChip` reads the box it had before
      // the render. FLIP would then invert against the wrong "last" and the chip would arrive
      // somewhere other than where it is.
      requestAnimationFrame(() => {
        animateFlip(element, flipStateFromRect(from), this.flipAnimationConfig);
      });
    }

    private restoreInventoryItem(dragSource: HTMLElement, from?: DOMRect): void {
      clearDragChipStates(dragSource);
      dragSource.style.display = '';
      dragSource.style.position = '';
      this.animateReturn(dragSource, from);
    }

    private placeResponse(response: string): void {
      const [dropIdentifier, ...dragIdentifiers] = response.split(' ').reverse();
      const droppable = this.trackedDroppables.find(d => d.getAttribute('identifier') === dropIdentifier);
      if (!droppable) return;

      dragIdentifiers.forEach(dragId => {
        if (!dragId) return;

        const fromInventory = findInventoryItems(this.trackedDragContainers, dragId).at(0);
        const draggable = fromInventory || this.trackedDraggables.find(d => d.getAttribute('identifier') === dragId);
        if (!draggable) return;

        this.dropDraggableInDroppable(draggable, droppable);
      });
    }

    private dropDraggableInDroppable(
      draggable: HTMLElement,
      droppable: HTMLElement,
      dragClonePosition?: DOMRect
    ): void {
      const isDragContainer = this.trackedDragContainers.includes(droppable);

      if (isDragContainer) {
        // Optional legacy compatibility:
        // for some interactions, dropping an inventory item back onto inventory
        // clears placed clones for that identifier.
        if (!this.dragState.sourceDroppable) {
          if (this.shouldReturnToInventoryOnInventoryDrop()) {
            this.returnToInventory(draggable, dragClonePosition);
            this._dropBlockedDueToMax = false;
            this.validate();
            return;
          }

          // Keep the inventory source item in place for interactions that don't
          // use "drop to inventory clears placed clones" semantics (e.g. gap-match).
          this.restoreInventoryItem(draggable, dragClonePosition);
          this.cacheInteractiveElements();
          this.checkAllMaxAssociations();
          this._dropBlockedDueToMax = false;
          this.validate();
          return;
        }

        const identifier = draggable.getAttribute('identifier');
        this.removeChipFromDroppable(this.droppableHolding(draggable), draggable);

        if (identifier) {
          this.restoreOriginalInInventory(identifier, dragClonePosition);
        }

        this.cacheInteractiveElements();
        this.checkAllMaxAssociations();

        // Clear the blocked flag and re-validate since we've removed an association
        this._dropBlockedDueToMax = false;
        this.validate();

        return;
      }

      const parsedMatchMax = parseInt(droppable.getAttribute('match-max') || '1', 10);
      const matchMax = Number.isNaN(parsedMatchMax) ? 1 : parsedMatchMax;
      const allowsMultiple = matchMax === 0 || matchMax > 1;

      // FLIP: First - capture positions of existing children in droppable
      const existingChildren = Array.from(droppable.querySelectorAll<HTMLElement>('[qti-draggable="true"]'));
      const flipStates =
        this.enableFlipAnimations && existingChildren.length > 0 ? captureMultipleFlipStates(existingChildren) : null;

      if (!allowsMultiple) {
        const existing =
          this.chipsIn(droppable)[0] ??
          (this.isDeclarativeTarget(droppable) ? null : droppable.querySelector('[qti-draggable="true"]'));
        if (existing) {
          const existingId = existing.getAttribute('identifier');
          // Where the evicted occupant is standing right now. Taken before it is removed, because
          // afterwards it has no box to measure — and it is *this* rect it should travel from, not
          // the dragged chip's clone.
          const evictedFrom = (existing as HTMLElement).getBoundingClientRect();
          this.removeChipFromDroppable(droppable, existing as HTMLElement);

          // A single-capacity target that already holds a chip and receives one *from another
          // target* swaps them: the occupant takes the dragged chip's vacated place. Dragged from
          // the inventory instead, the occupant simply goes back to the bank.
          //
          // Non-declarative targets get this from the sortable mixin's hover preview, which moves
          // the occupant's DOM node. A target that renders from data has no node to move.
          const source = this.dragState.sourceDroppable;
          const swapInto =
            this.isDeclarativeTarget(droppable) && source && source !== droppable && this.isDeclarativeTarget(source)
              ? source
              : null;

          if (swapInto) {
            this.placeChip(swapInto, existing as HTMLElement);
            setDropFilled(swapInto, true);
            this.animateReturn(existing as HTMLElement, evictedFrom);
          } else if (existingId) {
            this.restoreOriginalInInventory(existingId, evictedFrom);
          }
        }
      }

      const cleanClone = draggable.cloneNode(true) as HTMLElement;
      cleanClone.removeAttribute('style'); // Remove inline styles from the clone
      cleanClone.removeAttribute('data-keyboard-dragging'); // Remove keyboard dragging indicator
      cleanClone.setAttribute('qti-draggable', 'true');
      cleanClone.setAttribute('tabindex', '0');

      // FLIP: Last - add the new element (this may cause siblings to shift)
      if (this.isDeclarativeTarget(droppable)) {
        // A chip inside the target's shadow root is unreachable by tag, attribute or `:state()`
        // from the document — `::part()` is the only way in, and a bare `::part(drag)` matches in
        // any shadow root. Without this the chip renders unstyled, which the invariance spec
        // catches as "a chip is not the same size wherever it lives".
        cleanClone.setAttribute('part', 'drag');
        // Parts do not chain: `::part(drag)::part(control)` is inert. The chip forwards its own
        // inner part up one level, renamed, so a theme can still reach the drag handle as
        // `::part(drag-control)`. Drawing the grip on the chip host instead would have worked too,
        // but it moves the glyph for every *other* interaction's chips as well.
        // `correction*` forwarded under its own name: the theme reaches the badge with a bare
        // `::part(correction-correct)` whether the chip is in the bank or inside this target.
        cleanClone.setAttribute(
          'exportparts',
          'control: drag-control, label: drag-label, correction, correction-correct, correction-incorrect'
        );
        // Cloned once, here — never inside `render()`, which would mint a new node per update and
        // lose focus, transitions and the chip's own shadow root.
        this.placeChip(droppable, cleanClone);
      } else if (droppable.tagName === 'SLOT') {
        cleanClone.setAttribute('slot', droppable.getAttribute('name') || '');
      } else if (droppable.tagName === 'QTI-SIMPLE-ASSOCIABLE-CHOICE') {
        cleanClone.setAttribute('slot', 'qti-simple-associable-choice');
        droppable.appendChild(cleanClone);
      } else {
        droppable.appendChild(cleanClone);
      }

      // Every drop target says it is occupied, not just the one branch that used to.
      setDropFilled(droppable, true);
      // Publish placement so a declarative target re-renders before anything measures it.
      this.syncDragDropState();

      if (flipStates && this.enableFlipAnimations) {
        animateMultipleFlips(flipStates, this.flipAnimationConfig);
      }

      // FLIP: Animate the newly dropped element from drag position to final position
      if (dragClonePosition && this.enableFlipAnimations) {
        requestAnimationFrame(() => {
          const finalPosition = cleanClone.getBoundingClientRect();

          const deltaX = dragClonePosition.left - finalPosition.left;
          const deltaY = dragClonePosition.top - finalPosition.top;

          // Only animate if there's actual movement
          if (deltaX !== 0 || deltaY !== 0) {
            cleanClone.animate(
              [
                {
                  transform: `translate(${deltaX}px, ${deltaY}px)`,
                  opacity: 0.8
                },
                {
                  transform: 'translate(0, 0)',
                  opacity: 1
                }
              ],
              {
                duration: this.flipAnimationConfig.duration || 200,
                easing: this.flipAnimationConfig.easing || 'ease',
                fill: 'both'
              }
            );
          }
        });
      }

      const identifier = draggable.getAttribute('identifier');
      if (identifier) {
        this.updateInventoryBasedOnMatchMax(identifier);
      }

      this.cacheInteractiveElements();
      this.checkAllMaxAssociations();
    }

    private returnToInventory(element: HTMLElement, from?: DOMRect): void {
      const identifier = element.getAttribute('identifier');
      if (identifier) {
        // Remove all clones of this item from drop zones
        this.trackedDroppables.forEach(droppable => {
          const clones = this.chipsIn(droppable).filter(chip => chip.getAttribute('identifier') === identifier);
          clones.forEach(clone => this.removeChipFromDroppable(droppable, clone));
          if (clones.length > 0 && this.chipsIn(droppable).length === 0) {
            setDropFilled(droppable, false);
          }
        });

        this.restoreOriginalInInventory(identifier, from);
      }
      this.cacheInteractiveElements();
      this.checkAllMaxAssociations();
    }

    /**
     * @param from where the chip was last painted on screen. Given one, the restored inventory item
     * travels back from there instead of blinking into the bank. The bank's *other* chips still
     * FLIP from their own captured positions, since removing a placeholder can rewrap the row.
     */
    private restoreOriginalInInventory(identifier: string, from?: DOMRect): void {
      const inventoryItems = findInventoryItems(this.trackedDragContainers, identifier);

      // FLIP: First - capture positions of the items that merely *shift* when the hole closes.
      //
      // The returning items themselves are excluded. They are still hidden at this point, so their
      // rect is 0×0 at the viewport origin, and FLIP read that as their "first" state: the chip
      // animated in from the top-left corner of the screen at scale(0). It travels from `from`
      // instead, which is where the user last saw it.
      const returning = new Set<HTMLElement>(inventoryItems);
      const shiftingItems: HTMLElement[] = [];
      this.trackedDragContainers.forEach(container => {
        container
          .querySelectorAll<HTMLElement>('[qti-draggable="true"]')
          .forEach(item => !returning.has(item) && shiftingItems.push(item));
      });

      const flipStates =
        this.enableFlipAnimations && shiftingItems.length > 0 ? captureMultipleFlipStates(shiftingItems) : null;

      // FLIP: Last - restore the inventory items (may cause reflow)
      inventoryItems.forEach(item => {
        clearDragChipStates(item);
        item.style.display = '';
        item.style.visibility = 'visible';
      });

      // FLIP: Invert & Play - animate items that may have shifted
      if (flipStates && this.enableFlipAnimations) {
        animateMultipleFlips(flipStates, this.flipAnimationConfig);
      }

      // ...and fly the chip itself home, from the dropzone or the cursor it left.
      inventoryItems.forEach(item => this.animateReturn(item, from));
    }

    private updateInventoryBasedOnMatchMax(identifier: string): void {
      const inventoryItems = findInventoryItems(this.trackedDragContainers, identifier);
      const matchMax = getMatchMaxValue(this.trackedDraggables, identifier);

      // Count only items placed in dropzones, not in inventory/drag containers
      const placedInDropzones = this.trackedDroppables.reduce((count, droppable) => {
        if (this.isDeclarativeTarget(droppable)) {
          return count + this.chipsIn(droppable).filter(c => c.getAttribute('identifier') === identifier).length;
        }
        return count + droppable.querySelectorAll(`[identifier="${identifier}"]`).length;
      }, 0);

      // This source chip's copies are all placed — it becomes the hole they left behind.
      inventoryItems.forEach(item => {
        setDragChipState(item, 'placeholder', matchMax !== 0 && placedInDropzones >= matchMax);
      });
    }

    private checkAllMaxAssociations(): void {
      const totalAssociations = this.totalAssociationsFromState();

      const maxReached = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;

      this.trackedDroppables.forEach(droppable => {
        // Don't disable the source droppable during an active drag
        const isDragSource = droppable.hasAttribute('data-drag-source');
        const isAtCapacity = this.droppableAtCapacityFromState(droppable);

        if ((maxReached || isAtCapacity) && !isDragSource) {
          droppable.setAttribute('disabled', '');
        } else {
          droppable.removeAttribute('disabled');
        }
      });
    }

    public override saveResponse(): void;
    public override saveResponse(value: string | string[]): void;
    public override saveResponse(value?: string | string[]): void {
      const getResponse = (this as unknown as { getResponse?: () => unknown }).getResponse;
      const candidate = value ?? (typeof getResponse === 'function' ? getResponse.call(this) : undefined);
      const responseData = Array.isArray(candidate)
        ? candidate
        : typeof candidate === 'string'
          ? [candidate]
          : (() => {
              this.cacheInteractiveElements();
              return this.responseFromState();
            })();

      // Persist response state without mutating the DOM tree.
      // Using the response setter here can trigger reset/replay flows that clear
      // partially completed interactions (e.g. associate left side dropped first).
      this._response = responseData;
      this._internals.setFormValue(JSON.stringify(this._response));

      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          bubbles: true,
          composed: true,
          detail: {
            responseIdentifier: (this as unknown as { responseIdentifier?: string }).responseIdentifier,
            response: responseData
          }
        })
      );

      this.requestUpdate();
    }

    override reset(): void;
    override reset(save: boolean): void;
    override reset(save = true): void {
      this.trackedDroppables.forEach(droppable => {
        this.clearChips(droppable);
      });

      this.trackedDraggables.forEach(draggable => {
        const identifier = draggable.getAttribute('identifier');
        if (identifier) {
          this.restoreOriginalInInventory(identifier);
        }
      });

      this.resetDragState();
      this.cacheInteractiveElements();

      this._response = [];
      this._internals.setFormValue(JSON.stringify(this._response));

      if (save) {
        this.saveResponse();
      }
    }

    public override validate(): boolean {
      const totalAssociations = this.totalAssociationsFromState();

      const atMaxCapacity = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;
      const exceedsMax = this.maxAssociations > 0 && totalAssociations > this.maxAssociations;
      const belowMin = this.minAssociations > 0 && totalAssociations < this.minAssociations;

      let validityMessage = '';
      let isValid = true;

      // Priority order: exceedsMax > (atMaxCapacity && blockedDrop) > belowMin
      if (exceedsMax) {
        // QTI conformance: default platform message format
        validityMessage =
          this.getFirstMessageAttribute(['data-max-associations-message', 'data-max-selections-message']) ||
          this.dataset.maxAssociationsMessage ||
          this.dataset.maxSelectionsMessage ||
          `You've selected too many associations. Maximum allowed is ${this.maxAssociations}.`;
        isValid = false;
      } else if (atMaxCapacity && this._dropBlockedDueToMax && this.shouldTreatBlockedMaxAsInvalid()) {
        validityMessage =
          this.getFirstMessageAttribute(['data-max-associations-message', 'data-max-selections-message']) ||
          this.dataset.maxAssociationsMessage ||
          this.dataset.maxSelectionsMessage ||
          `You've selected too many associations. Maximum allowed is ${this.maxAssociations}.`;
        isValid = false;
      } else if (belowMin) {
        validityMessage =
          this.getFirstMessageAttribute(['data-min-associations-message', 'data-min-selections-message']) ||
          this.dataset.minAssociationsMessage ||
          this.dataset.minSelectionsMessage ||
          `Please select at least ${this.minAssociations} ${this.minAssociations === 1 ? 'association' : 'associations'}.`;
        isValid = false;
        // Clear the blocked flag since we're now in a different error state
        this._dropBlockedDueToMax = false;
      } else {
        // Clear the blocked flag when validation passes
        this._dropBlockedDueToMax = false;
      }

      const validityAnchor = this.trackedDroppables[0] ?? this.trackedDraggables[0] ?? this;
      this._internals.setValidity(isValid ? {} : { customError: true }, validityMessage, validityAnchor);

      return isValid;
    }

    public override reportValidity(): boolean {
      const isValid = this._internals.reportValidity();

      // Query the validation message element directly in the shadow root
      // to avoid timing issues with @query decorator
      const validationMessageElement = this.shadowRoot?.querySelector('#validation-message') as HTMLElement | null;

      if (validationMessageElement) {
        if (!isValid) {
          validationMessageElement.textContent = this._internals.validationMessage;
          validationMessageElement.style.setProperty('display', 'block', 'important');
        } else {
          validationMessageElement.textContent = '';
          validationMessageElement.style.display = 'none';
        }
      }

      return isValid;
    }
  }

  return DragDropSlottedElement as unknown as Constructor<DragDropSlotted> & T;
};
