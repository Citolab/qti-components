import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import * as styles from '../components/styles';
import { dispatchPublic } from '../public-events';

import type { View } from '@qti-components/base';

/**
 * Ends the attempt on the current item and switches the test to `view` (default `scorer`), which
 * reveals the `[view]` content for that view, such as a scorer's rubric. The view stays until
 * something switches it back (`test-view-toggle`).
 *
 * @attr view - The view to switch to after the attempt ended.
 */
export class TestCheckItem extends LitElement {
  @property({ type: String }) view: View = 'scorer';

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
      dispatchPublic(this, 'cito-test-end-attempt', {});
      dispatchPublic(this, 'cito-test-switch-view', this.view);
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
