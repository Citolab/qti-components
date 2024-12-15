import '../../index';

import { composeStory } from '@storybook/preview-api';
import { render } from 'lit';
import meta, { T4_T7 as PlayStory } from './qti-test-conformance.stories';
import { ComposedStoryFn } from 'storybook/internal/types';
import { WebComponentsRenderer } from '@storybook/web-components';
import { QtiTest } from './qti-test';
import { resolveLoaders } from '../../../.storybook/custom-story-loader';

const story: ComposedStoryFn<WebComponentsRenderer, Partial<QtiTest>> = composeStory(PlayStory, meta);

test('renders and test conformance story', async () => {
  const canvasElement = document.body;
  const loaded = await resolveLoaders(PlayStory.loaders, story.args);
  render(PlayStory.render!(meta.args, { loaded, argTypes: PlayStory.argTypes } as any), canvasElement);
  await story.play({ canvasElement });
});
