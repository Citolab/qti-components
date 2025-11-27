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

type Constructor<T = {}> = abstract new (...args: any[]) => T;

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
  collisionAlgorithm: CollisionDetectionAlgorithm = 'closestCorners'
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
      // Apply QTI spec default for gap-match interactions when attribute is not set
      if (!this._maxAssociationsDefaultApplied) {
        this._maxAssociationsDefaultApplied = true;
        const tagName = this.tagName?.toLowerCase() || '';
        const isGapMatchInteraction =
          tagName === 'qti-graphic-gap-match-interaction' || tagName === 'qti-gap-match-interaction';

        // If it's a gap-match interaction and no explicit attribute was set, default to 1
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

    get response(): string[] {
      return [...this._response];
    }

    set response(value: string | string[]) {
      this._response = Array.isArray(value) ? [...value] : typeof value === 'string' && value.length > 0 ? [value] : [];

      this._internals.setFormValue(JSON.stringify(this._response));
    }

    public override afterCache(): void {
      this.updateMinDimensionsForDropZones();
    }

    public override allowDrop(_draggable: HTMLElement, droppable: HTMLElement): boolean {
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
      if (dragSource && dragSource.style.opacity === '0') {
        this.restoreInventoryItem(dragSource);
      }

      if (dragSource) {
        this.returnToInventory(dragSource);
      }

      // Check if the drop was blocked due to max associations being reached
      const totalAssociations = countTotalAssociations(this.trackedDroppables, draggablesSelector);
      const maxReached = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;

      if (maxReached) {
        // Flag that drop was blocked and show validation message
        this._dropBlockedDueToMax = true;
        this.validate();
        this.reportValidity();
      }
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

    private dropDraggableInDroppable(
      draggable: HTMLElement,
      droppable: HTMLElement,
      dragClonePosition?: DOMRect
    ): void {
      const isDragContainer = this.trackedDragContainers.includes(droppable);

      if (isDragContainer) {
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

      const matchMax = parseInt(droppable.getAttribute('match-max') || '1', 10) || 1;
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
      const currentDraggables = this.trackedDraggables.filter(d => d.getAttribute('identifier') === identifier);

      inventoryItems.forEach(item => {
        if (matchMax !== 0 && currentDraggables.length >= matchMax) {
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

      this.response = responseData;

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

      this.response = [];

      if (save) {
        this.saveResponse();
      }
    }

    public override validate(): boolean {
      const totalAssociations = countTotalAssociations(this.trackedDroppables, draggablesSelector);

      // Check if we're at max capacity
      const atMaxCapacity = this.maxAssociations > 0 && totalAssociations >= this.maxAssociations;
      const exceedsMax = this.maxAssociations > 0 && totalAssociations > this.maxAssociations;
      const belowMin = this.minAssociations > 0 && totalAssociations < this.minAssociations;

      let validityMessage = '';
      let isValid = true;

      // Priority order: exceedsMax > (atMaxCapacity && _dropBlockedDueToMax) > belowMin
      if (exceedsMax) {
        // QTI conformance: default platform message format
        validityMessage =
          this.dataset.maxAssociationsMessage ||
          this.dataset.maxSelectionsMessage ||
          `You've selected too many associations. Maximum allowed is ${this.maxAssociations}.`;
        isValid = false;
      } else if (atMaxCapacity && this._dropBlockedDueToMax) {
        // Show "max reached" message only when drop was actively blocked
        // QTI conformance: default platform message format
        validityMessage =
          this.dataset.maxAssociationsMessage ||
          this.dataset.maxSelectionsMessage ||
          `You've selected too many associations. Maximum allowed is ${this.maxAssociations}.`;
        isValid = false;
      } else if (belowMin) {
        validityMessage =
          this.dataset.minAssociationsMessage ||
          this.dataset.minSelectionsMessage ||
          `Please create at least ${this.minAssociations} ${this.minAssociations === 1 ? 'association' : 'associations'}.`;
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

  return DragDropSlottedElement as Constructor<IInteraction> & T;
};
