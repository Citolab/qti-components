import React, { ForwardRefExoticComponent, Ref } from 'react';
import { createComponent } from '@lit-labs/react';

import { QtiItem as QtiItemWebComponent } from '../qti-item/qti-item';
import { OutcomeChangedDetails, InteractionChangedDetails, QtiAssessmentItem } from '../qti-components';

interface QtiItemProps {
  ref?: Ref<QtiItemWebComponent>;
  className?: string;
  xml: string;
  audienceContext?: {
    view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';
  };
  'item-location'?: string;
  'qti-outcome-changed'?: (e: CustomEvent<OutcomeChangedDetails>) => void;
  'qti-interaction-changed'?: (e: CustomEvent<InteractionChangedDetails>) => void;
  'qti-item-connected'?: (e: CustomEvent<QtiAssessmentItem>) => void;
}
export const QtiItem = createComponent({
  tagName: 'qti-item',
  react: React,
  elementClass: QtiItemWebComponent,
  events: {
    'qti-outcome-changed': 'qti-outcome-changed', // as EventName<Event>
    'qti-interaction-changed': 'qti-interaction-changed',
    'qti-item-connected': 'qti-item-connected'
  }
}) as ForwardRefExoticComponent<QtiItemProps>;
