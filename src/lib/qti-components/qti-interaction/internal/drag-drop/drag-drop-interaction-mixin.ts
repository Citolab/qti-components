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
  droppablesSelector: string,
  dragContainersSelector: string
) => {
  abstract class DragDropInteractionElement extends FlippablesMixin(
    DroppablesMixin(superClass, droppablesSelector),
    droppablesSelector,
    draggablesSelector
  ) {
    protected draggables = new Map<HTMLElement, { parent: HTMLElement; index: number }>();
    dragDropApi: TouchDragAndDrop;

    @property({ attribute: false, type: Object }) configuration: InteractionConfiguration = {
      copyStylesDragClone: true,
      dragCanBePlacedBack: true,
      dragOnClick: false
    };
    @property({ type: Number, reflect: true, attribute: 'min-associations' }) minAssociations = 1;
    @property({ type: Number, reflect: true, attribute: 'max-associations' }) maxAssociations = 1;

    @liveQuery(dragContainersSelector)
    handleDraggableContainerChange(dragContainersAdded: HTMLElement[], dragContainersRemoved: HTMLElement[]) {
      if (this.isMatchTabular()) return;
      if (dragContainersAdded.length > 0 || dragContainersRemoved.length > 0) {
        this.dragContainersModified(dragContainersAdded || [], dragContainersRemoved || []);
      }
    }

    @liveQuery(draggablesSelector)
    handleDraggablesChange(dragsAdded: HTMLElement[], dragsRemoved: HTMLElement[]) {
      if (this.isMatchTabular()) return;
      if (dragsAdded.length > 0 || dragsRemoved.length > 0) {
        this.draggablesModified(dragsAdded || [], dragsRemoved || []);
      }
    }

    @liveQuery(droppablesSelector)
    handleDroppablesChange(dropsAdded: HTMLElement[], dropsRemoved: HTMLElement[]) {
      if (this.isMatchTabular()) return;
      if (dropsAdded.length > 0 || dropsRemoved.length > 0) {
        this.droppablesModified(dropsAdded || [], dropsRemoved || []);
      }
    }

    override firstUpdated(changedProps): void {
      super.firstUpdated(changedProps);
      const draggables = Array.from(this.querySelectorAll(draggablesSelector) || []).concat(
        Array.from(this.shadowRoot?.querySelectorAll(draggablesSelector) || [])
      ) as HTMLElement[];
      const droppables = Array.from(this.querySelectorAll(droppablesSelector) || []).concat(
        Array.from(this.shadowRoot?.querySelectorAll(droppablesSelector) || [])
      ) as HTMLElement[];
      const dragContainers = Array.from(this.querySelectorAll(dragContainersSelector) || []).concat(
        Array.from(this.shadowRoot?.querySelectorAll(dragContainersSelector) || [])
      ) as HTMLElement[];
      this.dragContainersModified(dragContainers, []);
      this.droppablesModified(droppables, []);
      this.draggablesModified(draggables, []);
    }

    private dragContainersModified = (dragContainersAdded: HTMLElement[], dragContainersRemoved: HTMLElement[]) => {
      this.dragDropApi.dragContainersModified(dragContainersAdded, dragContainersRemoved);
    };

    private draggablesModified = (dragsAdded: HTMLElement[], dragsRemoved: HTMLElement[]) => {
      this.dragDropApi.draggablesModified(dragsAdded, dragsRemoved);
      this.dragDropApi.draggables.forEach(draggable => {
        this.storeDraggable(draggable);
      });
    };

    private droppablesModified = (dropsAdded: HTMLElement[], dropsRemoved: HTMLElement[]) => {
      this.dragDropApi.droppablesModified(dropsAdded, dropsRemoved);
      for (const droppable of this.dragDropApi.droppables) {
        if (this.dataset.choicesContainerWidth) {
          droppable.style.width = `${this.dataset.choicesContainerWidth}px`;
          droppable.style.boxSizing = `border-box`;
        }
      }
    };

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

    private storeDraggable(draggable: HTMLElement): void {
      const index = Array.from(draggable.parentNode.children).indexOf(draggable);
      if (!this.draggables.has(draggable)) {
        this.draggables.set(draggable, {
          parent: draggable.parentElement,
          index
        });
      }
      draggable.style.viewTransitionName = `drag-${index}-${this.getAttribute('identifier') || crypto.randomUUID()}`;
      draggable.setAttribute('qti-draggable', 'true');
      draggable.addEventListener('dragstart', this.handleDragStart);
      draggable.addEventListener('dragend', this.handleDragEnd);
    }

    private handleDragStart = (ev: DragEvent) => {
      const target = ev.currentTarget as HTMLElement;
      ev.dataTransfer.setData('text', target.getAttribute('identifier'));
      if (this.responseIdentifier) {
        ev.dataTransfer.setData('responseIdentifier', this.responseIdentifier);
      }
      this._internals.states.add('--dragzone-enabled');
      this._internals.states.add('--dragzone-active');
      target.setAttribute('dragging', '');
      this.activateDragLocation();
      this.activateDroppables(target);
    };

    private handleDragEnd = async (ev: DragEvent) => {
      ev.preventDefault();
      this._internals.states.delete('--dragzone-enabled');
      this._internals.states.delete('--dragzone-active');
      this.deactivateDragLocation();
      this.deactivateDroppables();
      const draggable = ev.currentTarget as HTMLElement;
      draggable.removeAttribute('dragging');
      const wasDropped = await this.wasDropped(ev);
      if (!wasDropped) {
        if (this.configuration.dragCanBePlacedBack) {
          this.restoreInitialDraggablePosition(draggable);
        }
      }
    };

    private activateDroppables(target: HTMLElement): void {
      const dragContainers = this.dragDropApi.dragContainers;
      dragContainers.forEach(d => {
        d.setAttribute('enabled', '');
        if (d.hasAttribute('disabled')) {
          if (d.contains(target) || (d.shadowRoot && d.shadowRoot.contains(target))) {
            d.removeAttribute('disabled');
          }
        }
      });
      this.dragDropApi.droppables.forEach(d => {
        d.setAttribute('enabled', '');
        if (d.hasAttribute('disabled')) {
          if (d.contains(target) || (d.shadowRoot && d.shadowRoot.contains(target))) {
            d.removeAttribute('disabled');
          }
        }
      });
    }

    private activateDragLocation(): void {
      this._internals.states.add('--dragzone-enabled');
    }

    private deactivateDragLocation(): void {
      this._internals.states.delete('--dragzone-enabled');
    }

    private deactivateDroppables(): void {
      const dragContainers = this.dragDropApi.dragContainers;
      dragContainers.forEach(d => {
        d.removeAttribute('enabled');
      });
      this.dragDropApi.droppables.forEach(d => d.removeAttribute('enabled'));
    }

    private async wasDropped(ev: DragEvent): Promise<boolean> {
      // const hasMoveTestItem = await this.checkForMoveTestItem(ev);
      return ev.dataTransfer.dropEffect !== 'none';
    }

    private async restoreInitialDraggablePosition(draggable: HTMLElement): Promise<void> {
      const { parent, index } = this.draggables.get(draggable);

      const moveDraggable = (draggable: HTMLElement, parent: HTMLElement, index: number) => {
        console.log('moveDraggable', draggable, parent, index);
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
      this.dragDropApi.droppables.forEach(d => {
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
    }

    private enableDroppable(droppable: Element): void {
      droppable.removeAttribute('disabled');
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
      return this.dragDropApi.droppables.find(drop => drop.getAttribute('identifier') === identifier);
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
      return this.dragDropApi.droppables.filter(d => d.childElementCount > 0).length;
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
      const response = this.dragDropApi.droppables
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
