import '../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { afterEach, beforeEach, describe } from 'vitest';
import { composeStory } from '@storybook/preview-api';

import { resolveLoaders } from '../../../../.storybook/custom-story-loader';
import meta, { Test as TestStory } from './test-prev.stories';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import type { TestPrev } from '.';

import '../../qti-components';
import '../core';
import '.';
import '../../qti-item/core';
import '../../../item.css';

// Compose stories
const testStory: ComposedStoryFn<WebComponentsRenderer, Partial<TestPrev>> = composeStory(TestStory, meta);

describe.sequential('suite', () => {
  let canvasElement;

  beforeEach(() => {
    canvasElement = document.createElement('div');
    document.body.appendChild(canvasElement);
  });

  afterEach(() => {
    if (canvasElement) {
      canvasElement.remove();
      canvasElement = null;
    }
  });

  beforeEach(async () => {
    const loaded = await resolveLoaders(TestStory.loaders, testStory.args);
    render(
      TestStory.render!({ ...meta.args, ...TestStory.args } as any, { loaded, argTypes: TestStory.argTypes } as any),
      canvasElement
    );
  });

  test('test-prev fast clicking between items, cancelling previous requests', async () => {
    await testStory.play({ canvasElement });
  });
});
