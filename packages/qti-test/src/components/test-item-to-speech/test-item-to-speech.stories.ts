import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, spyOn, waitFor, within } from 'storybook/test';
import { within as shadowWithin } from 'shadow-dom-testing-library';
import { html } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../tools/testing/test-utils';

import '../../../../../.storybook/utilities.css';
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
\`language\` attribute on \`<test-item-to-speech>\`. The three items in this test each exercise one rule.

How the player decides what to read — next to a stimulus placeholder, next to marked HTML
(\`data-tts-content\`), inside an item-ref, or following navigation — is described on the Docs page.`
      }
    }
  }
};
export default meta;

const TEST_URL = '/assets/qti-test-package/assessment-text-to-speech.xml';

/** The player in the item-ref for `itemId`, inside test-container's shadow root. */
const playerFor = (canvasElement: HTMLElement, itemId: string) =>
  canvasElement
    .querySelector('test-container')
    ?.shadowRoot?.querySelector<TestItemToSpeech>(
      `qti-assessment-item-ref[identifier="${itemId}"] test-item-to-speech`
    ) ?? null;

const playButtonOf = (player: TestItemToSpeech) =>
  player.querySelector('test-tts-play')?.shadowRoot?.querySelector('button') ?? null;

/**
 * Press play on `player()` until it speaks, then wait for it to read to the end.
 * The item — and so the player with it — can re-render right after navigating, so the player is
 * looked up again on every attempt. (Waiting for :state(playing) instead would race the mock,
 * which reads a whole item at once.)
 */
const playUntilSpoken = async (player: () => TestItemToSpeech | null, spoken: unknown[]) => {
  spoken.length = 0;
  await waitFor(() => {
    const current = player();
    if (current && !spoken.length) playButtonOf(current)?.click();
    expect(spoken.length).toBeGreaterThan(0);
  });
  await waitFor(() => expect(player()?.matches(':state(idle)')).toBe(true), { timeout: 5000 });
};

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
 *
 * The player sits in the toolbar, outside any item-ref, so it follows the navigation cursor:
 * this story is the test for cursor mode. It switches items, and links to the item already on
 * screen, which re-renders it.
 */
export const LanguageResolution: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation class="stack">
        <div class="card stack text-sm">
          ${EXAMPLES.map(
            e =>
              html`<div class="row">
                <test-item-link item-id=${e.id}>${e.label}</test-item-link><span class="muted">${e.explains}</span>
              </div>`
          )}
        </div>
        <div class="row">
          <test-item-to-speech language=${args.language}>
            <test-tts-prev></test-tts-prev>
            <test-tts-play></test-tts-play>
            <test-tts-next></test-tts-next>
            <test-tts-stop></test-tts-stop>
            <test-tts-pick></test-tts-pick>
          </test-item-to-speech>
          <button
            type="button"
            class="story-button"
            @click=${(e: Event) => {
              const root = document.documentElement;
              if (root.getAttribute('lang')) root.removeAttribute('lang');
              else root.setAttribute('lang', 'de-DE');
              (e.target as HTMLButtonElement).textContent = `Document lang: ${root.getAttribute('lang') || 'none'}`;
            }}
          >
            Document lang: ${document.documentElement.getAttribute('lang') || 'none'}
          </button>
          <span class="text-sm muted">Player fallback language: <code>${args.language}</code></span>
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

    const shownItem = (title: string) =>
      canvasElement
        .querySelector('test-container')
        ?.shadowRoot?.querySelector(`qti-assessment-item[data-title="${title}"]`);

    const readItem = async (title: string, itemId: string) => {
      // Linking to the item already on screen re-renders it, which stops a player mid-sentence:
      // remember what is shown now, so the wait below only accepts the freshly rendered item.
      const before = shownItem(title);
      (await canvas.findByText(EXAMPLES.find(e => e.id === itemId)!.label)).click();
      // navigate="item" loads the target item asynchronously; wait until it is the one in the container
      await waitFor(() => {
        const item = shownItem(title);
        expect(item).toBeTruthy();
        expect(item).not.toBe(before);
      });
      // One player for the whole test, in the light DOM toolbar — not inside any item-ref.
      const player = canvasElement.querySelector<TestItemToSpeech>('test-item-to-speech')!;
      expect(player.closest('qti-assessment-item-ref')).toBeNull();
      await playUntilSpoken(() => player, spokenLangs);
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

      // 4. Link to the item just read: it re-renders without the cursor moving. The toolbar player
      // stays, so it has to drop the detached elements it collected rather than go silent.
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
 * The player renders where the `<template item-ref>` puts it: a toolbar above each item. That
 * also works on a section page showing several items at once — every player reads its own item;
 * starting one player stops any other.
 *
 * The template renders inside `<test-container>`'s shadow root, where page CSS does not reach;
 * the player lays out and paints itself, so only the row around it needs an inline style.
 * `{{ item.index }}` is the item's number in the test, from the computed context.
 */
export const OnEveryItem: Story = {
  render: () =>
    html` <qti-test navigate="item">
      <template item-ref>
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-block-end: 0.75rem">
          <template type="if" if="{{ item.index }}">
            <strong>{{ item.index }}.</strong>
          </template>
          <test-item-to-speech>
            <test-tts-play></test-tts-play>
            <test-tts-pick></test-tts-pick>
            <test-tts-prev></test-tts-prev>
            <test-tts-next></test-tts-next>
            <test-tts-stop></test-tts-stop>
          </test-item-to-speech>
        </div>
        {{ xmlDoc }}
      </template>
      <test-navigation class="stack">
        <test-section-buttons-stamp class="row">
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
      expect(player?.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    };

    const [firstItem] = await getAssessmentItemsFromTestContainer(canvasElement);
    expectToolbarAboveItem(firstItem);

    // Item-ref mode: section "basic" shows four items on one page, each with its own player.
    // Every player reads its own item — not the navigated one, and not its neighbour's.
    const spokenTexts: string[] = [];
    const speak = spyOn(speechSynthesis, 'speak').mockImplementation((utterance: SpeechSynthesisUtterance) => {
      spokenTexts.push(utterance.text);
      setTimeout(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent), 0);
    });
    const cancel = spyOn(speechSynthesis, 'cancel').mockImplementation(() => {});
    try {
      await fireEvent.click(await canvas.findByShadowText('basic'));
      await waitFor(() => expect(playerFor(canvasElement, 'ITM-extended_text')).toBeTruthy());

      const readBy = async (itemId: string) => {
        await playUntilSpoken(() => playerFor(canvasElement, itemId), spokenTexts);
        const itemText = playerFor(canvasElement, itemId)!
          .closest('qti-assessment-item-ref')!
          .querySelector('qti-item-body')!.textContent!;
        for (const text of spokenTexts) expect(itemText).toContain(text.trim());
        return spokenTexts.slice();
      };
      const textEntry = await readBy('ITM-text_entry');
      const choice = await readBy('ITM-choice');
      expect(choice).not.toEqual(textEntry);
    } finally {
      speak.mockRestore();
      cancel.mockRestore();
    }

    await fireEvent.click(await canvas.findByShadowText('info-end'));
    const lastItem = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info End');
    expectToolbarAboveItem(lastItem);
  }
};

const STIMULUS_TEST_URL = '/assets/qti-test-package-stimulus/assessment.xml';

/** The stimulus player: next to the placeholder in the panel, not inside any item-ref. */
const stimulusPlayerOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<TestItemToSpeech>('[data-stimulus-panel] > test-item-to-speech');

const stimulusBodyOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-stimulus-panel] > [data-stimulus-idref] qti-stimulus-body');

/**
 * A reading text shared by several questions, shown once in a panel beside them — the layout a
 * section page with a stimulus typically has. The panel holds a player next to the stimulus
 * placeholder, and every item gets its own player through the `<template item-ref>`.
 *
 * Next to a `[data-stimulus-idref]` placeholder (same parent) the player reads that stimulus,
 * and only that; the item players read only their own item. When the stimulus is reloaded, or a
 * host swaps the content, the stimulus player starts over on the new text.
 *
 * The player sits beside the placeholder, not in it: loading a stimulus replaces the
 * placeholder's content. Items in this package declare `<qti-assessment-stimulus-ref>` without
 * a placeholder of their own, so `<qti-test>` puts the stimulus in the panel.
 */
export const SharedStimulus: Story = {
  render: () =>
    html` <qti-test navigate="item">
      <template item-ref>
        <div style="margin-block-end: 0.75rem">
          <test-item-to-speech>
            <test-tts-play></test-tts-play>
            <test-tts-stop></test-tts-stop>
          </test-item-to-speech>
        </div>
        {{ xmlDoc }}
      </template>
      <test-navigation class="stack">
        <test-section-buttons-stamp class="row">
          <template>
            <test-section-link section-id="{{ item.identifier }}"> {{ item.identifier }} </test-section-link>
          </template>
        </test-section-buttons-stamp>
        <div class="row" style="align-items: flex-start">
          <aside data-stimulus-panel style="flex: 1; min-width: 0">
            <test-item-to-speech>
              <test-tts-play></test-tts-play>
              <test-tts-pick></test-tts-pick>
              <test-tts-prev></test-tts-prev>
              <test-tts-next></test-tts-next>
              <test-tts-stop></test-tts-stop>
            </test-item-to-speech>
            <div data-stimulus-idref="Stimulus1"></div>
          </aside>
          <test-container style="flex: 1; min-width: 0" test-url=${STIMULUS_TEST_URL}></test-container>
        </div>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const canvas = shadowWithin(canvasElement);

    const spokenTexts: string[] = [];
    const spokenLangs: string[] = [];
    const speak = spyOn(speechSynthesis, 'speak').mockImplementation((utterance: SpeechSynthesisUtterance) => {
      spokenTexts.push(utterance.text.trim());
      spokenLangs.push(utterance.lang);
      setTimeout(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent), 0);
    });
    const cancel = spyOn(speechSynthesis, 'cancel').mockImplementation(() => {});
    try {
      await getAssessmentItemsFromTestContainer(canvasElement);
      // Section "basic" shows four items; three of them reference Stimulus1.
      await fireEvent.click(await canvas.findByShadowText('basic'));
      await waitFor(() => expect(stimulusBodyOf(canvasElement)?.textContent).toContain('An Unbelievable Night'), {
        timeout: 5000
      });
      await waitFor(() => expect(playerFor(canvasElement, 'ITM-choice')).toBeTruthy());

      // 1. The panel player reads the stimulus, and nothing from the items beside it.
      const stimulusPlayer = stimulusPlayerOf(canvasElement)!;
      expect(stimulusPlayer.closest('qti-assessment-item-ref')).toBeNull();
      await playUntilSpoken(() => stimulusPlayerOf(canvasElement), spokenTexts);
      const stimulusText = stimulusBodyOf(canvasElement)!.textContent!;
      expect(spokenTexts[0]).toBe('An Unbelievable Night');
      for (const text of spokenTexts) expect(stimulusText).toContain(text);
      expect(spokenTexts).not.toContain('What does it say?');
      // The stimulus' own xml:lang applies: <qti-assessment-stimulus> is placed along with its body.
      expect(new Set(spokenLangs)).toEqual(new Set(['eng']));

      // 2. An item player reads its own item, and not the stimulus.
      await playUntilSpoken(() => playerFor(canvasElement, 'ITM-choice'), spokenTexts);
      expect(spokenTexts).toContain('What does it say?');
      expect(spokenTexts).not.toContain('An Unbelievable Night');

      // 3. The stimulus content is replaced (a reload, or a host swapping it): the player drops
      // what it collected and reads the new text from the top, not the detached old one.
      const placeholder = canvasElement.querySelector('[data-stimulus-panel] > [data-stimulus-idref]')!;
      placeholder.innerHTML =
        '<qti-stimulus-body><h2>A second text</h2><p>Only this is read now.</p></qti-stimulus-body>';
      await playUntilSpoken(() => stimulusPlayerOf(canvasElement), spokenTexts);
      expect(spokenTexts).toEqual(['A second text', 'Only this is read now.']);
    } finally {
      speak.mockRestore();
      cancel.mockRestore();
    }
  }
};

/**
 * Plain HTML, not QTI: for instance a start screen that a React app renders before the test.
 * Mark one container with `data-tts-content` and put the player next to it (same parent); the
 * player reads the readable elements inside, the same way it reads an item body. No `<qti-test>`
 * is needed.
 *
 * Hidden content (`display: none`) and content inside `aria-hidden="true"` are skipped. There is
 * no observer: text changed inside an element is read as it is when that element is spoken, and
 * the list of elements is rebuilt when the player starts from the top — so a re-render of the
 * content never interrupts speech.
 */
export const HtmlContent: Story = {
  render: () =>
    html` <div class="stack" style="max-width: 40rem">
      <test-item-to-speech>
        <test-tts-play></test-tts-play>
        <test-tts-pick></test-tts-pick>
        <test-tts-prev></test-tts-prev>
        <test-tts-next></test-tts-next>
        <test-tts-stop></test-tts-stop>
      </test-item-to-speech>
      <section data-tts-content lang="nl-NL">
        <h2>Overzicht toets</h2>
        <dl>
          <dt>Naam toets</dt>
          <dd data-testid="name">De bloedsomloop</dd>
          <dt>Aantal vragen</dt>
          <dd>22</dd>
        </dl>
        <p data-testid="intro">De toets bestaat uit 22 vragen.</p>
        <table>
          <caption>
            Hulpmiddelen
          </caption>
          <tr>
            <th>Zoomen</th>
            <td>Gebruik de plus- en minknop.</td>
          </tr>
        </table>
        <ul>
          <li><span aria-hidden="true">🔍</span> Zoom in op de tekst.</li>
        </ul>
        <p aria-hidden="true">Alleen decoratie.</p>
        <p style="display: none">Verborgen tekst.</p>
      </section>
    </div>`,
  play: async ({ canvasElement }) => {
    const spoken: string[] = [];
    const langs = new Set<string>();
    const speak = spyOn(speechSynthesis, 'speak').mockImplementation((utterance: SpeechSynthesisUtterance) => {
      spoken.push(utterance.text.trim().replace(/\s+/g, ' '));
      langs.add(utterance.lang);
      setTimeout(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent), 0);
    });
    const cancel = spyOn(speechSynthesis, 'cancel').mockImplementation(() => {});
    const player = () => canvasElement.querySelector<TestItemToSpeech>('test-item-to-speech');
    const content = canvasElement.querySelector('[data-tts-content]')!;
    try {
      // 1. Every readable element inside the marked container, in order and in its language;
      // the hidden paragraph and the aria-hidden one are not read.
      await playUntilSpoken(player, spoken);
      expect(spoken).toEqual([
        'Overzicht toets',
        'Naam toets',
        'De bloedsomloop',
        'Aantal vragen',
        '22',
        'De toets bestaat uit 22 vragen.',
        'Hulpmiddelen',
        'Zoomen',
        'Gebruik de plus- en minknop.',
        'Zoom in op de tekst.'
      ]);
      expect([...langs]).toEqual(['nl-NL']);

      // 2. A framework re-render: text changed inside an element, an element replaced and one
      // added. The next play from the top reads the page as it is now.
      content.querySelector('[data-testid="name"]')!.textContent = 'Fotosynthese';
      const intro = content.querySelector('[data-testid="intro"]')!;
      const replacement = document.createElement('p');
      replacement.textContent = 'De toets bestaat uit 16 vragen.';
      intro.replaceWith(replacement);
      const code = document.createElement('p');
      code.textContent = 'Herstelcode: BLOED';
      content.append(code);

      await playUntilSpoken(player, spoken);
      expect(spoken).toContain('Fotosynthese');
      expect(spoken).toContain('De toets bestaat uit 16 vragen.');
      expect(spoken).not.toContain('De toets bestaat uit 22 vragen.');
      expect(spoken.at(-1)).toBe('Herstelcode: BLOED');

      // 3. Only an addition, nothing removed: no element in the list has left the page, so it is
      // the play from the top that picks it up.
      const note = document.createElement('p');
      note.textContent = 'Succes!';
      content.append(note);
      await playUntilSpoken(player, spoken);
      expect(spoken.at(-1)).toBe('Succes!');

      // 4. Resuming in the middle after a re-render: "next" leaves the player on an element, the
      // content is rebuilt underneath, then play. The remembered elements are gone from the page,
      // so the player starts over on the new content instead of reading a detached element.
      player()!.querySelector('test-tts-next')!.shadowRoot!.querySelector('button')!.click();
      content.innerHTML = '<h2>Nieuwe pagina</h2><p>Alles is opnieuw getekend.</p>';
      await playUntilSpoken(player, spoken);
      expect(spoken).toEqual(['Nieuwe pagina', 'Alles is opnieuw getekend.']);
    } finally {
      speak.mockRestore();
      cancel.mockRestore();
    }
  }
};

/** Shared by `SkipsHiddenContent` and its manual twin. */
const skipsHiddenContentRender = () => html`
  <qti-test navigate="item">
    <template item-ref>
      <test-item-to-speech>
        <test-tts-play></test-tts-play>
        <test-tts-stop></test-tts-stop>
        <test-tts-pick></test-tts-pick>
      </test-item-to-speech>
      {{ xmlDoc }}
    </template>
    <test-navigation class="stack">
      <div class="row">
        <test-item-link item-id="ITM-tts-hidden-content">Hidden content example</test-item-link>
        <test-view-toggle role="switch">
          <template> {{ view === 'scorer' ? 'Scorer view' : 'Candidate view' }} </template>
        </test-view-toggle>
        <test-check-item>Check answer</test-check-item>
      </div>
      <test-container test-url=${TEST_URL}></test-container>
    </test-navigation>
  </qti-test>
`;

/**
 * The player only reads what is actually rendered. Content that is present in the DOM but
 * `display: none` — a scorer-only `<qti-rubric-block view="scorer">` before the view switches,
 * answer feedback before the response is checked — is skipped, both for playback and for pick
 * mode. Once the content is shown (view switched, answer checked), it is included on the next
 * play without needing to reload the item: the candidate set is cached, but visibility is
 * re-checked live.
 *
 * The play function mocks `speechSynthesis`; use `SkipsHiddenContentManual` to try it with real
 * speech.
 */
export const SkipsHiddenContent: Story = {
  render: () => skipsHiddenContentRender(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ITEM_ID = 'ITM-tts-hidden-content';

    const spokenTexts: string[] = [];
    const speak = spyOn(speechSynthesis, 'speak').mockImplementation((utterance: SpeechSynthesisUtterance) => {
      spokenTexts.push(utterance.text);
      setTimeout(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent), 0);
    });
    const cancel = spyOn(speechSynthesis, 'cancel').mockImplementation(() => {});

    const play = () => playUntilSpoken(() => playerFor(canvasElement, ITEM_ID), spokenTexts);

    try {
      await getAssessmentItemsFromTestContainer(canvasElement);
      (await canvas.findByText('Hidden content example')).click();
      const item = await waitFor(async () => {
        const found = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'TTS: hidden content');
        expect(found).toBeTruthy();
        return found!;
      });

      // 1. Scorer rubric and answer feedback are in the DOM already, but hidden: the rubric
      // block itself is `[view]:not(.show)` (display: none), and the feedback block's shadow
      // root un-slots the hidden variant. Either way, the actual reading candidate (the inner
      // `<p>`) is not rendered — asserted the same way the player itself checks, since jest-dom's
      // `toBeVisible` does not follow slot assignment across the feedback block's shadow root.
      const rubricText = item.querySelector('qti-rubric-block[view="scorer"] p')!;
      const correctFeedbackText = item.querySelector('qti-feedback-block[identifier="correct"] p')!;
      expect(rubricText.checkVisibility()).toBe(false);
      expect(correctFeedbackText.checkVisibility()).toBe(false);

      await play();
      expect(spokenTexts).toEqual(['Read this line first.', 'What is the capital of France?', 'Paris', 'Lyon']);

      // 2. Switch to scorer view — the rubric block becomes visible.
      const viewSwitch = await canvas.findByRole('switch');
      await fireEvent.click(viewSwitch);
      await waitFor(() => expect(rubricText.checkVisibility()).toBe(true));

      // 3. Answer correctly and check — response processing sets FEEDBACK, revealing the
      // matching feedback block; the non-matching one stays hidden.
      const choiceA = item.querySelector('qti-simple-choice[identifier="ChoiceA"]')!;
      await fireEvent.click(choiceA);
      const checkButton = canvasElement.querySelector('test-check-item')!;
      await fireEvent.click(checkButton);
      await waitFor(() => expect(correctFeedbackText.checkVisibility()).toBe(true));
      expect(item.querySelector('qti-feedback-block[identifier="incorrect"] p')!.checkVisibility()).toBe(false);

      // 4. Play again from the top (a finished player restarts): both newly-visible elements are
      // now read, in document order, still skipping the still-hidden "incorrect" feedback.
      await play();
      expect(spokenTexts).toEqual([
        'Read this line first.',
        'Scorer note: accept only the capital of France.',
        'What is the capital of France?',
        'Paris',
        'Lyon',
        'Feedback: that is correct.'
      ]);

      // 5. Pick mode only offers the elements that were actually spoken above — never the
      // still-hidden "incorrect" feedback.
      expect(playerFor(canvasElement, ITEM_ID)!['_ttsContext'].elementCount).toBe(spokenTexts.length);

      // 6. Navigating to the item already shown re-renders it: the player must drop the
      // now-detached elements it collected, not go silent on them.
      (await canvas.findByText('Hidden content example')).click();
      await waitFor(() => expect(item.isConnected).toBe(false));
      await play();
      expect(spokenTexts[0]).toBe('Read this line first.');
    } finally {
      speak.mockRestore();
      cancel.mockRestore();
    }
  }
};

/**
 * Same setup as `SkipsHiddenContent`, without a play function and with real speech, for trying
 * it by hand: open "Hidden content example", press play (scorer note and feedback are skipped),
 * switch to scorer view and check the answer, then press play again.
 */
export const SkipsHiddenContentManual: Story = {
  render: () => skipsHiddenContentRender()
};

/** Outline icons standing in for a host's own icon set (Lucide, Font Awesome, a brand set, …). */
const ownIcon = (slot: string | undefined, d: string) =>
  unsafeStatic(
    `<svg ${slot ? `slot="${slot}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"` +
      ` stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"></path></svg>`
  );

/**
 * Each control takes its content from its slot, so a host can use its own icon set. The default
 * icon is replaced along with its built-in English name, and an icon has no text to name the
 * button by, so give every control a `label` (and `<test-tts-play>` a `pause-label` too). A
 * slotted `<svg>` is sized like the default icon; `--test-tts-icon-size` resizes both.
 */
export const WithOwnIcons: Story = {
  render: () => staticHtml`
    <qti-test navigate="item">
      <template item-ref>
        <test-item-to-speech>
          <test-tts-prev label="Vorige zin">${ownIcon(undefined, 'M18 6v12L9 12zM6 6v12')}</test-tts-prev>
          <test-tts-play label="Voorlezen" pause-label="Pauzeren">
            ${ownIcon('play', 'M7 4.5v15l12-7.5z')} ${ownIcon('pause', 'M8 5v14M16 5v14')}
          </test-tts-play>
          <test-tts-next label="Volgende zin">${ownIcon(undefined, 'M6 6v12l9-6zM18 6v12')}</test-tts-next>
          <test-tts-stop label="Stoppen"
            >${ownIcon(
              undefined,
              'M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z'
            )}</test-tts-stop
          >
          <test-tts-pick label="Voorlezen vanaf hier">${ownIcon(undefined, 'M4 4l6 16 2.5-6.5L19 11z')}</test-tts-pick>
        </test-item-to-speech>
        {{ xmlDoc }}
      </template>
      <test-navigation class="stack">
        <test-container test-url=${TEST_URL}></test-container>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const button = (tag: string) =>
      canvasElement
        .querySelector('test-container')
        ?.shadowRoot?.querySelector(tag)
        ?.shadowRoot?.querySelector<HTMLButtonElement>('button[part="button"]') ?? null;

    await waitFor(() => expect(button('test-tts-play')).toBeTruthy());

    // Every control is named by its label, since the slotted icons carry no text.
    expect(button('test-tts-prev')!.getAttribute('aria-label')).toBe('Vorige zin');
    expect(button('test-tts-play')!.getAttribute('aria-label')).toBe('Voorlezen');
    expect(button('test-tts-next')!.getAttribute('aria-label')).toBe('Volgende zin');
    expect(button('test-tts-stop')!.getAttribute('aria-label')).toBe('Stoppen');
    expect(button('test-tts-pick')!.getAttribute('aria-label')).toBe('Voorlezen vanaf hier');

    // A slotted icon gets the default icon's size.
    const icon = canvasElement
      .querySelector('test-container')!
      .shadowRoot!.querySelector('test-tts-stop svg')!
      .getBoundingClientRect();
    expect(icon.width).toBeCloseTo(18, 0);
    expect(icon.height).toBeCloseTo(18, 0);
  }
};
