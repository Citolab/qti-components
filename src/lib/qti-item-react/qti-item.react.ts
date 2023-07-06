import React, { ForwardRefExoticComponent, Ref } from 'react';
import { createComponent } from '@lit-labs/react';

import { QtiItem as QtiItemComponent } from '../qti-item/qti-item';
import {
  OutcomeChangedDetails,
  ResponseInteraction,
  InteractionChangedDetails,
  QtiAssessmentItem
} from '../qti-components';

interface QtiItemProps {
  ref?: Ref<QtiItemComponent>;
  className?: string;
  xml: string;
  audienceContext?: {
    view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';
  };
  qtioutcomechanged?: (e: CustomEvent<OutcomeChangedDetails>) => void;
  qtiinteractionchanged?: (e: CustomEvent<InteractionChangedDetails>) => void;
  qtiitemconnected?: (e: CustomEvent<QtiAssessmentItem>) => void;
}
export const QtiItem = createComponent({
  tagName: 'qti-item',
  react: React,
  elementClass: QtiItemComponent,
  events: {
    qtioutcomechanged: 'qti-outcome-changed', // as EventName<Event>
    qtiinteractionchanged: 'qti-interaction-changed',
    qtiitemconnected: 'qti-item-connected'
  }
}) as ForwardRefExoticComponent<QtiItemProps>;
