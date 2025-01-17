import { composeStory } from '@storybook/preview-api';
import { render } from 'lit';
import meta, { PlayFast as PlayFastStory } from './test-prev.stories';
import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import { resolveLoaders } from '../../../../.storybook/custom-story-loader';
import type { TestPrev } from '.';

import '../../qti-components';
import '../core';
import '.';
import '../../qti-item/core';
import '../../../item.css';

// Compose stories
const storyFast: ComposedStoryFn<WebComponentsRenderer, Partial<TestPrev>> = composeStory(PlayFastStory, meta);

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
    const loaded = await resolveLoaders(PlayFastStory.loaders, storyFast.args);
    render(PlayFastStory.render!(meta.args as any, { loaded, argTypes: PlayFastStory.argTypes } as any), canvasElement);
  });

  test('text-prev fast clicking between items, cancelling previous requests', async () => {
    await storyFast.play({ canvasElement });
  });
});
