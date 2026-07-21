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
      [part~='correction'] {
        position: static;
        translate: none;
        width: var(--qti-form-size);
        height: var(--qti-form-size);
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
        padding: var(--qti-padding-vertical) var(--qti-padding-horizontal);
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

  protected override renderSupplementalContent(): unknown {
    return html`<span part=${this.correctionPart} aria-hidden="true"></span>`;
  }
}
