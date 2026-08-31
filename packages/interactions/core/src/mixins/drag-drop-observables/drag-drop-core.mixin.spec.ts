import { afterEach, describe, expect, it, vi } from 'vitest';

import { DragDropCoreMixin } from './drag-drop-core.mixin';

class TestBase {
  disabled = false;
  readonly = false;
  updateComplete = Promise.resolve();
  ownerDocument: Document = document;
  shadowRoot: ShadowRoot | null = null;
  tagName = 'QTI-TEST-INTERACTION';
  /** Stands in for the interaction's tree; tests that care about clone hosting override it. */
  getRootNode(): Node {
    return document;
  }
  _internals = {
    states: {
      add: vi.fn(),
      delete: vi.fn()
    }
  };

  connectedCallback(): void {}
  disconnectedCallback(): void {}
}

const Core = DragDropCoreMixin(TestBase as any, '[qti-draggable="true"]', `[part~='drop']`);

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

describe('DragDropCoreMixin - drag clone hosting', () => {
  const cleanups: Array<() => void> = [];

  const mount = <T extends HTMLElement>(element: T): T => {
    document.body.appendChild(element);
    cleanups.push(() => element.remove());
    return element;
  };

  const fakeFullscreen = (element: Element | null): void => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => element });
    cleanups.push(() => {
      delete (document as unknown as Record<string, unknown>).fullscreenElement;
    });
  };

  const dragSourceIn = (parent: HTMLElement | ShadowRoot): HTMLElement => {
    const source = parent.appendChild(document.createElement('div'));
    source.style.cssText = 'position:absolute;left:0;top:0;width:60px;height:20px;margin:0;';
    return source;
  };

  afterEach(() => {
    while (cleanups.length) cleanups.pop()!();
  });

  it('appends the clone to the body when the page is not in fullscreen', () => {
    const element = new TestCoreElement() as any;
    const source = dragSourceIn(mount(document.createElement('div')));

    const clone = element.createDragClone(source, source.getBoundingClientRect());
    cleanups.push(() => clone.remove());

    expect(clone.parentNode).toBe(document.body);
  });

  it("appends the clone to the interaction's root, the only tree the theme's rules can reach", () => {
    const element = new TestCoreElement() as any;
    const shadowHost = mount(document.createElement('div'));
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    element.getRootNode = () => shadowRoot;
    const source = dragSourceIn(shadowRoot);

    const clone = element.createDragClone(source, source.getBoundingClientRect());

    expect(clone.parentNode).toBe(shadowRoot);
  });

  it("keeps the interaction's root as host while the fullscreen element still paints it", () => {
    const element = new TestCoreElement() as any;
    const fullscreenRoot = mount(document.createElement('div'));
    const shadowHost = fullscreenRoot.appendChild(document.createElement('div'));
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    element.getRootNode = () => shadowRoot;
    const source = dragSourceIn(shadowRoot);
    fakeFullscreen(fullscreenRoot);

    const clone = element.createDragClone(source, source.getBoundingClientRect());

    expect(clone.parentNode).toBe(shadowRoot);
  });

  it('appends the clone to the fullscreen element when that is the only subtree the browser paints', () => {
    const element = new TestCoreElement() as any;
    const fullscreenRoot = mount(document.createElement('div'));
    const source = dragSourceIn(fullscreenRoot);
    fakeFullscreen(fullscreenRoot);

    const clone = element.createDragClone(source, source.getBoundingClientRect());

    expect(clone.parentNode).toBe(fullscreenRoot);
  });

  it('positions the clone under the pointer even when its host offsets and scales fixed children', () => {
    const element = new TestCoreElement() as any;
    const fullscreenRoot = mount(document.createElement('div'));
    fullscreenRoot.style.cssText =
      'position:absolute;left:30px;top:20px;width:400px;height:300px;transform:scale(0.5);transform-origin:0 0;';
    const source = dragSourceIn(fullscreenRoot);
    fakeFullscreen(fullscreenRoot);

    const sourceRect = source.getBoundingClientRect();
    const clone = element.createDragClone(source, sourceRect);
    element.dragState = {
      dragging: true,
      dragSource: source,
      dragClone: clone,
      startOffset: { x: 5, y: 5 },
      currentTarget: null,
      sourceDroppable: null,
      inputType: 'mouse'
    };

    element.updateClonePosition(200, 150);
    const cloneRect = clone.getBoundingClientRect();

    // The clone's top-left must land at the pointer minus the grab offset, in viewport pixels...
    expect(cloneRect.left).toBeCloseTo(195, 0);
    expect(cloneRect.top).toBeCloseTo(145, 0);
    // ...and it must stay the same size as the element it was cloned from.
    expect(cloneRect.width).toBeCloseTo(sourceRect.width, 0);
    expect(cloneRect.height).toBeCloseTo(sourceRect.height, 0);
  });
});
