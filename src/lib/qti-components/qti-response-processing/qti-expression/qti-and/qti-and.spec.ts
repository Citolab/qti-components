import '../../../../../index';

import { render } from 'lit';
import Meta, {
  AllTrueResultsInTrue as AllTrueResultsInTrueStory,
  OneFalseResultsInFalse as OneFalseResultsInFalseStory
} from './qti-and.stories';

import { composeStory } from '@storybook/preview-api';
import { QtiAnd } from './qti-and';

const allTrueStory = composeStory(AllTrueResultsInTrueStory, Meta);

test('all true', async () => {
  render(allTrueStory(), document.body);

  await allTrueStory.play({ canvasElement: document.body });
  const qtiAnd = document.body.querySelector('qti-and') as QtiAnd;
  expect(qtiAnd.calculate()).toBeTruthy();
});

const oneFalseStory = composeStory(OneFalseResultsInFalseStory, Meta);

test('one false should result in false', async () => {
  render(oneFalseStory(), document.body);

  await oneFalseStory.play({ canvasElement: document.body });
  const qtiAnd = document.body.querySelector('qti-and') as QtiAnd;
  expect(qtiAnd.calculate()).toBeFalsy();
});
