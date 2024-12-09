import { qtiTransformItem, qtiTransformTest } from '@citolab/qti-components/qti-transformers';
import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';

// const setSessionData = <T>(key: string, value?: T): void => sessionStorage.setItem(key, JSON.stringify(value));
// const getSessionData = <T>(key: string): T | null => (sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null);

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestLoaderInterface {}
export const TestLoaderMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  abstract class TestLoaderClass extends superClass {
    @property({ type: String })
    testURL = '';

    constructor(...args: any[]) {
      super(...args);

      this.addEventListener('qti-load-test-request', (e: CustomEvent /* 1. Request the test */) => {
        if (!this.testURL) return;

        e.detail.promise = (async () => {
          e.preventDefault(); /* indicates that the event was catched and handled */
          const api = await qtiTransformTest().load(`${this.testURL}`); /* 6. load the item */
          return api.htmlDoc(); /* 3. Return html version of the assessment.xml */
        })();
      });

      this.addEventListener('qti-assessment-test-connected', () => {
        // this.context = getSessionData(`testcontext-${this.testURL}`); /* 4. Set the context */
      });

      this.addEventListener('qti-load-item-request' /* 5. Request the item */, ({ detail }: CustomEvent) => {
        if (!this.testURL) return;
        detail.promise = (async () => {
          const api = await qtiTransformItem().load(
            `${this.testURL.slice(0, this.testURL.lastIndexOf('/'))}/${detail.href}`,
            detail.cancelPreviousRequest
          ); /* 6. load the item */
          return api.htmlDoc(); /* 7. Return HTML version of the item.xml */
        })();
      });

      this.addEventListener('qti-interaction-changed', e => {
        /* 8. Interaction changed */
        // const scoreOutcomeIdentifier = qtiAssessmentItem.variables.find(v => v.identifier === 'SCORE') as OutcomeVariable;
        // if (scoreOutcomeIdentifier.externalScored === null && qtiAssessmentItem.adaptive === 'false') {
        //   qtiAssessmentItem.processResponse(); /* 9. Process the response */
        // }
        // setSessionData(`testcontext-${this.testURL}`, this.context); /* 10. Update the context */
      });

      this.addEventListener('qti-outcome-changed', () => {
        // setSessionData(`testcontext-${this.testURL}`, this.context); /* 10. Update the context */
      });
    }
  }

  return TestLoaderClass as Constructor<TestLoaderInterface> & T;
};
