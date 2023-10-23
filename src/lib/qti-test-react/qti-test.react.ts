import React, { ForwardRefExoticComponent, Ref } from 'react';
import { createComponent } from '@lit/react';
import { InteractionChangedDetails, OutcomeChangedDetails } from '../qti-components/qti-utilities/EventTypes';
import { TestContext } from '../qti-test/qti-assessment-test.context';
import { QtiTest as WcQtiTest } from './../qti-test';
import { QtiAssessmentItem } from '../qti-components';

interface QtiTestProps {
  className?: string;
  context?: TestContext;
  ref?: Ref<WcQtiTest | undefined>;
  onOutcomeChanged?: (e: CustomEvent<OutcomeChangedDetails>) => void;
  onInteractionChanged?: (e: CustomEvent<InteractionChangedDetails>) => void;
  onRegisterItem?: (
    e: CustomEvent<{
      href: string;
      identifier: string;
    }>
  ) => void;
  onTestRequestItem?: (e: CustomEvent<number>) => void;
  onItemConnected?: (e: CustomEvent<QtiAssessmentItem>) => void;
}

export const QtiTest = createComponent({
  tagName: 'qti-test',
  react: React,
  elementClass: WcQtiTest,
  events: {
    onOutcomeChanged: 'qti-outcome-changed', // as EventName<Event>
    onInteractionChanged: 'qti-interaction-changed',
    onItemConnected: 'qti-item-first-updated',
    onRegisterItem: 'register-item-ref',
    onTestRequestItem: 'on-test-request-item'
  }
}) as ForwardRefExoticComponent<QtiTestProps>;
