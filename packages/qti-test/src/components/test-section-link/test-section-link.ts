import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import * as styles from '../styles';
import { dispatchPublic } from '../../public-events';

export class TestSectionLink extends LitElement {
  static override styles = css`
    :host {
      ${styles.btn};
    }
    @media (hover: hover) and (pointer: fine) {
      :host(:hover:not([disabled])) {
        ${styles.btnInteractive};
      }
    }
    :host(:active:not([disabled])) {
      ${styles.btnActive};
    }
    :host(:focus-visible) {
      ${styles.focusRing};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  @property({ type: String, attribute: 'section-id' })
  private sectionId: string = null;

  #requestItem(identifier: string) {
    dispatchPublic(this, 'cito-test-navigate', { type: 'section', id: identifier });
  }

  constructor() {
    super();
    this.addEventListener('click', () => this.#requestItem(this.sectionId));
  }

  override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-section-link': TestSectionLink;
  }
}
