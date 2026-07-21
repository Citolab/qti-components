import { QtiPositionObjectInteraction } from './qti-position-object-interaction';
import { QtiPositionObjectStage } from './qti-position-object-stage';

export const elements = [
  { tag: 'qti-position-object-interaction', ctor: QtiPositionObjectInteraction },
  { tag: 'qti-position-object-stage', ctor: QtiPositionObjectStage }
] as const;

export { QtiPositionObjectInteraction, QtiPositionObjectStage };
