export class TouchDragAndDrop {
  public draggables: HTMLElement[] = [];
  public droppables: HTMLElement[] = [];
  public dragContainers: HTMLElement[] = [];
  public dragClone: HTMLElement = null; // Clone of drag source for visual feedback
  public dragSource: HTMLElement = null; // The source element being dragged

  private touchStartPoint = null; // Point of the first touch
  private isDraggable = false; // Whether a draggable element is active

  private isDragging = false; // Whether a drag operation is ongoing
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

  private readonly MIN_DRAG_DISTANCE = 5; // Minimum pixel movement to start dragging
  private readonly DRAG_CLONE_OPACITY = 1; // Opacity of the drag clone element

  constructor() {
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('mousemove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('mouseup', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
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

  draggablesModified(addedDraggables: HTMLElement[], removedDraggables: HTMLElement[]) {
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
        // el.addEventListener('focus', () => (this.focusedElement = el as HTMLElement));
        // el.addEventListener('blur', () => (this.focusedElement = null));

        draggable.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        draggable.addEventListener('mousedown', this.handleTouchStart.bind(this), { passive: false });
        // });
      }
    }
  }

  droppablesModified(addedDroppables: HTMLElement[], removedDroppables: HTMLElement[]) {
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
  }

  private handleTouchStart(e) {
    const { x, y } = this.getEventCoordinates(e);
    this.touchStartPoint = { x, y };
    this.dragSource = e.currentTarget;
    this.isDraggable = true;
    this.rootNode = this.dragSource.getRootNode();

    // Create and position the drag clone
    const rect = this.dragSource.getBoundingClientRect();
    this.cloneOffset.x = x - rect.left;
    this.cloneOffset.y = y - rect.top;

    // clone the element if it is not in a dropzone
    const parent = this.dragSource.parentElement;
    if (!this.droppables.includes(parent)) {
      // TODO: check if this is a correct check in all cases
      this.dragClone = this.dragSource.cloneNode(true) as HTMLElement;
      this.setDragCloneStyles(rect);

      if (this.rootNode instanceof ShadowRoot) {
        this.rootNode.host.appendChild(this.dragClone);
      } else if (this.rootNode instanceof Document) {
        document.body.appendChild(this.dragClone);
      }

      this.dragSource.style.opacity = '0.5'; // Reduce visibility of the original
      e.preventDefault();
    } else {
      this.dragClone = this.dragSource;
    }
  }

  private handleTouchMove(e) {
    if (this.isDraggable && this.dragClone) {
      const { x, y } = this.getEventCoordinates(e);
      const currentTouch = { clientX: x, clientY: y };

      if (this.calculateDragDistance(currentTouch) >= this.MIN_DRAG_DISTANCE) {
        this.isDragging = true;
        this.updateDragClonePosition(currentTouch);
      }

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

      e.preventDefault();
    }
  }

  private handleTouchEnd(_e) {
    if (this.currentDropTarget) {
      this.dispatchCustomEvent(this.currentDropTarget, 'drop');
    }
    this.dispatchCustomEvent(this.dragClone, 'dragend');

    this.resetDragState();
  }

  private handleTouchCancel(_e) {
    this.resetDragState();
  }

  private setDragCloneStyles(rect: DOMRect) {
    this.dragClone.style.position = 'fixed';
    this.dragClone.style.top = `${rect.top}px`;
    this.dragClone.style.left = `${rect.left}px`;
    this.dragClone.style.width = `${rect.width}px`;
    this.dragClone.style.height = `${rect.height}px`;
    this.dragClone.style.zIndex = '9999';
    this.dragClone.style.pointerEvents = 'none';
    this.dragClone.style.opacity = this.DRAG_CLONE_OPACITY.toString();
  }

  private updateDragClonePosition(touch) {
    if (!this.isDragging || !this.dragClone) return;

    const newLeft = touch.clientX - this.cloneOffset.x;
    const newTop = touch.clientY - this.cloneOffset.y;

    const { newLeft: boundedLeft, newTop: boundedTop } = this.applyBoundaries(newLeft, newTop, this.dragClone);

    this.dragClone.style.left = `${boundedLeft}px`;
    this.dragClone.style.top = `${boundedTop}px`;
  }

  private resetDragState() {
    if (this.dragClone) {
      // copy styles from dragSource to dragClone
      const isDropped = this.currentDropTarget !== null;
      if (isDropped) {
        const computedStyles = window.getComputedStyle(this.dragSource);
        for (let i = 0; i < computedStyles.length; i++) {
          const key = computedStyles[i];
          this.dragClone.style.setProperty(key, computedStyles.getPropertyValue(key));
        }
      } else {
        this.dragClone.remove();
      }
    }
    if (this.dragSource) {
      // TODO: remove if match-max is reached
      this.dragSource.style.opacity = '1.0';
    }

    this.isDragging = false;
    this.isDraggable = false;
    this.dragSource = null;
    this.dragClone = null;
    this.touchStartPoint = null;
    this.currentDropTarget = null;
    this.lastTarget = null;
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

  private dispatchCustomEvent(element, eventType, bubble = true) {
    if (!element) return;
    const event = new CustomEvent(eventType, { bubbles: bubble, cancelable: true });
    event['dataTransfer'] = this.dataTransfer;
    element.dispatchEvent(event);
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

  private getDropzoneRect(el: HTMLElement): DOMRect {
    const slot = el.shadowRoot?.querySelector<HTMLElement>('slot[part="dropslot"]');
    return (slot ?? el).getBoundingClientRect();
  }

  private findClosestDropzone(): HTMLElement | null {
    const activeDrops = this.allDropzones.filter(d => !d.hasAttribute('disabled'));
    if (!this.dragClone || activeDrops.length === 0) return null;

    const dragRect = this.dragClone.getBoundingClientRect();
    let closestDropzone: HTMLElement | null = null;
    let maxArea = 0;

    // prefer real droppables first
    const prefer = (elements: HTMLElement[]) => {
      for (const dz of elements) {
        const dzRect = this.getDropzoneRect(dz);
        const area = this.calculateOverlapArea(dragRect, dzRect);
        if (area > maxArea) {
          maxArea = area;
          closestDropzone = dz;
        }
      }
    };

    prefer(this.droppables.filter(droppable => !droppable.hasAttribute('disabled')));
    if (!closestDropzone) {
      // fallback to drag containers only if no droppable overlaps
      prefer(this.dragContainers.filter(drags => !drags.hasAttribute('disabled')));
    }

    // fallback by distance
    if (!closestDropzone) {
      let minDist = Number.POSITIVE_INFINITY;
      for (const dz of activeDrops) {
        const dzRect = this.getDropzoneRect(dz);
        const dist = Math.hypot(dragRect.left - dzRect.left, dragRect.top - dzRect.top);
        if (dist < minDist) {
          minDist = dist;
          closestDropzone = dz;
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
}
