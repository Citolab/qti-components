import { composeStory } from '@storybook/preview-api';
import { render } from 'lit';
import meta, { PlayFast as PlayFastStory, PlayWithDelay as PlayWithDelayStory } from './test-next.stories';
import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import { resolveLoaders } from '../../../../.storybook/custom-story-loader';
import type { QtiTest } from '../core/qti-test';

import '../../qti-components';
import '../../../lib/qti-test/core';
import '../../../lib/qti-test/components';
import '../../../lib/qti-item/core';
import '../../../item.css';

// Compose stories
const storyFast: ComposedStoryFn<WebComponentsRenderer, Partial<QtiTest>> = composeStory(PlayWithDelayStory, meta);
const storySlow: ComposedStoryFn<WebComponentsRenderer, Partial<QtiTest>> = composeStory(PlayWithDelayStory, meta);

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
    render(PlayFastStory.render!(meta.args, { loaded, argTypes: PlayFastStory.argTypes } as any), canvasElement);
  });

  test('text-next fast clicking between items, cancelling previous requests', async () => {
    await storyFast.play({ canvasElement });
  });

  test('text-next slow clicking between items, cancelling previous requests', async () => {
    await storySlow.play({ canvasElement });
  });
});
