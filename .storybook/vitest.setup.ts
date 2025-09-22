import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { beforeAll } from 'vitest';
// 👇 If you're using Next.js, import from @storybook/nextjs
//   If you're using Next.js with Vite, import from @storybook/experimental-nextjs-vite
import { setProjectAnnotations } from '@storybook/web-components-vite';

import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([a11yAddonAnnotations, previewAnnotations]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);
