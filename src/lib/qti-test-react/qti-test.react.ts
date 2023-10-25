import React, { ForwardRefExoticComponent, Ref } from 'react';
import { createComponent } from '@lit/react';
import { InteractionChangedDetails, OutcomeChangedDetails } from '@citolab/qti-components/qti-components';
import { TestContext, QtiAssessmentTest, QtiTest as WcQtiTest } from '@citolab/qti-components/qti-test';

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
