import { elements as qtiAssociableHotspotElements } from './elements/qti-associable-hotspot/elements';
import { elements as qtiGapElements } from './elements/qti-gap/elements';
import { elements as qtiGapImgElements } from './elements/qti-gap-img/elements';
import { elements as qtiGapTextElements } from './elements/qti-gap-text/elements';
import { elements as qtiHotspotChoiceElements } from './elements/qti-hotspot-choice/elements';
import { elements as qtiHottextElements } from './elements/qti-hottext/elements';
import { elements as qtiInlineChoiceElements } from './elements/qti-inline-choice/elements';
import { elements as qtiPromptElements } from './elements/qti-prompt/elements';
import { elements as qtiSimpleAssociableChoiceElements } from './elements/qti-simple-associable-choice/elements';
import { elements as qtiSimpleChoiceElements } from './elements/qti-simple-choice/elements';

export const qtiInteractionCoreElements = [
  ...qtiAssociableHotspotElements,
  ...qtiGapElements,
  ...qtiGapImgElements,
  ...qtiGapTextElements,
  ...qtiHotspotChoiceElements,
  ...qtiHottextElements,
  ...qtiInlineChoiceElements,
  ...qtiPromptElements,
  ...qtiSimpleAssociableChoiceElements,
  ...qtiSimpleChoiceElements
] as const;
