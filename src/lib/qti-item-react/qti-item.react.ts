import React, { ForwardRefExoticComponent, Ref } from 'react';
import { createComponent } from '@lit/react';

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
  onOutcomeChanged?: (e: CustomEvent<OutcomeChangedDetails>) => void;
  onInteractionChanged?: (e: CustomEvent<InteractionChangedDetails>) => void;
  onItemConnected?: (e: CustomEvent<QtiAssessmentItem>) => void;
}
export const QtiItem = createComponent({
  tagName: 'qti-item',
  react: React,
  elementClass: QtiItemWebComponent,
  events: {
    onOutcomeChanged: 'qti-outcome-changed', // as EventName<Event>
    onInteractionChanged: 'qti-interaction-changed',
    onItemConnected: 'qti-item-connected'
  }
}) as ForwardRefExoticComponent<QtiItemProps>;
