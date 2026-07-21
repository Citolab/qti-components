import { afterEach, describe, expect, it } from 'vitest';

import '../../register';

import type { ItemContainer } from './item-container';

class ScopedItemProbe extends HTMLElement {}

afterEach(() => {
  document.body.replaceChildren();
});

const expectScopedUpgrade = (container: ItemContainer) => {
  container.shadowRoot!.innerHTML = '<scoped-item-probe></scoped-item-probe>';
  expect(container.shadowRoot!.firstElementChild).toBeInstanceOf(ScopedItemProbe);
};

describe('ItemContainer scoped registries', () => {
  it('uses a registry supplied as a property before connection', () => {
    const registry = new CustomElementRegistry();
    registry.define('scoped-item-probe', ScopedItemProbe);
    const container = document.createElement('item-container') as ItemContainer;
    container.customElementRegistry = registry;

    document.body.append(container);

    expectScopedUpgrade(container);
  });
});
