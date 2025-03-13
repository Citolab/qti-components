import { beforeAll } from 'vitest';
// 👇 If you're using Next.js, import from @storybook/nextjs
//   If you're using Next.js with Vite, import from @storybook/experimental-nextjs-vite
import { setProjectAnnotations } from '@storybook/web-components';

import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([previewAnnotations]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);
