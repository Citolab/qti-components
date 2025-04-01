import { render } from 'lit';
import { composeStory } from '@storybook/preview-api';
import { vi } from 'vitest';

import Meta, { SlowLoadingStimulus, NotLoadingAdvancedOrder } from './test-integration.stories';
import { ExtendedXMLHttpRequest } from '../testing/xmlHttpRequest';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components';

import '../lib/index';

const testStory1: ComposedStoryFn<WebComponentsRenderer, Partial<any>> = composeStory(SlowLoadingStimulus, Meta);
const testStory2: ComposedStoryFn<WebComponentsRenderer, Partial<any>> = composeStory(NotLoadingAdvancedOrder, Meta);

vi.stubGlobal('XMLHttpRequest', ExtendedXMLHttpRequest);

describe.sequential('suite', () => {
  let canvasElement;

  beforeEach(() => {
    canvasElement = document.createElement('div');
    document.body.appendChild(canvasElement);

    render(Meta.render!({ ...Meta.args } as any, {} as any), canvasElement);
  });

  afterEach(() => {
    if (canvasElement) {
      canvasElement.remove();
      canvasElement = null;
    }
  });

  beforeEach(async () => {});

  test('test-peiling-requests', async () => {
    await testStory1.play({ canvasElement });
  });

  test('test-peiling-requests', async () => {
    await testStory2.play({ canvasElement });
  });
});
