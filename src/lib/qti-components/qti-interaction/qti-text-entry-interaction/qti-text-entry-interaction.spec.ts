import '../../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, { Test as TestStory } from './qti-text-entry-interaction.stories';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import type { QtiTextEntryInteraction } from './qti-text-entry-interaction';

import './qti-text-entry-interaction';

const testStory: ComposedStoryFn<WebComponentsRenderer, Partial<QtiTextEntryInteraction>> = composeStory(
  TestStory,
  Meta
);

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

  test('text-entry', async () => {
    await testStory.play({ canvasElement });
  });
});
