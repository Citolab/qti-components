import '../../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, { Test as TestStory } from './qti-order-interaction.stories';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import './qti-order-interaction';
import '../qti-simple-associable-choice';
import type { QtiOrderInteraction } from './qti-order-interaction';

const testStory: ComposedStoryFn<WebComponentsRenderer, Partial<QtiOrderInteraction>> = composeStory(TestStory, Meta);

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
    render(
      TestStory.render!({ ...Meta.args, ...TestStory.args } as any, { argTypes: TestStory.argTypes } as any),
      canvasElement
    );
  });

  test('choice-interaction min-choices="1" max-choices="2"', async () => {
    await testStory.play({ canvasElement });
  });
});
