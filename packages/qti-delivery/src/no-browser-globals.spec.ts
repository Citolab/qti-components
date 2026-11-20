import { describe, expect, it } from 'vitest';

import * as delivery from './index';

/*
 * Runs in the `node` vitest project, where no browser exists: if any module of the package reached
 * for a browser global while loading, the import above would already have thrown. The checks below
 * make sure this file really ran outside a browser, so a passing run proves something.
 */
describe('@qti-components/delivery under Node', () => {
  it('runs where there is no browser', () => {
    for (const name of ['window', 'document', 'customElements', 'HTMLElement', 'DOMParser']) {
      expect(name in globalThis, name).toBe(false);
    }
  });

  it('loads and works without one', () => {
    const state = delivery.createDeliveryState({ clock: delivery.fixedClock(0), seed: 'x' });
    expect(state.startedAt).toBe(0);
    expect(delivery.createSeededRandom('x').random()).toBeTypeOf('number');
  });
});
