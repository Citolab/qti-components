import { expect, fireEvent } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../tools/testing/test-utils.js';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestItemToSpeech } from './test-item-to-speech';

type Story = StoryObj<TestItemToSpeech>;

const meta: Meta<TestItemToSpeech> = {
  component: 'test-item-to-speech'
};
export default meta;

/**
 * A `<template item-ref>` on `<qti-test>` wraps every item in the test, so each one gets its
 * own text-to-speech toolbar above it. The template renders inside `<test-container>`'s shadow
 * root, so the toolbar is styled inline; `item-ref-id` pins each player to the item it sits on.
 */
export const OnEveryItem: Story = {
  render: () =>
    html` <qti-test navigate="item">
      <template item-ref>
        <test-item-to-speech item-ref-id="{{ identifier }}" style="display:flex; gap:0.25rem; margin-block-end:0.5rem">
          <test-tts-play></test-tts-play>
          <test-tts-pick>☝</test-tts-pick>
          <test-tts-prev></test-tts-prev>
          <test-tts-next></test-tts-next>
          <test-tts-stop></test-tts-stop>
        </test-item-to-speech>
        {{ xmlDoc }}
      </template>
      <test-navigation>
        <test-section-buttons-stamp>
          <template>
            <test-section-link section-id="{{ item.identifier }}"> {{ item.identifier }} </test-section-link>
          </template>
        </test-section-buttons-stamp>
        <test-container test-url="/assets/qti-test-package-stimulus/assessment.xml"></test-container>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const expectToolbarAboveItem = (item: Element) => {
      const itemRef = item.closest('qti-assessment-item-ref');
      const player = itemRef?.querySelector('test-item-to-speech');
      expect(player).toBeInTheDocument();
      expect(player?.getAttribute('item-ref-id')).toBe(itemRef?.getAttribute('identifier'));
      expect(player?.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    };

    const [firstItem] = await getAssessmentItemsFromTestContainer(canvasElement);
    expectToolbarAboveItem(firstItem);

    await fireEvent.click(await canvas.findByShadowText('info-end'));
    const lastItem = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info End');
    expectToolbarAboveItem(lastItem);
  }
};
