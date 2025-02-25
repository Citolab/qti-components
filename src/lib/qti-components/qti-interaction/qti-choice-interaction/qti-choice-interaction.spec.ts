import '../../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, * as Stories from './qti-choice-interaction.stories';

import type { StoryObj } from '@storybook/web-components';

import './qti-choice-interaction';
import '../qti-simple-choice';

describe.sequential('QtiChoiceInteraction stories', () => {
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

  for (const storyName of storiesToTest) {
    test(`${storyName} story`, async () => {
      // eslint-disable-next-line import/namespace
      const Story = Stories[storyName];
      const composedStory = composeStory(Story, Meta);
      render(Story.render!({ ...Meta.args, ...Story.args } as any, { argTypes: Story.argTypes } as any), canvasElement);
      await composedStory.play({ canvasElement });
    });
  }
});
