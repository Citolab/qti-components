import { LitElement, html } from 'lit';
import { QtiAssessmentTest } from '../qti-assessment-test';
import { customElement } from 'lit/decorators.js';

@customElement('test-toggle-scoring')
export class TestToggleScoring extends LitElement {
  render() {
    const assessmentTestEl = this.closest('qti-assessment-test') as QtiAssessmentTest;
    return html`
      <label>
        <input
          type="checkbox"
          @change=${(e: Event) => {
            const el = e.target as HTMLInputElement;
            assessmentTestEl.audienceContext = el.checked ? 'scorer' : 'candidate';
          }}
        />
        Toggle audience context
      </label>
    `;
  }
}
