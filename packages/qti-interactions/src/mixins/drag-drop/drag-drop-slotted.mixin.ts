import { property, query } from 'lit/decorators.js';

import {
  collectResponseData,
  countTotalAssociations,
  findInventoryItems,
  getMatchMaxValue,
  isDroppableAtCapacity
} from './utils/drag-drop.utils';
import { DragDropCoreMixin } from './drag-drop-core.mixin';
import { captureMultipleFlipStates, animateMultipleFlips, type FlipAnimationOptions } from './utils/flip.utils';

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
  dragContainersSelector = 'slot[part="drags"]'
) => {
  const Core = DragDropCoreMixin(superClass, draggablesSelector, droppablesSelector, dragContainersSelector);

  abstract class DragDropSlottedElement extends Core implements IInteraction {
    @query('#validation-message')
    protected _validationMessageElement?: HTMLElement;

    @property({ attribute: false, type: Object }) protected configuration: InteractionConfiguration = {
      copyStylesDragClone: true,
      dragCanBePlacedBack: true,
      dragOnClick: false
    };
    @property({ type: Number, reflect: true, attribute: 'min-associations' }) minAssociations = 1;
    @property({ type: Number, reflect: true, attribute: 'max-associations' }) maxAssociations = 0;

    protected _response: string[] = [];

    // FLIP animation configuration
    public flipAnimationConfig: FlipAnimationOptions = {
      duration: 200, // Slightly faster for slotted interactions
      easing: 'ease' // Simple, browser-optimized easing
    };
    public enableFlipAnimations = true;

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
      return this.trackedDroppables.includes(droppable) && !droppable.hasAttribute('disabled');
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
    }

    public override handleInvalidDrop(dragSource: HTMLElement | null): void {
      if (dragSource && dragSource.style.opacity === '0') {
        this.restoreInventoryItem(dragSource);
      }

      if (dragSource) {
        this.returnToInventory(dragSource);
      }
    }

    private updateMinDimensionsForDropZones(): void {
      if (this.trackedDraggables.length === 0) return;

      // Find the maximum dimensions from all draggables
      let maxDraggableHeight = 0;
      let maxDraggableWidth = 0;

      this.trackedDraggables.forEach(draggable => {
        const rect = draggable.getBoundingClientRect();
        maxDraggableHeight = Math.max(maxDraggableHeight, rect.height);
        maxDraggableWidth = Math.max(maxDraggableWidth, rect.width);
      });

      const dropContainer: HTMLElement | null =
        this.trackedDroppables.length > 0 ? this.trackedDroppables[0].parentElement : null;

      const isGridLayout =
        this.trackedDroppables.length > 0 && this.trackedDroppables[0].tagName === 'QTI-SIMPLE-ASSOCIABLE-CHOICE';

      if (isGridLayout && dropContainer) {
        let maxWidth: number;

        if (dropContainer.clientWidth > 0) {
          const styles = window.getComputedStyle(dropContainer);
          const paddingLeft = parseFloat(styles.paddingLeft);
          const paddingRight = parseFloat(styles.paddingRight);
          maxWidth = dropContainer.clientWidth - paddingLeft - paddingRight;
        } else {
          maxWidth = Math.min(window.innerWidth * 0.8, 600);
        }

        dropContainer.style.gridTemplateColumns = `repeat(auto-fit, minmax(calc(min(${maxWidth}px, ${maxDraggableWidth}px + 2 * var(--qti-dropzone-padding, 0.5rem))), 1fr))`;
      }

      this.trackedDroppables.forEach(droppable => {
        droppable.style.minHeight = `${maxDraggableHeight}px`;

        if (isGridLayout) {
          droppable.style.minWidth = `${maxDraggableWidth}px`;
        }

        const dropSlot: HTMLElement | null = droppable.shadowRoot?.querySelector('slot[part="dropslot"]');
        if (dropSlot) {
          dropSlot.style.minHeight = `${maxDraggableHeight}px`;
        }
      });

      this.trackedDragContainers.forEach(dragContainer => {
        dragContainer.style.minHeight = `${maxDraggableHeight}px`;
      });
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
        console.warn('⚠️ [Observable DnD] Attempted to drop into drag container via dropDraggableInDroppable');
        const identifier = draggable.getAttribute('identifier');
        draggable.remove();

        if (identifier) {
          this.restoreOriginalInInventory(identifier);
        }

        this.cacheInteractiveElements();
        this.checkAllMaxAssociations();

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
        const isAtCapacity = isDroppableAtCapacity(droppable, draggablesSelector);
        if (maxReached || isAtCapacity) {
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
      const exceedsMax = this.maxAssociations > 0 && totalAssociations > this.maxAssociations;
      const belowMin = this.minAssociations > 0 && totalAssociations < this.minAssociations;

      let validityMessage = '';
      let isValid = true;

      if (exceedsMax) {
        validityMessage =
          this.dataset.maxAssociationsMessage ||
          `Please create no more than ${this.maxAssociations} ${this.maxAssociations === 1 ? 'association' : 'associations'}.`;
        isValid = false;
      } else if (belowMin) {
        validityMessage =
          this.dataset.minAssociationsMessage ||
          `Please create at least ${this.minAssociations} ${this.minAssociations === 1 ? 'association' : 'associations'}.`;
        isValid = false;
      }

      const validityAnchor = this.trackedDroppables[0] ?? this.trackedDraggables[0] ?? this;
      this._internals.setValidity(isValid ? {} : { customError: true }, validityMessage, validityAnchor);

      return isValid;
    }

    public override reportValidity(): boolean {
      const isValid = this._internals.reportValidity();

      if (this._validationMessageElement) {
        if (!isValid) {
          this._validationMessageElement.textContent = this._internals.validationMessage;
          this._validationMessageElement.style.setProperty('display', 'block', 'important');
        } else {
          this._validationMessageElement.textContent = '';
          this._validationMessageElement.style.display = 'none';
        }
      }

      return isValid;
    }
  }

  return DragDropSlottedElement as Constructor<IInteraction> & T;
};
