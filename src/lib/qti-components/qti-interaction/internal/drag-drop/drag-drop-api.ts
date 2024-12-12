type Point = { x: number; y: number };

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
  private rootNode: Node = null; // Root node for boundary calculations

  private allDropzones: HTMLElement[] = []; // All dropzones for keyboard navigation

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

  private readonly MIN_DRAG_DISTANCE = 5; // Minimum pixel movement to start dragging
  private readonly DRAG_CLONE_OPACITY = 1; // Opacity of the drag clone element
  initialTransition: string;
  // droppables: Element[];

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
      el.setAttribute('tabindex', '0'); // Make draggable elements focusable
      // el.addEventListener('focus', () => (this.focusedElement = el as HTMLElement));
      // el.addEventListener('blur', () => (this.focusedElement = null));

      el.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      el.addEventListener('mousedown', this.handleTouchStart.bind(this), { passive: false });
    });
  }

  private getInteraction(el: HTMLElement) {
    // Find the closest parent where the tagname ends with '-interaction'
    let parent = el;
    while (parent && !parent.tagName.toLocaleLowerCase().endsWith('-interaction')) {
      parent = parent.parentElement;
    }
    return parent;
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

      // Save the original transition style
      this.initialTransition = computedStyle.transition || '';

      // Disable transitions
      this.dragSource.style.transition = 'none';

      // Calculate clone offset
      const rect = this.dragSource.getBoundingClientRect();
      this.cloneOffset.x = x - rect.left;
      this.cloneOffset.y = y - rect.top;

      // Set higher z-index to bring it on top
      this.dragSource.style.zIndex = '9999';
      // this.dragSource.style.pointerEvents = 'none'; // So it doesn't block events
      this.dragSource.focus();
    }

    e.preventDefault();
  }

  private handleTouchMove(e) {
    if (this.isDraggable && this.dragSource) {
      const interaction = this.getInteraction(this.dragSource);
      this.allDropzones = [
        ...(Array.from(interaction.querySelectorAll('[dropzone]')) as HTMLElement[]),
        ...(Array.from(interaction.shadowRoot?.querySelectorAll('[dropzone]')) as HTMLElement[])
      ];
      const { x, y } = this.getEventCoordinates(e);
      const currentTouch = { clientX: x, clientY: y };

      if (this.calculateDragDistance(currentTouch) >= this.MIN_DRAG_DISTANCE) {
        this.dragSource.style.pointerEvents = 'none'; // So it doesn't block events
        this.isDragging = true;
      }

      this.createDragClone(e, currentTouch);
      e.preventDefault();

      // Determine the closest dropzone using the closest corners algorithm
      const closestDropzone = this.findClosestDropzone();
      this.currentDropTarget = closestDropzone;
      if (closestDropzone !== this.lastTarget) {
        if (this.lastTarget) {
          this.dispatchCustomEvent(this.lastTarget, 'dragleave');
        }
        if (closestDropzone) {
          this.dispatchCustomEvent(closestDropzone, 'dragenter');
        }
        this.lastTarget = closestDropzone;
      }

      if (this.lastTarget) {
        this.dispatchCustomEvent(this.lastTarget, 'dragover');
      }
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
        // const { boundedDeltaX, boundedDeltaY } = this.applyTransformBoundaries(deltaX, deltaY);
        // this.dragSource.style.transform = `${this.initialTransform} translate(${boundedDeltaX}px, ${boundedDeltaY}px)`;

        this.dragSource.style.transform = `${this.initialTransform} translate(${deltaX}px, ${deltaY}px)`;

        if (!this.hasDispatchedDragStart) {
          this.dispatchCustomEvent(this.dragSource, 'dragstart');
          this.hasDispatchedDragStart = true;
        }
      }
    }

    const dropTarget = this.currentDropTarget;

    if (dropTarget !== this.lastTarget) {
      this.dispatchCustomEvent(dropTarget, 'dragenter');
      this.dispatchCustomEvent(this.lastTarget, 'dragleave');
      this.lastTarget = dropTarget;
    }

    this.currentDropTarget = dropTarget;
    if (this.currentDropTarget) this.dispatchCustomEvent(dropTarget, 'dragover');
  }

  private handleTouchEnd(e) {
    this.allDropzones = [];
    this.touchEndTriggered = true;
    this.isDraggable = false;
    let dropFound = false;

    // console.log('dropFound', dropFound);

    if (this.currentDropTarget) {
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

  private findClosestDropzone(): HTMLElement | null {
    if (!this.dragSource || this.allDropzones.length === 0) return null;

    const dragRect = this.dragSource.getBoundingClientRect();
    const dragCorners = this.getCorners(dragRect);
    const dragCenter = this.getCenter(dragRect);

    let closestDropzone: HTMLElement | null = null;
    let minDistance = Infinity;

    for (const dropzone of this.allDropzones) {
      const dropRect = dropzone.getBoundingClientRect();
      const dropCorners = this.getCorners(dropRect);
      const dropCenter = this.getCenter(dropRect);

      // Calculate normalized corner distances
      const cornerDistance =
        this.calculateTotalCornerDistance(dragCorners, dropCorners) / this.getRectDiagonal(dropRect);

      // Calculate center-to-center distance
      const centerDistance = this.calculateDistance(dragCenter, dropCenter);

      // Combine distances with weights
      const totalDistance = cornerDistance * 0.5 + centerDistance * 0.5;

      if (totalDistance < minDistance) {
        minDistance = totalDistance;
        closestDropzone = dropzone;
      }
    }

    return closestDropzone;
  }

  private getCenter(rect: DOMRect): Point {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  private getRectDiagonal(rect: DOMRect): number {
    return Math.sqrt(rect.width ** 2 + rect.height ** 2);
  }

  private getCorners(rect: DOMRect): { topLeft: Point; topRight: Point; bottomLeft: Point; bottomRight: Point } {
    return {
      topLeft: { x: rect.left, y: rect.top },
      topRight: { x: rect.right, y: rect.top },
      bottomLeft: { x: rect.left, y: rect.bottom },
      bottomRight: { x: rect.right, y: rect.bottom }
    };
  }

  private calculateTotalCornerDistance(cornersA, cornersB): number {
    return (
      this.calculateDistance(cornersA.topLeft, cornersB.topLeft) +
      this.calculateDistance(cornersA.topRight, cornersB.topRight) +
      this.calculateDistance(cornersA.bottomLeft, cornersB.bottomLeft) +
      this.calculateDistance(cornersA.bottomRight, cornersB.bottomRight)
    );
  }

  private calculateDistance(pointA: Point, pointB: Point): number {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private findDropTarget(event) {
    const { x, y } = this.getEventCoordinates(event);
    return this.getDropTargetAtPoint(document, x, y);
  }

  private getDropTargetAtPoint(root: DocumentOrShadowRoot, x: number, y: number, depth: number = 0): Element | null {
    // Limit the recursion depth
    const MAX_DEPTH = 2;
    if (depth > MAX_DEPTH) {
      return null;
    }

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

    // If the element has a Shadow DOM and depth limit not reached, traverse it
    if (element.shadowRoot && depth < MAX_DEPTH) {
      const shadowElement = this.getDropTargetAtPoint(element.shadowRoot, x, y, depth + 1);
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
        // Restore original styles
        if (!dropFound) this.dragSource.style.transform = 'translate(0, 0)';
        this.dragSource.style.zIndex = '';
        this.dragSource.style.pointerEvents = '';
        // Restore the original transition style
        this.dragSource.style.transition = this.initialTransition;

        // Reset the original transition property
        this.initialTransition = '';
      }
    }

    this.isDragging = false;
    this.dragSource = null;
    this.dragClone = null;
    this.isDraggable = false;
    this.touchStartTime = 0;
    this.touchStartPoint = null;
    this.touchEndTriggered = false;
    this.allDropzones = [];
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
