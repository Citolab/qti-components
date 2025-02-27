import '../../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, * as Stories from './qti-choice-interaction.docs.stories';

import type { StoryObj } from '@storybook/web-components';

import './qti-choice-interaction';
import '../qti-simple-choice';

describe.sequential('QtiChoiceInteraction docs stories', () => {
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

  // test(`ChoiceOrientationVertical story`, async () => play(canvasElement, Stories.ChoiceOrientationVertical));

  for (const storyName of storiesToTest) {
    // eslint-disable-next-line import/namespace
    test(`${storyName} story`, async () => play(canvasElement, Stories[storyName]));
  }
});

async function play(canvasElement, Story: StoryObj) {
  const composedStory = composeStory(Story, Meta);
  await render(
    Story.render!({ ...Meta.args, ...Story.args } as any, { argTypes: Story.argTypes } as any),
    canvasElement
  );
  await composedStory.play({ canvasElement });
}
