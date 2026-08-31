import { css, html } from 'lit';

import { QtiTextEntryInteraction } from '@qti-components/text-entry-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';
import { Correctness } from '../mixins/correct-response.mixin';
import { correctionPart } from '../styles/correction.styles';

export class QtiTextEntryInteractionCorrection extends CandidateCorrectionMixin(QtiTextEntryInteraction) {
  static override styles = [
    QtiTextEntryInteraction.styles,
    correctionPart,
    css`
      /*
       * The trailing inset only — size and leading gap come from the shared sheet.
       *
       * This block used to also set position: static; translate: none (dead: nothing positions this
       * badge) and size it with --qti-control-size, the radio/checkbox token — 1rem, absolute, where
       * every other badge is 1em and scales with the text it annotates. The two agreed only while the
       * item's font-size happened to equal the root's.
       *
       * The inset is needed because the field's box is the HOST while its padding is on ::part(input),
       * so the badge — a child of the host — falls outside that padding and lands flush on the border.
       * Measured at 0px from the border, against 16px for a choice and 12.8px for a chip.
       */
      [part~='correction'] {
        margin-inline-end: var(--qti-correction-inset);
      }
      :host {
        position: relative;
        anchor-name: --text-entry-host, --qti-correction-anchor;
      }
      [part='correct'] {
        position: absolute;
        position-anchor: --text-entry-host;
        position-area: top span-right;
        margin-bottom: 0.25rem;
        padding: var(--qti-padding-box);
        background-color: var(--qti-bg);
        white-space: nowrap;
      }
    `
  ];

  public override get correctness(): Readonly<Correctness | null> {
    const variable = this.responseVariable;
    if (!variable) return super.correctness;
    if (variable.value === null) return Correctness.Incorrect;

    if (variable.mapping) {
      const maxScore = variable.mapping.mapEntries.reduce((maximum, entry) => Math.max(entry.mappedValue, maximum), 0);
      for (const entry of variable.mapping.mapEntries) {
        let expected = entry.mapKey;
        let actual = variable.value as string;
        if (!entry.caseSensitive) {
          expected = expected.toLowerCase();
          actual = actual.toLowerCase();
        }
        if (expected !== actual) continue;
        if (entry.mappedValue === maxScore) return Correctness.Correct;
        if (entry.mappedValue <= (variable.mapping.defaultValue || 0)) return Correctness.Incorrect;
        return Correctness.PartiallyCorrect;
      }
    }

    return variable.correctResponse === variable.value ? Correctness.Correct : Correctness.Incorrect;
  }

  public override toggleInternalCorrectResponse(show: boolean): void {
    if (!this.showFullCorrectResponse) this.toggleFullCorrectResponse(show);
  }

  /** The badge goes between the field and the validation message; everything else is the base's. */
  override render() {
    return html`
      ${this.renderAnswer()} ${this.renderInput()}
      <span part=${this.correctionPart} aria-hidden="true"></span>
      ${this.renderValidationMessage()}
    `;
  }
}
