import React, { ForwardRefExoticComponent, ReactNode, Ref } from 'react';
import { createComponent } from '@lit/react';
import {
  InteractionChangedDetails,
  OutcomeChangedDetails,
  QtiAssessmentItem
} from '@citolab/qti-components/qti-components';
import { TestContext, QtiAssessmentTest as WcQtiAssessmentTest } from '@citolab/qti-components/qti-test';

export interface OutcomeChangedDetailsExtended extends OutcomeChangedDetails {
  identifier: string;
}

interface QtiAssessmentTestProps {
  children?: any;
  className?: string;
  context?: TestContext;
  ref?: Ref<WcQtiAssessmentTest | undefined>;

  onOutcomeChanged?: (e: CustomEvent<OutcomeChangedDetails>) => void;
  onInteractionChanged?: (e: CustomEvent<InteractionChangedDetails>) => void;
  onTestRequestItem?: (e: CustomEvent<{ old: string; new: string }>) => void;
  onTestFirstUpdated?: (e: CustomEvent<WcQtiAssessmentTest>) => void;
  onItemFirstUpdated?: (e: CustomEvent<QtiAssessmentItem>) => void;
}

export const QtiAssessmentTest = createComponent({
  tagName: 'qti-assessment-test',
  react: React,
  elementClass: WcQtiAssessmentTest,
  events: {
    onOutcomeChanged: 'qti-outcome-changed', // as EventName<Event>
    onInteractionChanged: 'qti-interaction-changed',
    onItemFirstUpdated: 'qti-item-first-updated',
    onTestRequestItem: 'on-test-set-item',
    onTestFirstUpdated: 'qti-assessment-first-updated'
  }
}) as ForwardRefExoticComponent<QtiAssessmentTestProps>;
