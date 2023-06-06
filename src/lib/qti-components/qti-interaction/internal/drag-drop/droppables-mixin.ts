import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T> = new (...args: any[]) => T;

declare class DroppablesInterface {}

// https://ng-run.com/edit/9MGr5dYWA20AiJtpy5az?open=app%2Fapp.component.html
export const DroppablesMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  droppablesInShadowRoot: boolean,
  droppablesSelector: string
) => {
  class DroppablesElement extends superClass {
    private observer: MutationObserver;

    @property({ type: Boolean, reflect: true }) disabled = false;

    override firstUpdated(changedProps): void {
      // for qti-match-interaction the drag interaction can be replace with a qti-match-tabular class
      // which shows the data in a a tabular way, so no drag drop should be involved then
      if (this.classList.contains('qti-match-tabular')) return;

      super.firstUpdated(changedProps);

      const droppables = Array.from(
        droppablesInShadowRoot
          ? this.shadowRoot.querySelectorAll(droppablesSelector)
          : this.querySelectorAll(droppablesSelector)
      );

      this.dragoverHandler = this.dragoverHandler.bind(this);
      this.dragleaveHandler = this.dragleaveHandler.bind(this);

      this.dropHandler = this.dropHandler.bind(this);

      droppables.forEach(d => {
        d.setAttribute('dropzone', 'move');
        d.addEventListener('dragleave', this.dragleaveHandler);

        this.attachHandler(d);
      });
      for (const droppable of droppables) {
        this.observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
              const propName = mutation.attributeName;
              switch (propName) {
                case 'disabled': {
                  const disabled = droppable.hasAttribute('disabled');
                  if (!disabled) {
                    this.attachHandler(droppable);
                  } else {
                    this.removeHandler(droppable);
                  }
                  break;
                }
              }
            }
          });
        });
        this.observer.observe(droppable, {
          attributes: true //configure it to listen to attribute changes
        });
      }
    }

    private attachHandler(droppable: Element) {
      droppable.addEventListener('dragover', this.dragoverHandler);
      droppable.addEventListener('drop', this.dropHandler);
    }

    private removeHandler(droppable: Element) {
      droppable.removeEventListener('dragover', this.dragoverHandler);
      droppable.removeEventListener('drop', this.dropHandler);
    }

    override disconnectedCallback() {
      // for qti-match-interaction the drag interaction can be replace with a qti-match-tabular class
      // which shows the data in a a tabular way, so no drag drop should be involved then
      if (this.classList.contains('qti-match-tabular')) return;

      super.disconnectedCallback();
      this.observer?.disconnect();
    }

    dragoverHandler(ev: DragEvent) {
      ev.preventDefault();

      const droppable = ev.currentTarget as HTMLElement;
      // droppablesInShadowRoot
      // ? droppable.setAttribute('part', droppable.getAttribute('part') + ' active') :
      droppable.setAttribute('active', '');

      ev.dataTransfer.dropEffect = 'move';

      return false;
    }

    dropHandler(ev: DragEvent) {
      ev.preventDefault();
      const droppable = ev.currentTarget as HTMLElement;
      // pk: draggables in light dom can be dragged to shadowdom, this is one of the rules of webcomponents.
      // They may not create new elements in light dom. Some sometimess drop zones should be generated
      // by the webcomponent. Then a draggable ( which is always already created by a webcomponent )
      // can be in light dom, en can be dragged to shadow dom.
      // thinking of another way where we just change slots. Maybe thats better..
      const draggableInLightDom = this.querySelector(`[identifier=${ev.dataTransfer.getData('text')}`);
      const draggable = draggableInLightDom
        ? draggableInLightDom
        : this.shadowRoot.querySelector(`[identifier=${ev.dataTransfer.getData('text')}`);

      if (!droppable) {
        console.error(`cannot find droppable, target: ${ev.target ? JSON.stringify(ev.target) : 'null'}`);
      } else if (draggable.parentElement.getAttribute('identifier') !== droppable.getAttribute('identifier')) {
        droppable.appendChild(draggable);
      }
      // droppablesInShadowRoot
      // ? droppable.setAttribute('part', droppable.getAttribute('part').replace('active', '').trim()) :
      droppable.removeAttribute('active');

      return false;
    }

    dragleaveHandler(ev: DragEvent) {
      ev.preventDefault();

      const droppable = ev.currentTarget as HTMLElement;
      droppable.removeAttribute('active');

      return false;
    }
  }
  return DroppablesElement as Constructor<DroppablesInterface> & T;
};
