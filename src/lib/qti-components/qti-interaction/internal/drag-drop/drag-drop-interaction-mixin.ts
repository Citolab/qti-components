import { LitElement } from 'lit';
import { IInteraction } from '../interaction/interaction.interface';
import { DroppablesMixin } from './droppables-mixin';
import { FlippablesMixin } from './flippables-mixin';

import { property } from 'lit/decorators.js';
import { liveQuery } from '../../../../decorators/live-query';
import { watch } from '../../../../decorators/watch';
import { TouchDragAndDrop } from './drag-drop-api';
// keyboard navigatable drag drop: https://codepen.io/SitePoint/pen/vEzXbj
// https://stackoverflow.com/questions/55242196/typescript-allows-to-use-proper-multiple-inheritance-with-mixins-but-fails-to-c
// https://github.com/microsoft/TypeScript/issues/17744#issuecomment-558990381
// https://ng-run.com/edit/9MGr5dYWA20AiJtpy5az?open=app%2Fapp.component.html

type Constructor<T> = new (...args: any[]) => T;

interface InteractionConfiguration {
  copyStylesDragClone: boolean;
  dragCanBePlacedBack: boolean;
  dragOnClick: boolean;
}

export const DragDropInteractionMixin = <T extends Constructor<LitElement>>(
  superClass: T,
  draggablesSelector: string,
  droppablesInShadowRoot: boolean,
  droppablesSelector: string
) => {
  class DragDropInteractionElement extends FlippablesMixin(
    DroppablesMixin(superClass, droppablesInShadowRoot, droppablesSelector),
    droppablesSelector,
    draggablesSelector
  ) {
    protected draggables = new Map<Element, { parent: Element; index: number }>();
    protected droppables: Element[];
    dragDropApi: TouchDragAndDrop;

    @liveQuery(draggablesSelector)
    reInitDragAndDrop(dragsAdded: Element[], dragsRemoved: Element[]) {
      if (this.classList.contains('qti-match-tabular')) return;

      // check if added elements are not already in list
      const draggables = dragsAdded.filter(d => !this.draggables || !this.draggables.get(d));

      if (draggables.length > 0) {
        this.dragDropApi.addDraggables(dragsAdded);

        dragsAdded.forEach(elem => {
          // store initial positions of elements, and of course, just the elements for looping and such
          this.draggables.set(elem, {
            parent: elem.parentElement,
            index: Array.from(elem.parentNode.children).indexOf(elem)
          });
          elem.setAttribute('qti-draggable', 'true');
          elem.addEventListener('dragstart', this.handleDragStart);
          elem.addEventListener('dragend', this.handleDragEnd);
        });
      }
    }

    @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string = '';

    @property({ attribute: false, type: Object }) configuration: InteractionConfiguration = {
      copyStylesDragClone: true,
      dragCanBePlacedBack: true,
      dragOnClick: false
    };
    @watch('configuration')
    handleDragOptionsChanged(old, dragOptions) {
      this.dragDropApi.copyStylesDragClone = dragOptions.copyStylesDragClone;
      this.dragDropApi.dragOnClick = dragOptions.dragOnClick;
    }

    @property({ type: Boolean, reflect: true }) disabled = false;
    @watch('disabled', { waitUntilFirstUpdate: true })
    handleDisabledChange(old, disabled: boolean) {
      this.draggables.forEach((s, ch) => {
        disabled ? ch.setAttribute('disabled', '') : ch.removeAttribute('disabled');
        disabled ? ch.removeAttribute('qti-draggable') : ch.setAttribute('qti-draggable', 'true');
      });
    }

    @property({ type: Boolean, reflect: true }) readonly = false;
    @watch('readonly', { waitUntilFirstUpdate: true })
    handleReadonlyChange(old, readonly: boolean) {
      this.draggables.forEach((s, ch) => {
        readonly ? ch.setAttribute('readonly', '') : ch.removeAttribute('readonly');
        readonly ? ch.removeAttribute('qti-draggable') : ch.setAttribute('qti-draggable', 'true');
      });
    }

    @property({ type: Number, reflect: true, attribute: 'min-associations' }) minAssociations = 1;
    @property({ type: Number, reflect: true, attribute: 'max-associations' }) maxAssociations = 1;

    override firstUpdated(changedProps): void {
      super.firstUpdated(changedProps);
      this.droppables = Array.from(
        droppablesInShadowRoot
          ? this.shadowRoot.querySelectorAll(droppablesSelector)
          : this.querySelectorAll(droppablesSelector)
      );
      // PK: Maybe later, for now we assume droppables are not dynamicly added or removed
      // .filter((elem) => !this.droppables || !this.droppables.includes(elem));
      // this.droppables = this.droppables ? this.droppables.concat(newDroppables) : newDroppables;
    }

    override connectedCallback() {
      super.connectedCallback();

      this.dragDropApi = new TouchDragAndDrop();

      this.dispatchEvent(
        new CustomEvent<DragDropInteractionElement>('qti-register-interaction', {
          bubbles: true,
          composed: true,
          detail: this
        })
      );
    }

    private handleDragStart = (ev: any) => {
      ev.dataTransfer.setData('text', ev.currentTarget.getAttribute(`identifier`));
      ev.currentTarget.setAttribute('dragging', '');

      // highlight all droppables with an active class
      this.droppables.forEach(d => d.setAttribute('enabled', ''));
    };

    private handleDragEnd = (ev: DragEvent) => {
      ev.preventDefault();
      this.droppables.forEach(d => d.removeAttribute('enabled'));
      const draggable = ev.currentTarget as HTMLElement;
      draggable.removeAttribute('over');
      draggable.removeAttribute('dragging');

      // pk: if not dropped on a drop location put it back where it belongs
      if (ev.dataTransfer.dropEffect === 'none' || ev.dataTransfer.dropEffect === undefined) {
        if (this.configuration.dragCanBePlacedBack) {
          this.placeDraggableBack(draggable);
        }
      }
      if (ev.dataTransfer.dropEffect === 'move') {
        this.saveResponse();
        this.checkMaxMatchAssociations();
      }
    };

    private placeDraggableBack(draggable: HTMLElement) {
      const position = this.draggables.get(draggable);
      const index =
        position.index <= position.parent.children.length ? position.index : position.parent.children.length - 1;
      const interaction = position.parent;
      const gapText = position.parent.children[index];

      interaction.insertBefore(draggable, gapText);
      this.saveResponse();
      this.checkMaxMatchAssociations();
    }

    reset(save = true): void {
      this.draggables.forEach((position, draggable) => {
        const children = position.parent.children;
        const index = position.index < children.length ? position.index : children.length;
        position.parent.insertBefore(draggable, children[index]);
      });
      save && this.saveResponse();
    }

    protected checkMaxMatchAssociations() {
      this.droppables.forEach(d => {
        const maxMatch = +(d.getAttribute('match-max') || 1);
        // const maxMin = +(d.getAttribute('match-min') || 0);
        // const disable = maxMatch <= (d.children.length || 0);
        const disable = maxMatch <= (d.querySelectorAll('[qti-draggable="true"]').length || 0);

        disable ? d.setAttribute('disabled', '') : d.removeAttribute('disabled');
        disable ? d.removeAttribute('dropzone') : d.setAttribute('dropzone', 'move');
      });
    }

    set response(response: string[]) {
      // for qti-match-interaction the drag interaction can be replace with a qti-match-tabular class
      // which shows the data in a a tabular way, so no drag drop should be involved then
      if (this.classList.contains('qti-match-tabular')) return;

      this.reset(false);
      if (response !== null && Array.isArray(response))
        response.forEach(response => {
          const [dropId, ...dragIds] = response.split(' ').reverse();
          if (dropId) {
            const droppable = this.droppables.find(drop => drop.getAttribute('identifier') === dropId);
            dragIds.forEach(dragId => {
              const draggable = this.querySelector(`[identifier=${dragId}]`);
              if (!droppable) {
                console.error(`cannot find droppable with identifier: ${dropId}`);
              } else if (!draggable) {
                console.error(`cannot find draggable with identifier: ${dragId}`);
              } else {
                droppable.appendChild(draggable);
                this.checkMaxMatchAssociations();
              }
            });
          }
        });
    }

    validate() {
      const droppables = droppablesInShadowRoot
        ? Array.from(this.shadowRoot.querySelectorAll(droppablesSelector))
        : Array.from(this.querySelectorAll(droppablesSelector));
      const associations = droppables.filter(d => d.childElementCount > 0).length;
      return this.minAssociations <= 0 || this.minAssociations <= associations;
    }

    protected saveResponse() {
      const response = this.droppables.map(droppable => {
        let responseString = '';

        // const dragsInDroppable = droppable.shadowRoot
        //   .querySelector<HTMLSlotElement>(`[name="qti-simple-associable-choice"]`)
        //   .assignedElements();

        const dragsInDroppable = droppable.querySelectorAll('[qti-draggable="true"]');

        if (dragsInDroppable.length > 0) {
          responseString +=
            Array.from(dragsInDroppable)
              .map(d => d.getAttribute('identifier'))
              .join(' ') + ` `;
        }
        responseString += droppable.getAttribute('identifier');
        return responseString;
      });

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
  }
  return DragDropInteractionElement as Constructor<IInteraction> & T;
};
