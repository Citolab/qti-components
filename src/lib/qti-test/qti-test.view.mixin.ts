import { consume } from '@lit/context';
import { LitElement, PropertyValues } from 'lit';
import { QtiAssessmentItem } from '../qti-components';
import { sessionContext, SessionContext } from './context/session.context';

type Constructor<T = {}> = new (...args: any[]) => T;

declare class ChangeViewInterface {}
export const ChangeViewMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class ChangeViewElement extends superClass {
    @consume({ context: sessionContext, subscribe: true })
    protected _sessionContext?: SessionContext;

    updated(changedProperties: PropertyValues<any>) {
      if (
        changedProperties.has('_sessionContext') &&
        changedProperties.get('_sessionContext') &&
        changedProperties.get('_sessionContext')?.view !== this._sessionContext.view
      ) {
        switch (changedProperties.get('_sessionContext').view) {
          case 'candidate':
            break;
          case 'scorer':
            break;
          default:
            break;
        }
        // if (this._sessionContext.identifier === null) return;
        this._viewChangedHandler();
      }
    }

    private _viewChangedHandler() {
      this.querySelectorAll('[view]')?.forEach((element: HTMLElement) => {
        element.getAttribute('view') === this._sessionContext.view
          ? element.classList.add('show')
          : element.classList.remove('show');
      });

      // is there already a QtiAssessmentItem visible, if so, set the response
      const assessmentItem = this.querySelector<QtiAssessmentItem>(
        `qti-assessment-item[identifier="${this._sessionContext.identifier}"]`
      );
      if (assessmentItem) {
        assessmentItem.showCorrectResponse(this._sessionContext.view === 'scorer');
      }
    }
    private asd(event: CustomEvent): void {
      event.detail.showCorrectResponse(this._sessionContext.view === 'scorer');
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('qti-assessment-item-connected', this.asd);
      this.addEventListener('on-test-switch-view', this.handleTestSwitchView);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('qti-assessment-item-connected', this.asd);
      this.removeEventListener('on-test-switch-view', this.handleTestSwitchView);
    }

    handleTestSwitchView(event: CustomEvent) {
      const view = event.detail;
      this._sessionContext = { ...this._sessionContext, view };
    }
  }

  return ChangeViewElement as Constructor<ChangeViewInterface> & T;
};
