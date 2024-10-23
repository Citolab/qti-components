import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T> = new (...args: any[]) => T;

declare class DroppablesInterface {}

export const DroppablesMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  useShadowRoot: boolean,
  droppablesSelector: string
) => {
  class DroppablesElement extends superClass {
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
      return Array.from(
        useShadowRoot ? this.shadowRoot.querySelectorAll(droppablesSelector) : this.querySelectorAll(droppablesSelector)
      );
    }

    private initializeEventHandlers(): void {
      this.dragoverHandler = this.dragoverHandler.bind(this);
      this.dragleaveHandler = this.dragleaveHandler.bind(this);
      this.dragenterHandler = this.dragenterHandler.bind(this);
      this.dropHandler = this.dropHandler.bind(this);
    }

    private prepareDroppable(droppable: Element): void {
      droppable.setAttribute('dropzone', 'move');
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
      disabled ? this.removeEventListeners(droppable) : this.attachEventListeners(droppable);
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
      ev.preventDefault();
      this.activateDroppable(ev.currentTarget as HTMLElement);
      ev.dataTransfer.dropEffect = 'move';
      return false;
    }

    private activateDroppable(droppable: HTMLElement): void {
      droppable.setAttribute('active', '');
    }

    private async dropHandler(ev: DragEvent): Promise<boolean> {
      ev.preventDefault();
      const droppable = ev.currentTarget as HTMLElement;
      const identifier = ev.dataTransfer.getData('text');
      const draggable = this.findDraggable(identifier);
      // console.log(this.isValidDrop(droppable, draggable));

      if (!draggable) return false;
      if (draggable && !this.isValidDrop(droppable, draggable)) {
        draggable.style.transform = 'translate(0, 0)';
        return false;
      }

      await this.moveDraggableToDroppable(draggable, droppable);
      this.deactivateDroppable(droppable);
      return false;
    }

    private findDraggable(identifier: string): HTMLElement | null {
      if (!identifier) return null;
      return (
        this.querySelector(`[identifier=${identifier}]`) || this.shadowRoot.querySelector(`[identifier=${identifier}]`)
      );
    }

    private isValidDrop(droppable: HTMLElement, draggable: HTMLElement): boolean {
      return draggable.parentElement.getAttribute('identifier') !== droppable.getAttribute('identifier');
    }

    private async moveDraggableToDroppable(draggable: HTMLElement, droppable: HTMLElement): Promise<void> {
      const moveElement = (): void => {
        draggable.style.transform = 'translate(0, 0)';
        droppable.appendChild(draggable);
        this['checkMaxAssociations']();

        this['saveResponse']();
      };

      if (!document.startViewTransition) {
        moveElement();
        return;
      }

      const transition = document.startViewTransition(moveElement);
      await transition.finished;

      // this['checkMaxAssociations']();
    }

    private deactivateDroppable(droppable: HTMLElement): void {
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
