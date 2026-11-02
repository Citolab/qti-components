import { describe, expect, it } from 'vitest';

import { pluginElements } from './elements';

describe('plugins/elements', () => {
  it('lists every plugin element once', () => {
    const tags = pluginElements.map(({ tag }) => tag);
    expect(new Set(tags).size).toBe(tags.length);
  });
});
