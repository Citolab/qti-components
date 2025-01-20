import '../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { composeStory } from '@storybook/preview-api';
import { render } from 'lit';

import meta, { Test as TestStory } from './test-view.stories';
import { resolveLoaders } from '../../../../.storybook/custom-story-loader';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import type { TestView } from '.';

import '../../qti-components';
import '../core';
import '.';
import '../../qti-item/core';
import '../../../item.css';

// Compose stories
const testStory: ComposedStoryFn<WebComponentsRenderer, Partial<TestView>> = composeStory(TestStory, meta);

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
    render(TestStory.render!(meta.args as any, { loaded, argTypes: TestStory.argTypes } as any), canvasElement);
  });

  test('changing viewer', async () => {
    await testStory.play({ canvasElement });
  });
});
