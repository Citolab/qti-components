export class TouchDragAndDrop {
  private touchStartTime = 0; // Timestamp of the first touch
  private touchStartPoint = null; // Point of the first touch
  private lastClickTime = 0; // Timestamp of the previous click
  private isDraggable = false; // Whether a draggable element is active
  private dragSource: HTMLElement = null; // The source element being dragged
  private dragClone: HTMLElement = null; // Clone of drag source for visual feedback
  private touchEndTriggered = false; // Flag for touchEnd event
  private isDragging = false; // Whether a drag operation is ongoing
  private initialTransform = ''; // Original transform style
  private hasDispatchedDragStart = false; // Flag to ensure dragstart event is dispatched once

  private rootNode: DocumentOrShadowRoot = null; // Root node for boundary calculations

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
  private allowClick = true; // Flag to allow or prevent click
  private static instance: TouchDragAndDrop;

  copyStylesForDragClone = true;
  dragOnClickEnabled = false;
  useDragClone = false; // Set to true to drag with a clone; set to false to drag the original element

  private readonly DOUBLE_CLICK_DELAY = 500; // Max delay for a double-click
  private readonly CONTEXT_MENU_DELAY = 1000; // Delay before context menu is shown
  private readonly MIN_DRAG_DISTANCE = 5; // Minimum pixel movement to start dragging
  private readonly DRAG_CLONE_OPACITY = 1; // Opacity of the drag clone element
  private readonly ORIGINAL_OPACITY = 0.7; // Original opacity of the dragged element

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

    // Get the root node
    this.rootNode = this.dragSource.getRootNode();

    if (this.dragOnClickEnabled) {
      this.isDragging = true;
      this.createDragClone(e, { clientX: x, clientY: y });
    }

    if (!this.useDragClone) {
      // Save initial transform
      const computedStyle = window.getComputedStyle(this.dragSource);
      this.initialTransform = computedStyle.transform === 'none' ? '' : computedStyle.transform;

      // Calculate clone offset
      const rect = this.dragSource.getBoundingClientRect();
      this.cloneOffset.x = x - rect.left;
      this.cloneOffset.y = y - rect.top;

      // Set higher z-index to bring it on top
      this.dragSource.style.zIndex = '9999';
      this.dragSource.style.pointerEvents = 'none'; // So it doesn't block events
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
    if (!this.isDragging) return;

    if (this.useDragClone) {
      // Existing code for creating and handling the drag clone
      if (!this.dragClone) {
        this.dragSource.style.opacity = this.DRAG_CLONE_OPACITY.toString();
        this.dragClone = this.dragSource.cloneNode(true) as HTMLElement;

        if (this.copyStylesForDragClone) {
          const computedStyles = window.getComputedStyle(this.dragSource);
          for (const style of computedStyles) {
            this.dragClone.style[style] = computedStyles.getPropertyValue(style);
          }
        }

        // Move the drag clone to the root node
        if (this.rootNode instanceof ShadowRoot) {
          // Append to the host of the shadow root
          this.rootNode.host.appendChild(this.dragClone);
        } else if (this.rootNode instanceof Document) {
          document.body.appendChild(this.dragClone);
        }

        this.calculateClonePosition(currentTouch);
        this.setDragCloneStyles(currentTouch);
        this.dispatchCustomEvent(this.dragSource, 'dragstart');
      }

      this.updateDragClonePosition(currentTouch);
    } else {
      // Handle dragging the original element using CSS transforms
      if (this.touchStartPoint) {
        const deltaX = currentTouch.clientX - this.touchStartPoint.x;
        const deltaY = currentTouch.clientY - this.touchStartPoint.y;

        // Apply boundaries
        const { boundedDeltaX, boundedDeltaY } = this.applyTransformBoundaries(deltaX, deltaY);

        this.dragSource.style.transform = `${this.initialTransform} translate(${boundedDeltaX}px, ${boundedDeltaY}px)`;

        if (!this.hasDispatchedDragStart) {
          this.dispatchCustomEvent(this.dragSource, 'dragstart');
          this.hasDispatchedDragStart = true;
        }
      }
    }

    const dropTarget = this.findDropTarget(e);

    if (dropTarget !== this.lastTarget) {
      this.dispatchCustomEvent(dropTarget, 'dragenter');
      this.dispatchCustomEvent(this.lastTarget, 'dragleave');
      this.lastTarget = dropTarget;
    }

    this.currentDropTarget = dropTarget;
    if (this.currentDropTarget) this.dispatchCustomEvent(dropTarget, 'dragover');
  }

  private handleTouchEnd(e) {
    this.touchEndTriggered = true;
    this.isDraggable = false;
    let dropFound = false;

    if (this.currentDropTarget) {
      console.log(this.currentDropTarget);
      this.dispatchCustomEvent(this.currentDropTarget, 'drop');
      this.dispatchCustomEvent(this.dragSource, 'dragend');
      dropFound = true;
    } else if (this.isDragging) {
      const dragEndEvent = new CustomEvent('dragend', { bubbles: true, cancelable: true });
      dragEndEvent['dataTransfer'] = { dropEffect: 'none' };
      this.dragSource?.dispatchEvent(dragEndEvent);
    }

    this.resetDragState(dropFound);
  }

  private handleTouchCancel(e) {
    this.resetDragState();
  }

  private findDropTarget(event) {
    const { x, y } = this.getEventCoordinates(event);
    return this.getDropTargetAtPoint(document, x, y);
  }

  private getDropTargetAtPoint(root: DocumentOrShadowRoot, x: number, y: number): Element | null {
    const element = root.elementFromPoint(x, y) as HTMLElement;

    if (!element) {
      return null;
    }

    if (element.hasAttribute('dropzone')) {
      return element;
    }

    // Traverse up the DOM tree to find an ancestor with 'dropzone' attribute
    let currentElement = element.parentElement;
    while (currentElement) {
      if (currentElement.hasAttribute('dropzone')) {
        return currentElement;
      }
      currentElement = currentElement.parentElement;
    }

    // If the element is inside a Shadow DOM, check its shadow root
    if (element.shadowRoot) {
      const shadowElement = this.getDropTargetAtPoint(element.shadowRoot, x, y);
      if (shadowElement) {
        return shadowElement;
      }
    }

    // No element with 'dropzone' found
    return null;
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

      const newLeft = touch.clientX - this.cloneOffset.x;
      const newTop = touch.clientY - this.cloneOffset.y;

      // Apply boundaries
      const { newLeft: boundedLeft, newTop: boundedTop } = this.applyBoundaries(newLeft, newTop, this.dragClone);

      this.dragClone.style.left = `${boundedLeft}px`;
      this.dragClone.style.top = `${boundedTop}px`;
    });
  }

  private applyTransformBoundaries(deltaX: number, deltaY: number) {
    // Get the boundaries of the root node
    let boundaryRect: DOMRect;
    if (this.rootNode instanceof ShadowRoot) {
      boundaryRect = this.rootNode.host.getBoundingClientRect();
    } else if (this.rootNode instanceof Document) {
      boundaryRect = document.documentElement.getBoundingClientRect();
    } else {
      // Default to viewport
      boundaryRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    }

    // Get the dimensions and position of the element
    const elementRect = this.dragSource.getBoundingClientRect();
    const elementWidth = elementRect.width;
    const elementHeight = elementRect.height;

    // Calculate potential new position
    const newLeft = elementRect.left + deltaX;
    const newTop = elementRect.top + deltaY;

    // Limit the new position within the boundaries
    const boundedLeft = Math.max(boundaryRect.left, Math.min(newLeft, boundaryRect.right - elementWidth));
    const boundedTop = Math.max(boundaryRect.top, Math.min(newTop, boundaryRect.bottom - elementHeight));

    // Calculate the bounded delta values
    const boundedDeltaX = boundedLeft - elementRect.left;
    const boundedDeltaY = boundedTop - elementRect.top;

    return { boundedDeltaX, boundedDeltaY };
  }

  private applyBoundaries(newLeft: number, newTop: number, element: HTMLElement) {
    // Get the boundaries of the root node
    let boundaryRect: DOMRect;
    if (this.rootNode instanceof ShadowRoot) {
      boundaryRect = this.rootNode.host.getBoundingClientRect();
    } else if (this.rootNode instanceof Document) {
      boundaryRect = document.documentElement.getBoundingClientRect();
    } else {
      // Default to viewport
      boundaryRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    }

    // Get the dimensions of the element
    const elementRect = element.getBoundingClientRect();
    const elementWidth = elementRect.width;
    const elementHeight = elementRect.height;

    // Limit the newLeft and newTop within the boundaries
    const boundedLeft = Math.max(boundaryRect.left, Math.min(newLeft, boundaryRect.right - elementWidth));
    const boundedTop = Math.max(boundaryRect.top, Math.min(newTop, boundaryRect.bottom - elementHeight));

    return { newLeft: boundedLeft, newTop: boundedTop };
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

  private resetDragState(dropFound: boolean = false) {
    if (this.isDragging) {
      if (this.useDragClone) {
        this.dragSource.style.opacity = '1.0';
        this.dragClone?.parentElement.removeChild(this.dragClone);
      } else {
        console.log('dropFound', dropFound);
        // Restore original styles
        if (!dropFound) this.dragSource.style.transform = this.initialTransform;
        this.dragSource.style.zIndex = '';
        this.dragSource.style.pointerEvents = '';
      }
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
    this.initialTransform = '';
    this.hasDispatchedDragStart = false;

    this.rootNode = null;
  }
}
