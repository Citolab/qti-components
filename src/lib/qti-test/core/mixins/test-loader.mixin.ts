import { qtiTransformItem } from '../../../qti-transformers';
import { property } from 'lit/decorators.js';
import type { TestBase } from '../test-base';
import type { OutcomeVariable } from '../../../exports/variables';
import type { QtiAssessmentItemRef } from '../qti-assessment-test';

const setSessionData = <T>(key: string, value?: T): void => sessionStorage.setItem(key, JSON.stringify(value));
const getSessionData = <T>(key: string): T | null =>
  sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null;

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestLoaderInterface {}
export const TestLoaderMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestLoaderClass extends superClass {
    /** Items will be scored on everyinteraction when `qti-assessment-item` is not set to adaptive, and the `SCORE` outcome identifier is not set to be "human" | "externalMachine" */
    @property({ type: Boolean, attribute: 'auto-score-items' }) autoScoreItems = false;
    @property({ type: Boolean, attribute: 'auto-store-restore' }) autoStoreRestoreContext = false;

    constructor(...args: any[]) {
      super(...args);

      // this.addEventListener('qti-load-test-request', (e: CustomEvent /* 1. Request the test */) => {
      //   const { testURL } = e.detail;
      //   if (!testURL) {
      //     console.warn(
      //       'No test found, there should be an attribute test-url with the path to the test on the test-container'
      //     );
      //   } else {
      //     this.testURL = testURL;
      //   }

      //   e.detail.promise = (async () => {
      //     e.preventDefault(); /* indicates that the event was catched and handled */
      //     const api = await qtiTransformTest().load(`${this.testURL}`); /* 6. load the item */
      //     return api.htmlDoc(); /* 3. Return html version of the assessment.xml */
      //   })();
      // });

      this.addEventListener('qti-test-connected', () => {
        if (this.autoStoreRestoreContext) {
          this.context = getSessionData(`testcontext`); /* 4. Set the context */
        }
      });

      this.addEventListener('qti-load-item-request' /* 5. Request the item */, ({ detail }: CustomEvent) => {
        detail.promise = (async () => {
          const api = await qtiTransformItem().load(`${detail.href}`, detail.cancelPreviousRequest);
          return api.htmlDoc();
        })();
      });

      this.addEventListener('qti-interaction-changed', (e: CustomEvent<any>) => {
        if (this.autoScoreItems) {
          const qtiItemEl = this.testElement.querySelector<QtiAssessmentItemRef>(
            `qti-assessment-item-ref[identifier="${this.context.navItemId}"]`
          );
          const qtiAssessmentItem = qtiItemEl.assessmentItem;
          const scoreOutcomeIdentifier = qtiAssessmentItem.variables.find(
            v => v.identifier === 'SCORE'
          ) as OutcomeVariable;
          if (scoreOutcomeIdentifier.externalScored === null && qtiAssessmentItem.adaptive === 'false') {
            qtiAssessmentItem.processResponse();
            if (this.autoStoreRestoreContext) {
              setSessionData(`testcontext`, this.context);
            }
          }
        } else {
          if (this.autoStoreRestoreContext) {
            setSessionData(`testcontext`, this.context);
          }
        }
      });
    }
  }

  return TestLoaderClass as Constructor<TestLoaderInterface> & T;
};
