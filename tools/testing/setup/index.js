import { expect as expectInVitest } from 'vitest';
import { expect as expectInStorybook } from 'storybook/test';

import { toEqualXml } from './toEqualXml';
import { toBePositionedRelativeTo } from './toBePositionedRelativeTo';

export const customMatchers = {
  toBePositionedRelativeTo,
  toEqualXml
};

expectInVitest.extend(customMatchers);
expectInStorybook.extend(customMatchers);
