import '../../../../testing/import-storybook-cem';
import '../qti-match-interaction/qti-match-interaction';
import { render } from 'lit';
import Meta, { Default } from './qti-choice-interaction.stories';
import { afterEach, beforeEach, describe } from 'vitest';
import { composeStory } from '@storybook/preview-api';

const DefaultStory = composeStory(Default, Meta);

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
    if (DefaultStory.play) await DefaultStory.play({ canvasElement: document.body });
  });
});
