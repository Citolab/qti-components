import type { QtiOutcomeProcessing } from '../../qti-outcome-processing/qti-outcome-processing';
import type { OutcomeVariable, VariableDeclaration } from '@qti-components/base';
import type { TestBase } from '../test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestProcessingInterface {
  updateOutcomeVariable(identifier: string, value: string | string[] | undefined): void;
  getOutcome(identifier: string): Readonly<OutcomeVariable>;
  getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>>;
  outcomeProcessing(): boolean;
}
export const TestProcessingMixin = <T extends Constructor<TestBase>>(superClass: T) => {
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
      const outcomeProcessor = this.querySelector('qti-outcome-processing') as unknown as QtiOutcomeProcessing;
      if (!outcomeProcessor) return false;
      outcomeProcessor?.process();
      return true;
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
