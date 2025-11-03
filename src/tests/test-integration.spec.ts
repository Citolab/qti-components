import { render } from 'lit';
import { composeStory } from 'storybook/preview-api';
import { afterEach, beforeEach, describe, test, vi } from 'vitest';

import Meta, { SlowLoadingStimulus } from './test-integration.stories';
import { ExtendedXMLHttpRequest } from '../../apps/e2e/src/testing/xmlHttpRequest';

import type { ComposedStoryFn } from 'storybook/internal/types';
import type { WebComponentsRenderer } from '@storybook/web-components-vite';

import '@qti-components/test';
import '@qti-components/elements';

const testStory1: ComposedStoryFn<WebComponentsRenderer, Partial<any>> = composeStory(SlowLoadingStimulus, Meta);

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
});
