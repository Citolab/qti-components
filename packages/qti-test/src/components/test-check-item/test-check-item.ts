import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';

import { testHostContext } from '../../internal/test-host.context';
import * as styles from '../styles';

import type { TestHost } from '../../internal/test-host.context';
import type { TestContainer } from '../test-container/test-container';

export class TestCheckItem extends LitElement {
  @consume({ context: testHostContext, subscribe: true })
  protected testHost?: TestHost;

  static override styles = css`
    :host {
      ${styles.btn};
    }
    :host(:hover:not([disabled])) {
      ${styles.btnInteractive};
    }
    :host(:focus-visible) {
      ${styles.focusRing};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  constructor() {
    super();
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('test-end-attempt', { bubbles: true }));
      const testContainer = this.testHost?.querySelector<TestContainer>('test-container');
      if (!testContainer) return;

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
