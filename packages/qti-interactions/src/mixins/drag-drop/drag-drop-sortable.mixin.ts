import { DragDropCoreMixin } from './drag-drop-core.mixin';
import { defaultSortingStrategy } from './strategies/sorting-strategy';

import type { DragDropCore } from './drag-drop-core.mixin';
import type { Interaction } from '@qti-components/base';
import type { SortingStrategy } from './strategies/sorting-strategy';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

/**
 * Drag/drop mixin that keeps a single list of draggables sortable.
 * Draggables are treated as both the draggable items and the drop targets.
 * A response is the ordered list of `identifier` attributes for all draggables.
 */
export const DragDropSortableMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  dragContainersSelector = 'slot[part="drags"]',
  sortingStrategy: SortingStrategy = defaultSortingStrategy
) => {
  const Core = DragDropCoreMixin(superClass, draggablesSelector, draggablesSelector, dragContainersSelector);

  abstract class DragDropSortableElement extends Core {
    protected _response: string[] = [];
    protected _initialOrder: string[] = [];
    protected sortableContainer: HTMLElement | null = null;
    protected dropPlaceholder: HTMLElement | null = null;
    protected lastHoverTarget: HTMLElement | null = null;
    protected lastPlacement: { target: HTMLElement; after: boolean } | null = null;
    protected strategy: SortingStrategy = sortingStrategy;

    public get response(): string | string[] | null {
      return [...this._response];
    }

    public set response(value: string | string[] | null) {
      const next = Array.isArray(value) ? [...value] : value ? [value] : [];
      this._response = next;
      this._internals.setFormValue(JSON.stringify(this._response));

      // Reorder the DOM to match the provided response
      this.reorderDOMByIdentifiers(next);
      this.cacheInteractiveElements();
    }

    /**
     * Reorder DOM elements to match a given array of identifiers.
     * Inspired by dnd-kit's approach to separating data from DOM manipulation.
     *
     * @param identifiers - Ordered array of identifier strings
     */
    protected reorderDOMByIdentifiers(identifiers: string[]): void {
      const container =
        this.sortableContainer ??
        this.trackedDraggables[0]?.parentElement ??
        this.trackedDragContainers[0] ??
        (this as unknown as HTMLElement);

      if (!container) return;

      // Create a map of identifiers to elements
      const byId = new Map(
        this.trackedDraggables
          .map(el => [el.getAttribute('identifier') ?? '', el] as const)
          .filter(([id]) => Boolean(id))
      );

      // Append elements in the specified order
      identifiers.forEach(id => {
        const el = byId.get(id);
        if (el) {
          container.appendChild(el);
        }
      });

      // Append any elements not in the identifiers list at the end
      this.trackedDraggables
        .filter(el => {
          const id = el.getAttribute('identifier') ?? '';
          return id && !identifiers.includes(id);
        })
        .forEach(el => container.appendChild(el));
    }

    public override afterCache(): void {
      this.sortableContainer =
        this.trackedDraggables[0]?.parentElement ?? this.trackedDragContainers[0] ?? (this as unknown as HTMLElement);

      // Capture the initial DOM order once so reset can restore it.
      if (this._initialOrder.length === 0) {
        this._initialOrder = this.collectResponse();
      }
    }

    protected createDropPlaceholder(source: HTMLElement, rect: DOMRect): HTMLElement {
      const placeholder = document.createElement('div');
      placeholder.setAttribute('data-drop-placeholder', 'true');
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.margin = window.getComputedStyle(source).margin;
      placeholder.style.boxSizing = 'border-box';
      placeholder.style.border = '2px dashed var(--qti-drop-placeholder, #c1c1c1)';
      placeholder.style.borderRadius = getComputedStyle(source).borderRadius;
      placeholder.style.background = 'transparent';
      placeholder.style.transition = 'transform 150ms ease';
      return placeholder;
    }

    public override initiateDrag(
      dragElement: HTMLElement,
      startX: number,
      startY: number,
      inputType: 'mouse' | 'touch'
    ): void {
      if (this.dragState.dragging) {
        console.warn('⚠️ [Observable DnD] Already dragging, ignoring initiateDrag');
        return;
      }
      if (dragElement.hasAttribute('data-drag-clone')) {
        console.warn('⚠️ [Observable DnD] Attempted to drag visual clone, ignoring');
        return;
      }

      const rect = dragElement.getBoundingClientRect();
      this.dropPlaceholder = this.createDropPlaceholder(dragElement, rect);

      this.dragState = {
        dragging: true,
        dragSource: dragElement,
        dragClone: this.createDragClone(dragElement, rect),
        startOffset: {
          x: startX - rect.left,
          y: startY - rect.top
        },
        currentTarget: null,
        inputType: inputType
      };

      dragElement.style.display = 'none';
      dragElement.style.pointerEvents = 'none';

      this.updateClonePosition(startX, startY);
      this.activateAllDroppables();
      this.setupMoveObservables(inputType);
    }

    /**
     * Place the placeholder element at the appropriate position.
     * Uses the sorting strategy to calculate insertion position.
     */
    protected placePlaceholder(dropTarget: HTMLElement | null, clientX: number, clientY: number): void {
      if (!this.dropPlaceholder || !this.sortableContainer) return;

      // Use the provided dropTarget, or fall back to the last known hover target
      const target = dropTarget || this.lastHoverTarget;
      if (!target || target === this.dragState.dragSource) return;

      // Keep placeholder in the container
      if (this.dropPlaceholder.parentElement !== this.sortableContainer) {
        this.sortableContainer.appendChild(this.dropPlaceholder);
      }

      // Get all siblings excluding the placeholder and the hidden drag source
      const siblings = Array.from(this.sortableContainer.querySelectorAll<HTMLElement>(draggablesSelector)).filter(
        el => el !== this.dropPlaceholder && el.style.display !== 'none'
      );

      const source = this.dragState.dragSource;
      if (!source || siblings.indexOf(target) === -1) return;

      // Use strategy to determine insertion position
      const insertPosition = this.strategy.getInsertPosition(siblings, source, target, clientX, clientY);
      if (!insertPosition) return;

      const { placeAfter } = insertPosition;

      if (this.lastPlacement && this.lastPlacement.target === target && this.lastPlacement.after === placeAfter) {
        return;
      }

      // Calculate the reference node for insertion
      // If placeAfter is true, insert after the target (before its next sibling)
      // If placeAfter is false, insert before the target
      const referenceNode = placeAfter ? target.nextElementSibling : target;

      this.sortableContainer.insertBefore(this.dropPlaceholder, referenceNode);
      this.lastPlacement = { target, after: placeAfter };
    }

    protected handleDragMove(clientX: number, clientY: number): void {
      const baseProto = Object.getPrototypeOf(DragDropSortableElement.prototype) as {
        handleDragMove?: (x: number, y: number) => void;
      };
      baseProto.handleDragMove?.call(this, clientX, clientY);
      if (this.dragState.currentTarget && this.dragState.currentTarget !== this.dropPlaceholder) {
        this.lastHoverTarget = this.dragState.currentTarget;
      }
      this.placePlaceholder(this.dragState.currentTarget ?? this.lastHoverTarget, clientX, clientY);
    }

    public override allowDrop(_draggable: HTMLElement, droppable: HTMLElement): boolean {
      return this.trackedDraggables.includes(droppable) || this.trackedDragContainers.includes(droppable);
    }

    public override handleDrop(draggable: HTMLElement, _droppable: HTMLElement): void {
      if (this.dropPlaceholder?.parentElement) {
        this.dropPlaceholder.parentElement.replaceChild(draggable, this.dropPlaceholder);
      } else {
        const container = this.sortableContainer ?? draggable.parentElement;
        if (container) {
          container.appendChild(draggable);
        }
      }

      // Restore draggable element visibility
      draggable.style.opacity = '1.0';
      draggable.style.display = '';
      draggable.style.pointerEvents = 'auto';

      // Cleanup
      this.dropPlaceholder?.remove();
      this.dropPlaceholder = null;
      this.lastPlacement = null;

      this.cacheInteractiveElements();
    }

    public override handleInvalidDrop(dragSource: HTMLElement | null): void {
      if (dragSource) {
        dragSource.style.opacity = '1.0';
        dragSource.style.display = '';
        dragSource.style.pointerEvents = 'auto';
      }
      if (this.dropPlaceholder) {
        this.dropPlaceholder.remove();
        this.dropPlaceholder = null;
      }
      this.lastPlacement = null;
    }

    protected collectResponse(): string[] {
      return this.trackedDraggables.map(el => el.getAttribute('identifier')).filter((id): id is string => Boolean(id));
    }

    public override saveResponse(): void;
    public override saveResponse(value: string | string[]): void;
    public override saveResponse(value?: string | string[]): void {
      const responseData = Array.isArray(value) ? value : typeof value === 'string' ? [value] : this.collectResponse();

      this._response = [...responseData];
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

    public override reset(): void;
    public override reset(save: boolean): void;
    public override reset(save = true): void {
      if (this._initialOrder.length > 0) {
        this.response = [...this._initialOrder];
      }

      this.resetDragState();
      if (this.dropPlaceholder) {
        this.dropPlaceholder.remove();
        this.dropPlaceholder = null;
      }
      this.lastPlacement = null;
      this.cacheInteractiveElements();

      if (save) {
        this.saveResponse();
      }
    }

    public override validate(): boolean {
      this._internals.setValidity({});
      return true;
    }

    public override reportValidity(): boolean {
      return this._internals.reportValidity();
    }
  }

  return DragDropSortableElement as unknown as Constructor<DragDropCore> & T;
};
