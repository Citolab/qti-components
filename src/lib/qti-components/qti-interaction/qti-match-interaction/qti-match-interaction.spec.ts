import '../../../../testing/import-storybook-cem';
import './qti-match-interaction';
import { render } from 'lit';
import Meta, { Play, PlayTwoOneZero } from './qti-match-interaction.stories';
import { afterEach, beforeEach, describe } from 'vitest';
import { composeStory } from '@storybook/preview-api';

const PlayStory = composeStory(Play, Meta);
const PlayTwoOneZeroStory = composeStory(PlayTwoOneZero, Meta);

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
    render(PlayStory(), document.body);
    await PlayStory.play({ canvasElement: document.body });
  });

  // test('text-next slow clicking between items, cancelling previous requests', async () => {
  //   render(PlayTwoOneZeroStory(), document.body);
  //   await PlayTwoOneZeroStory.play({ canvasElement: document.body });
  // });
});
