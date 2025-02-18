import '../../../../../.storybook/import-storybook-cem'; // <-- fake storybook import
import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';

import Meta, { FeedbackInline as TestStory } from './qti-feedback-inline.docs.stories';

import type { WebComponentsRenderer } from '@storybook/web-components';
import type { ComposedStoryFn } from 'storybook/internal/types';
import type { QtiModalFeedback } from '../..';

import '../..';

const testStory: ComposedStoryFn<WebComponentsRenderer, Partial<QtiModalFeedback>> = composeStory(TestStory, Meta);

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

  test('modal-feedback', async () => {
    await testStory.play({ canvasElement });
  });
});
