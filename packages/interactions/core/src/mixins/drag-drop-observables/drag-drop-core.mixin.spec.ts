import { describe, expect, it, vi } from 'vitest';

import { DragDropCoreMixin } from './drag-drop-core.mixin';

class TestBase {
  disabled = false;
  readonly = false;
  updateComplete = Promise.resolve();
  ownerDocument: Document = document;
  shadowRoot: ShadowRoot | null = null;
  _internals = {
    states: {
      add: vi.fn(),
      delete: vi.fn()
    }
  };

  connectedCallback(): void {}
  disconnectedCallback(): void {}
}

const Core = DragDropCoreMixin(TestBase as any, '[qti-draggable="true"]', '[qti-droppable="true"]');

class TestCoreElement extends Core {
  dropCalls: Array<{ draggable: HTMLElement; droppable: HTMLElement }> = [];
  invalidCalls: Array<HTMLElement | null> = [];
  saveCalls = 0;

  cacheInteractiveElements(): void {}
  setupDragObservables(): void {}
  saveResponse(): void {
    this.saveCalls += 1;
  }
  handleDrop(draggable: HTMLElement, droppable: HTMLElement): void {
    this.dropCalls.push({ draggable, droppable });
  }
  handleInvalidDrop(dragSource: HTMLElement | null): void {
    this.invalidCalls.push(dragSource);
  }
}

describe('DragDropCoreMixin - slotted press/release behavior', () => {
  it('re-drops into source droppable when drag started from slot and no drop target is detected', () => {
    const element = new TestCoreElement() as any;
    const dragSource = document.createElement('div');
    const sourceDroppable = document.createElement('div');
    const dragClone = document.createElement('div');
    const sourceRect = { left: 10, top: 10, width: 40, height: 40 };
    sourceDroppable.getBoundingClientRect = () =>
      ({
        ...sourceRect,
        x: sourceRect.left,
        y: sourceRect.top,
        right: sourceRect.left + sourceRect.width,
        bottom: sourceRect.top + sourceRect.height,
        toJSON: () => ({})
      }) as DOMRect;
    dragClone.getBoundingClientRect = () =>
      ({
        ...sourceRect,
        x: sourceRect.left,
        y: sourceRect.top,
        right: sourceRect.left + sourceRect.width,
        bottom: sourceRect.top + sourceRect.height,
        toJSON: () => ({})
      }) as DOMRect;
    element.allDropzones = [sourceDroppable];
    element.trackedDroppables = [sourceDroppable];
    element.trackedDragContainers = [];

    element.dragState = {
      dragging: true,
      dragSource,
      dragClone,
      startOffset: { x: 0, y: 0 },
      currentTarget: null,
      sourceDroppable,
      inputType: 'mouse',
      pointerId: undefined,
      startedFromTrustedEvent: true,
      initialCoordinates: { x: 20, y: 20 }
    };

    element.handleDragEnd();

    expect(element.dropCalls).toHaveLength(1);
    expect(element.dropCalls[0]).toEqual({ draggable: dragSource, droppable: sourceDroppable });
    expect(element.invalidCalls).toHaveLength(0);
  });
});
