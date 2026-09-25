import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, spyOn, waitFor, within } from 'storybook/test';
import { within as shadowWithin } from 'shadow-dom-testing-library';
import { html } from 'lit';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../tools/testing/test-utils';

import type { TestItemToSpeech } from './test-item-to-speech';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes } = getStorybookHelpers('test-item-to-speech');

type Story = StoryObj<TestItemToSpeech & typeof args>;

const meta: Meta<TestItemToSpeech> = {
  component: 'test-item-to-speech',
  args: { ...args, language: 'fr-FR' },
  argTypes,
  parameters: {
    actions: { handles: events },
    docs: {
      description: {
        component: `Every reading element is spoken in the language of the nearest \`lang\` attribute:
element → closest ancestor (including \`<qti-assessment-item xml:lang>\`) → \`<html lang>\` → the
\`language\` attribute on \`<test-item-to-speech>\`. The three items in this test each exercise one rule.`
      }
    }
  }
};
export default meta;

const TEST_URL = '/assets/qti-test-package/assessment-text-to-speech.xml';

const EXAMPLES = [
  {
    id: 'ITM-tts-element-lang',
    title: 'TTS: element lang',
    label: '1. Element lang',
    explains:
      'English passage marked lang="en-GB" on the elements; Dutch heading and questions inherit nl-NL from the item root.'
  },
  {
    id: 'ITM-tts-item-lang',
    title: 'TTS: item lang',
    label: '2. Item lang',
    explains: 'No lang on the content; everything inherits xml:lang="nl-NL" from the closest ancestor, the item root.'
  },
  {
    id: 'ITM-tts-no-lang',
    title: 'TTS: no lang',
    label: '3. No lang',
    explains: 'No lang anywhere: uses <html lang> when set, otherwise the language attribute on the player.'
  }
];

/**
 * All language-resolution examples in one test. Use the item links to switch example,
 * press Play and listen — or toggle the document language with the button to hear example 3 change.
 */
export const LanguageResolution: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <ol style="font-size: 0.875rem; line-height: 1.5">
          ${EXAMPLES.map(
            e => html`<li><test-item-link item-id=${e.id}>${e.label}</test-item-link> — ${e.explains}</li>`
          )}
        </ol>
        <div style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0">
          <test-item-to-speech language=${args.language}>
            <test-tts-prev>◀◀</test-tts-prev>
            <test-tts-play>
              <span slot="play">▶ Play</span>
              <span slot="pause">⏸ Pause</span>
            </test-tts-play>
            <test-tts-next>▶▶</test-tts-next>
            <test-tts-stop>■ Stop</test-tts-stop>
          </test-item-to-speech>
          <button
            type="button"
            @click=${(e: Event) => {
              const root = document.documentElement;
              if (root.getAttribute('lang')) root.removeAttribute('lang');
              else root.setAttribute('lang', 'de-DE');
              (e.target as HTMLButtonElement).textContent = `Document lang: ${root.getAttribute('lang') || 'none'}`;
            }}
          >
            Document lang: ${document.documentElement.getAttribute('lang') || 'none'}
          </button>
          <span style="font-size: 0.875rem">Player fallback language: <code>${args.language}</code></span>
        </div>
        <test-container test-url=${TEST_URL}></test-container>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;
    const originalDocumentLang = root.getAttribute('lang');

    // Record the language of every utterance instead of speaking it, and end each one right
    // away so the player auto-advances through the whole item.
    const spokenLangs: string[] = [];
    const speak = spyOn(speechSynthesis, 'speak').mockImplementation((utterance: SpeechSynthesisUtterance) => {
      spokenLangs.push(utterance.lang);
      setTimeout(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent), 0);
    });
    const cancel = spyOn(speechSynthesis, 'cancel').mockImplementation(() => {});

    const tts = canvasElement.querySelector('test-item-to-speech') as TestItemToSpeech;
    const playButton = await canvas.findByText('▶ Play');

    const readItem = async (title: string, itemId: string) => {
      spokenLangs.length = 0;
      (await canvas.findByText(EXAMPLES.find(e => e.id === itemId)!.label)).click();
      // navigate="item" loads the target item asynchronously; wait until it is the one in the container
      await waitFor(() => {
        const shadow = canvasElement.querySelector('test-container')?.shadowRoot;
        expect(shadow?.querySelector(`qti-assessment-item[data-title="${title}"]`)).toBeTruthy();
      });
      await waitFor(() => expect(tts.matches(':state(idle)')).toBe(true));
      // Linking to the item already on screen re-renders it, so the container can be briefly
      // empty after the check above; play finds nothing to read then, so press it until it speaks.
      // (Waiting for :state(playing) instead would race the mock, which reads a whole item at once.)
      await waitFor(() => {
        if (!spokenLangs.length) playButton.click();
        expect(spokenLangs.length).toBeGreaterThan(0);
      });
      await waitFor(() => expect(tts.matches(':state(idle)')).toBe(true), { timeout: 5000 });
      return spokenLangs.slice();
    };

    try {
      root.removeAttribute('lang');
      await getAssessmentItemsFromTestContainer(canvasElement);

      // 1. lang on the elements wins; Dutch heading and questions inherit nl-NL from the item root
      expect(await readItem('TTS: element lang', 'ITM-tts-element-lang')).toEqual([
        'nl-NL', // <h2> Lees de tekst…
        'en-GB', // <div lang="en-GB"><p>The lighthouse keeper…
        'en-GB', // <div lang="en-GB"><p>From the top…
        'en-GB', // <p lang="en-GB">On stormy nights…
        'nl-NL', // <qti-prompt>
        'nl-NL', // choice A
        'nl-NL', // choice B
        'nl-NL' //  choice C
      ]);

      // 2. no lang on content; closest ancestor with lang is the item root
      expect(await readItem('TTS: item lang', 'ITM-tts-item-lang')).toEqual(['nl-NL', 'nl-NL', 'nl-NL', 'nl-NL']);

      // 3a. no lang in the item at all; the document language is used
      root.setAttribute('lang', 'de-DE');
      expect(await readItem('TTS: no lang', 'ITM-tts-no-lang')).toEqual(['de-DE', 'de-DE', 'de-DE', 'de-DE']);

      // 3b. no document language either; the player's own language attribute is the last resort.
      // Navigate away and back so the player starts the item from the top again.
      root.removeAttribute('lang');
      await readItem('TTS: item lang', 'ITM-tts-item-lang');
      expect(await readItem('TTS: no lang', 'ITM-tts-no-lang')).toEqual(['fr-FR', 'fr-FR', 'fr-FR', 'fr-FR']);
    } finally {
      if (originalDocumentLang === null) root.removeAttribute('lang');
      else root.setAttribute('lang', originalDocumentLang);
      speak.mockRestore();
      cancel.mockRestore();
    }
  }
};

/**
 * A `<template item-ref>` on `<qti-test>` wraps every item in the test, so each one gets its
 * own text-to-speech toolbar above it instead of one player in the page chrome. `item-ref-id`
 * pins each player to the item it sits on, so this also works on a section page showing several
 * items at once; starting one player stops any other.
 *
 * The template renders inside `<test-container>`'s shadow root, where page CSS does not reach,
 * so the toolbar is styled inline. `{{ item.index }}` comes from the computed context and is
 * empty for info items.
 */
export const OnEveryItem: Story = {
  render: () =>
    html` <qti-test navigate="item">
      <template item-ref>
        <div style="display:flex; gap:0.25rem; align-items:center; margin-block-end:0.5rem">
          <template type="if" if="{{ item.index }}">
            <strong>{{ item.index }}.</strong>
          </template>
          <test-item-to-speech item-ref-id="{{ identifier }}" style="display:flex; gap:0.25rem">
            <test-tts-play></test-tts-play>
            <test-tts-pick>☞</test-tts-pick>
            <test-tts-prev></test-tts-prev>
            <test-tts-next></test-tts-next>
            <test-tts-stop></test-tts-stop>
          </test-item-to-speech>
        </div>
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
    const canvas = shadowWithin(canvasElement);

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
