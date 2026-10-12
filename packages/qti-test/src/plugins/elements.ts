import { printElements } from '../print/elements';
import { scoringElements } from '../scoring/elements';
import { stampElements } from '../stamp/elements';
import { ttsElements } from '../tts/elements';
import { viewElements } from '../view/elements';

/** Every test plugin's elements in one list, for a scoped registry. Defines nothing. */
export const pluginElements = [
  ...printElements,
  ...scoringElements,
  ...stampElements,
  ...ttsElements,
  ...viewElements
] as const;
