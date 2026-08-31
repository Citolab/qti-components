import { QtiAssessmentItem } from '@qti-components/elements/elements';

type CorrectionInteraction = {
  toggleCorrectResponse(show: boolean): void;
  toggleCandidateCorrection(show: boolean): void;
};

/** Assessment-item extension that coordinates correction-capable interactions. */
export class QtiAssessmentItemCorrection extends QtiAssessmentItem {
  public showCorrectResponse(show: boolean): void {
    for (const interaction of this.interactionElements) {
      (interaction as unknown as Partial<CorrectionInteraction>).toggleCorrectResponse?.(show);
    }

    this.updateControlState('item-show-correct-response', show);
  }

  public showCandidateCorrection(show: boolean): void {
    for (const interaction of this.interactionElements) {
      (interaction as unknown as Partial<CorrectionInteraction>).toggleCandidateCorrection?.(show);
    }

    this.updateControlState('item-show-candidate-correction', show);
  }

  protected override afterResponseVariableUpdated(): void {
    this.showCandidateCorrection(false);
  }

  private updateControlState(selector: string, shown: boolean): void {
    let root = this.getRootNode();
    while (true) {
      (root as ParentNode)
        .querySelectorAll<HTMLElement & { shown: boolean }>(selector)
        .forEach(control => (control.shown = shown));

      if (!(root instanceof ShadowRoot)) return;
      root = root.host.getRootNode();
    }
  }
}
