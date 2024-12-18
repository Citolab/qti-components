import { property } from 'lit/decorators.js';
import { Interaction } from '../interaction/interaction';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class DroppablesInterface {}

export const DroppablesMixin = <T extends Constructor<Interaction>>(superClass: T, droppablesSelector: string) => {
  abstract class DroppablesElement extends superClass {
    private observer: MutationObserver;

    @property({ type: Boolean, reflect: true }) disabled = false;

    override firstUpdated(changedProps): void {
      if (this.isMatchTabular()) return;
      super.firstUpdated(changedProps);

      const droppables = this.getDroppableElements();
      this.initializeEventHandlers();
      droppables.forEach(droppable => {
        this.prepareDroppable(droppable);
        this.observeDroppableAttributes(droppable);
      });
    }

    private isMatchTabular(): boolean {
      return this.classList.contains('qti-match-tabular');
    }

    private getDroppableElements(): Element[] {
      return Array.from(this.shadowRoot?.querySelectorAll(droppablesSelector) || []).concat(
        Array.from(this.querySelectorAll(droppablesSelector) || [])
      );
    }

    private initializeEventHandlers(): void {
      this.dragoverHandler = this.dragoverHandler.bind(this);
      this.dragleaveHandler = this.dragleaveHandler.bind(this);
      this.dragenterHandler = this.dragenterHandler.bind(this);
      this.dropHandler = this.dropHandler.bind(this);
    }

    private prepareDroppable(droppable: Element): void {
      droppable.addEventListener('dragleave', this.dragleaveHandler);
      this.attachEventListeners(droppable);
    }

    private observeDroppableAttributes(droppable: Element): void {
      this.observer = new MutationObserver(mutations => {
        mutations.forEach(({ attributeName }) => {
          if (attributeName === 'disabled') {
            this.toggleDroppableHandlers(droppable);
          }
        });
      });
      this.observer.observe(droppable, { attributes: true });
    }

    private toggleDroppableHandlers(droppable: Element): void {
      const disabled = droppable.hasAttribute('disabled');
      if (disabled) {
        this.removeEventListeners(droppable);
      } else {
        this.attachEventListeners(droppable);
      }
    }

    private attachEventListeners(droppable: Element): void {
      droppable.addEventListener('dragover', this.dragoverHandler);
      droppable.addEventListener('dragenter', this.dragenterHandler);
      droppable.addEventListener('drop', this.dropHandler);
    }

    private removeEventListeners(droppable: Element): void {
      droppable.removeEventListener('dragover', this.dragoverHandler);
      droppable.removeEventListener('dragenter', this.dragenterHandler);
      droppable.removeEventListener('drop', this.dropHandler);
    }

    override disconnectedCallback(): void {
      if (this.isMatchTabular()) return;
      super.disconnectedCallback();
      this.observer?.disconnect();
    }

    private dragenterHandler(ev: DragEvent): void {
      ev.preventDefault();
    }

    private dragoverHandler(ev: DragEvent): boolean {
      // const responseIdentifierDraggable = ev.dataTransfer.getData('responseIdentifier');
      ev.preventDefault();
      // if (responseIdentifierDraggable === this.responseIdentifier) {
      this.activateDroppable(ev.currentTarget as HTMLElement);
      ev.dataTransfer.dropEffect = 'move';
      // }
      return false;
    }

    private activateDroppable(droppable: HTMLElement): void {
      this._internals.states.delete('--dragzone-active');
      droppable.setAttribute('active', '');
    }

    private async dropHandler(ev: DragEvent): Promise<boolean> {
      ev.preventDefault();
      const droppable = ev.currentTarget as HTMLElement;
      const identifier = ev.dataTransfer.getData('text');
      const responseIdentifierDraggable = ev.dataTransfer.getData('responseIdentifier');
      const draggable = this.findDraggable(responseIdentifierDraggable, identifier);

      if (!draggable) return false;
      if (draggable && !this.isValidDrop(droppable, draggable, responseIdentifierDraggable)) {
        draggable.style.transform = 'translate(0, 0)';
        return false;
      }
      await this.moveDraggableToDroppable(draggable, droppable);
      this.deactivateDroppable(droppable, false);
      return false;
    }

    private findDraggable(responseIdentifier: string, identifier: string): HTMLElement | null {
      if (!identifier) return null;
      // if (responseIdentifier === this.responseIdentifier) {
      return (
        this.querySelector(`[identifier=${identifier}]`) || this.shadowRoot.querySelector(`[identifier=${identifier}]`)
      );
      // }
    }

    private isValidDrop(
      _droppable: HTMLElement,
      _draggable: HTMLElement,
      responseIdentifierDraggable: string
    ): boolean {
      // debugger;
      return true;
      // this.responseIdentifier === responseIdentifierDraggable
      // && draggable.parentElement.getAttribute('identifier') !== droppable.getAttribute('identifier')
    }

    private async moveDraggableToDroppable(draggable: HTMLElement, droppable: HTMLElement): Promise<void> {
      console.log(`moveDraggableToDroppable, draggable: ${draggable.tagName}, droppable: ${droppable.tagName}`);
      const moveElement = (): void => {
        draggable.style.transform = 'translate(0, 0)';
        if (droppable.tagName === 'SLOT') {
          draggable.setAttribute('slot', droppable.getAttribute('name'));
        } else {
          droppable.appendChild(draggable);
        }

        // checkMaxAssociations and saveResponse are defined/overridden in a mixin
        this['checkMaxAssociations']();
        this['saveResponse'](null); //
      };

      if (!document.startViewTransition) {
        moveElement();
        return;
      }

      const transition = document.startViewTransition(moveElement);
      await transition.finished;

      // this['checkMaxAssociations']();
    }

    private deactivateDroppable(droppable: HTMLElement, makeDragzoneActive = true): void {
      if (makeDragzoneActive) {
        this._internals.states.add('--dragzone-active');
      }
      droppable.removeAttribute('active');
    }

    private dragleaveHandler(ev: DragEvent): boolean {
      ev.preventDefault();
      this.deactivateDroppable(ev.currentTarget as HTMLElement);
      ev.dataTransfer.dropEffect = 'none';
      return false;
    }
  }
  return DroppablesElement as Constructor<DroppablesInterface> & T;
};
