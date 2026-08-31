import { afterEach, describe, expect, it } from 'vitest';

import '../../register';

import type { TestContainer } from './test-container';

class ScopedTestProbe extends HTMLElement {}

afterEach(() => {
  document.body.replaceChildren();
});

describe('TestContainer scoped registries', () => {
  it('uses a registry supplied as a property before connection', () => {
    const registry = new CustomElementRegistry();
    registry.define('scoped-test-probe', ScopedTestProbe);
    const container = document.createElement('test-container') as TestContainer;
    container.customElementRegistry = registry;

    document.body.append(container);
    container.shadowRoot!.innerHTML = '<scoped-test-probe></scoped-test-probe>';

    expect(container.shadowRoot!.firstElementChild).toBeInstanceOf(ScopedTestProbe);
  });
});
