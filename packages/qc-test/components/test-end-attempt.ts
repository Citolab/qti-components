import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import * as styles from './styles';

@customElement('test-end-attempt')
export class TestEndAttempt extends LitElement {
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
    this.addEventListener('click', () => this.dispatchEvent(new CustomEvent('test-end-attempt', { bubbles: true })));
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-end-attempt': TestEndAttempt;
  }
}
