import { CandidateCorrectionMixin } from './candidate-correction.mixin';

import type { Interaction } from '@qti-components/base';
import type { CorrectResponseInterface } from './correct-response.mixin';

type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

type DragDropInteraction = Interaction & {
  afterCache(): void;
};

/** Adds correction lifecycle behavior shared by drag-and-drop interactions. */
export const DragDropCorrectionMixin = <T extends AbstractConstructor<DragDropInteraction>>(superClass: T) => {
  abstract class DragDropCorrectionMixinClass extends CandidateCorrectionMixin(superClass) {
    public override toggleInternalCorrectResponse(show: boolean): void {
      if (!this.showFullCorrectResponse) {
        this.toggleFullCorrectResponse(show);
      }
    }

    public override afterCache(): void {
      super.afterCache();
      if (this.showCorrectResponse) this.toggleInternalCorrectResponse(true);
      if (this.showCandidateCorrection) this.toggleCandidateCorrection(true);
      if (this.showFullCorrectResponse) this.toggleFullCorrectResponse(true);
    }
  }

  return DragDropCorrectionMixinClass as unknown as AbstractConstructor<CorrectResponseInterface> & T;
};
