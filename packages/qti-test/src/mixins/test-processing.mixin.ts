import { dispatchPublic, listenPublic } from '../public-events';

import type { QtiOutcomeProcessing } from '../components/qti-outcome-processing/qti-outcome-processing';
import type { QtiTestFeedback } from '../components/qti-test-feedback/qti-test-feedback';
import type { OutcomeVariable, VariableDeclaration } from '@qti-components/base';
import type { TestBaseInterface } from './test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestProcessingInterface {
  updateOutcomeVariable(identifier: string, value: string | string[] | undefined): void;
  getOutcome(identifier: string): Readonly<OutcomeVariable>;
  getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>>;
  outcomeProcessing(): boolean;
  submit(): boolean;
  getTestFeedback(access?: 'atEnd' | 'during'): QtiTestFeedback[];
}
export const TestProcessingMixin = <T extends Constructor<TestBaseInterface>>(superClass: T) => {
  abstract class TestProcessingElement extends superClass implements TestProcessingInterface {
    constructor(...args: any[]) {
      super(...args);
      this.addEventListener('qti-register-variable', (e: CustomEvent<{ variable: any }>) => {
        this.testContext = {
          ...this.testContext,
          testOutcomeVariables: [...(this.testContext.testOutcomeVariables || []), e.detail.variable]
        };
        e.stopPropagation();
      });
      listenPublic(this, 'cito-test-submit', () => this.submit());
      // wordt aangeroepen vanuit de processingtemplate
      this.addEventListener(
        'qti-set-outcome-value',
        (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
          const { outcomeIdentifier, value } = e.detail;
          this.updateOutcomeVariable(outcomeIdentifier, value);
          e.stopPropagation();
        }
      );
    }

    outcomeProcessing(): boolean {
      // Inside the loaded test: `test-container` renders it into its own shadow root, which a
      // `querySelector` on this element does not reach. Without a loaded test, look in the light DOM.
      const outcomeProcessor = (this._testElement ?? this).querySelector(
        'qti-outcome-processing'
      ) as unknown as QtiOutcomeProcessing;
      if (!outcomeProcessor) return false;
      // QTI starts every run of the test's outcome processing from the declared defaults, so an
      // accumulating rule (`SCORE_TOTAL = sum + SCORE_TOTAL`) gives the same total on every run.
      this.testContext = {
        ...this.testContext,
        testOutcomeVariables: this.testContext.testOutcomeVariables?.map(v => ({
          ...v,
          value: v.defaultValue ?? null
        }))
      };
      outcomeProcessor.process();
      return true;
    }

    /**
     * Ends the test for scoring: runs `outcomeProcessing()`, then tells the host with
     * `cito-test-submitted`. Returns false, and sends nothing, when the test has no outcome processing.
     */
    submit(): boolean {
      if (!this.outcomeProcessing()) return false;
      dispatchPublic(this, 'cito-test-submitted', {});
      return true;
    }

    /**
     * The `qti-test-feedback` elements that apply now, read from the test outcomes: run
     * `outcomeProcessing()` first. `access` narrows them to the end of the test (`atEnd`) or to
     * while it runs (`during`); without it, both.
     */
    getTestFeedback(access?: 'atEnd' | 'during'): QtiTestFeedback[] {
      const feedback = Array.from(
        (this._testElement ?? this).querySelectorAll<QtiTestFeedback>('qti-test-feedback') ?? []
      );
      return feedback.filter(
        fb => (!access || fb.access === access) && fb.matches(this.getOutcome(fb.outcomeIdentifier)?.value)
      );
    }

    /* --------------------------- ENABLED WHEN UNIT TESTING OUTCOME PROCESSING ------------------------------------ */

    public updateOutcomeVariable(identifier: string, value: string | string[] | undefined) {
      const outcomeVariable = this.getOutcome(identifier);
      if (!outcomeVariable) {
        console.warn(`Can not set qti-outcome-identifier: ${identifier}, it is not available`);
        return;
      }
      this.testContext = {
        ...this.testContext,
        testOutcomeVariables: this.testContext.testOutcomeVariables?.map(v => {
          if (v.identifier !== identifier) {
            return v;
          }
          return {
            ...v,
            value: outcomeVariable.cardinality === 'single' ? value : [...v.value, value as string]
          };
        })
      };
    }

    public getOutcome(identifier: string): Readonly<OutcomeVariable> {
      return this.getVariable(identifier) as OutcomeVariable;
    }
    public getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>> {
      return this.testContext.testOutcomeVariables?.find(v => v.identifier === identifier) || null;
    }
    /* --------------------------- ENABLED WHEN UNIT TESTING OUTCOME PROCESSING ------------------------------------ */
  }

  return TestProcessingElement as Constructor<TestProcessingInterface> & T;
};
