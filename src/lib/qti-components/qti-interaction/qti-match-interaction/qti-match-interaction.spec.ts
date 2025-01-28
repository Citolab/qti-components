import '../../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, { Test as TestStory, Test2 as Test2Story } from './qti-match-interaction.stories';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';
import type { QtiMatchInteraction } from './qti-match-interaction';

import './qti-match-interaction';
import '../qti-simple-associable-choice';

const testStory: ComposedStoryFn<WebComponentsRenderer, Partial<QtiMatchInteraction>> = composeStory(TestStory, Meta);
const test2Story: ComposedStoryFn<WebComponentsRenderer, Partial<QtiMatchInteraction>> = composeStory(Test2Story, Meta);

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

  test('choice-interaction min-choices="1" max-choices="2"', async () => {
    await test2Story.play({ canvasElement });
  });
});
