import '../../../../../.storybook/import-storybook-cem';
import { render } from 'lit';
import { afterEach, beforeEach, describe } from 'vitest';
import { composeStory } from '@storybook/preview-api';
import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import type { QtiChoiceInteraction } from './qti-choice-interaction';
import Meta, { Default } from './qti-choice-interaction.stories';

const DefaultStory: ComposedStoryFn<WebComponentsRenderer, Partial<QtiChoiceInteraction>> = composeStory(Default, Meta);

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

  test('text-next fast clicking between items, cancelling previous requests', async () => {
    render(DefaultStory(), document.body);
  });
});
