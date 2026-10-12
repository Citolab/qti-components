import { describe, expect, it } from 'vitest';

import { pluginElements } from './elements';
import { printElements } from '../print/elements';
import { scoringElements } from '../scoring/elements';
import { stampElements } from '../stamp/elements';
import { ttsElements } from '../tts/elements';
import { viewElements } from '../view/elements';

describe('plugins/elements', () => {
  it('lists every plugin element once', () => {
    const tags = pluginElements.map(({ tag }) => tag);
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags.length).toBe(
      [printElements, scoringElements, stampElements, ttsElements, viewElements].reduce((n, list) => n + list.length, 0)
    );
  });
});
