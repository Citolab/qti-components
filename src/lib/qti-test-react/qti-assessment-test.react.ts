import { DOMAttributes } from 'react';
import React, { ForwardRefExoticComponent, ReactNode, Ref } from 'react';

import { createComponent } from '@lit/react';
import {
  InteractionChangedDetails,
  OutcomeChangedDetails,
  QtiAssessmentItem
} from '@citolab/qti-components/qti-components';
import {
  QtiAssessmentItemRef,
  TestContext,
  TestNext,
  TestPrev,
  TestShowIndex,
  TestProgress,
  TestPagingButtons,
  TestPagingRadio,
  TestSlider,
  TestShowCorrect,
  TestPrintVariables,
  QtiAssessmentTest as WcQtiAssessmentTest
} from '@citolab/qti-components/qti-test';

export interface OutcomeChangedDetailsExtended extends OutcomeChangedDetails {
  identifier: string;
}

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['qti-test-part']: CustomElement<{ identifier: string }>;
      ['qti-assessment-section']: CustomElement<{
        identifier: string;
        title: string;
        visible: string;
        required: string;
      }>;

      ['qti-assessment-item-ref']: CustomElement<{
        identifier: string;
        href: string;
        key: string;
        'item-location': string;
        category?: string;
        ref: (el: any) => Map<string, QtiAssessmentItemRef>;
      }>;

      ['test-prev']: CustomElement<TestPrev>;
      ['test-next']: CustomElement<TestNext>;
      'test-show-index': CustomElement<TestShowIndex>;
      'test-progress': CustomElement<TestProgress>;
      'test-paging-buttons': CustomElement<TestPagingButtons>;
      'test-paging-radio': CustomElement<TestPagingRadio>;
      'test-slider': CustomElement<TestSlider>;
      'test-show-correct': CustomElement<TestShowCorrect>;
      'test-print-variables': CustomElement<TestPrintVariables>;
    }
  }
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
