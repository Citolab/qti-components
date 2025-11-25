// dragChain.ts
export function drag(element: Element) {
  const state = {
    x: 0,
    y: 0,
    pointerId: 1
  };

  const queue: Array<() => Promise<void>> = [];

  const emit = (target: Element | Document, type: string, coords: PointerEventInit = {}) => {
    target.dispatchEvent(
      new PointerEvent(type, {
        pointerId: state.pointerId,
        pointerType: 'mouse',
        bubbles: true,
        cancelable: true,
        isPrimary: true,
        width: 1,
        height: 1,
        // keep button/buttons simple; dndkit mostly cares about coords + type
        ...coords
      })
    );
  };

  const api = {
    fromCenter() {
      queue.push(async () => {
        const rect = element.getBoundingClientRect();
        state.x = rect.left + rect.width / 2;
        state.y = rect.top + rect.height / 2;
      });
      return api;
    },

    pointerDown() {
      queue.push(async () => {
        emit(element, 'pointerdown', {
          clientX: state.x,
          clientY: state.y
        });
      });
      return api;
    },

    moveBy(dx: number, dy: number) {
      queue.push(async () => {
        state.x += dx;
        state.y += dy;
        emit(element, 'pointermove', {
          clientX: state.x,
          clientY: state.y
        });
      });
      return api;
    },

    moveTo(x: number, y: number) {
      queue.push(async () => {
        state.x = x;
        state.y = y;
        emit(element, 'pointermove', {
          clientX: state.x,
          clientY: state.y
        });
      });
      return api;
    },

    moveToElementCenter(target: Element) {
      queue.push(async () => {
        const rect = target.getBoundingClientRect();
        state.x = rect.left + rect.width / 2;
        state.y = rect.top + rect.height / 2;
        emit(element, 'pointermove', {
          clientX: state.x,
          clientY: state.y
        });
      });
      return api;
    },

    // pointerup on *document* (important for dnd-kit)
    pointerUpDocument() {
      queue.push(async () => {
        emit(document, 'pointerup', {
          clientX: state.x,
          clientY: state.y
        });
      });
      return api;
    },

    wait(ms: number) {
      queue.push(async () => {
        await new Promise(res => setTimeout(res, ms));
      });
      return api;
    },

    async run() {
      for (const step of queue) {
        await step();
      }
      return element;
    }
  };

  return api;
}
// qti-order-interaction-in-place.styles.ts
