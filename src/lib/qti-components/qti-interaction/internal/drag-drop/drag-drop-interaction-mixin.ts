import { LitElement } from 'lit';
import { IInteraction } from '../interaction/interaction.interface';
import { DroppablesMixin } from './droppables-mixin';
import { FlippablesMixin } from './flippables-mixin';

import { property } from 'lit/decorators.js';
import { liveQuery } from '../../../../decorators/live-query';
import { TouchDragAndDrop } from './drag-drop-api';
import { Interaction } from '../interaction/interaction';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

interface InteractionConfiguration {
  copyStylesDragClone: boolean;
  dragCanBePlacedBack: boolean;
  dragOnClick: boolean;
}

export const DragDropInteractionMixin = <T extends Constructor<Interaction>>(
  superClass: T,
  draggablesSelector: string,
  useShadowRootForDroppables: boolean,
  droppablesSelector: string
) => {
  abstract class DragDropInteractionElement extends FlippablesMixin(
    DroppablesMixin(superClass, useShadowRootForDroppables, droppablesSelector),
    droppablesSelector,
    draggablesSelector
  ) {
    protected draggables = new Map<HTMLElement, { parent: HTMLElement; index: number }>();
    protected droppables: HTMLElement[] = [];
    dragDropApi: TouchDragAndDrop;

    @property({ attribute: false, type: Object }) configuration: InteractionConfiguration = {
      copyStylesDragClone: true,
      dragCanBePlacedBack: true,
      dragOnClick: false
    };
    @property({ type: Number, reflect: true, attribute: 'min-associations' }) minAssociations = 1;
    @property({ type: Number, reflect: true, attribute: 'max-associations' }) maxAssociations = 1;

    @liveQuery(draggablesSelector)
    handleDraggablesChange(dragsAdded: HTMLElement[], dragsRemoved: Element[]) {
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
      draggable.style.viewTransitionName = `drag-${index}-${this.getAttribute('identifier') || crypto.randomUUID()}`;
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
      // get data attribue data-choices-container-width
      const choicesContainerWidth = this.dataset.choicesContainerWidth;
      if (choicesContainerWidth) {
        this.droppables.forEach(d => {
          d.style.width = `${choicesContainerWidth}px`;
          d.style.boxSizing = `border-box`;
        });
      }
    }

    private handleDragStart = (ev: DragEvent) => {
      const target = ev.currentTarget as HTMLElement;
      ev.dataTransfer.setData('text', target.getAttribute('identifier'));
      if (this.responseIdentifier) {
        ev.dataTransfer.setData('responseIdentifier', this.responseIdentifier);
      }
      target.setAttribute('dragging', '');
      this.activateDroppables();
    };

    private handleDragEnd = async (ev: DragEvent) => {
      ev.preventDefault();
      this.deactivateDroppables();
      const draggable = ev.currentTarget as HTMLElement;
      draggable.removeAttribute('dragging');
      const wasDropped = await this.wasDropped(ev);
      console.log('wasDropped', wasDropped);
      if (!wasDropped) {
        if (this.configuration.dragCanBePlacedBack) {
          this.restoreInitialDraggablePosition(draggable);
        }
      }
    };

    private activateDroppables(): void {
      this.droppables.forEach(d => d.setAttribute('enabled', ''));
    }

    private deactivateDroppables(): void {
      this.droppables.forEach(d => d.removeAttribute('enabled'));
    }

    private async wasDropped(ev: DragEvent): Promise<boolean> {
      // const hasMoveTestItem = await this.checkForMoveTestItem(ev);
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
        draggable.style.transform = 'translate(0, 0)';
        this.checkMaxAssociations();
      };

      // Fallback if view transitions are not supported
      if (!document.startViewTransition) {
        moveDraggable(draggable, parent, index);
        return;
      }

      // Use view transitions if supported
      const transition = document.startViewTransition(() => {
        draggable.style.transform = '';
        moveDraggable(draggable, parent, index);
      });
      // transition.finished.then(() => {
      //   draggable.style.transition = '';
      // });
    }

    validate(): boolean {
      const validAssociations = this.getValidAssociations();
      let isValid = true;
      let validityMessage = '';

      if (this.maxAssociations > 0 && validAssociations > this.maxAssociations) {
        isValid = false;
        validityMessage =
          this.dataset.maxSelectionsMessage ||
          `You've selected too many associations. Maximum allowed is ${this.maxAssociations}.`;
      } else if (this.minAssociations > 0 && validAssociations < this.minAssociations) {
        isValid = false;
        validityMessage =
          this.dataset.minSelectionsMessage ||
          `You haven't selected enough associations. Minimum required is ${this.minAssociations}.`;
      }
      const lastElementChild = this.lastElementChild as HTMLElement;
      // Use null for the third argument if no specific anchor is needed
      this._internals.setValidity(isValid ? {} : { customError: true }, validityMessage, lastElementChild);

      this.reportValidity();
      return isValid;
    }

    override reportValidity(): boolean {
      const validationMessageElement = this.shadowRoot.querySelector('#validationMessage') as HTMLElement;
      if (validationMessageElement) {
        if (!this._internals.validity.valid) {
          validationMessageElement.textContent = this._internals.validationMessage;
          validationMessageElement.style.display = 'block';
        } else {
          validationMessageElement.textContent = '';
          validationMessageElement.style.display = 'none';
        }
      }
      return this._internals.validity.valid;
    }

    protected checkMaxAssociations(): void {
      this.droppables.forEach((d, index) => {
        const maxMatch = +(d.getAttribute('match-max') || 1);
        const currentAssociations = d.querySelectorAll('[qti-draggable="true"]').length;
        const disableDroppable = currentAssociations >= maxMatch;
        if (disableDroppable) {
          this.disableDroppable(d);
        } else {
          this.enableDroppable(d);
        }
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

    get value(): string[] {
      return this.collectResponseData();
    }

    set value(value: string[]) {
      if (this.isMatchTabular()) return;
      this.resetDroppables();
      value?.forEach(entry => this.placeResponse(entry));

      // Assuming this.value is an array of strings
      if (Array.isArray(value)) {
        const formData = new FormData();
        value.forEach(response => {
          formData.append(this.responseIdentifier, response);
        });
        this._internals.setFormValue(formData);
      } else {
        // Handle the case where this.value is not an array
        this._internals.setFormValue(value);
      }
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
        draggable.style.transform = 'translate(0, 0)';
        droppable.appendChild(draggable);
        this.checkMaxAssociations();
      };

      if (!document.startViewTransition) {
        moveElement();
      } else {
        const transition = document.startViewTransition(moveElement);
        await transition.finished;
      }
    }

    private getValidAssociations(): number {
      return this.droppables.filter(d => d.childElementCount > 0).length;
    }

    public saveResponse(): void {
      this.validate();
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
      const response = this.droppables
        .map(droppable => {
          const draggablesInDroppable = droppable.querySelectorAll('[qti-draggable="true"]');
          const identifiers = Array.from(draggablesInDroppable).map(d => d.getAttribute('identifier'));
          const droppableIdentifier = droppable.getAttribute('identifier');
          return identifiers.map(id => `${id} ${droppableIdentifier}`);
        })
        .flat();
      return response;
    }

    reset(save = true): void {
      this.resetDroppables();
      if (save) this.saveResponse();
    }

    private async resetDroppables(): Promise<void> {
      const moveDraggable = (draggable: HTMLElement, parent: HTMLElement, index: number) => {
        draggable.style.transform = 'translate(0, 0)';
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
