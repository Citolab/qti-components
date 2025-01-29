import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import * as styles from './styles';

@customElement('test-section-link')
export class TestSectionLink extends LitElement {
  static styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  @property({ type: String, attribute: 'section-id' })
  private sectionId: string = null;

  private _requestItem(identifier: string) {
    this.dispatchEvent(
      new CustomEvent('qti-request-navigation', {
        composed: true,
        bubbles: true,
        detail: {
          type: 'section',
          id: identifier
        }
      })
    );
  }

  constructor() {
    super();
    this.addEventListener('click', () => this._requestItem(this.sectionId));
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-section-link': TestSectionLink;
  }
}
