import { describe, expect, it } from 'vitest';

import { pluginElements } from './elements';

describe('plugins/elements', () => {
  it('lists every plugin element once', () => {
    const tags = pluginElements.map(({ tag }) => tag);
    expect(new Set(tags).size).toBe(tags.length);
    // 10 element tags in the component folders, plus text-to-speech's player and its seven controls.
    expect(tags).toHaveLength(18);
  });
});
