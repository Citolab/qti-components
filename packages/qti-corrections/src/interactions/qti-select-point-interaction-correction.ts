import { css, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { ScoringHelper } from '@qti-components/base';
import { QtiSelectPointInteraction } from '@qti-components/select-point-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';

import type { QtiAreaMapEntry } from '@qti-components/base';

export class QtiSelectPointInteractionCorrection extends CandidateCorrectionMixin(QtiSelectPointInteraction) {
  #correctAreas: Array<{ shape: string; coords: string }> = [];

  #responseCorrection: boolean[] = [];

  static override styles = [
    QtiSelectPointInteraction.styles,
    css`
      [part~='correct'] {
        --qti-select-point-marker-color: var(--qti-correct);
      }
      [part~='incorrect'] {
        --qti-select-point-marker-color: var(--qti-incorrect);
      }
    `
  ];

  public override toggleCandidateCorrection(show: boolean): void {
    super.toggleCandidateCorrection(show);
    const previous = this.#responseCorrection;
    this.#responseCorrection = [];
    if (!show) {
      this.requestUpdate('responseCorrection', previous);
      return;
    }

    const areaEntries = this._effectiveAreaEntries;
    const baseType = this.responseVariable?.baseType;
    const response = this.correctResponse;
    for (const point of this.responsePoints) {
      let correct = areaEntries.some(area =>
        ScoringHelper.isPointInArea(`${point.x} ${point.y}`, `${area.shape},${area.coords}`, baseType)
      );
      if (!areaEntries.length && response) {
        const expected = Array.isArray(response) ? response : [response];
        correct = expected.some(entry => {
          const [x, y] = entry.split(' ').map(Number);
          return Number.isFinite(x) && Number.isFinite(y) && Math.hypot(point.x - x, point.y - y) <= 10;
        });
      }
      this.#responseCorrection.push(correct);
    }
    this.requestUpdate('responseCorrection', previous);
  }

  public override toggleInternalCorrectResponse(show: boolean): void {
    super.toggleInternalCorrectResponse(show);
    if (!show) {
      const previous = this.#correctAreas;
      this.#correctAreas = [];
      this.requestUpdate('correctAreas', previous);
      return;
    }

    let entries: QtiAreaMapEntry[] = this._effectiveAreaEntries;
    if (!entries.length) {
      const response = this.correctResponse;
      const values = response ? (Array.isArray(response) ? response : [response]) : [];
      if (values.some(value => value.split(' ').length < 2)) {
        console.error('No valid correct responses found.');
        return;
      }
      entries = values.map(value => ({
        shape: 'circle',
        coords: `${value.split(' ').join(',')},10`,
        defaultValue: 1,
        mappedValue: 1
      }));
    }
    const previous = this.#correctAreas;
    this.#correctAreas = entries.map(entry => ({ shape: entry.shape, coords: entry.coords }));
    this.requestUpdate('correctAreas', previous);
  }

  protected override pointPart(_point: string, index: number): string {
    const verdict = this.#responseCorrection[index];
    return verdict === undefined ? 'point' : `point ${verdict ? 'correct' : 'incorrect'}`;
  }

  protected override renderSupplementalLayer(): unknown {
    return repeat(
      this.#correctAreas,
      area => `${area.shape}:${area.coords}`,
      (area, index) =>
        html`<div
          style=${styleMap({
            position: 'absolute',
            pointerEvents: 'none',
            backgroundColor: 'var(--qti-correct)',
            opacity: '0.5'
          })}
          data-correction-area
          data-coord=${area.coords}
          data-shape=${area.shape}
          alt=${`correct-response-${index + 1}`}
        ></div>`
    );
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('correctAreas' as never)) {
      this.positionOverlayElements(this.shadowRoot!.querySelectorAll<HTMLElement>('[data-correction-area]'));
    }
  }
}
