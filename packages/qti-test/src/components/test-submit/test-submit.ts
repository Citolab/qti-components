import { LitElement } from 'lit';

import * as styles from '../styles';
import { dispatchPublic } from '../../public-events';

/**
 * Scores the test: on click the test resets its outcomes to their declared defaults, runs its
 * outcome processing and dispatches `cito-test-submitted`, after which the host reads the outcomes.
 * The host decides where it sits, for example on the last item or in a review view.
 */
export class TestSubmit extends LitElement {
  static override styles = styles.button;

  constructor() {
    super();
    this.addEventListener('click', () => dispatchPublic(this, 'cito-test-submit', {}));
  }

  override render() {
    return styles.control;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-submit': TestSubmit;
  }
}
