import { html } from 'lit';
import { QtiResponseIf } from '../qti-responseif';

export class QtiResponseElseIf extends QtiResponseIf {
  override render() {
    return html`${super.render()}`;
  }
}

customElements.define('qti-response-else-if', QtiResponseElseIf);
