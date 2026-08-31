import { afterEach, describe, expect, it } from 'vitest';

import { measureFixedFrame, resolveDragCloneHost } from './drag-clone-host';

const cleanups: Array<() => void> = [];

const mount = <T extends HTMLElement>(element: T): T => {
  document.body.appendChild(element);
  cleanups.push(() => element.remove());
  return element;
};

/** `fullscreenElement` is read-only, so it is shadowed with an own property on the root. */
const fakeFullscreen = (root: Document | ShadowRoot, element: Element | null): void => {
  Object.defineProperty(root, 'fullscreenElement', { configurable: true, get: () => element });
  cleanups.push(() => {
    delete (root as unknown as Record<string, unknown>).fullscreenElement;
  });
};

afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
});

describe('resolveDragCloneHost', () => {
  it('hosts the clone in the body for an item rendered in a plain page', () => {
    const source = mount(document.createElement('div'));

    expect(resolveDragCloneHost(source)).toBe(document.body);
  });

  it("hosts the clone in the caller's preferred tree, the one the theme's rules can reach", () => {
    const host = mount(document.createElement('div'));
    const preferred = host.attachShadow({ mode: 'open' });

    expect(resolveDragCloneHost(mount(document.createElement('div')), preferred)).toBe(preferred);
  });

  it('keeps the preferred tree while the fullscreen element still paints it', () => {
    const fullscreenRoot = mount(document.createElement('div'));
    const host = fullscreenRoot.appendChild(document.createElement('div'));
    const preferred = host.attachShadow({ mode: 'open' });
    fakeFullscreen(document, fullscreenRoot);

    expect(resolveDragCloneHost(mount(document.createElement('div')), preferred)).toBe(preferred);
  });

  it('drops the preferred tree for the fullscreen element when the browser no longer paints it', () => {
    const fullscreenRoot = mount(document.createElement('div'));
    const host = mount(document.createElement('div'));
    const preferred = host.attachShadow({ mode: 'open' });
    fakeFullscreen(document, fullscreenRoot);

    expect(resolveDragCloneHost(mount(document.createElement('div')), preferred)).toBe(fullscreenRoot);
  });

  it('hosts the clone in the fullscreen element, which is the only subtree the browser paints', () => {
    const fullscreenRoot = mount(document.createElement('div'));
    const source = fullscreenRoot.appendChild(document.createElement('div'));
    fakeFullscreen(document, fullscreenRoot);

    expect(resolveDragCloneHost(source)).toBe(fullscreenRoot);
  });

  it('resolves the retargeted fullscreen element down through shadow trees', () => {
    const host = mount(document.createElement('div'));
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const realFullscreenElement = shadowRoot.appendChild(document.createElement('div'));
    // The document reports the host, not the element that actually went fullscreen.
    fakeFullscreen(document, host);
    fakeFullscreen(shadowRoot, realFullscreenElement);

    expect(resolveDragCloneHost(mount(document.createElement('div')))).toBe(realFullscreenElement);
  });

  it('hosts the clone in the shadow tree when the fullscreen element cannot slot it', () => {
    const fullscreenRoot = mount(document.createElement('div'));
    const shadowRoot = fullscreenRoot.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = '<slot name="drags"></slot>';
    fakeFullscreen(document, fullscreenRoot);

    expect(resolveDragCloneHost(mount(document.createElement('div')))).toBe(shadowRoot);
  });

  it('keeps the clone in the light DOM when the fullscreen element has a default slot', () => {
    const fullscreenRoot = mount(document.createElement('div'));
    const shadowRoot = fullscreenRoot.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = '<slot></slot>';
    fakeFullscreen(document, fullscreenRoot);

    expect(resolveDragCloneHost(mount(document.createElement('div')))).toBe(fullscreenRoot);
  });

  it('leaves a clone dragged from a shadow tree in the body, out of the tree the interaction owns', () => {
    const host = mount(document.createElement('div'));
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const source = shadowRoot.appendChild(document.createElement('div'));

    expect(resolveDragCloneHost(source)).toBe(document.body);
  });
});

describe('measureFixedFrame', () => {
  it('measures the viewport itself for a body-hosted clone', () => {
    const frame = measureFixedFrame(document.body);

    expect(frame.origin.x).toBeCloseTo(0, 0);
    expect(frame.origin.y).toBeCloseTo(0, 0);
    expect(frame.scale.x).toBeCloseTo(1, 2);
    expect(frame.scale.y).toBeCloseTo(1, 2);
  });

  it('measures the containing block a transformed host establishes for its fixed children', () => {
    const host = mount(document.createElement('div'));
    host.style.cssText = 'position:absolute;left:40px;top:25px;width:200px;height:200px;transform:translateZ(0);';

    const frame = measureFixedFrame(host);
    const hostRect = host.getBoundingClientRect();

    expect(frame.origin.x).toBeCloseTo(hostRect.left, 0);
    expect(frame.origin.y).toBeCloseTo(hostRect.top, 0);
    expect(frame.scale.x).toBeCloseTo(1, 2);
  });

  it('measures the scale a zoomed or scaled host applies, so clone coordinates can be corrected', () => {
    const host = mount(document.createElement('div'));
    host.style.cssText =
      'position:absolute;left:0;top:0;width:200px;height:200px;transform:scale(0.5);transform-origin:0 0;';

    const frame = measureFixedFrame(host);

    expect(frame.scale.x).toBeCloseTo(0.5, 2);
    expect(frame.scale.y).toBeCloseTo(0.5, 2);
  });

  it('leaves no probe behind', () => {
    const host = mount(document.createElement('div'));

    measureFixedFrame(host);

    expect(host.childElementCount).toBe(0);
  });
});
