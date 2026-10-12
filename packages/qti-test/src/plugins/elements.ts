import { printElements } from '../print/elements';
import { scoringElements } from '../scoring/elements';
import { stampElements } from '../stamp/elements';
import { ttsElements } from '../tts/elements';
import { viewElements } from '../view/elements';

export * from '../print/elements';
export * from '../scoring/elements';
export * from '../stamp/elements';
export * from '../tts/elements';
export * from '../view/elements';

/**
 * Every test plugin's elements in one list. `qti-test` registers them with the rest of its
 * elements, and a scoped registry can use the list directly. Defines nothing.
 */
export const pluginElements = [
  ...printElements,
  ...scoringElements,
  ...stampElements,
  ...ttsElements,
  ...viewElements
] as const;
