import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import * as styles from '../styles';
import { dispatchPublic } from '../../public-events';

export class TestSectionLink extends LitElement {
  static override styles = styles.button;

  @property({ type: String, attribute: 'section-id' })
  private sectionId: string = null;

  #requestItem(identifier: string) {
    dispatchPublic(this, 'qc-test-navigate', { type: 'section', id: identifier });
  }

  constructor() {
    super();
    this.addEventListener('click', () => this.#requestItem(this.sectionId));
  }

  override render() {
    return styles.control;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-section-link': TestSectionLink;
  }
}
