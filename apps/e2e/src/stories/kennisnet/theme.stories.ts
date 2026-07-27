import { html, nothing, render } from 'lit';

import { qtiBaseElements } from '@qti-components/base/elements';
import { qtiContentElements } from '@qti-components/elements/elements';
import { qtiInteractionElements } from '@qti-components/interactions/elements';
import { qtiItemElements } from '@qti-components/item/elements';
import { qtiProcessingElements } from '@qti-components/processing/elements';
import { qtiCorrectionElements } from '@qti-components/qti-corrections/elements';
import { qtiTestElements } from '@qti-components/test/elements';

import itemCss from '../../../../../packages/qti-theme/src/item.css?inline';
import kennisnetCss from './kennisnet.css?inline';

import type { Decorator, Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The theme bench — every interaction the theme paints, on one page, in a grid.
 *
 * This is the sibling of kennisnet.stories.ts. That file is the *item* suite: seventeen realistic
 * exam items, each its own story, each screenshotted by VRT. This one is the *theme* suite: the same
 * components stripped of their exam dressing and laid out as a dense grid of small labelled cards,
 * so a change to a `--qti-*` token can be judged against everything it touches at once.
 *
 * Two consequences of that difference are deliberate:
 *
 *   - Decorative item imagery is gone. Photographs of atoms and world maps tell you nothing about a
 *     border radius; they only make the cards tall. Images survive here ONLY where they are
 *     functionally part of the interaction — a hotspot backdrop, a gap-img tile, a match image.
 *   - Every interaction appears in its RESTING state first, and in correction state second. The item
 *     suite is entirely `show-candidate-correction` + `show-full-correct-response`, which meant the
 *     ordinary unanswered/answered paint — the state a candidate actually spends the whole exam
 *     looking at — was not represented anywhere. Cards labelled `normal` carry a `response` so a
 *     selection is visible; cards labelled `correction` carry the correction attributes.
 *
 * Not covered, and why: qti-portable-custom-interaction and qti-custom-interaction need a runtime
 * host script, and qti-position-object-interaction needs a stage plus object children. None of the
 * three has theme surface of its own beyond what the other cards already show.
 */

const correctionRegistry = (() => {
  const registry = new CustomElementRegistry();
  const overrides = new Map<string, CustomElementConstructor>(
    qtiCorrectionElements.map(({ tag, ctor }) => [tag, ctor])
  );
  const everyElement = [
    ...qtiBaseElements,
    ...qtiProcessingElements,
    ...qtiContentElements,
    ...qtiItemElements,
    ...qtiTestElements,
    ...qtiInteractionElements,
    ...qtiCorrectionElements
  ];
  for (const { tag, ctor } of everyElement) {
    if (!registry.get(tag)) registry.define(tag, overrides.get(tag) ?? ctor);
  }
  return registry;
})();

/**
 * The bench chrome — grid, cards, labels.
 *
 * Deliberately NOT built from `--qti-*` tokens. This is the frame around the specimens, and a frame
 * that re-themes itself alongside them makes it impossible to tell which border you just changed.
 * The one exception would be tempting and wrong: using --qti-gap for the grid gap would make the
 * whole page reflow every time you nudge the spacing unit.
 *
 * `.tc-b { overflow-x: auto }` rather than `img { max-width: 100% }`: the graphic interactions map
 * hotspot coordinates onto their backdrop at natural size, so scaling those images would silently
 * put every hotspot in the wrong place. Wide specimens scroll inside their own card instead.
 */
const benchCss = `
  .tp {
    box-sizing: border-box;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    font-family: system-ui, -apple-system, sans-serif;
    color: #0f172a;
  }
  .ts-h {
    margin: 0 0 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #64748b;
  }
  .tg {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
    align-items: start;
  }
  .tc {
    margin: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
  }
  .tc-h {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .tc-t { font-size: 0.75rem; font-weight: 600; }
  .tc-n {
    font-size: 0.6875rem;
    color: #64748b;
    font-family: ui-monospace, SFMono-Regular, monospace;
    white-space: nowrap;
  }
  .tc-b { padding: 1rem; min-width: 0; overflow-x: auto; }
  .tc--wide { grid-column: span 2; }
  .tc--full { grid-column: 1 / -1; }
  @media (max-width: 780px) {
    .tc--wide, .tc--full { grid-column: span 1; }
  }
`;

const itemSheet = new CSSStyleSheet();
itemSheet.replaceSync(itemCss);
const kennisnetSheet = new CSSStyleSheet();
kennisnetSheet.replaceSync(kennisnetCss);
const benchSheet = new CSSStyleSheet();
benchSheet.replaceSync(benchCss);

/**
 * Same scoped-registry trick as kennisnet.stories.ts: serialize the lit template to a string and
 * assign it via innerHTML, so the browser upgrades the custom elements against the scoped registry
 * (lit's `render()` binds to the global registry at creation time and would ignore the mapping).
 */
const withThemeBench: Decorator = story => {
  const scratch = document.createElement('div');
  render(story() as Parameters<typeof render>[0], scratch);
  const markup = scratch.innerHTML;
  render(nothing, scratch);

  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open', customElementRegistry: correctionRegistry });
  shadow.adoptedStyleSheets = [itemSheet, kennisnetSheet, benchSheet];

  // The wrapping <div> matters: `show-full-correct-response` inserts its clone through
  // `interaction.parentElement`, which is null for a direct child of a shadow root.
  shadow.innerHTML = `<div>${markup}</div>`;

  return host;
};

const meta: Meta = {
  title: 'Theme',
  tags: ['autodocs', 'no-tests'],
  decorators: [withThemeBench],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'themeBench',
      options: {
        themeBench: {
          name: 'Theme bench',
          styles: { width: '1600px', height: '1200px' }
        }
      }
    }
  }
};

export default meta;

type Story = StoryObj;

/* ── Bench helpers ───────────────────────────────────────────────────────────────────────────── */

type CardOptions = { note?: string; width?: 'wide' | 'full' };

const card = (label: string, body: unknown, { note, width }: CardOptions = {}) => html`
  <figure class="tc ${width ? `tc--${width}` : ''}">
    <figcaption class="tc-h">
      <span class="tc-t">${label}</span>
      ${note ? html`<span class="tc-n">${note}</span>` : nothing}
    </figcaption>
    <div class="tc-b">${body}</div>
  </figure>
`;

const section = (title: string, cards: unknown[]) => html`
  <section class="ts">
    <h2 class="ts-h">${title}</h2>
    <div class="tg">${cards}</div>
  </section>
`;

const page = (...sections: unknown[]) => html`<div class="tp">${sections}</div>`;

/* ── Choice ──────────────────────────────────────────────────────────────────────────────────── */

const choiceCards = [
  card(
    'Choice — single, answered',
    html`
      <qti-choice-interaction response-identifier="RESPONSE" min-choices="1" max-choices="1" response="choice3">
        <qti-prompt>Welk element heeft de hoogste atoommassa?</qti-prompt>
        <qti-simple-choice identifier="choice1">Tin (Sn)</qti-simple-choice>
        <qti-simple-choice identifier="choice2">Jodium (I)</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Xenon (Xe)</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: 'normal · radio' }
  ),
  card(
    'Choice — single, unanswered',
    html`
      <qti-choice-interaction response-identifier="RESPONSE" min-choices="1" max-choices="1">
        <qti-prompt>Welk element heeft de hoogste atoommassa?</qti-prompt>
        <qti-simple-choice identifier="choice1">Tin (Sn)</qti-simple-choice>
        <qti-simple-choice identifier="choice2">Jodium (I)</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Xenon (Xe)</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: 'normal · resting' }
  ),
  card(
    'Choice — multiple, answered',
    html`
      <qti-choice-interaction response-identifier="RESPONSE" min-choices="0" max-choices="0" response="choice1,choice4">
        <qti-prompt>Welke landen zijn volledig door één ander land ingesloten?</qti-prompt>
        <qti-simple-choice identifier="choice1">Lesotho</qti-simple-choice>
        <qti-simple-choice identifier="choice2">San Marino</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Bolivia</qti-simple-choice>
        <qti-simple-choice identifier="choice4">Vaticaanstad</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: 'normal · checkbox' }
  ),
  card(
    'Choice — control hidden, answered',
    html`
      <qti-choice-interaction
        response-identifier="RESPONSE"
        class="qti-input-control-hidden"
        min-choices="1"
        max-choices="1"
        response="choice2"
      >
        <qti-prompt>Welk element heeft de hoogste atoommassa?</qti-prompt>
        <qti-simple-choice identifier="choice1">Tin (Sn)</qti-simple-choice>
        <qti-simple-choice identifier="choice2">Jodium (I)</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Xenon (Xe)</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: '.qti-input-control-hidden' }
  ),
  card(
    'Choice — control hidden, unanswered',
    html`
      <qti-choice-interaction
        response-identifier="RESPONSE"
        class="qti-input-control-hidden"
        min-choices="1"
        max-choices="1"
      >
        <qti-prompt>Welk element heeft de hoogste atoommassa?</qti-prompt>
        <qti-simple-choice identifier="choice1">Tin (Sn)</qti-simple-choice>
        <qti-simple-choice identifier="choice2">Jodium (I)</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Xenon (Xe)</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: '.qti-input-control-hidden' }
  ),
  card(
    'Choice — control hidden, multiple',
    html`
      <qti-choice-interaction
        response-identifier="RESPONSE"
        class="qti-input-control-hidden"
        min-choices="0"
        max-choices="0"
        response="choice1,choice4"
      >
        <qti-prompt>Welke landen zijn volledig ingesloten?</qti-prompt>
        <qti-simple-choice identifier="choice1">Lesotho</qti-simple-choice>
        <qti-simple-choice identifier="choice2">San Marino</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Bolivia</qti-simple-choice>
        <qti-simple-choice identifier="choice4">Vaticaanstad</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: '.qti-input-control-hidden' }
  ),
  card(
    'Choice — correction',
    html`
      <qti-choice-interaction
        response-identifier="RESPONSE"
        min-choices="1"
        max-choices="1"
        response="choice1"
        correct-response="choice3"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Welk element heeft de hoogste atoommassa?</qti-prompt>
        <qti-simple-choice identifier="choice1">Tin (Sn)</qti-simple-choice>
        <qti-simple-choice identifier="choice2">Jodium (I)</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Xenon (Xe)</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: 'correction' }
  ),
  card(
    'Choice — correction, control hidden',
    html`
      <qti-choice-interaction
        response-identifier="RESPONSE"
        class="qti-input-control-hidden"
        min-choices="0"
        max-choices="0"
        response="choice1,choice3"
        correct-response="choice1,choice2,choice4"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Welke landen zijn volledig ingesloten?</qti-prompt>
        <qti-simple-choice identifier="choice1">Lesotho</qti-simple-choice>
        <qti-simple-choice identifier="choice2">San Marino</qti-simple-choice>
        <qti-simple-choice identifier="choice3">Bolivia</qti-simple-choice>
        <qti-simple-choice identifier="choice4">Vaticaanstad</qti-simple-choice>
      </qti-choice-interaction>
    `,
    { note: 'correction' }
  )
];

/* ── Text ────────────────────────────────────────────────────────────────────────────────────── */

const textCards = [
  card(
    'Text entry — answered',
    html`
      <p>
        Het verschijnsel heet
        <qti-text-entry-interaction
          response-identifier="RESPONSE"
          expected-length="20"
          response="refractie"
        ></qti-text-entry-interaction
        >.
      </p>
    `,
    { note: 'normal' }
  ),
  card(
    'Text entry — empty',
    html`
      <p>
        Het verschijnsel heet
        <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="20"></qti-text-entry-interaction>.
      </p>
    `,
    { note: 'normal · resting' }
  ),
  card(
    'Text entry — correction',
    html`
      <p>
        Het verschijnsel heet
        <qti-text-entry-interaction
          response-identifier="RESPONSE"
          expected-length="20"
          response="reflectie"
          correct-response="refractie"
          show-candidate-correction
          show-full-correct-response
        ></qti-text-entry-interaction
        >.
      </p>
    `,
    { note: 'correction' }
  ),
  card(
    'Extended text — answered',
    html`
      <qti-extended-text-interaction
        response-identifier="RESPONSE"
        expected-lines="4"
        response="Een mix van bronnen is betrouwbaarder omdat zon en wind elkaar aanvullen."
      >
        <qti-prompt>Leg uit waarom landen overstappen op een energiemix.</qti-prompt>
      </qti-extended-text-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Extended text — empty',
    html`
      <qti-extended-text-interaction response-identifier="RESPONSE" expected-lines="4">
        <qti-prompt>Leg uit waarom landen overstappen op een energiemix.</qti-prompt>
      </qti-extended-text-interaction>
    `,
    { note: 'normal · resting' }
  ),
  /*
   * Extended text is judged from OUTSIDE — free prose has no correct answer to compare against, so
   * unlike every other interaction it computes no verdict and `show-candidate-correction` does
   * nothing here. A grader hands it one through `candidate-correction`, and the states, badge and
   * tint follow from that.
   */
  card(
    'Extended text — correct',
    html`
      <qti-extended-text-interaction response-identifier="RESPONSE" expected-lines="4" candidate-correction="correct">
        <qti-prompt>Leg uit waarom landen overstappen op een energiemix.</qti-prompt>
      </qti-extended-text-interaction>
    `,
    { note: 'correction · set by the grader' }
  ),
  card(
    'Extended text — partially correct',
    html`
      <qti-extended-text-interaction
        response-identifier="RESPONSE"
        expected-lines="4"
        candidate-correction="partially-correct"
      >
        <qti-prompt>Leg uit waarom landen overstappen op een energiemix.</qti-prompt>
      </qti-extended-text-interaction>
    `,
    { note: 'correction · amber edge, normal text' }
  ),
  card(
    'Extended text — incorrect',
    html`
      <qti-extended-text-interaction response-identifier="RESPONSE" expected-lines="4" candidate-correction="incorrect">
        <qti-prompt>Leg uit waarom landen overstappen op een energiemix.</qti-prompt>
      </qti-extended-text-interaction>
    `,
    { note: 'correction' }
  ),
  card(
    'Upload',
    html`
      <qti-upload-interaction response-identifier="RESPONSE">
        <qti-prompt>Upload je uitwerking als PDF.</qti-prompt>
      </qti-upload-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'End attempt',
    html`<qti-end-attempt-interaction response-identifier="RESPONSE" title="Nakijken"></qti-end-attempt-interaction>`,
    { note: 'normal' }
  )
];

/* ── Inline / in-text ────────────────────────────────────────────────────────────────────────── */

const inlineCards = [
  card(
    'Inline choice — answered',
    html`
      <p>
        Het waargenomen geluid wordt
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          shuffle="false"
          data-prompt="kies…"
          response="choice_hoger"
        >
          <qti-inline-choice identifier="choice_lager">lager</qti-inline-choice>
          <qti-inline-choice identifier="choice_hoger">hoger</qti-inline-choice>
          <qti-inline-choice identifier="choice_onveranderd">onveranderd</qti-inline-choice>
        </qti-inline-choice-interaction>
        wanneer de bron dichterbij komt.
      </p>
    `,
    { note: 'normal' }
  ),
  card(
    'Inline choice — unanswered',
    html`
      <p>
        Het waargenomen geluid wordt
        <qti-inline-choice-interaction response-identifier="RESPONSE" shuffle="false" data-prompt="kies…">
          <qti-inline-choice identifier="choice_lager">lager</qti-inline-choice>
          <qti-inline-choice identifier="choice_hoger">hoger</qti-inline-choice>
          <qti-inline-choice identifier="choice_onveranderd">onveranderd</qti-inline-choice>
        </qti-inline-choice-interaction>
        wanneer de bron dichterbij komt.
      </p>
    `,
    { note: 'normal · resting' }
  ),
  card(
    'Inline choice — correction',
    html`
      <p>
        Het waargenomen geluid wordt
        <qti-inline-choice-interaction
          response-identifier="RESPONSE"
          shuffle="false"
          data-prompt="kies…"
          response="choice_lager"
          correct-response="choice_hoger"
          show-candidate-correction
          show-full-correct-response
        >
          <qti-inline-choice identifier="choice_lager">lager</qti-inline-choice>
          <qti-inline-choice identifier="choice_hoger">hoger</qti-inline-choice>
          <qti-inline-choice identifier="choice_onveranderd">onveranderd</qti-inline-choice>
        </qti-inline-choice-interaction>
        wanneer de bron dichterbij komt.
      </p>
    `,
    { note: 'correction' }
  ),
  card(
    'Hottext — answered',
    html`
      <qti-hottext-interaction response-identifier="RESPONSE" max-choices="1" response="ht_door">
        <qti-prompt>Selecteer het woord dat oorzaak aanduidt.</qti-prompt>
        <div>
          De productiviteit <qti-hottext identifier="ht_daalde">daalde</qti-hottext> aanzienlijk
          <qti-hottext identifier="ht_door">door</qti-hottext> een
          <qti-hottext identifier="ht_tekort">tekort</qti-hottext> aan grondstoffen.
        </div>
      </qti-hottext-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Hottext — unanswered',
    html`
      <qti-hottext-interaction response-identifier="RESPONSE" max-choices="1">
        <qti-prompt>Selecteer het woord dat oorzaak aanduidt.</qti-prompt>
        <div>
          De productiviteit <qti-hottext identifier="ht_daalde">daalde</qti-hottext> aanzienlijk
          <qti-hottext identifier="ht_door">door</qti-hottext> een
          <qti-hottext identifier="ht_tekort">tekort</qti-hottext> aan grondstoffen.
        </div>
      </qti-hottext-interaction>
    `,
    { note: 'normal · resting' }
  ),
  card(
    'Hottext — unselected hidden',
    html`
      <qti-hottext-interaction
        response-identifier="RESPONSE"
        class="qti-unselected-hidden"
        max-choices="0"
        response="ht_onderzocht,ht_verving"
      >
        <qti-prompt>Selecteer alle werkwoorden.</qti-prompt>
        <div>
          De <qti-hottext identifier="ht_technicus">technicus</qti-hottext>
          <qti-hottext identifier="ht_onderzocht">onderzocht</qti-hottext> het
          <qti-hottext identifier="ht_apparaat">apparaat</qti-hottext> en
          <qti-hottext identifier="ht_verving">verving</qti-hottext> de
          <qti-hottext identifier="ht_sensor">sensor</qti-hottext>.
        </div>
      </qti-hottext-interaction>
    `,
    { note: '.qti-unselected-hidden' }
  ),
  card(
    'Hottext — correction',
    html`
      <qti-hottext-interaction
        response-identifier="RESPONSE"
        max-choices="1"
        response="ht_daalde"
        correct-response="ht_door"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Selecteer het woord dat oorzaak aanduidt.</qti-prompt>
        <div>
          De productiviteit <qti-hottext identifier="ht_daalde">daalde</qti-hottext> aanzienlijk
          <qti-hottext identifier="ht_door">door</qti-hottext> een
          <qti-hottext identifier="ht_tekort">tekort</qti-hottext> aan grondstoffen.
        </div>
      </qti-hottext-interaction>
    `,
    { note: 'correction' }
  ),
  card(
    'Gap match — answered',
    html`
      <qti-gap-match-interaction response-identifier="RESPONSE" response="ht_zuur gap_low,ht_basisch gap_high">
        <qti-gap-text identifier="ht_basisch" match-max="1">basisch</qti-gap-text>
        <qti-gap-text identifier="ht_zuur" match-max="1">zuur</qti-gap-text>
        <p>
          Een oplossing met een pH lager dan 7 noemen we <qti-gap identifier="gap_low"></qti-gap>, terwijl een oplossing
          met een pH hoger dan 7 <qti-gap identifier="gap_high"></qti-gap> is.
        </p>
      </qti-gap-match-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Gap match — unanswered',
    html`
      <qti-gap-match-interaction response-identifier="RESPONSE">
        <qti-gap-text identifier="ht_basisch" match-max="1">basisch</qti-gap-text>
        <qti-gap-text identifier="ht_zuur" match-max="1">zuur</qti-gap-text>
        <p>
          Een oplossing met een pH lager dan 7 noemen we <qti-gap identifier="gap_low"></qti-gap>, terwijl een oplossing
          met een pH hoger dan 7 <qti-gap identifier="gap_high"></qti-gap> is.
        </p>
      </qti-gap-match-interaction>
    `,
    { note: 'normal · resting' }
  ),
  card(
    'Gap match — correction',
    html`
      <qti-gap-match-interaction
        response-identifier="RESPONSE"
        response="ht_basisch gap_low,ht_zuur gap_high"
        correct-response="ht_zuur gap_low,ht_basisch gap_high"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-gap-text identifier="ht_basisch" match-max="1">basisch</qti-gap-text>
        <qti-gap-text identifier="ht_zuur" match-max="1">zuur</qti-gap-text>
        <p>
          Een oplossing met een pH lager dan 7 noemen we <qti-gap identifier="gap_low"></qti-gap>, terwijl een oplossing
          met een pH hoger dan 7 <qti-gap identifier="gap_high"></qti-gap> is.
        </p>
      </qti-gap-match-interaction>
    `,
    { note: 'correction' }
  )
];

/* ── Order & match (drag and drop) ───────────────────────────────────────────────────────────── */

const dragCards = [
  card(
    'Order — horizontal',
    html`
      <qti-order-interaction
        response-identifier="RESPONSE"
        shuffle="false"
        orientation="horizontal"
        response="step_hypothese,step_data,step_conclusies"
      >
        <qti-prompt>Zet de stappen in volgorde.</qti-prompt>
        <qti-simple-choice identifier="step_hypothese">Hypothese</qti-simple-choice>
        <qti-simple-choice identifier="step_data">Data</qti-simple-choice>
        <qti-simple-choice identifier="step_conclusies">Conclusies</qti-simple-choice>
      </qti-order-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Order — vertical',
    html`
      <qti-order-interaction
        response-identifier="RESPONSE"
        shuffle="false"
        orientation="vertical"
        response="num_1,num_sqrt2,num_pi"
      >
        <qti-prompt>Sorteer van klein naar groot.</qti-prompt>
        <qti-simple-choice identifier="num_sqrt2">√2 (≈ 1,414)</qti-simple-choice>
        <qti-simple-choice identifier="num_1">1</qti-simple-choice>
        <qti-simple-choice identifier="num_pi">π (≈ 3,14159)</qti-simple-choice>
      </qti-order-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Order — unanswered',
    html`
      <qti-order-interaction response-identifier="RESPONSE" shuffle="false" orientation="vertical">
        <qti-prompt>Sorteer van klein naar groot.</qti-prompt>
        <qti-simple-choice identifier="num_sqrt2">√2 (≈ 1,414)</qti-simple-choice>
        <qti-simple-choice identifier="num_1">1</qti-simple-choice>
        <qti-simple-choice identifier="num_pi">π (≈ 3,14159)</qti-simple-choice>
      </qti-order-interaction>
    `,
    { note: 'normal · resting' }
  ),
  card(
    'Order — correction',
    html`
      <qti-order-interaction
        response-identifier="RESPONSE"
        shuffle="false"
        orientation="vertical"
        response="num_sqrt2,num_1,num_pi"
        correct-response="num_1,num_sqrt2,num_pi"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Sorteer van klein naar groot.</qti-prompt>
        <qti-simple-choice identifier="num_sqrt2">√2 (≈ 1,414)</qti-simple-choice>
        <qti-simple-choice identifier="num_1">1</qti-simple-choice>
        <qti-simple-choice identifier="num_pi">π (≈ 3,14159)</qti-simple-choice>
      </qti-order-interaction>
    `,
    { note: 'correction' }
  ),
  card(
    'Match — options above',
    html`
      <qti-match-interaction response-identifier="RESPONSE" response="left_vermogen right_watt">
        <qti-prompt>Koppel het verschijnsel aan de eenheid.</qti-prompt>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="left_vermogen" match-max="1">Vermogen</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="left_druk" match-max="1">Druk</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="left_frequentie" match-max="1"
            >Frequentie</qti-simple-associable-choice
          >
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="right_watt" match-max="1">watt (W)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="right_pascal" match-max="1"
            >pascal (Pa)</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="right_hertz" match-max="1">hertz (Hz)</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>
    `,
    { note: 'normal', width: 'wide' }
  ),
  card(
    'Match — options right',
    html`
      <qti-match-interaction
        response-identifier="RESPONSE"
        class="qti-choices-right"
        response="left_harari right_sapiens"
      >
        <qti-prompt>Koppel de auteur aan het werk.</qti-prompt>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="left_diamond" match-max="1"
            >Jared Diamond</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="left_harari" match-max="1"
            >Yuval Noah Harari</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="left_arendt" match-max="1"
            >Hannah Arendt</qti-simple-associable-choice
          >
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="right_sapiens" match-max="1">Sapiens</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="right_ggs" match-max="1"
            >Guns, Germs and Steel</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="right_thc" match-max="1"
            >The Human Condition</qti-simple-associable-choice
          >
        </qti-simple-match-set>
      </qti-match-interaction>
    `,
    { note: '.qti-choices-right', width: 'wide' }
  ),
  card(
    'Match — many per category',
    html`
      <qti-match-interaction response-identifier="RESPONSE" response="enzym biologie,isotoop scheikunde">
        <qti-prompt>Sleep elk begrip naar het juiste vak.</qti-prompt>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="enzym" match-max="1">enzym</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="isotoop" match-max="1">isotoop</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="katalysator" match-max="1"
            >katalysator</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="molmassa" match-max="1">molmassa</qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="biologie" match-max="5">Biologie</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="scheikunde" match-max="5">Scheikunde</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>
    `,
    { note: 'normal', width: 'wide' }
  ),
  card(
    'Match — images',
    html`
      <qti-match-interaction response-identifier="RESPONSE" response="left_fiets right_spierkracht">
        <qti-prompt>Koppel vervoermiddel aan energiebron.</qti-prompt>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="left_auto" match-max="1">
            <img src="/assets/api/kennisnet/resources/vehicle-car.svg" alt="Auto" width="100" height="65" />
          </qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="left_fiets" match-max="1">
            <img src="/assets/api/kennisnet/resources/vehicle-bike.svg" alt="Fiets" width="100" height="75" />
          </qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="right_brandstof" match-max="1">
            <img src="/assets/api/kennisnet/resources/energy-fuel.svg" alt="Brandstof" width="70" height="90" />
          </qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="right_spierkracht" match-max="1">
            <img src="/assets/api/kennisnet/resources/energy-human.svg" alt="Spierkracht" width="70" height="90" />
          </qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>
    `,
    { note: 'normal', width: 'wide' }
  ),
  card(
    'Match — correction',
    html`
      <qti-match-interaction
        response-identifier="RESPONSE"
        response="left_vermogen right_pascal,left_frequentie right_hertz"
        correct-response="left_vermogen right_watt,left_druk right_pascal,left_frequentie right_hertz"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Koppel het verschijnsel aan de eenheid.</qti-prompt>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="left_vermogen" match-max="1">Vermogen</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="left_druk" match-max="1">Druk</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="left_frequentie" match-max="1"
            >Frequentie</qti-simple-associable-choice
          >
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="right_watt" match-max="1">watt (W)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="right_pascal" match-max="1"
            >pascal (Pa)</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="right_hertz" match-max="1">hertz (Hz)</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>
    `,
    { note: 'correction', width: 'wide' }
  ),
  card(
    'Match — tabular',
    html`
      <qti-match-interaction
        response-identifier="RESPONSE"
        class="qti-match-tabular"
        response="evenaar juist,helium juist,pluto onjuist"
      >
        <qti-prompt>Juist of onjuist?</qti-prompt>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="evenaar" match-max="1"
            >De evenaar loopt door drie continenten</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="helium" match-max="1"
            >Helium is lichter dan lucht</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="pluto" match-max="1"
            >Pluto is een planeet</qti-simple-associable-choice
          >
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="juist" match-max="3">Juist</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="onjuist" match-max="3">Onjuist</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>
    `,
    { note: '.qti-match-tabular', width: 'wide' }
  ),
  card(
    'Match — tabular, correction',
    html`
      <qti-match-interaction
        response-identifier="RESPONSE"
        class="qti-match-tabular"
        response="evenaar onjuist,helium onjuist,pluto juist"
        correct-response="evenaar juist,helium juist,pluto onjuist"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Juist of onjuist?</qti-prompt>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="evenaar" match-max="1"
            >De evenaar loopt door drie continenten</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="helium" match-max="1"
            >Helium is lichter dan lucht</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="pluto" match-max="1"
            >Pluto is een planeet</qti-simple-associable-choice
          >
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="juist" match-max="3">Juist</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="onjuist" match-max="3">Onjuist</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>
    `,
    { note: 'correction', width: 'wide' }
  ),
  card(
    'Associate',
    html`
      <qti-associate-interaction response-identifier="RESPONSE" max-associations="3" response="A P,C M">
        <qti-prompt>Combineer elke tegenspeler met zijn rivaal.</qti-prompt>
        <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="M" match-max="1">Montague</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
      </qti-associate-interaction>
    `,
    { note: 'normal', width: 'wide' }
  ),
  card(
    'Associate — correction',
    html`
      <qti-associate-interaction
        response-identifier="RESPONSE"
        max-associations="3"
        response="A M,C P,D L"
        correct-response="A P,C M,D L"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Combineer elke tegenspeler met zijn rivaal.</qti-prompt>
        <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="M" match-max="1">Montague</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
      </qti-associate-interaction>
    `,
    { note: 'correction', width: 'wide' }
  )
];

/* ── Graphic ─────────────────────────────────────────────────────────────────────────────────── */

const graphicCards = [
  card(
    'Hotspot',
    html`
      <qti-hotspot-interaction response-identifier="RESPONSE" max-choices="1" response="C">
        <qti-prompt>Klik op de meest zuidelijke luchthaven.</qti-prompt>
        <img src="/assets/qti-hotspot-interaction/uk.png" height="280" width="206" alt="Kaart van het VK" />
        <qti-hotspot-choice coords="77,115,10" identifier="A" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="118,184,10" identifier="B" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="150,235,10" identifier="C" shape="circle"></qti-hotspot-choice>
      </qti-hotspot-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Hotspot — correction',
    html`
      <qti-hotspot-interaction
        response-identifier="RESPONSE"
        max-choices="1"
        response="A"
        correct-response="C"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Klik op de meest zuidelijke luchthaven.</qti-prompt>
        <img src="/assets/qti-hotspot-interaction/uk.png" height="280" width="206" alt="Kaart van het VK" />
        <qti-hotspot-choice coords="77,115,10" identifier="A" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="118,184,10" identifier="B" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="150,235,10" identifier="C" shape="circle"></qti-hotspot-choice>
      </qti-hotspot-interaction>
    `,
    { note: 'correction' }
  ),
  card(
    'Graphic order',
    html`
      <qti-graphic-order-interaction response-identifier="RESPONSE" response="C B A">
        <qti-prompt>Zet de luchthavens op volgorde van noord naar zuid.</qti-prompt>
        <img src="/assets/qti-graphic-order-interaction/uk.png" height="280" width="206" alt="Kaart van het VK" />
        <qti-hotspot-choice coords="78,102,8" identifier="A" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="117,171,8" identifier="B" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="166,227,8" identifier="C" shape="circle"></qti-hotspot-choice>
      </qti-graphic-order-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Graphic associate',
    html`
      <qti-graphic-associate-interaction response-identifier="RESPONSE" max-associations="2" response="A B,B C">
        <qti-prompt>Teken de nieuwe routes.</qti-prompt>
        <img src="/assets/qti-graphic-associate-interaction/uk.png" alt="Luchthavens" width="206" height="280" />
        <qti-associable-hotspot shape="circle" coords="78,102,8" identifier="A" match-max="2"></qti-associable-hotspot>
        <qti-associable-hotspot shape="circle" coords="117,171,8" identifier="B" match-max="2"></qti-associable-hotspot>
        <qti-associable-hotspot shape="circle" coords="166,227,8" identifier="C" match-max="2"></qti-associable-hotspot>
      </qti-graphic-associate-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Select point',
    html`
      <qti-select-point-interaction response-identifier="RESPONSE" max-choices="1" response="191 393">
        <qti-prompt>Klik op het land met de hoogste bevolkingsdichtheid.</qti-prompt>
        <img src="/assets/api/kennisnet/resources/europe.svg" width="600" height="513" alt="Kaart van Europa" />
      </qti-select-point-interaction>
    `,
    { note: 'normal', width: 'wide' }
  ),
  card(
    'Graphic gap match',
    html`
      <qti-graphic-gap-match-interaction response-identifier="RESPONSE" response="DraggerB A">
        <qti-prompt>Sleep elke gebeurtenis naar het juiste vak.</qti-prompt>
        <img
          alt="Tijdlijn 1939–1991"
          src="/assets/qti-graphic-gap-match-interaction/timeline-558.png"
          height="326"
          width="558"
        />
        <qti-gap-img identifier="DraggerA" match-max="2">
          <img src="/assets/qti-graphic-gap-match-interaction/a-cw.png" alt="Koude Oorlog" height="63" width="78" />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerB" match-max="1">
          <img src="/assets/qti-graphic-gap-match-interaction/b-ww2.png" alt="WO2" height="63" width="78" />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerC" match-max="1">
          <img src="/assets/qti-graphic-gap-match-interaction/c-vietnam.png" alt="Vietnam" height="63" width="78" />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerD" match-max="1">
          <img src="/assets/qti-graphic-gap-match-interaction/d-bay.png" alt="Bay of Pigs" height="63" width="78" />
        </qti-gap-img>
        <qti-associable-hotspot
          coords="55,256,133,319"
          identifier="A"
          match-max="2"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="190,256,268,319"
          identifier="B"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="309,256,387,319"
          identifier="C"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="450,256,528,319"
          identifier="D"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>
    `,
    { note: 'normal', width: 'full' }
  )
];

/* ── Sliders, media & item furniture ─────────────────────────────────────────────────────────── */

const miscCards = [
  card(
    'Slider',
    html`
      <qti-slider-interaction response-identifier="RESPONSE" lower-bound="0" upper-bound="100" step="5" response="35">
        <qti-prompt>Hoeveel procent van het aardoppervlak is water?</qti-prompt>
      </qti-slider-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Media',
    html`
      <qti-media-interaction response-identifier="RESPONSE">
        <qti-prompt>Bekijk het fragment.</qti-prompt>
        <video src="/assets/qti-media-interaction/earth.mp4" width="300" controls></video>
      </qti-media-interaction>
    `,
    { note: 'normal' }
  ),
  card(
    'Rubric block',
    html`
      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>Xenon — atoommassa ≈ 131,29 u; Tin ≈ 118,71 u.</qti-content-body>
      </qti-rubric-block>
    `,
    { note: 'qti-rubric-block' }
  ),
  card(
    'Modal feedback',
    html`
      <qti-modal-feedback identifier="FEEDBACK" outcome-identifier="FEEDBACK" show-hide="show">
        <qti-content-body>Goed gedaan — je hebt alle vragen beantwoord.</qti-content-body>
      </qti-modal-feedback>
    `,
    { note: 'qti-modal-feedback' }
  )
];

/* ── Stories ─────────────────────────────────────────────────────────────────────────────────── */

/** Everything at once — the page to keep open while tuning a token. */
export const Overview: Story = {
  name: 'Overview — every interaction',
  render: () =>
    page(
      section('Choice', choiceCards),
      section('Text', textCards),
      section('Inline & in-text', inlineCards),
      section('Order & match', dragCards),
      section('Graphic', graphicCards),
      section('Sliders, media & furniture', miscCards)
    )
};

export const Choice: Story = { render: () => page(section('Choice', choiceCards)) };
export const Text: Story = { render: () => page(section('Text', textCards)) };
export const Inline: Story = { name: 'Inline & in-text', render: () => page(section('Inline & in-text', inlineCards)) };
export const DragAndDrop: Story = { name: 'Order & match', render: () => page(section('Order & match', dragCards)) };
export const Graphic: Story = { render: () => page(section('Graphic', graphicCards)) };
export const Misc: Story = {
  name: 'Sliders, media & furniture',
  render: () => page(section('Sliders, media & furniture', miscCards))
};
