import { html, LitElement } from 'lit';

import styles from './qti-assessment-stimulus.styles';

import type { CSSResultGroup } from 'lit';

/**
 * @summary Root of a shared stimulus, placed as a whole wherever the stimulus is rendered.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info#Root_AssessmentStimulus
 * @status stable
 * @since 4.0
 *
 * Generates no box of its own (`display: contents`), so the stimulus lays out as if only its
 * `qti-stimulus-body` were placed. It is kept in the DOM because it carries the stimulus'
 * `xml:lang` (transformed to `lang`): the content inherits its language from here, which is what
 * text-to-speech and screen readers use to pick a voice.
 *
 * @slot - stimulus content: `qti-stylesheet`, `qti-stimulus-body` and `qti-catalog-info` (hidden).
 */
export class QtiAssessmentStimulus extends LitElement {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-stimulus': QtiAssessmentStimulus;
  }
}
