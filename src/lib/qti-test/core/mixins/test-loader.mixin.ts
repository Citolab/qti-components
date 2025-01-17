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

    /** TestContext will be stored in sessionStorage with given attribute value if provided */
    @property({ type: String, attribute: 'auto-store-restore' }) autoStoreRestoreContext: string | null = null;

    @property({ type: String, attribute: 'nav-item-id' }) navItemId: string | null = null;

    constructor(...args: any[]) {
      super(...args);

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
          }
        }
      });
    }

    async connectedCallback(): Promise<void> {
      super.connectedCallback();
      if (this.navItemId) {
        this._testContext = { ...this._testContext, navItemId: this.navItemId };
      }
      if (this.autoStoreRestoreContext) {
        this.context = getSessionData(this.autoStoreRestoreContext); /* 4. Set the context */
      }
    }

    updated(changedProperties: Map<string | number | symbol, unknown>) {
      if (changedProperties.has('_testContext')) {
        if (this.autoStoreRestoreContext) {
          setSessionData(this.autoStoreRestoreContext, this.context);
        }
      }
    }
  }

  return TestLoaderClass as Constructor<TestLoaderInterface> & T;
};
