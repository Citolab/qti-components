export class TouchDragAndDrop {
  private touchStartTime = 0; // timestamp of first touch
  private touchStartPoint = null; // point of first touch
  private lastClickTime = 0; // timestamp of previous click
  private isDraggable = false; // whether a draggable element is active
  private dragSource: HTMLElement = null; // the source element being dragged
  private dragClone: HTMLElement = null; // clone of drag source for visual feedback
  private touchEndTriggered = false; // flag for touchEnd event
  private isDragging = false; // whether a drag operation is ongoing

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
  private cloneOffset = { x: 0, y: 0 }; // Offset for positioning the drag clone

  private lastTarget = null; // Last touch target
  private currentDropTarget = null; // Current droppable element
  private allowClick = true; // flag to allow or prevent click
  private static instance: TouchDragAndDrop;

  copyStylesForDragClone = true;
  dragOnClickEnabled = false;

  private readonly DOUBLE_CLICK_DELAY = 500; // max delay for a double-click
  private readonly CONTEXT_MENU_DELAY = 1000; // delay before context menu is shown
  private readonly MIN_DRAG_DISTANCE = 5; // minimum pixel movement to start dragging
  private readonly DRAG_CLONE_OPACITY = 1; // opacity of the drag clone element
  private readonly ORIGINAL_OPACITY = 0.7; // original opacity of the dragged element

  constructor() {
    if (TouchDragAndDrop.instance) {
      return TouchDragAndDrop.instance;
    }
    TouchDragAndDrop.instance = this;

    // Add event listeners for touch and mouse interactions
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('mousemove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('mouseup', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
  }

  addDraggableElements(draggables: Element[]) {
    draggables.forEach(el => {
      el.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      el.addEventListener('mousedown', this.handleTouchStart.bind(this), { passive: false });
    });
  }

  private handleTouchStart(e) {
    this.touchStartTime = Date.now();
    const { x, y } = this.getEventCoordinates(e);
    this.touchStartPoint = { x, y };
    this.dragSource = e.currentTarget;
    this.isDraggable = true;

    if (this.dragOnClickEnabled) {
      this.isDragging = true;
      this.createDragClone(e, { clientX: x, clientY: y });
    }

    e.preventDefault();
  }

  private handleTouchMove(e) {
    if (this.isDraggable && this.dragSource) {
      const { x, y } = this.getEventCoordinates(e);
      const currentTouch = { clientX: x, clientY: y };

      if (this.calculateDragDistance(currentTouch) >= this.MIN_DRAG_DISTANCE) {
        this.isDragging = true;
      }

      this.createDragClone(e, currentTouch);
      e.preventDefault();
    }
  }

  private createDragClone(e, currentTouch: { clientX: number; clientY: number }) {
    if (!this.dragClone && this.isDragging) {
      this.dragSource.style.opacity = this.DRAG_CLONE_OPACITY.toString();
      this.dragClone = this.dragSource.cloneNode(true) as HTMLElement;

      if (this.copyStylesForDragClone) {
        const computedStyles = window.getComputedStyle(this.dragSource);
        for (const style of computedStyles) {
          this.dragClone.style[style] = computedStyles.getPropertyValue(style);
        }
      }

      this.calculateClonePosition(currentTouch);
      this.setDragCloneStyles(currentTouch);
      this.dragClone = document.body.appendChild(this.dragClone);
      this.dispatchCustomEvent(this.dragSource, 'dragstart');
    }

    if (this.isDragging) {
      this.updateDragClonePosition(currentTouch);
      const dropTarget = this.findDropTarget(e);

      if (dropTarget !== this.lastTarget) {
        this.dispatchCustomEvent(dropTarget, 'dragenter');
        this.dispatchCustomEvent(this.lastTarget, 'dragleave');
        this.lastTarget = dropTarget;
      }

      this.currentDropTarget = dropTarget;
      if (this.currentDropTarget) this.dispatchCustomEvent(dropTarget, 'dragover');
    }
  }

  private handleTouchEnd(e) {
    this.touchEndTriggered = true;
    this.isDraggable = false;

    if (this.currentDropTarget) {
      this.dispatchCustomEvent(this.currentDropTarget, 'drop');
      this.dispatchCustomEvent(this.dragSource, 'dragend');
    } else if (this.isDragging) {
      const dragEndEvent = new CustomEvent('dragend', { bubbles: true, cancelable: true });
      dragEndEvent['dataTransfer'] = { dropEffect: 'none' };
      this.dragSource?.dispatchEvent(dragEndEvent);
    }

    this.resetDragState();
  }

  private handleTouchCancel(e) {
    this.resetDragState();
  }

  private findDropTarget(event) {
    const { x, y } = this.getEventCoordinates(event);
    const visitedElements = new Set<Element>();
    return this.getDropTargetAtPoint(document, x, y, visitedElements);
  }

  private getDropTargetAtPoint(
    root: DocumentOrShadowRoot,
    x: number,
    y: number,
    visited: Set<Element>
  ): Element | null {
    const element = root.elementFromPoint(x, y) as HTMLElement;
    if (element && !visited.has(element)) {
      visited.add(element);
      if (element.hasAttribute('dropzone')) {
        return element;
      }
      if (element.shadowRoot) {
        return this.getDropTargetAtPoint(element.shadowRoot, x, y, visited);
      }
    }
    return element;
  }

  private getEventCoordinates(event, page = false) {
    const touch = event.touches ? event.touches[0] : event;
    return {
      x: page ? touch.pageX : touch.clientX,
      y: page ? touch.pageY : touch.clientY
    };
  }

  private calculateClonePosition(touch) {
    const rect = this.dragSource.getBoundingClientRect();
    this.cloneOffset.x = touch.clientX - rect.left;
    this.cloneOffset.y = touch.clientY - rect.top;
  }

  private setDragCloneStyles(touch) {
    this.dragClone.style.position = 'fixed';
    this.dragClone.style.top = `${touch.clientY - this.cloneOffset.y}px`;
    this.dragClone.style.left = `${touch.clientX - this.cloneOffset.x}px`;
    this.dragClone.style.pointerEvents = 'none';
    this.dragClone.style.zIndex = '999999';
  }

  private updateDragClonePosition(touch) {
    requestAnimationFrame(() => {
      if (this.touchEndTriggered || !this.dragClone) return;
      this.dragClone.style.top = `${touch.clientY - this.cloneOffset.y}px`;
      this.dragClone.style.left = `${touch.clientX - this.cloneOffset.x}px`;
    });
  }

  private calculateDragDistance(touch): number {
    const xDist = Math.abs(touch.clientX - this.touchStartPoint.x);
    const yDist = Math.abs(touch.clientY - this.touchStartPoint.y);
    return xDist + yDist;
  }

  private dispatchCustomEvent(element, eventType, bubble = true) {
    if (!element) return;
    const event = new CustomEvent(eventType, { bubbles: bubble, cancelable: true });
    event['dataTransfer'] = this.dataTransfer;
    element.dispatchEvent(event);
  }

  private resetDragState() {
    if (this.isDragging) {
      this.dragSource.style.opacity = '1.0';
      this.dragClone?.parentElement.removeChild(this.dragClone);
    }

    this.isDragging = false;
    this.dragSource = null;
    this.dragClone = null;
    this.isDraggable = false;
    this.touchStartTime = 0;
    this.touchStartPoint = null;
    this.touchEndTriggered = false;
    this.dataTransfer = {
      data: {},
      setData(type, val) {
        this.data[type] = val;
      },
      getData(type) {
        return this.data[type];
      },
      effectAllowed: 'move'
    };
    this.cloneOffset = { x: 0, y: 0 };
    this.lastTarget = null;
    this.currentDropTarget = null;
    this.allowClick = true;
  }
}
