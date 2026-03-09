import { property } from 'lit/decorators.js';

import {
  collectResponseData,
  countTotalAssociations,
  findInventoryItems,
  getMatchMaxValue,
  isDroppableAtCapacity,
  applyDropzoneAutoSizing
} from './utils/drag-drop.utils';
import { DragDropCoreMixin } from './drag-drop-core.mixin';
import { captureMultipleFlipStates, animateMultipleFlips, type FlipAnimationOptions } from './utils/flip.utils';

import type { CollisionDetectionAlgorithm } from './utils/drag-drop.utils';
import type { Interaction, IInteraction } from '@qti-components/base';
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
    public autoSizeDropzones = false;

    get response(): string {
      const getResponse = (this as unknown as { getResponse?: () => unknown }).getResponse;
      const candidate = typeof getResponse === 'function' ? getResponse.call(this) : undefined;
      const computedResponse = Array.isArray(candidate)
        ? candidate
        : (() => {
            this.cacheInteractiveElements();
            return collectResponseData(this.trackedDroppables, draggablesSelector);
          })();
      return computedResponse.join(',');
    }

    set response(value: string | string[]) {
      if (Array.isArray(value)) {
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
              return collectResponseData(this.trackedDroppables, draggablesSelector);
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
      this.applyConfiguredChoicesContainerWidth();
      this.updateMinDimensionsForDropZones();
    }

    private applyConfiguredChoicesContainerWidth(): void {
      const configuredWidth = this.dataset.choicesContainerWidth;
      if (!configuredWidth) return;

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
      const totalAssociations = countTotalAssociations(this.trackedDroppables, draggablesSelector);
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
        this.dropDraggableInDroppable(dragSource, sourceDroppable);
      } else if (dragSource.style.opacity === '0') {
        // Drag started from inventory: simply restore inventory visual state.
        this.restoreInventoryItem(dragSource);
        this.cacheInteractiveElements();
        this.checkAllMaxAssociations();
      }

      // Only flag "blocked due to max" when the user attempted to drop on
      // a disabled non-source target while global max is reached.
      // This avoids showing max-capacity errors for unrelated invalid drops
      // (e.g. dropping outside any known dropzone).
      const totalAssociations = countTotalAssociations(this.trackedDroppables, draggablesSelector);
      const maxReached = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;
      const attemptedDisabledTarget =
        !!currentTarget && currentTarget.hasAttribute('disabled') && !currentTarget.hasAttribute('data-drag-source');

      this._dropBlockedDueToMax = attemptedDisabledTarget && maxReached;
      this.validate();
      this.reportValidity();
    }

    private updateMinDimensionsForDropZones(): void {
      if (this.trackedDraggables.length === 0) return;

      applyDropzoneAutoSizing(this.trackedDraggables, this.trackedDroppables, this.trackedDragContainers);
    }

    private restoreInventoryItem(dragSource: HTMLElement): void {
      dragSource.style.opacity = '1.0';
      dragSource.style.display = '';
      dragSource.style.position = '';
      dragSource.style.pointerEvents = 'auto';
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
            this.returnToInventory(draggable);
            this._dropBlockedDueToMax = false;
            this.validate();
            return;
          }

          // Keep the inventory source item in place for interactions that don't
          // use "drop to inventory clears placed clones" semantics (e.g. gap-match).
          this.restoreInventoryItem(draggable);
          this.cacheInteractiveElements();
          this.checkAllMaxAssociations();
          this._dropBlockedDueToMax = false;
          this.validate();
          return;
        }

        const identifier = draggable.getAttribute('identifier');
        draggable.remove();

        if (identifier) {
          this.restoreOriginalInInventory(identifier);
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
          droppable.querySelector(draggablesSelector) || droppable.querySelector('[qti-draggable="true"]');
        if (existing) {
          const existingId = existing.getAttribute('identifier');
          existing.remove();

          if (existingId) {
            this.restoreOriginalInInventory(existingId);
          }
        }
      }

      const cleanClone = draggable.cloneNode(true) as HTMLElement;
      cleanClone.removeAttribute('style'); // Remove inline styles from the clone
      cleanClone.removeAttribute('data-keyboard-dragging'); // Remove keyboard dragging indicator
      cleanClone.setAttribute('qti-draggable', 'true');
      cleanClone.setAttribute('tabindex', '0');

      // FLIP: Last - add the new element (this may cause siblings to shift)
      if (droppable.tagName === 'SLOT') {
        cleanClone.setAttribute('slot', droppable.getAttribute('name') || '');
      } else if (droppable.tagName === 'QTI-SIMPLE-ASSOCIABLE-CHOICE') {
        cleanClone.setAttribute('slot', 'qti-simple-associable-choice');
        droppable.appendChild(cleanClone);
        droppable.setAttribute('data-has-drop', 'true');
      } else {
        droppable.appendChild(cleanClone);
      }

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

    private returnToInventory(element: HTMLElement): void {
      const identifier = element.getAttribute('identifier');
      if (identifier) {
        // Remove all clones of this item from drop zones
        this.trackedDroppables.forEach(droppable => {
          const clones = Array.from(droppable.querySelectorAll(`[identifier="${identifier}"][qti-draggable="true"]`));
          clones.forEach(clone => {
            clone.remove();
            if (droppable.tagName === 'QTI-SIMPLE-ASSOCIABLE-CHOICE') {
              droppable.removeAttribute('data-has-drop');
            }
          });
        });

        this.restoreOriginalInInventory(identifier);
      }
      this.cacheInteractiveElements();
      this.checkAllMaxAssociations();
    }

    private restoreOriginalInInventory(identifier: string): void {
      const inventoryItems = findInventoryItems(this.trackedDragContainers, identifier);

      // FLIP: First - capture positions of all items in inventory containers
      const allInventoryItems: HTMLElement[] = [];
      this.trackedDragContainers.forEach(container => {
        allInventoryItems.push(...Array.from(container.querySelectorAll<HTMLElement>('[qti-draggable="true"]')));
      });

      const flipStates =
        this.enableFlipAnimations && allInventoryItems.length > 0 ? captureMultipleFlipStates(allInventoryItems) : null;

      // FLIP: Last - restore the inventory items (may cause reflow)
      inventoryItems.forEach(item => {
        item.style.opacity = '1.0';
        item.style.pointerEvents = 'auto';
        item.style.display = '';
        item.style.visibility = 'visible';

        item.style.setProperty('opacity', '1.0', 'important');
        item.style.setProperty('pointer-events', 'auto', 'important');
      });

      // FLIP: Invert & Play - animate items that may have shifted
      if (flipStates && this.enableFlipAnimations) {
        animateMultipleFlips(flipStates, this.flipAnimationConfig);
      }
    }

    private updateInventoryBasedOnMatchMax(identifier: string): void {
      const inventoryItems = findInventoryItems(this.trackedDragContainers, identifier);
      const matchMax = getMatchMaxValue(this.trackedDraggables, identifier);
      
      // Count only items placed in dropzones, not in inventory/drag containers
      const placedInDropzones = this.trackedDroppables.reduce((count, droppable) => {
        const items = droppable.querySelectorAll(`[identifier="${identifier}"]`);
        return count + items.length;
      }, 0);

      inventoryItems.forEach(item => {
        if (matchMax !== 0 && placedInDropzones >= matchMax) {
          item.style.opacity = '0.0';
          item.style.pointerEvents = 'none';
        } else {
          item.style.opacity = '1.0';
          item.style.pointerEvents = 'auto';
        }
      });
    }

    private checkAllMaxAssociations(): void {
      const totalAssociations = countTotalAssociations(this.trackedDroppables, draggablesSelector);

      const maxReached = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;

      this.trackedDroppables.forEach(droppable => {
        // Don't disable the source droppable during an active drag
        const isDragSource = droppable.hasAttribute('data-drag-source');
        const isAtCapacity = isDroppableAtCapacity(droppable, draggablesSelector);

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
              return collectResponseData(this.trackedDroppables, draggablesSelector);
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
        const items = Array.from(droppable.querySelectorAll(draggablesSelector));
        items.forEach(item => item.remove());
        if (droppable.tagName === 'QTI-SIMPLE-ASSOCIABLE-CHOICE') {
          droppable.removeAttribute('data-has-drop');
        }
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
      const totalAssociations = countTotalAssociations(this.trackedDroppables, draggablesSelector);

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
