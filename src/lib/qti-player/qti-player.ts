import { html, LitElement } from 'lit';

import { qtiTransformItem } from '@citolab/qti-components/qti-transformers';
import { customElement, queryAssignedElements } from 'lit/decorators.js';
import { fetchItem } from 'src/stories/fetch-item';
import { QtiAssessmentTest } from '../qti-test';
import { QtiAssessmentItemRef } from '../qti-test/qti-assessment-test/qti-assessment-item-ref';

const setSessionData = <T>(key: string, value: T): void => sessionStorage.setItem(key, JSON.stringify(value));
const getSessionData = <T>(key: string): T | null =>
  sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)!) : null;

@customElement('qti-player')
export class QtiPlayer extends LitElement {
  @queryAssignedElements({ selector: 'qti-assessment-test' })
  _assessmentTestEls!: Array<QtiAssessmentTest>;

  constructor() {
    super();
    this.addEventListener('qti-test-set-item', this.changeItem);
  }

  async changeItem(e: CustomEvent<string>) {
    const itemRefEl = this.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier=${e.detail}]`);
    const itemRefEls = this.querySelectorAll<QtiAssessmentItemRef>(`qti-assessment-item-ref`);

    const newItemXML = await fetchItem(`public/assets/api/conformance/${itemRefEl.href}`);
    itemRefEls.forEach(
      (value, key) => (value.style.display = value.identifier !== itemRefEl.identifier ? 'none' : 'block')
    );
    itemRefEl.xmlDoc = qtiTransformItem().parse(newItemXML).path(`public/assets/api/conformance/items`).htmldoc();
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-player': QtiPlayer;
  }
}
