import { LitElement } from 'lit';
import { IInteraction } from '../interaction/interaction.interface';
import { DroppablesMixin } from './droppables-mixin';
import { FlippablesMixin } from './flippables-mixin';

import { property } from 'lit/decorators.js';
import { liveQuery } from '../../../../decorators/live-query';
import { TouchDragAndDrop } from './drag-drop-api';

type Constructor<T> = new (...args: any[]) => T;

interface InteractionConfiguration {
  copyStylesDragClone: boolean;
  dragCanBePlacedBack: boolean;
  dragOnClick: boolean;
}

export const DragDropInteractionMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  draggablesSelector: string,
  useShadowRootForDroppables: boolean,
  droppablesSelector: string
) => {
  class DragDropInteractionElement extends FlippablesMixin(
    DroppablesMixin(superClass, useShadowRootForDroppables, droppablesSelector),
    droppablesSelector,
    draggablesSelector
  ) {
    protected draggables = new Map<HTMLElement, { parent: HTMLElement; index: number }>();
    protected droppables: HTMLElement[] = [];
    dragDropApi: TouchDragAndDrop;

    @property({ type: String, attribute: 'response-identifier' }) responseIdentifier = '';

    @property({ attribute: false, type: Object }) configuration: InteractionConfiguration = {
      copyStylesDragClone: true,
      dragCanBePlacedBack: true,
      dragOnClick: false
    };

    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) readonly = false;
    @property({ type: Number, reflect: true, attribute: 'min-associations' }) minAssociations = 1;
    @property({ type: Number, reflect: true, attribute: 'max-associations' }) maxAssociations = 1;

    @liveQuery(draggablesSelector)
    handleDraggablesChange(dragsAdded: Element[], dragsRemoved: Element[]) {
      if (this.isMatchTabular()) return;
      const newDraggables = this.filterExistingDraggables(dragsAdded);

      if (newDraggables.length > 0) {
        this.addNewDraggables(newDraggables);
      }
    }

    override firstUpdated(changedProps): void {
      super.firstUpdated(changedProps);
      this.initializeDroppables();
    }

    override connectedCallback() {
      super.connectedCallback();
      this.initializeDragDropApi();
    }

    private initializeDragDropApi() {
      this.dragDropApi = new TouchDragAndDrop();
      this.dispatchEvent(
        new CustomEvent<DragDropInteractionElement>('qti-register-interaction', {
          bubbles: true,
          composed: true,
          detail: this
        })
      );
    }

    private isMatchTabular(): boolean {
      return this.classList.contains('qti-match-tabular');
    }

    private filterExistingDraggables(draggables: HTMLElement[]): HTMLElement[] {
      return draggables.filter(d => !this.draggables.has(d));
    }

    private addNewDraggables(draggables: HTMLElement[]): void {
      this.dragDropApi.addDraggableElements(draggables);
      draggables.forEach(draggable => this.storeDraggable(draggable));
    }

    private storeDraggable(draggable: HTMLElement): void {
      const index = Array.from(draggable.parentNode.children).indexOf(draggable);
      this.draggables.set(draggable, {
        parent: draggable.parentElement,
        index
      });
      draggable.style.viewTransitionName = `drag-${index}`;
      draggable.setAttribute('qti-draggable', 'true');
      draggable.addEventListener('dragstart', this.handleDragStart);
      draggable.addEventListener('dragend', this.handleDragEnd);
    }

    private initializeDroppables(): void {
      this.droppables = Array.from(
        useShadowRootForDroppables
          ? this.shadowRoot.querySelectorAll(droppablesSelector)
          : this.querySelectorAll(droppablesSelector)
      );
    }

    private handleDragStart = (ev: DragEvent) => {
      ev.dataTransfer.setData('text', ev.currentTarget.getAttribute('identifier'));
      ev.currentTarget.setAttribute('dragging', '');
      this.activateDroppables();
    };

    private handleDragEnd = (ev: DragEvent) => {
      ev.preventDefault();
      this.deactivateDroppables();
      const draggable = ev.currentTarget as HTMLElement;
      draggable.removeAttribute('dragging');
      if (!this.wasDropped(ev)) {
        if (this.configuration.dragCanBePlacedBack) {
          this.restoreInitialDraggablePosition(draggable);
        }
      }
      if (this.wasMoved(ev)) {
        this.saveResponse();
        this.checkMaxAssociations();
      }
    };

    private activateDroppables(): void {
      this.droppables.forEach(d => d.setAttribute('enabled', ''));
    }

    private deactivateDroppables(): void {
      this.droppables.forEach(d => d.removeAttribute('enabled'));
    }

    private wasDropped(ev: DragEvent): boolean {
      return ev.dataTransfer.dropEffect !== 'none';
    }

    private wasMoved(ev: DragEvent): boolean {
      return ev.dataTransfer.dropEffect === 'move';
    }

    private async restoreInitialDraggablePosition(draggable: HTMLElement): Promise<void> {
      const { parent, index } = this.draggables.get(draggable);
      const targetIndex = Math.min(index, parent.children.length);

      const moveDraggable = (draggable: HTMLElement, parent: HTMLElement, index: number) => {
        const targetIndex = Math.min(index, parent.children.length);
        parent.insertBefore(draggable, parent.children[targetIndex]);
      };

      // Fallback if view transitions are not supported
      if (!document.startViewTransition) {
        moveDraggable(draggable, parent, index);
        return;
      }

      // Use view transitions if supported
      const transition = document.startViewTransition(() => moveDraggable(draggable, parent, index));
      await transition.finished;

      this.saveResponse();
      this.checkMaxAssociations();
    }

    protected checkMaxAssociations(): void {
      this.droppables.forEach(d => {
        const maxMatch = +(d.getAttribute('match-max') || 1);
        const currentAssociations = d.querySelectorAll('[qti-draggable="true"]').length;
        const disableDroppable = currentAssociations >= maxMatch;

        disableDroppable ? this.disableDroppable(d) : this.enableDroppable(d);
      });
    }

    private disableDroppable(droppable: Element): void {
      droppable.setAttribute('disabled', '');
      droppable.removeAttribute('dropzone');
    }

    private enableDroppable(droppable: Element): void {
      droppable.removeAttribute('disabled');
      droppable.setAttribute('dropzone', 'move');
    }

    set response(response: string[]) {
      if (this.isMatchTabular()) return;

      this.resetDroppables();
      response?.forEach(entry => this.placeResponse(entry));
    }

    private placeResponse(response: string): void {
      const [dropId, ...dragIds] = response.split(' ').reverse();
      const droppable = this.findDroppableById(dropId);
      dragIds.forEach(dragId => this.placeDraggableInDroppable(dragId, droppable));
    }

    private findDroppableById(identifier: string): Element | undefined {
      return this.droppables.find(drop => drop.getAttribute('identifier') === identifier);
    }

    private async placeDraggableInDroppable(dragId: string, droppable: Element): Promise<void> {
      const draggable = this.querySelector<HTMLElement>(`[identifier=${dragId}]`);
      if (!droppable || !draggable) {
        console.error(`Cannot find draggable or droppable with the given identifier: ${dragId}`);
        return;
      }
      const moveElement = (): void => {
        droppable.appendChild(draggable);
      };

      if (!document.startViewTransition) {
        moveElement();
      } else {
        const transition = document.startViewTransition(moveElement);
        await transition.finished;
      }

      this.checkMaxAssociations();
    }

    validate(): boolean {
      const validAssociations = this.getValidAssociations();
      return this.minAssociations <= 0 || this.minAssociations <= validAssociations;
    }

    private getValidAssociations(): number {
      return this.droppables.filter(d => d.childElementCount > 0).length;
    }

    protected saveResponse(): void {
      const response = this.collectResponseData();
      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          bubbles: true,
          composed: true,
          detail: {
            responseIdentifier: this.responseIdentifier,
            response
          }
        })
      );
    }

    private collectResponseData(): string[] {
      return this.droppables.map(droppable => {
        const draggablesInDroppable = droppable.querySelectorAll('[qti-draggable="true"]');
        const identifiers = Array.from(draggablesInDroppable).map(d => d.getAttribute('identifier'));
        const droppableIdentifier = droppable.getAttribute('identifier');
        return [...identifiers, droppableIdentifier].join(' ');
      });
    }

    reset(save = true): void {
      this.resetDroppables();
      if (save) this.saveResponse();
    }

    private async resetDroppables(): Promise<void> {
      const moveDraggable = (draggable: HTMLElement, parent: HTMLElement, index: number) => {
        const targetIndex = Math.min(index, parent.children.length);
        parent.insertBefore(draggable, parent.children[targetIndex]);
      };

      if (!document.startViewTransition) {
        // Fallback if view transitions are not supported
        this.draggables.forEach(({ parent, index }, draggable) => {
          moveDraggable(draggable, parent, index);
        });
        return;
      }

      // Use view transitions if supported
      const transition = document.startViewTransition(() => {
        this.draggables.forEach(({ parent, index }, draggable) => {
          moveDraggable(draggable, parent, index);
        });
      });

      await transition.finished;
    }
  }

  return DragDropInteractionElement as Constructor<IInteraction> & T;
};
``;
