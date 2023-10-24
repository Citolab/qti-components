import React, { ForwardRefExoticComponent, ReactNode, Ref } from 'react';
import { createComponent } from '@lit/react';
import { InteractionChangedDetails, OutcomeChangedDetails } from '../qti-components/qti-utilities/EventTypes';
import { TestContext } from '../qti-test/qti-assessment-test.context';
import { QtiAssessmentTest as WcQtiAssessmentTest } from './../qti-test';
import { QtiAssessmentItem } from '../qti-components';

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
  onRegisterItem?: (
    e: CustomEvent<{
      href: string;
      identifier: string;
    }>
  ) => void;
  onTestRequestItem?: (e: CustomEvent<{ old: string; new: string }>) => void;
  onTestFirstUpdated?: (e: CustomEvent<WcQtiAssessmentTest>) => void;
  onItemConnected?: (e: CustomEvent<QtiAssessmentItem>) => void;
}

export const QtiAssessmentTest = createComponent({
  tagName: 'qti-assessment-test',
  react: React,
  elementClass: WcQtiAssessmentTest,
  events: {
    onOutcomeChanged: 'qti-outcome-changed', // as EventName<Event>
    onInteractionChanged: 'qti-interaction-changed',
    onItemConnected: 'qti-item-connected',
    onRegisterItem: 'register-item-ref',
    onTestRequestItem: 'on-test-set-item',
    onTestFirstUpdated: 'qti-assessment-first-updated'
  }
}) as ForwardRefExoticComponent<QtiAssessmentTestProps>;
