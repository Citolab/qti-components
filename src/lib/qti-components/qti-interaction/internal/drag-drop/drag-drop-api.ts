export class TouchDragAndDrop {
  private _touchBegin = 0; // timestamp of first touch
  private _touchDown = null; // point of first touch
  private _lastClick = 0; // timestamp of previous click (touchstart + touchend)
  private _canDrag = false; // whether there is an element which can be dragged
  private _dragSrc = null; // the element which should be dragged
  private _dragCopy = null; // copy of drag source for drag feedback
  private _touchEndCalled = false; // whether touchEnd occured
  private _dragRunning = false; // whether a drag process is running at the moment

  private _dataTransfer = {
    data: {},
    setData: function (type, val) {
      this.data[type] = val;
    },
    getData: function (type) {
      return this.data[type];
    },
    effectAllowed: 'move'
  };
  private _copyOffset = { x: 0, y: 0 }; // Offset for positioning the drag copy

  private _lastTarget = null; // The last registered touch target
  private _currentDropContainer = null; // The current drop container; false if element is not droppable
  private _handleClick = true; // Specifies

  private _DBLCLICKDELAY = 500; // maximum delay in which a second click must occur
  private _CONTEXTMENUDELAY = 1000; // hold delay after which context menu is shown
  private _DRAGDELTA = 5; // Minimum of pixels which the finger must be moved to start drag
  private _COPYOPACITY = 1; // Opacity of the drag copy element
  private _ORGOPACITY = 0.7; // Opacity of the drag copy element
  private static _instance: TouchDragAndDrop;

  copyStylesDragClone: boolean = true;
  dragOnClick: boolean = false;

  constructor() {
    // Check singleton
    if (TouchDragAndDrop._instance) {
      //  throw new Error("TouchDragAndDrop can't be instantiated more than once.");
      return TouchDragAndDrop._instance;
    }
    TouchDragAndDrop._instance = this;

    // this._initializeFields();

    // Add event listeners

    document.addEventListener('touchmove', this._touchMove.bind(this), { passive: false, capture: false });
    document.addEventListener('mousemove', this._touchMove.bind(this), { passive: false, capture: false });

    document.addEventListener('touchend', this._touchEnd.bind(this), { passive: false, capture: false });
    document.addEventListener('mouseup', this._touchEnd.bind(this), { passive: false, capture: false });

    document.addEventListener('touchcancel', this._touchCancel.bind(this), { passive: false, capture: false });

    return this;
  }

  addDraggables(draggables: Element[]) {
    draggables.forEach(el => {
      el.addEventListener('touchstart', this._touchStart.bind(this), { passive: false, capture: false });
      el.addEventListener('mousedown', this._touchStart.bind(this), { passive: false, capture: false });
    });
  }

  /**
   * Callback for touchstart event listener.
   * @param {TouchEvent} e
   */
  private _touchStart(e) {
    // Save current timestamp
    this._touchBegin = Date.now();

    const { x, y } = this._getPoint(e);

    this._touchDown = { x, y };

    this._dragSrc = e.currentTarget;
    this._canDrag = true;

    if (this.dragOnClick) {
      const _touches = { clientX: x, clientY: y };
      this._dragRunning = true;
      this._createDragCopy(e, _touches);
    }

    e.preventDefault();
  }

  /**
   * Callback for touchmove event listener.
   * @param {TouchEvent} e
   */
  private _touchMove(e) {
    if (this._canDrag && this._dragSrc) {
      // Create copy of element for visual drag feedback

      const { x, y } = this._getPoint(e);
      const _touches = { clientX: x, clientY: y };

      if (this._getDelta(_touches) >= this._DRAGDELTA) {
        this._dragRunning = true;
      }

      this._createDragCopy(e, _touches);
      e.preventDefault();
    }
  }

  private _createDragCopy = (e: any, _touches: { clientX: number; clientY: number }) => {
    if (this._dragCopy === null && this._dragRunning) {
      this._dragSrc.style.opacity = this._COPYOPACITY;
      this._dragCopy = this._dragSrc.cloneNode(true);
      const elementStyles = window.getComputedStyle(this._dragSrc);

      this._dragCopy.style = '';
      this._dragCopy.setAttribute('dragclone', '');

      if (this.copyStylesDragClone) {
        for (const style of elementStyles) {
          this._dragCopy.style[style] = elementStyles.getPropertyValue(style);
        }
      }

      this._calculateDragCopyPosition(_touches);

      this._dragCopy.style.top = _touches.clientY - this._copyOffset.y + 'px';
      this._dragCopy.style.left = _touches.clientX - this._copyOffset.x + 'px';
      this._dragCopy.style.position = 'fixed';
      this._dragCopy.style.pointerEvents = 'none';
      this._dragCopy.style.zIndex = '999999';

      this._dragCopy = document.body.appendChild(this._dragCopy);
      this._dispatchEvent(this._dragSrc, 'dragstart');
    }

    // Drag is running, move drag copy and fire events
    if (this._dragRunning) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this;
      requestAnimationFrame(function () {
        if (_this._touchEndCalled || _this._dragCopy === null) return;
        _this._dragCopy.style.top = _touches.clientY - _this._copyOffset.y + 'px';
        _this._dragCopy.style.left = _touches.clientX - _this._copyOffset.x + 'px';
      });

      const target = this._findDroppable(e);

      // Fire dragleave and dragenter events when target has changed during move
      if (target != this._lastTarget) {
        this._dispatchEvent(target, 'dragenter');
        this._dispatchEvent(this._lastTarget, 'dragleave');
        this._lastTarget = target;
      }

      // Make current drop container classwide available and fire dragover if it's really a drop container.

      this._currentDropContainer = target;
      if (this._currentDropContainer) this._dispatchEvent(target, 'dragover');
    }
  };

  /**
   * Callback for touchend event listener.
   * @param {TouchEvent} e
   */
  private _touchEnd(e) {
    this._touchEndCalled = true;
    this._canDrag = false;

    // console.log(1, e.target, this._currentDropContainer);

    // User seems to click
    // if (!this._dragRunning && this._handleClick) {
    //   this._dispatchEvent(e.target, 'click');
    //   e.preventDefault();
    //   return;
    // }
    if (this._currentDropContainer) {
      this._dispatchEvent(this._currentDropContainer, 'drop');
      this._dispatchEvent(this._dragSrc, 'dragend');
    } else {
      // fire dragEvent even if their is no droppable. And assign dropEffect none.
      // for our purpose, this will bring back the drag to its start position, seel drag-drop-interaction-mixin.ts
      if (this._dragRunning) {
        const event = new CustomEvent('dragend', { bubbles: true, cancelable: true });
        event['dataTransfer'] = { dropEffect: 'none' };
        this._dragSrc?.dispatchEvent(event);
      }
    }

    this._reset();
  }

  /**
   * Callback for touchcancel event listener, in case browser supports this.
   * @param {TouchEvent} e
   */
  private _touchCancel(e) {
    this._reset();
  }

  /**
   * Determines the next droppable element at current point.
   * @param {Object} pt
   */
  private _findDroppable(event) {
    const pointFromTouchEvent = this._getPoint(event);
    const visited = new Set<Element>();
    const element = this.getElementWithDropzone(document, pointFromTouchEvent.x, pointFromTouchEvent.y, visited);
    return element;
  }

  private getElementWithDropzone(
    root: DocumentOrShadowRoot,
    x: number,
    y: number,
    visited: Set<Element>
  ): Element | null {
    const el = root.elementFromPoint(x, y) as HTMLElement | null;
    if (el) {
      // Check if we've already visited this element
      if (visited.has(el)) {
        // Prevent infinite recursion by not revisiting the same element
        return null;
      }
      visited.add(el);

      if (el.hasAttribute('dropzone')) {
        // Found an element with 'dropzone'; return it immediately
        return el;
      }
      if (el.shadowRoot) {
        // Recursively search within the Shadow DOM
        const nestedEl = this.getElementWithDropzone(el.shadowRoot, x, y, visited);
        if (nestedEl) {
          // If a nested element with 'dropzone' is found, return it
          return nestedEl;
        }
      }
      // No 'dropzone' attribute found in deeper levels; return the current element
      return el;
    }
    // No element found at the given coordinates
    return null;
  }

  private _getPoint(event, page?) {
    if (event && event.touches) {
      event = event.touches[0];
    }
    return {
      x: page ? event.pageX : event.clientX,
      y: page ? event.pageY : event.clientY
    };
  }

  /**
   * Calculates the offset for displaying the drag copy to have a seamless dragging.
   * @param {Touch} touch The current touch.
   */
  private _calculateDragCopyPosition(touch) {
    const clientRect = this._dragSrc.getBoundingClientRect();
    this._copyOffset.x = touch.clientX - clientRect.left;
    this._copyOffset.y = touch.clientY - clientRect.top;
  }

  /**
   * Calculates the pixel delta between first touch and the current touch position.
   * @param {Object} touch
   */
  private _getDelta(touch) {
    const x = Math.abs(touch.clientX - this._touchDown.x);
    const y = Math.abs(touch.clientY - this._touchDown.y);

    return x + y;
  }

  /**
   *
   * @param {Element} e The event's target element.
   * @param {string} eventType The type of the event.
   * @param {bool} bubble Sets whether the event should bubble.
   */
  private _dispatchEvent(e, eventType, bubble = true) {
    if (!e) return false;

    const event = new CustomEvent(eventType, { bubbles: bubble, cancelable: true });
    event['dataTransfer'] = this._dataTransfer;
    e.dispatchEvent(event);
    return event.defaultPrevented;
  }

  /**
   * Resets all variables and prepares for new Drag and Drop.
   */
  private _reset() {
    if (this._dragRunning) {
      this._dragSrc.style.opacity = '1.0';
      this._dragCopy.parentElement.removeChild(this._dragCopy);
    }

    this._dragRunning = false;
    this._dragSrc = null;
    this._dragCopy = null;
    this._canDrag = false;

    this._touchBegin = 0;
    this._touchDown = null;
    this._lastClick = 0;
    this._touchEndCalled = false;
    this._dataTransfer = {
      data: {},
      setData: function (type, val) {
        this.data[type] = val;
      },
      getData: function (type) {
        return this.data[type];
      },
      effectAllowed: 'move'
    };
    this._copyOffset = { x: 0, y: 0 };

    this._lastTarget = null;
    this._currentDropContainer = null;
    this._handleClick = true;
  }

  // private _getPositionFromEvent(e: any): {
  //   x: number;
  //   y: number;
  // } {
  //   let _touchMove;
  //   if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
  //     const evt = typeof e.originalEvent === 'undefined' ? e : e.originalEvent;
  //     const touch = evt.touches[0] || evt.changedTouches[0];
  //     _touchMove = {
  //       x: touch.pageX,
  //       y: touch.pageY
  //     };
  //   } else if (
  //     e.type == 'mousedown' ||
  //     e.type == 'mouseup' ||
  //     e.type == 'mousemove' ||
  //     e.type == 'mouseover' ||
  //     e.type == 'mouseout' ||
  //     e.type == 'mouseenter' ||
  //     e.type == 'mouseleave'
  //   ) {
  //     _touchMove = {
  //       x: e.clientX,
  //       y: e.clientY
  //     };
  //   }
  //   return _touchMove;
  // }
}
