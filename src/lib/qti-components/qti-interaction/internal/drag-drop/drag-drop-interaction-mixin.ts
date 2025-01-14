import { FlippablesMixin } from './flippables-mixin';

import { property } from 'lit/decorators.js';
import { liveQuery } from '../../../../decorators/live-query';
import type { Interaction } from '../../../../exports/interaction';
import type { IInteraction } from '../../../../exports/interaction.interface';

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
  dragContainersSelector: string,
  appendClone: 'body' | 'host' | 'interaction' | 'default' = 'default'
) => {
  abstract class DragDropInteractionElement extends FlippablesMixin(
    superClass,
    droppablesSelector,
    draggablesSelector
  ) {
    // protected draggables = new Map<HTMLElement, { parent: HTMLElement; index: number }>();
    private observer: MutationObserver | null = null;
    private droppableObsever: MutationObserver | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private draggables: HTMLElement[] = [];
    private droppables: HTMLElement[] = [];
    private dragContainers: HTMLElement[] = [];
    private dragClone: HTMLElement = null; // Clone of drag source for visual feedback
    private dragSource: HTMLElement = null; // The source element being dragged

    private touchStartPoint = null; // Point of the first touch
    private isDraggable = false; // Whether a draggable element is active
    private cloneOffset = { x: 0, y: 0 }; // Offset for positioning the drag clone
    private isDragging = false; // Whether a drag operation is ongoing
    private rootNode: Node = null; // Root node for boundary calculations
    private allDropzones: HTMLElement[] = []; // All dropzones for keyboard navigation
    private lastTarget = null; // Last touch target
    private dropzoneOriginalParent = null; // Original parent of the drag clone
    private currentDropTarget = null; // Current droppable element

    private readonly MIN_DRAG_DISTANCE = 5; // Minimum pixel movement to start dragging
    private readonly DRAG_CLONE_OPACITY = 1; // Opacity of the drag clone element

    private dataTransfer = {
      data: {},
      setData(type, val) {
        this.data[type] = val;
      },
      getData(type) {
        return this.data[type];
      },
      effectAllowed: 'move'
    };

    @property({ attribute: false, type: Object }) protected configuration: InteractionConfiguration = {
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

    dragContainersModified(addedDragContainers: HTMLElement[], removedDragContainers: HTMLElement[]) {
      for (const removedContainer of removedDragContainers) {
        if (this.dragContainers.includes(removedContainer)) {
          this.dragContainers = this.dragContainers.filter(container => container !== removedContainer);
          this.allDropzones = this.allDropzones.filter(dropzone => dropzone !== removedContainer);
        }
      }
      for (const dragContainer of addedDragContainers) {
        if (!this.dragContainers.includes(dragContainer)) {
          this.dragContainers.push(dragContainer);
          this.allDropzones.push(dragContainer);
        }
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
      const disabled = this.hasAttribute('disabled');
      if (!disabled) {
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('mousemove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('mouseup', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
      }
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

      this.updateMinDimensionsForDropZones();

      // MutationObserver to observe changes in childrd elements
      this.observer = new MutationObserver(() => this.updateMinDimensionsForDropZones());
      this.observer.observe(this, { childList: true, subtree: true });

      // ResizeObserver to monitor size changes of `gapTexts`
      this.resizeObserver = new ResizeObserver(() => this.updateMinDimensionsForDropZones());
      const gapTexts = this.querySelectorAll('qti-gap-text');
      gapTexts.forEach(gapText => this.resizeObserver?.observe(gapText));
    }

    private draggablesModified = (addedDraggables: HTMLElement[], removedDraggables: HTMLElement[]) => {
      for (const removedDraggable of removedDraggables) {
        if (this.draggables.includes(removedDraggable)) {
          this.draggables = this.draggables.filter(draggable => draggable !== removedDraggable);
          removedDraggable.removeAttribute('tabindex');
          removedDraggable.removeEventListener('touchstart', this.handleTouchStart.bind(this));
          removedDraggable.removeEventListener('mousedown', this.handleTouchStart.bind(this));
        }
      }
      for (const draggable of addedDraggables) {
        if (!this.draggables.includes(draggable)) {
          this.draggables.push(draggable);
          // draggables.forEach(el => {
          draggable.setAttribute('tabindex', '0'); // Make draggable elements focusable
          if (!(draggable as any).hasTouchStartListener) {
            // Prevent adding multiple listeners
            draggable.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            draggable.addEventListener('mousedown', this.handleTouchStart.bind(this), { passive: false });
            (draggable as any).hasTouchStartListener = true;
          }
          // });
        }
      }
      let index = 0;
      this.draggables.forEach(draggable => {
        draggable.style.viewTransitionName = `drag-${index}-${this.getAttribute('identifier') || crypto.randomUUID()}`;
        draggable.setAttribute('qti-draggable', 'true');
        index++;
      });
    };

    private droppablesModified = (addedDroppables: HTMLElement[], removedDroppables: HTMLElement[]) => {
      for (const removedDroppable of removedDroppables) {
        if (this.droppables.includes(removedDroppable)) {
          this.droppables = this.droppables.filter(droppable => droppable !== removedDroppable);
          this.allDropzones = this.allDropzones.filter(dropzone => dropzone !== removedDroppable);
        }
      }
      for (const droppable of addedDroppables) {
        if (!this.droppables.includes(droppable)) {
          this.droppables.push(droppable);
          this.allDropzones.push(droppable);
        }
      }
      for (const droppable of this.droppables) {
        if (this.dataset.choicesContainerWidth) {
          droppable.style.width = `${this.dataset.choicesContainerWidth}px`;
          droppable.style.boxSizing = `border-box`;
        }
      }
    };

    private async moveDraggableToDroppable(draggable: HTMLElement, droppable: HTMLElement): Promise<void> {
      // console.log(`moveDraggableToDroppable, draggable: ${draggable.tagName}, droppable: ${droppable.tagName}`);
      const moveElement = (): void => {
        draggable.style.transform = 'translate(0, 0)';
        if (droppable.tagName === 'SLOT') {
          draggable.setAttribute('slot', droppable.getAttribute('name'));
        } else {
          droppable.appendChild(draggable);
        }
        this.checkAllMaxAssociations();
        this.saveResponse(); //
      };
      // debugger;
      // if (!document.startViewTransition) {
      moveElement();
      return;
      // }

      // const transition = document.startViewTransition(moveElement);
      // await transition.finished;
    }

    private activateDroppable(droppable: HTMLElement): void {
      if (this.dragContainers.includes(droppable)) {
        this._internals.states.add('--dragzone-active');
        droppable.setAttribute('active', '');
      } else {
        this._internals.states.delete('--dragzone-active');
        droppable.setAttribute('active', '');
      }
    }

    private deactivateDroppable(droppable: HTMLElement, makeDragzoneActive = true): void {
      if (makeDragzoneActive) {
        this._internals.states.add('--dragzone-active');
      }
      droppable.removeAttribute('active');
    }

    override connectedCallback() {
      super.connectedCallback();
    }

    private isMatchTabular(): boolean {
      return this.classList.contains('qti-match-tabular');
    }

    private updateMinDimensionsForDropZones() {
      const gapTexts = this.querySelectorAll(draggablesSelector);
      const gaps = Array.from(this.querySelectorAll(droppablesSelector)).map(d => d as HTMLElement);
      let maxHeight = 0;
      let maxWidth = 0;
      gapTexts.forEach(gapText => {
        const rect = gapText.getBoundingClientRect();
        maxHeight = Math.max(maxHeight, rect.height);
        maxWidth = Math.max(maxWidth, rect.width);
      });

      const dragContainer =
        (this.querySelector(dragContainersSelector) as HTMLElement) ||
        (this.shadowRoot?.querySelector(dragContainersSelector) as HTMLElement);

      if (dragContainer) {
        dragContainer.style.minHeight = `${maxHeight}px`;
        dragContainer.style.minWidth = `${maxWidth}px`;
      }
      for (const gap of gaps) {
        gap.style.minHeight = `${maxHeight}px`;
        gap.style.minWidth = `${maxWidth}px`;
      }
    }

    private activateDroppables(target: HTMLElement): void {
      const dragContainers = this.dragContainers;
      dragContainers.forEach(d => {
        d.setAttribute('enabled', '');
        if (d.hasAttribute('disabled')) {
          if (d.contains(target) || (d.shadowRoot && d.shadowRoot.contains(target))) {
            d.removeAttribute('disabled');
          }
        }
      });
      this.droppables.forEach(d => {
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
      const dragContainers = this.dragContainers;
      dragContainers.forEach(d => {
        d.removeAttribute('enabled');
        d.removeAttribute('active');
      });
      this.droppables.forEach(d => {
        d.removeAttribute('enabled');
        d.removeAttribute('active');
      });
    }
    override disconnectedCallback() {
      super.disconnectedCallback();

      // Cleanup MutationObserver
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      if (this.droppableObsever) {
        this.droppableObsever.disconnect();
        this.droppableObsever = null;
      }

      // Cleanup ResizeObserver
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      // Remove global event listeners
      document.removeEventListener('touchmove', this.handleTouchMove);
      document.removeEventListener('mousemove', this.handleTouchMove);
      document.removeEventListener('touchend', this.handleTouchEnd);
      document.removeEventListener('mouseup', this.handleTouchEnd);
      document.removeEventListener('touchcancel', this.handleTouchCancel);
    }

    private handleTouchMove(e) {
      if (this.isDraggable && this.dragClone) {
        const { x, y } = this.getEventCoordinates(e);
        const currentTouch = { clientX: x, clientY: y };

        // Check if the minimum drag distance has been reached
        if (this.calculateDragDistance(currentTouch) >= this.MIN_DRAG_DISTANCE) {
          this.isDragging = true;
          this.updateDragClonePosition(currentTouch);
        }

        // Find the closest dropzone to the current drag clone position
        const closestDropzone = this.findClosestDropzone();
        this.currentDropTarget = closestDropzone;

        // Handle dragenter and dragleave
        if (closestDropzone !== this.lastTarget) {
          if (this.lastTarget) {
            // Simulate dragleave for the previous target
            this.deactivateDroppable(this.lastTarget);
            this.dispatchCustomEvent(this.lastTarget, 'dragleave');
          }
          if (closestDropzone) {
            // Simulate dragenter for the new target
            this.activateDroppable(closestDropzone);
            this.dispatchCustomEvent(closestDropzone, 'dragenter');
          }
          this.lastTarget = closestDropzone;
        }

        // Simulate dragover for the current dropzone
        if (this.currentDropTarget) {
          this.dispatchCustomEvent(this.currentDropTarget, 'dragover');
        }

        e.preventDefault();
      }
    }

    private handleTouchEnd(e) {
      if (this.isDragging) {
        // Handle drop event
        if (this.currentDropTarget) {
          const draggable = this.dragClone;
          this.moveDraggableToDroppable(draggable, this.currentDropTarget);
        }
        this.resetDragState();
      }
      this._internals.states.delete('--dragzone-active');
      this.checkAllMaxAssociations();

      this._internals.states.delete('--dragzone-enabled');
      this._internals.states.delete('--dragzone-active');
      this.deactivateDragLocation();
      this.deactivateDroppables();

      this.dragClone?.removeAttribute('dragging');
      e.preventDefault();
    }

    private handleTouchCancel(_e) {
      this.resetDragState();
    }

    validate(): boolean {
      if (!this.shadowRoot) return false;
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

    private checkMaxAssociations(droppable: HTMLElement): boolean {
      const maxMatch = this.getMatchMaxValue(droppable);
      const currentAssociations = droppable.querySelectorAll('[qti-draggable="true"]').length;
      const unlimitedAssociations = maxMatch === 0;
      return unlimitedAssociations || currentAssociations >= maxMatch;
    }

    private resetDragState() {
      if (this.dragClone) {
        // copy styles from dragSource to dragClone
        const isDropped = this.currentDropTarget !== null;
        const droppedInDragContainer = !isDropped || this.dragContainers.includes(this.currentDropTarget);

        if (!droppedInDragContainer) {
          const computedStyles = window.getComputedStyle(this.dragSource);
          for (let i = 0; i < computedStyles.length; i++) {
            const key = computedStyles[i];
            this.dragClone.style.setProperty(key, computedStyles.getPropertyValue(key));
          }
          this.dragClone.style.opacity = '1.0';
          this.dragClone.style.display = 'block';
          this.dragClone.style.pointerEvents = 'auto';
        } else {
          this.dragSource.style.opacity = '1.0';
          this.dragSource.style.display = 'block';
          this.dragSource.style.pointerEvents = 'auto';
          this.dragClone.remove();
        }
      }

      this.isDragging = false;
      this.isDraggable = false;
      this.dragSource = null;
      this.dragClone = null;
      this.touchStartPoint = null;
      this.currentDropTarget = null;
      this.lastTarget = null;
    }
    protected checkAllMaxAssociations(): void {
      this.droppables.forEach(d => {
        const maxAssociationsReached = this.checkMaxAssociations(d);
        if (maxAssociationsReached) {
          this.disableDroppable(d);
        } else {
          this.enableDroppable(d);
        }
      });
    }

    private getMatchMaxValue(el: HTMLElement): number {
      const matchMaxRawValue = el.getAttribute('match-max');
      return matchMaxRawValue ? parseInt(matchMaxRawValue, 10) : 1;
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

    set value(value: string[] | string | null) {
      if (this.isMatchTabular()) return;
      // Assuming this.value is an array of strings
      if (Array.isArray(value)) {
        value?.forEach(entry => this.placeResponse(entry));
        const formData = new FormData();
        value.forEach(response => {
          formData.append(this.responseIdentifier, response);
        });
        this._internals.setFormValue(formData);
      } else {
        // Handle the case where this.value is not an array
        this._internals.setFormValue(value || '');
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
        this.checkAllMaxAssociations();
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
      // this.resetDroppables();
      if (save) this.saveResponse();
    }

    private updateDragClonePosition(touch) {
      if (!this.isDragging || !this.dragClone) return;

      const newLeft = touch.clientX - this.cloneOffset.x;
      const newTop = touch.clientY - this.cloneOffset.y;

      const { newLeft: boundedLeft, newTop: boundedTop } = this.applyBoundaries(newLeft, newTop, this.dragClone);

      this.dragClone.style.left = `${boundedLeft}px`;
      this.dragClone.style.top = `${boundedTop}px`;
    }

    private getEventCoordinates(event, page = false) {
      const touch = event.touches ? event.touches[0] : event;
      return {
        x: page ? touch.pageX : touch.clientX,
        y: page ? touch.pageY : touch.clientY
      };
    }

    private calculateDragDistance(touch): number {
      const xDist = Math.abs(touch.clientX - this.touchStartPoint.x);
      const yDist = Math.abs(touch.clientY - this.touchStartPoint.y);
      return xDist + yDist;
    }

    private applyBoundaries(newLeft: number, newTop: number, element: HTMLElement) {
      let boundaryRect: DOMRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
      if (this.rootNode instanceof ShadowRoot) {
        boundaryRect = this.rootNode.host.getBoundingClientRect();
      } else if (this.rootNode instanceof Document) {
        boundaryRect = document.documentElement.getBoundingClientRect();
      }

      const elementRect = element.getBoundingClientRect();
      const elementWidth = elementRect.width;
      const elementHeight = elementRect.height;

      const boundedLeft = Math.max(boundaryRect.left, Math.min(newLeft, boundaryRect.right - elementWidth));
      const boundedTop = Math.max(boundaryRect.top, Math.min(newTop, boundaryRect.bottom - elementHeight));

      return { newLeft: boundedLeft, newTop: boundedTop };
    }

    private findClosestDropzone(): HTMLElement | null {
      const allActiveDropzones = this.allDropzones.filter(d => !d.hasAttribute('disabled'));
      if (!this.dragClone || allActiveDropzones.length === 0) return null;

      const dragRect = this.dragClone.getBoundingClientRect();
      let closestDropzone: HTMLElement | null = null;
      let maxOverlapArea = 0;

      for (const dropzone of allActiveDropzones) {
        const dropRect = dropzone.getBoundingClientRect();
        const overlapArea = this.calculateOverlapArea(dragRect, dropRect);

        if (overlapArea > maxOverlapArea) {
          maxOverlapArea = overlapArea;
          closestDropzone = dropzone;
        }
      }
      // if none was find using this method, try to find the closest dropzone by distance
      if (!closestDropzone) {
        let minDistance = 200; // arbitrary large number could be max too: number.MAX_VALUE;
        for (const dropzone of allActiveDropzones) {
          const dropRect = dropzone.getBoundingClientRect();
          const distance = Math.sqrt(
            Math.pow(dragRect.left - dropRect.left, 2) + Math.pow(dragRect.top - dropRect.top, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestDropzone = dropzone;
          }
        }
      }

      return closestDropzone;
    }

    private calculateOverlapArea(rect1: DOMRect, rect2: DOMRect): number {
      const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
      const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
      return xOverlap * yOverlap;
    }

    private dispatchCustomEvent(element, eventType, bubble = true) {
      if (!element) return;
      const event = new CustomEvent(eventType, { bubbles: bubble, cancelable: true });
      event['dataTransfer'] = this.dataTransfer;
      element.dispatchEvent(event);
    }

    private appendClone() {
      const interaction = this.findParentInteractionElement(this.dragSource);
      if (appendClone == 'default') {
        if (interaction) {
          interaction.appendChild(this.dragClone);
        } else if (this.rootNode instanceof ShadowRoot) {
          this.rootNode.host.appendChild(this.dragClone);
        } else if (this.rootNode instanceof Document) {
          document.body.appendChild(this.dragClone);
        }
      } else if (appendClone == 'interaction') {
        if (interaction) {
          interaction.appendChild(this.dragClone);
        } else {
          console.error('No interaction found to append the drag clone');
        }
      } else if (appendClone == 'host') {
        if (this.rootNode instanceof ShadowRoot) {
          this.rootNode.host.appendChild(this.dragClone);
        } else {
          console.error('No host found to append the drag clone');
        }
      } else if (appendClone == 'body') {
        document.body.appendChild(this.dragClone);
      }
    }

    private handleTouchStart(e) {
      const { x, y } = this.getEventCoordinates(e);
      this.dropzoneOriginalParent = e.currentTarget.parentElement;
      this.touchStartPoint = { x, y };
      this.dragSource = e.currentTarget;
      this.isDraggable = true;
      this.rootNode = this.dragSource.getRootNode();

      this._internals.states.add('--dragzone-enabled');
      this._internals.states.add('--dragzone-active');
      this.dragSource.setAttribute('dragging', '');
      this.activateDragLocation();
      this.activateDroppables(this.dragSource);

      // Create and position the drag clone
      const draggableInDragContainer = this.findDraggableInDraggableContainer(
        this.dragSource.getAttribute('identifier')
      );

      // clone the element if it is not in a dropzone
      const parent = this.dragSource.parentElement;
      if (!this.droppables.includes(parent)) {
        // TODO: check if this is a correct check in all cases
        const rect = draggableInDragContainer.getBoundingClientRect();
        this.cloneOffset.x = x - rect.left;
        this.cloneOffset.y = y - rect.top;

        this.dragClone = draggableInDragContainer.cloneNode(true) as HTMLElement;
        const computedStyles = window.getComputedStyle(this.dragSource);
        for (let i = 0; i < computedStyles.length; i++) {
          const key = computedStyles[i];
          this.dragClone.style.setProperty(key, computedStyles.getPropertyValue(key));
        }
        if (rect) {
          this.setDragCloneStyles(rect);
        }
        this.appendClone();

        // check if max associations are reached
        const matchMax = this.getMatchMaxValue(this.dragSource);
        const currentDraggables = this.draggables.filter(
          d => d.getAttribute('identifier') === this.dragSource.getAttribute('identifier')
        );
        if (matchMax !== 0 && currentDraggables.length >= matchMax) {
          draggableInDragContainer.style.opacity = '0.0';
          draggableInDragContainer.style.pointerEvents = 'none';
        } else {
          draggableInDragContainer.style.opacity = '1.0';
        }
        e.preventDefault();
      } else {
        this.enableDroppable(parent);
        this.dragClone = this.dragSource;
        this.dragSource = this.findDraggableInDraggableContainer(this.dragSource.getAttribute('identifier'));

        const rect = this.dragClone.getBoundingClientRect();
        this.appendClone();
        if (rect) {
          this.setDragCloneStyles(rect);
        }
      }
    }

    private findParentInteractionElement(element: HTMLElement): HTMLElement {
      let parent = element.parentElement;
      // find parent where tag name endswith -interaction
      while (parent && !parent.tagName?.toLowerCase().endsWith('-interaction')) {
        parent = parent.parentElement;
      }
      return parent;
    }

    private findDraggableInDraggableContainer(identifier: string): HTMLElement | undefined {
      // Flatten all drag containers
      const allDragContainers = this.dragContainers.flat();

      // Iterate through each drag container
      for (const container of allDragContainers) {
        // Check if the container itself has the identifier
        if (container.getAttribute('identifier') === identifier) {
          // Return the container itself if it matches
          return container;
        }

        // If the container is a slot element, get assigned elements
        let elements: HTMLElement[];

        // Check if the container is a slot element
        if (container instanceof HTMLSlotElement) {
          // If it's a slot, get the assigned elements
          elements = Array.from(container?.assignedElements() || []) as HTMLElement[];
        } else {
          // Otherwise, query the container using draggablesSelector
          elements = Array.from(container.querySelectorAll(draggablesSelector)) as HTMLElement[];
        }
        // Search for a matching child element inside the container
        const foundElement = elements.find(e => e.getAttribute('identifier') === identifier);

        // If a matching element is found, return it
        if (foundElement) {
          return foundElement;
        }
      }

      // Return undefined if no matching element is found
      return undefined;
    }

    private setDragCloneStyles(rect: DOMRect) {
      this.dragClone.style.position = 'fixed';
      this.dragClone.style.top = `${rect.top}px`;
      this.dragClone.style.left = `${rect.left}px`;
      this.dragClone.style.width = `${rect.width}px`;
      this.dragClone.style.height = `${rect.height}px`;
      // set style.boxSizing = 'border-box' with important'
      this.dragClone.style.setProperty('box-sizing', 'border-box', 'important');
      this.dragClone.style.zIndex = '9999';
      this.dragClone.style.pointerEvents = 'none';
      this.dragClone.style.opacity = this.DRAG_CLONE_OPACITY.toString();
      this.dragClone.style.display = 'block';
    }
  }

  return DragDropInteractionElement as Constructor<IInteraction> & T;
};
