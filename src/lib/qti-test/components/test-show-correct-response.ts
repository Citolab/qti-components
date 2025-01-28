import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import * as styles from './styles';

@customElement('test-show-correct-response')
export class TestShowCorrectResponse extends LitElement {
  static styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  constructor() {
    super();
    this.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('test-show-correct-response', { detail: true, bubbles: true }))
    );
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-show-correct-response': TestShowCorrectResponse;
  }
}
