import { qtiInteractionCoreElements } from '@qti-components/interactions-core/elements';
import { elements as associateInteractionElements } from '@qti-components/associate-interaction/elements';
import { elements as choiceInteractionElements } from '@qti-components/choice-interaction/elements';
import { elements as customInteractionElements } from '@qti-components/custom-interaction/elements';
import { elements as endAttemptInteractionElements } from '@qti-components/end-attempt-interaction/elements';
import { elements as extendedTextInteractionElements } from '@qti-components/extended-text-interaction/elements';
import { elements as gapMatchInteractionElements } from '@qti-components/gap-match-interaction/elements';
import { elements as graphicAssociateInteractionElements } from '@qti-components/graphic-associate-interaction/elements';
import { elements as graphicGapMatchInteractionElements } from '@qti-components/graphic-gap-match-interaction/elements';
import { elements as graphicOrderInteractionElements } from '@qti-components/graphic-order-interaction/elements';
import { elements as hotspotInteractionElements } from '@qti-components/hotspot-interaction/elements';
import { elements as hottextInteractionElements } from '@qti-components/hottext-interaction/elements';
import { elements as inlineChoiceInteractionElements } from '@qti-components/inline-choice-interaction/elements';
import { elements as matchInteractionElements } from '@qti-components/match-interaction/elements';
import { elements as mediaInteractionElements } from '@qti-components/media-interaction/elements';
import { elements as orderInteractionElements } from '@qti-components/order-interaction/elements';
import { elements as portableCustomInteractionElements } from '@qti-components/portable-custom-interaction/elements';
import { elements as positionObjectInteractionElements } from '@qti-components/position-object-interaction/elements';
import { elements as selectPointInteractionElements } from '@qti-components/select-point-interaction/elements';
import { elements as sliderInteractionElements } from '@qti-components/slider-interaction/elements';
import { elements as textEntryInteractionElements } from '@qti-components/text-entry-interaction/elements';
import { elements as uploadInteractionElements } from '@qti-components/upload-interaction/elements';

export const qtiInteractionElements = [
  ...qtiInteractionCoreElements,
  ...associateInteractionElements,
  ...choiceInteractionElements,
  ...customInteractionElements,
  ...endAttemptInteractionElements,
  ...extendedTextInteractionElements,
  ...gapMatchInteractionElements,
  ...graphicAssociateInteractionElements,
  ...graphicGapMatchInteractionElements,
  ...graphicOrderInteractionElements,
  ...hotspotInteractionElements,
  ...hottextInteractionElements,
  ...inlineChoiceInteractionElements,
  ...matchInteractionElements,
  ...mediaInteractionElements,
  ...orderInteractionElements,
  ...portableCustomInteractionElements,
  ...positionObjectInteractionElements,
  ...selectPointInteractionElements,
  ...sliderInteractionElements,
  ...textEntryInteractionElements,
  ...uploadInteractionElements
] as const;
