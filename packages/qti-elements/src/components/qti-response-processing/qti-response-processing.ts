import { css, html, LitElement } from 'lit';

import { QtiExitResponseSignal, type QtiRuleBase } from '@qti-components/base';

import { mapResponse, mapResponsePoint, matchCorrect } from '../../internal/template-strings';

import type { PropertyValueMap } from 'lit';

/** The response processing templates we substitute for, keyed by the file name in `template`. */
const responseProcessingTemplates: Record<string, string> = {
  map_response: mapResponse,
  map_response_point: mapResponsePoint,
  match_correct: matchCorrect
};

export class QtiResponseProcessing extends LitElement {
  static override styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    return html`<slot></slot>`;
  }

  public process() {
    const assessmentItem = this.closest('qti-assessment-item');
    if (!assessmentItem) return;
    const rules = [...this.children] as unknown as QtiRuleBase[];
    try {
      for (const rule of rules) {
        rule.process();
      }
    } catch (error) {
      // `qti-exit-response` ends the attempt's processing from wherever it
      // sits, however deeply nested. Reaching here is the rule doing its job,
      // so the run simply stops; anything else is a real failure and rethrows.
      if (!(error instanceof QtiExitResponseSignal)) throw error;
    }
  }

  public override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const template = this.getAttribute('template');
    if (!template) return;

    const templateName = template.split('/').pop()!.replace('.xml', '');
    const rules = responseProcessingTemplates[templateName];
    // Leave an unknown template's authored children alone; there is nothing to substitute.
    if (!rules) return;

    // Parsed through this element's own `innerHTML` rather than a fragment created off `document`:
    // the HTML fragment parsing algorithm takes its custom element registry from the context
    // element, so the rules are upgraded with the registry this element lives in. A fragment from
    // `document.createRange()` is parsed against the global registry, which leaves every rule an
    // unupgraded HTMLElement when the item was rendered into a scoped registry.
    this.innerHTML = rules;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-processing': QtiResponseProcessing;
  }
}
