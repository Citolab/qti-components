import { css, html } from 'lit';
import { property } from 'lit/decorators.js';

import { QtiExtendedTextInteraction } from '@qti-components/extended-text-interaction/elements';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

import type { CandidateCorrection } from '../mixins/active-element-correction.mixin';

/**
 * Extended-text, judged from OUTSIDE.
 *
 * Every other correction class in this folder derives its verdict: it is handed a `correct-response`
 * and compares. Extended-text cannot — the response is free prose, there is nothing to compare it
 * to, and that is exactly why the base component extends `Interaction` directly and carries no
 * correction machinery (correct-response.mixin.ts says so for extended-text, upload and media).
 *
 * But an extended-text answer is still judged; just not here. A teacher, a marking service, or an app
 * that already knows the score decides, and then has to tell the component. This class is that
 * channel and nothing more: it computes no correctness, it only accepts one.
 *
 * Hence `ActiveElementCorrectionMixin` rather than `CandidateCorrectionMixin`. The two are otherwise
 * the same bookkeeping — clear the three `candidate-*` states, add one, expose `correctionPart` — but
 * `CandidateCorrectionMixin` sits on top of `CorrectResponseMixin` and drives everything off a
 * computed `correctness` getter with no setter. `ActiveElementCorrectionMixin` is the settable one,
 * written for chips whose parent interaction pushes a verdict into them. An externally-graded essay
 * is the same shape: something else knows the answer.
 *
 * Two consequences worth knowing:
 *
 *   - The `item-show-candidate-correction` button will not drive this. It disables itself unless a
 *     response variable declares a correctResponse / mapping / areaMapping, which a prose item never
 *     does. Correct: the verdict comes from the host application, which sets the attribute.
 *   - The verdict survives typing. It is a property, not the `showCandidateCorrection` toggle, so
 *     `afterResponseVariableUpdated()` does not clear it. If a stale grade should be dropped when the
 *     candidate edits their answer, that is an explicit decision for the host app to make.
 */
export class QtiExtendedTextInteractionCorrection extends ActiveElementCorrectionMixin(QtiExtendedTextInteraction) {
  static override styles = [
    QtiExtendedTextInteraction.styles,
    correctionPart,
    css`
      /*
       * Placement only — the glyph itself is the theme's, keyed on ::part(correction-*). That split
       * is the contract in correction.styles.ts, which deliberately leaves the shared badge in flow
       * and invites a component to lift it out if it wants a corner badge.
       *
       * A textarea is a box the candidate writes in, so the badge goes over its top-left corner
       * rather than trailing the text the way a chip's does, and the theme reserves the gutter for it
       * (padding-left on ::part(textarea)).
       *
       * Anchored to the TEXTAREA, not to the host. The badge's containing block is :host, and the
       * host also contains the prompt slot — so a plain top: 0.85rem measured from the host lands on
       * the prompt and the badge floats above the field, which is exactly what it did. Only the
       * vertical offset needs anchoring: the textarea spans the host's full width, so the left
       * offset is the same measured from either.
       */
      [part~='textarea'] {
        anchor-name: --qti-extended-text-field;
      }

      [part~='correction'] {
        position: absolute;
        position-anchor: --qti-extended-text-field;
        margin: 0;
        width: var(--qti-correction-size);
        height: var(--qti-correction-size);

        /* Fallback for engines without anchor positioning: the BOTTOM of the gutter, which needs no
           knowledge of where the field starts. The gutter runs the full height, so the badge clears
           the text either way. */
        left: 0.75rem;
        bottom: 0.75rem;

        /* Anchored: the top of the gutter, level with the first line — the textarea's own
           padding-top is 0.6rem. Setting top and height together over-constrains the box, so the
           bottom above is ignored wherever this line parses, and used where it does not. */
        top: calc(anchor(top) + 0.6rem);
      }
    `
  ];

  /**
   * The verdict, pushed in from outside: `correct`, `partially-correct`, `incorrect`, or absent.
   *
   * `noAccessor` because the mixin already owns the accessor — its setter is what writes the
   * `:state(candidate-*)` custom states — and Lit would otherwise replace it with a generated one and
   * silently drop that bookkeeping. Same pattern as the `response` attribute on
   * qti-inline-choice-interaction and qti-slider-interaction.
   */
  @property({ attribute: 'candidate-correction', reflect: true, noAccessor: true })
  declare candidateCorrection: CandidateCorrection;

  /** The badge goes between the field and the validation message; everything else is the base's. */
  override render() {
    return html`${this.renderPrompt()}${this.renderTextarea()}
      <span part=${this.correctionPart} aria-hidden="true"></span>
      ${this.renderValidationMessage()}`;
  }
}
