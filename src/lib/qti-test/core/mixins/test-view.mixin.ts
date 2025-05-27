import type { QtiAssessmentItemRef } from '../qti-assessment-test';
import type { QtiAssessmentItem } from '../../../qti-components';
import type { TestBase } from '../test-base';

export type View = 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor' | '';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

declare class TestViewInterface {}

export const TestViewMixin = <T extends Constructor<TestBase>>(superClass: T) => {
  abstract class TestViewClass extends superClass implements TestViewInterface {
    constructor(...args: any[]) {
      super(...args);
      this.sessionContext = { ...this.sessionContext, view: 'candidate' };

      this.addEventListener('on-test-switch-view', (e: CustomEvent<View>) => {
        this.sessionContext = { ...this.sessionContext, view: e.detail };
        this._updateElementView();
      });
      this.addEventListener('qti-assessment-test-connected', () => {
        this._updateElementView();
      });
      this.addEventListener('qti-assessment-item-connected', (e: CustomEvent) => {
        this._updateElementView();
        this._setCorrectResponseVisibility(e.detail);
      });
    }

    willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
      super.willUpdate(changedProperties);
      if (changedProperties.has('sessionContext')) {
        this._updateElementView();
      }
    }

    // Method to handle view updates for elements based on the current context view
    private _updateElementView() {
      if (this._testElement) {
        const viewElements = Array.from(this._testElement.querySelectorAll('[view]'));

        viewElements.forEach((element: HTMLElement) => {
          element.classList.toggle('show', element.getAttribute('view') === this.sessionContext.view);
        });

        const assessmentItemRef = this._testElement.querySelector<QtiAssessmentItemRef>(
          `qti-assessment-item-ref[identifier="${this.sessionContext.navItemRefId}"]`
        );
        const assessmentItem = assessmentItemRef?.assessmentItem;

        if (assessmentItem) {
          assessmentItem.showCorrectResponse(this.sessionContext.view === 'scorer');
        }
      }
    }

    // Event handler for connected QTI assessment items
    private _setCorrectResponseVisibility(assessmentItem: QtiAssessmentItem): void {
      assessmentItem.showCorrectResponse(this.sessionContext.view === 'scorer');
    }
  }

  return TestViewClass as Constructor<TestViewInterface> & T;
};
