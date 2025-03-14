import './../../../../../../.storybook/import-storybook-cem'; // <-- fake Storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, * as Stories from './single-cardinality-vocabulary.stories';

import type { StoryObj } from '@storybook/web-components';

import './../../../../../lib/qti-loader/qti-loader';
import './../../../../../lib/qti-components/index';

async function composeStoryWithLoaders(Story: StoryObj, Meta) {
  const composedStory = composeStory(Story, Meta);
  const loaded = Story.loaders
    ? Object.assign(
        {},
        ...(await Promise.all(
          ((Story.loaders as any[]) || []).map(loader => {
            return loader({ args: Story.args });
          })
        ))
      )
    : {};

  return {
    ...composedStory,
    render: context => Story.render!({ ...context.args }, { ...context, loaded }), // Ensure loaded is passed
    loaded // Make sure loaded is available when calling play
  };
}

describe.sequential('QtiChoiceInteraction single cardinality vocabulary stories', () => {
  let canvasElement;
  const storiesToTest = Object.entries(Stories)
    .filter(([_, value]) => (value as StoryObj).play)
    .map(([key]) => key);

  beforeEach(() => {
    canvasElement = document.createElement('div');
    document.body.appendChild(canvasElement);
  });

  afterEach(() => {
    canvasElement.remove();
    canvasElement = null;
  });

  // Clear session storage before tests
  sessionStorage.clear();

  for (const storyName of storiesToTest) {
    // eslint-disable-next-line import/namespace
    test(`${storyName} story`, async () => play(canvasElement, Stories[storyName], Meta));
  }
});

async function play(canvasElement, Story: StoryObj, Meta) {
  const composedStory = await composeStoryWithLoaders(Story, Meta);

  // Render the story with loaded data
  await render(composedStory.render({ args: Story.args } as any), canvasElement);

  // Ensure play function runs after rendering
  await composedStory.play({ canvasElement });
}
