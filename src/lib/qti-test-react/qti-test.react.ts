import React, { ForwardRefExoticComponent, Ref } from 'react';
import { createComponent } from '@lit/react';
import { InteractionChangedDetails, OutcomeChangedDetails } from '../qti-components/qti-utilities/EventTypes';
import { TestContext } from '../qti-test/qti-assessment-test.context';
import { QtiAssessmentTest, QtiTest as WcQtiTest } from './../qti-test';
import { QtiAssessmentItem } from '../qti-components';

interface QtiTestProps {
  children?: any;
  className?: string;
  context?: TestContext;
  ref?: Ref<WcQtiTest | undefined>;
  onOutcomeChanged?: (e: CustomEvent<OutcomeChangedDetails>) => void;
  onInteractionChanged?: (e: CustomEvent<InteractionChangedDetails>) => void;
  onTestFirstUpdated?: (e: CustomEvent<QtiAssessmentTest>) => void;
}

export const QtiTest = createComponent({
  tagName: 'qti-test',
  react: React,
  elementClass: WcQtiTest,
  events: {
    onOutcomeChanged: 'qti-outcome-changed', // as EventName<Event>
    onInteractionChanged: 'qti-interaction-changed',
    onTestFirstUpdated: 'qti-assessment-first-updated'
  }
}) as ForwardRefExoticComponent<QtiTestProps>;
