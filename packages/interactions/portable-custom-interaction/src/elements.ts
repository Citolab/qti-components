import { QtiPortableCustomInteraction } from './qti-portable-custom-interaction';
import { QtiPortableCustomInteractionTest } from './qti-portable-custom-test-interaction';

export const elements = [
  { tag: 'qti-portable-custom-interaction', ctor: QtiPortableCustomInteraction },
  { tag: 'qti-portable-custom-interaction-test', ctor: QtiPortableCustomInteractionTest }
] as const;

export { QtiPortableCustomInteraction, QtiPortableCustomInteractionTest };
