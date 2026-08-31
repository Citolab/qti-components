import { css, html, LitElement } from 'lit';

import * as styles from '../styles';

import type { QtiTest } from '../qti-test/qti-test';
import type { TestContainer } from '../test-container/test-container';

export class TestCheckItem extends LitElement {
  static override styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  constructor() {
    super();
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('test-end-attempt', { bubbles: true }));
      const qtiTest = this.closest<QtiTest>('qti-test');
      const testContainer = qtiTest.querySelector<TestContainer>('test-container');

      const viewElements = Array.from(testContainer.shadowRoot.querySelectorAll('[view]'));

      viewElements.forEach((element: HTMLElement) => {
        element.classList.toggle('show', true);
      });
    });
  }

  override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-check-item': TestCheckItem;
  }
}
