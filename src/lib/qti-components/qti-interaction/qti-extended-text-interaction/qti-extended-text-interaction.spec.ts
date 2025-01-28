import '../../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, { Test as TestStory } from './qti-extended-text-interaction.stories';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import type { QtiExtendedTextInteraction } from './qti-extended-text-interaction';

import './qti-extended-text-interaction';

const testStory: ComposedStoryFn<WebComponentsRenderer, Partial<QtiExtendedTextInteraction>> = composeStory(
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

  test('extended-text', async () => {
    await testStory.play({ canvasElement });
  });
});
