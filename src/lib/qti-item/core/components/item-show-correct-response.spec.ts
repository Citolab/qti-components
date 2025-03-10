import '../../../../../.storybook/import-storybook-cem'; // Fake Storybook import
import { html, render } from 'lit';
import { afterEach, beforeEach, describe, test } from 'vitest';
import { composeStory } from '@storybook/preview-api';

import { resolveLoaders } from '../../../../../.storybook/custom-story-loader';
import meta, {
  Default as DefaultStory,
  NoCorrectResponse as NoCorrectResponseStory,
  MultipleResponse as MultipleResponseStory,
  SelectPoint as SelectPointStory,
  SelectPointMultipleNoAreaMapping as SelectPointMultipleNoAreaMappingStory,
  GraphicOrder as GraphicOrderStory,
  InlineChoice as InlineChoiceStory,
  GapMatch as GapMatchStory,
  TextEntry as TextEntryStory,
  GraphicAssociate as GraphicAssociateStory,
  Slider as SliderStory
} from './item-show-correct-response.stories';

import '../../../qti-components';
import './..';
import '../../../../item.css';

// Compose all stories
const defaultStory = composeStory(DefaultStory, meta);
const noCorrectResponseStory = composeStory(NoCorrectResponseStory, meta);
const multipleResponseStory = composeStory(MultipleResponseStory, meta);
const selectPointStory = composeStory(SelectPointStory, meta);
const selectPointMultipleNoAreaMappingStory = composeStory(SelectPointMultipleNoAreaMappingStory, meta);
const graphicOrderStory = composeStory(GraphicOrderStory, meta);
const graphicAssociateStory = composeStory(GraphicAssociateStory, meta);
const gapMatchStory = composeStory(GapMatchStory, meta);
const sliderStory = composeStory(SliderStory, meta);
const textEntryStory = composeStory(TextEntryStory, meta);
const inlineChoiceStory = composeStory(InlineChoiceStory, meta);

// Helper function to resolve loaders and render story
async function setupStory(story, canvasElement) {
  const loaded = await resolveLoaders(story.loaders, story.args);
  const args = { ...meta.args, ...(story.args || {}) };

  // Ensure `item-url` is correctly prefixed with `/public/assets`
  if (args['item-url']) {
    args['item-url'] = `/assets${args['item-url']}`;
  }

  render(story.render!(args as any, { loaded, argTypes: story.argTypes || {} } as any), canvasElement);
}

describe.sequential('ItemShowCorrectResponse Suite', () => {
  let canvasElement: HTMLElement;

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

  test('show correct response - Default', async () => {
    await setupStory(DefaultStory, canvasElement);
    await defaultStory.play({ canvasElement });
  });

  test('show correct response - NoCorrectResponse', async () => {
    await setupStory(NoCorrectResponseStory, canvasElement);
    await noCorrectResponseStory.play({ canvasElement });
  });

  test('show correct response - MultipleResponse', async () => {
    await setupStory(MultipleResponseStory, canvasElement);
    await multipleResponseStory.play({ canvasElement });
  });

  test('show correct response - SelectPoint', async () => {
    await setupStory(SelectPointStory, canvasElement);
    await selectPointStory.play({ canvasElement });
  });

  test('show correct response - SelectPointMultipleNoAreaMapping', async () => {
    await setupStory(SelectPointMultipleNoAreaMappingStory, canvasElement);
    await selectPointMultipleNoAreaMappingStory.play({ canvasElement });
  });

  test('show correct response - GraphicOrder', async () => {
    await setupStory(GraphicOrderStory, canvasElement);
    await graphicOrderStory.play({ canvasElement });
  });

  test('show correct response - InlineChoice', async () => {
    await setupStory(InlineChoiceStory, canvasElement);
    await inlineChoiceStory.play({ canvasElement });
  });

  test('show correct response - GraphicAssociate', async () => {
    await setupStory(GraphicAssociateStory, canvasElement);
    await graphicAssociateStory.play({ canvasElement });
  });

  test('show correct response - TextEntry', async () => {
    await setupStory(TextEntryStory, canvasElement);
    await textEntryStory.play({ canvasElement });
  });

  test('show correct response - GapMatch', async () => {
    await setupStory(GapMatchStory, canvasElement);
    await gapMatchStory.play({ canvasElement });
  });

  test('show correct response - Slider', async () => {
    await setupStory(SliderStory, canvasElement);
    await sliderStory.play({ canvasElement });
  });
});
