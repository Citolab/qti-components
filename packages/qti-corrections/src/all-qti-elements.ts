import { qtiBaseElements } from '@qti-components/base/elements';
import { qtiContentElements } from '@qti-components/elements/elements';
import { qtiInteractionElements } from '@qti-components/interactions/elements';
import { qtiItemElements } from '@qti-components/item/elements';
import { qtiProcessingElements } from '@qti-components/processing/elements';
import { qtiTestElements } from '@qti-components/test/elements';

/** Complete normal-element manifest used as the base of correction registries. */
export const allQtiElements = [
  ...qtiBaseElements,
  ...qtiProcessingElements,
  ...qtiContentElements,
  ...qtiItemElements,
  ...qtiTestElements,
  ...qtiInteractionElements
] as const;
