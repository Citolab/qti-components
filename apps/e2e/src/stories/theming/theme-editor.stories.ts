import { html, nothing, render } from 'lit';

import { qtiBaseElements } from '@qti-components/base/elements';
import { qtiContentElements } from '@qti-components/elements/elements';
import { qtiInteractionElements } from '@qti-components/interactions/elements';
import { qtiItemElements } from '@qti-components/item/elements';
import { qtiProcessingElements } from '@qti-components/processing/elements';
import { qtiCorrectionElements } from '@qti-components/corrections/elements';
import { qtiTestElements } from '@qti-components/test/elements';
import itemCss from '@qti-components/theme/item-css';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The theme editor — the tier-1 inputs (`--qc-*`, packages/qti-theme/CONTRACT.md §8; the older
 * `--cito-*` names still work as fallbacks this major) as controls, and every interaction the
 * theme paints, once, on one page.
 *
 * Pick a preset in the toolbar (Default, Light, Dark, Kennisnet, Cito: .storybook/themes.css), then
 * change any input in the Controls panel. A control left empty keeps the preset's value. The block
 * at the top is the CSS for the inputs you changed, ready to paste into a host's stylesheet.
 *
 * The chrome follows the page's color-scheme (light-dark()), so it stays readable under Dark.
 *
 * The specimens render in a shadow root that adopts the theme, as an item does in a host. The
 * inputs are set on that root's host element and inherit into it; the theme re-derives every
 * `--qti-*` token there. The page chrome around them (cards, labels) is deliberately not themed, so
 * you can always tell which border you just changed.
 */

const registry = (() => {
  const scoped = new CustomElementRegistry();
  const corrections = new Map<string, CustomElementConstructor>(
    qtiCorrectionElements.map(({ tag, ctor }) => [tag, ctor])
  );
  for (const { tag, ctor } of [
    ...qtiBaseElements,
    ...qtiProcessingElements,
    ...qtiContentElements,
    ...qtiItemElements,
    ...qtiTestElements,
    ...qtiInteractionElements,
    ...qtiCorrectionElements
  ]) {
    if (!scoped.get(tag)) scoped.define(tag, corrections.get(tag) ?? ctor);
  }
  return scoped;
})();

const chromeCss = `
  .te { display: grid; gap: 1.5rem; padding: 1.5rem; font-family: system-ui, sans-serif;
    color: light-dark(#0f172a, #e2e8f0); }
  .te-css { margin: 0; padding: 0.75rem 1rem; border-radius: 6px; background: #0f172a; color: #e2e8f0;
    font: 0.75rem/1.5 ui-monospace, SFMono-Regular, monospace; white-space: pre-wrap; }
  .te-h { margin: 0 0 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.09em;
    text-transform: uppercase; color: #64748b; }
  .te-g { display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: 1rem; align-items: start; }
  /* Each card is a QTI well (.qti-well, vocabulary §1.1.6.2), drawn by the theme: its tint, border
     and radius follow the preset. Only the grid placement is the editor's. */
  .te-c { margin: 0; min-width: 0; overflow-x: auto; }
  /* A transform makes the card the containing block of the modal's fixed dialog, so it stays in the card. */
  .te-c--holds-fixed { transform: translateZ(0); min-height: 10rem; }
  .te-c > figcaption { margin: 0 0 0.75rem; font-size: 0.75rem; font-weight: 600; opacity: 0.75; }
  .te-c--wide { grid-column: span 2; }
  @media (max-width: 40rem) { .te-c--wide { grid-column: auto; } }
`;

const itemSheet = new CSSStyleSheet();
itemSheet.replaceSync(itemCss);
const chromeSheet = new CSSStyleSheet();
chromeSheet.replaceSync(chromeCss);

/* ── The inputs ───────────────────────────────────────────────────────────────────────────────── */

type Input = {
  token: string;
  control: 'color' | 'text' | { type: 'range'; min: number; max: number; step: number };
  unit?: string;
  group: string;
};

const INPUTS: Record<string, Input> = {
  base100: { token: '--qc-color-base-100', control: 'color', group: 'Surface' },
  baseContent: { token: '--qc-color-base-content', control: 'color', group: 'Surface' },
  primary: { token: '--qc-color-primary', control: 'color', group: 'Brand' },
  primaryContent: { token: '--qc-color-primary-content', control: 'color', group: 'Brand' },
  neutral: { token: '--qc-color-neutral', control: 'color', group: 'Brand' },
  neutralContent: { token: '--qc-color-neutral-content', control: 'color', group: 'Brand' },
  chip: { token: '--qc-color-chip', control: 'color', group: 'Brand' },
  chipContent: { token: '--qc-color-chip-content', control: 'color', group: 'Brand' },
  chipBorder: { token: '--qc-color-chip-border', control: 'color', group: 'Brand' },
  dragIcon: { token: '--qc-color-drag-icon', control: 'color', group: 'Brand' },
  dragIconSize: { token: '--qc-size-drag-icon', control: 'text', group: 'Brand' },
  border: { token: '--qc-color-border', control: 'color', group: 'Brand' },
  focus: { token: '--qc-color-focus', control: 'color', group: 'Brand' },
  info: { token: '--qc-color-info', control: 'color', group: 'States' },
  success: { token: '--qc-color-success', control: 'color', group: 'States' },
  warning: { token: '--qc-color-warning', control: 'color', group: 'States' },
  error: { token: '--qc-color-error', control: 'color', group: 'States' },
  radiusField: {
    token: '--qc-radius-field',
    control: { type: 'range', min: 0, max: 24, step: 1 },
    unit: 'px',
    group: 'Shape'
  },
  radiusSelector: {
    token: '--qc-radius-selector',
    control: { type: 'range', min: 0, max: 24, step: 1 },
    unit: 'px',
    group: 'Shape'
  },
  radiusBox: {
    token: '--qc-radius-box',
    control: { type: 'range', min: 0, max: 32, step: 1 },
    unit: 'px',
    group: 'Shape'
  },
  borderWidth: {
    token: '--qc-border-width',
    control: { type: 'range', min: 0, max: 4, step: 1 },
    unit: 'px',
    group: 'Shape'
  },
  spacing: {
    token: '--qti-spacing',
    control: { type: 'range', min: 0.25, max: 1, step: 0.125 },
    unit: 'rem',
    group: 'Size'
  },
  sizeSelector: {
    token: '--qc-size-selector',
    control: { type: 'range', min: 0.15, max: 0.5, step: 0.025 },
    unit: 'em',
    group: 'Size'
  },
  sizeField: {
    token: '--qc-size-field',
    control: { type: 'range', min: 0, max: 0.5, step: 0.0625 },
    unit: 'rem',
    group: 'Size'
  },
  fontFamily: { token: '--qc-font-family', control: 'text', group: 'Type' },
  fontFamilyHeading: { token: '--qc-font-family-heading', control: 'text', group: 'Type' },
  depth: { token: '--qc-depth', control: { type: 'range', min: 0, max: 1, step: 0.25 }, group: 'Feel' }
};

type Args = Partial<Record<keyof typeof INPUTS, string | number>>;

/** The inputs a reader changed, as declarations; an untouched control sets nothing. */
const declarations = (args: Args) =>
  Object.entries(INPUTS).flatMap(([key, { token, unit }]) => {
    const value = args[key as keyof typeof INPUTS];
    return value === undefined || value === '' ? [] : [`${token}: ${value}${unit ?? ''};`];
  });

/* ── The specimens ────────────────────────────────────────────────────────────────────────────── */

const card = (label: string, body: unknown, wide = false) =>
  html`<figure class="qti-well te-c ${wide ? 'te-c--wide' : ''}">
    <figcaption>${label}</figcaption>
    <qti-item-body>${body}</qti-item-body>
  </figure>`;

const choices = html`
  <qti-simple-choice identifier="tin">Tin (Sn)</qti-simple-choice>
  <qti-simple-choice identifier="jodium">Jodium (I)</qti-simple-choice>
  <qti-simple-choice identifier="xenon">Xenon (Xe)</qti-simple-choice>
`;
const gapText = html`
  <qti-gap-text identifier="basisch" match-max="1">basisch</qti-gap-text>
  <qti-gap-text identifier="zuur" match-max="1">zuur</qti-gap-text>
  <p>
    Een pH lager dan 7 is <qti-gap identifier="laag"></qti-gap>, een pH hoger dan 7 is
    <qti-gap identifier="hoog"></qti-gap>.
  </p>
`;
const inlineChoices = html`
  <qti-inline-choice identifier="lager">lager</qti-inline-choice>
  <qti-inline-choice identifier="hoger">hoger</qti-inline-choice>
`;
const orderChoices = html`
  <qti-simple-choice identifier="hypothese">Hypothese</qti-simple-choice>
  <qti-simple-choice identifier="data">Data</qti-simple-choice>
  <qti-simple-choice identifier="conclusie">Conclusie</qti-simple-choice>
`;
const matchSets = html`
  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="evenaar" match-max="1"
      >De evenaar loopt door drie continenten</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="helium" match-max="1"
      >Helium is lichter dan lucht</qti-simple-associable-choice
    >
  </qti-simple-match-set>
  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="juist" match-max="2">Juist</qti-simple-associable-choice>
    <qti-simple-associable-choice identifier="onjuist" match-max="2">Onjuist</qti-simple-associable-choice>
  </qti-simple-match-set>
`;
const correction = 'show-candidate-correction show-full-correct-response';

/**
 * Rubric and feedback, as an item shows them. A feedback shows only in an item whose outcome calls for
 * it, so each one sits in an item of its own, and `showFeedback` sets that outcome once the page is up.
 * The modal's dialog is `position: fixed`; its card holds it (`.te-c--holds-fixed`).
 */
const feedbackItem = (body: string) =>
  `<qti-assessment-item identifier="feedback"><qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"></qti-outcome-declaration><qti-item-body>${body}</qti-item-body></qti-assessment-item>`;
const feedback = (tag: string, text: string) =>
  `<${tag} outcome-identifier="FEEDBACK" identifier="shown" show-hide="show">${text}</${tag}>`;
const content = [
  [
    'Rubric block',
    `<qti-item-body><qti-rubric-block><p>Read the text first. Then answer the questions.</p></qti-rubric-block></qti-item-body>`
  ],
  [
    'Feedback block',
    feedbackItem(
      `<p>Which is acidic?</p>${feedback('qti-feedback-block', '<p>Not quite: a pH below 7 is acidic.</p>')}`
    )
  ],
  [
    'Feedback inline',
    feedbackItem(
      `<p>Plants make their own food. In their leaves, light turns water and carbon dioxide into sugar, and ${feedback('qti-feedback-inline', 'the gas they give off is oxygen')}, which leaves the leaf through tiny openings. The roots take up the water the plant needs from the soil.</p>`
    )
  ],
  ['Modal feedback', feedbackItem(feedback('qti-modal-feedback', '<p>Well done: that is right.</p>'))]
] as const;

/** Switches every feedback on, the way a host replays an outcome, once the page is in the document. */
const showFeedback = (root: ShadowRoot) => {
  if (!root.host.isConnected) return void requestAnimationFrame(() => showFeedback(root));
  for (const item of root.querySelectorAll<HTMLElement & { setOutcomeVariable(id: string, value: string): void }>(
    'qti-assessment-item'
  )) {
    item.setOutcomeVariable('FEEDBACK', 'shown');
  }
};

/* Plain author prose, as an item body carries it: what the reading font, the heading font and the
   text colour do, and what the theme leaves to the browser (lists, emphasis, a table). */
const prose = card(
  'Prose',
  html`<h3>De waterkringloop</h3>
    <p>
      Water verdampt uit <strong>zeeën en meren</strong>, stijgt op als waterdamp en koelt af tot <em>wolken</em>.
      Daarna valt het als neerslag terug op aarde.
    </p>
    <ul>
      <li>verdamping</li>
      <li>condensatie</li>
      <li>neerslag</li>
    </ul>
    <table>
      <thead>
        <tr>
          <th>Fase</th>
          <th>Temperatuur</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Verdamping</td>
          <td>boven 0 °C</td>
        </tr>
        <tr>
          <td>Condensatie</td>
          <td>onder het dauwpunt</td>
        </tr>
      </tbody>
    </table>
    <table class="qti-fullwidth qti-bordered">
      <caption>
        Gemiddelde neerslag in De Bilt
      </caption>
      <thead>
        <tr>
          <th class="qti-align-right">Maand</th>
          <th class="qti-align-left">Neerslag (mm)</th>
          <th class="qti-align-left">Dagen met neerslag</th>
          <th class="qti-align-center">Natste maand</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="qti-align-right">januari</td>
          <td class="qti-align-left">70,1</td>
          <td class="qti-align-left">18</td>
          <td class="qti-align-center"></td>
        </tr>
        <tr>
          <td class="qti-align-right">april</td>
          <td class="qti-align-left">41,4</td>
          <td class="qti-align-left">13</td>
          <td class="qti-align-center"></td>
        </tr>
        <tr>
          <td class="qti-align-right">juli</td>
          <td class="qti-align-left">85,2</td>
          <td class="qti-align-left">15</td>
          <td class="qti-align-center">✓</td>
        </tr>
        <tr>
          <td class="qti-align-right">oktober</td>
          <td class="qti-align-left">82,8</td>
          <td class="qti-align-left">17</td>
          <td class="qti-align-center"></td>
        </tr>
      </tbody>
    </table>`,
  true
);

const answered = [
  prose,
  card(
    'Choice',
    html`<qti-choice-interaction response-identifier="R" max-choices="1" response="xenon"
      >${choices}</qti-choice-interaction
    >`
  ),
  card(
    'Choice, multiple',
    html`<qti-choice-interaction response-identifier="R" max-choices="0" response="tin,xenon"
      >${choices}</qti-choice-interaction
    >`
  ),
  card(
    'Choice, as buttons',
    html`<qti-choice-interaction
      class="qti-input-control-hidden"
      response-identifier="R"
      max-choices="1"
      response="jodium"
      >${choices}</qti-choice-interaction
    >`
  ),
  card(
    'Choice, disabled',
    html`<qti-choice-interaction response-identifier="R" max-choices="1" response="xenon" disabled
      >${choices}</qti-choice-interaction
    >`
  ),
  card(
    'Text entry and inline choice',
    html`<p>
      Het verschijnsel heet
      <qti-text-entry-interaction
        response-identifier="T"
        expected-length="12"
        response="refractie"
      ></qti-text-entry-interaction>
      en de toon wordt
      <qti-inline-choice-interaction response-identifier="I" response="hoger"
        >${inlineChoices}</qti-inline-choice-interaction
      >.
    </p>`
  ),
  card(
    'Extended text',
    html`<qti-extended-text-interaction
      response-identifier="E"
      response="Een mix van bronnen is betrouwbaarder."
    ></qti-extended-text-interaction>`
  ),
  card(
    'Hottext',
    html`<qti-hottext-interaction response-identifier="H" max-choices="1" response="door">
      <p>
        De productie <qti-hottext identifier="daalde">daalde</qti-hottext>
        <qti-hottext identifier="door">door</qti-hottext> een tekort.
      </p>
    </qti-hottext-interaction>`
  ),
  card('Gap match', html`<qti-gap-match-interaction response-identifier="G">${gapText}</qti-gap-match-interaction>`),
  card(
    'Order',
    html`<qti-order-interaction response-identifier="O" shuffle="false" orientation="horizontal"
      >${orderChoices}</qti-order-interaction
    >`
  ),
  card(
    'Match, as a table',
    html`<qti-match-interaction class="qti-match-tabular" response-identifier="M">${matchSets}</qti-match-interaction>`,
    true
  ),
  card(
    'Slider',
    html`<qti-slider-interaction
      response-identifier="S"
      lower-bound="0"
      upper-bound="100"
      step="5"
      response="35"
    ></qti-slider-interaction>`
  ),
  card(
    'Select point',
    html`<qti-select-point-interaction response-identifier="P" max-choices="1" response="203 159">
      <qti-prompt>Klik op Mars.</qti-prompt>
      <img src="/assets/docs/theme-editor/planets.jpg" width="480" height="320" alt="De zon en de acht planeten" />
    </qti-select-point-interaction>`,
    true
  ),
  card(
    'Graphic gap match, words on an image',
    html`<qti-graphic-gap-match-interaction response-identifier="GG" max-associations="4">
      <qti-prompt>Sleep elk woord naar het juiste deel van de plant.</qti-prompt>
      <img src="/assets/docs/theme-editor/plant.jpg" width="320" height="480" alt="Een bloeiende plant" />
      <qti-gap-text identifier="petal" match-max="1">petal</qti-gap-text>
      <qti-gap-text identifier="leaf" match-max="1">leaf</qti-gap-text>
      <qti-gap-text identifier="stem" match-max="1">stem</qti-gap-text>
      <qti-gap-text identifier="roots" match-max="1">roots</qti-gap-text>
      <qti-associable-hotspot identifier="A" match-max="1" shape="rect" coords="175,60,275,96"></qti-associable-hotspot>
      <qti-associable-hotspot
        identifier="B"
        match-max="1"
        shape="rect"
        coords="40,190,140,226"
      ></qti-associable-hotspot>
      <qti-associable-hotspot
        identifier="C"
        match-max="1"
        shape="rect"
        coords="165,285,265,321"
      ></qti-associable-hotspot>
      <qti-associable-hotspot
        identifier="D"
        match-max="1"
        shape="rect"
        coords="110,405,210,441"
      ></qti-associable-hotspot>
    </qti-graphic-gap-match-interaction>`,
    true
  ),
  card(
    'Associate',
    html`<qti-associate-interaction response-identifier="A" max-associations="2">
      <qti-prompt>Koppel elk land aan zijn hoofdstad.</qti-prompt>
      <qti-simple-associable-choice identifier="fr" match-max="1">Frankrijk</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="parijs" match-max="1">Parijs</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="es" match-max="1">Spanje</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="madrid" match-max="1">Madrid</qti-simple-associable-choice>
    </qti-associate-interaction>`
  ),
  card(
    'Hotspot',
    html`<qti-hotspot-interaction response-identifier="HS" max-choices="1" response="C">
      <qti-prompt>Klik op de meest zuidelijke luchthaven.</qti-prompt>
      <img
        src="/fixtures/packages/interactions/hotspot-interaction/src/fixtures/uk.png"
        width="206"
        height="280"
        alt="Kaart van het VK"
      />
      <qti-hotspot-choice identifier="A" shape="circle" coords="77,115,10"></qti-hotspot-choice>
      <qti-hotspot-choice identifier="B" shape="circle" coords="118,184,10"></qti-hotspot-choice>
      <qti-hotspot-choice identifier="C" shape="circle" coords="150,235,10"></qti-hotspot-choice>
    </qti-hotspot-interaction>`
  ),
  card(
    'Graphic order',
    html`<qti-graphic-order-interaction response-identifier="GO">
      <qti-prompt>Zet de luchthavens op volgorde van noord naar zuid.</qti-prompt>
      <img
        src="/fixtures/packages/interactions/graphic-order-interaction/src/fixtures/uk.png"
        width="206"
        height="280"
        alt="Kaart van het VK"
      />
      <qti-hotspot-choice identifier="A" shape="circle" coords="78,102,8"></qti-hotspot-choice>
      <qti-hotspot-choice identifier="B" shape="circle" coords="117,171,8"></qti-hotspot-choice>
      <qti-hotspot-choice identifier="C" shape="circle" coords="166,227,8"></qti-hotspot-choice>
    </qti-graphic-order-interaction>`
  ),
  card(
    'Graphic associate',
    html`<qti-graphic-associate-interaction response-identifier="GA" max-associations="2">
      <qti-prompt>Teken de nieuwe routes.</qti-prompt>
      <img
        src="/fixtures/packages/interactions/graphic-associate-interaction/src/fixtures/uk.png"
        width="206"
        height="280"
        alt="Luchthavens"
      />
      <qti-associable-hotspot identifier="A" match-max="2" shape="circle" coords="78,102,8"></qti-associable-hotspot>
      <qti-associable-hotspot identifier="B" match-max="2" shape="circle" coords="117,171,8"></qti-associable-hotspot>
      <qti-associable-hotspot identifier="C" match-max="2" shape="circle" coords="166,227,8"></qti-associable-hotspot>
    </qti-graphic-associate-interaction>`
  ),
  card(
    'Media',
    html`<qti-media-interaction response-identifier="MD">
      <qti-prompt>Bekijk het fragment.</qti-prompt>
      <video
        src="/fixtures/packages/interactions/media-interaction/src/fixtures/earth.mp4"
        controls
        style="inline-size: 100%"
      ></video>
    </qti-media-interaction>`
  ),
  card(
    'Upload',
    html`<qti-upload-interaction response-identifier="U">
      <qti-prompt>Upload je uitwerking als PDF.</qti-prompt>
    </qti-upload-interaction>`
  ),
  card(
    'End attempt',
    html`<qti-end-attempt-interaction response-identifier="EA" title="Nakijken"></qti-end-attempt-interaction>`
  )
];

/* Corrections: the candidate's answer marked, and the answer key below it. Attributes are written as
   a string because show-candidate-correction is read when the element connects. Extended text has
   no answer key: its verdict comes from a grader, through the candidate-correction attribute. */
const corrected = [
  [
    'Choice',
    `<qti-choice-interaction response-identifier="R" max-choices="1" response="tin" correct-response="xenon" ${correction}>${'<qti-simple-choice identifier="tin">Tin (Sn)</qti-simple-choice><qti-simple-choice identifier="jodium">Jodium (I)</qti-simple-choice><qti-simple-choice identifier="xenon">Xenon (Xe)</qti-simple-choice>'}</qti-choice-interaction>`
  ],
  [
    'Text entry',
    `<p>Het verschijnsel heet <qti-text-entry-interaction response-identifier="T" expected-length="12" response="reflectie" correct-response="refractie" ${correction}></qti-text-entry-interaction>.</p>`
  ],
  [
    'Extended text, partially correct',
    `<qti-extended-text-interaction response-identifier="E" response="Zon en wind vullen elkaar aan." candidate-correction="partially-correct"></qti-extended-text-interaction>`
  ],
  [
    'Gap match',
    `<qti-gap-match-interaction response-identifier="G" response="basisch laag,zuur hoog" correct-response="zuur laag,basisch hoog" ${correction}><qti-gap-text identifier="basisch" match-max="1">basisch</qti-gap-text><qti-gap-text identifier="zuur" match-max="1">zuur</qti-gap-text><p>Een pH lager dan 7 is <qti-gap identifier="laag"></qti-gap>, hoger dan 7 is <qti-gap identifier="hoog"></qti-gap>.</p></qti-gap-match-interaction>`
  ],
  [
    'Order',
    `<qti-order-interaction response-identifier="O" shuffle="false" response="data,hypothese,conclusie" correct-response="hypothese,data,conclusie" ${correction}><qti-simple-choice identifier="hypothese">Hypothese</qti-simple-choice><qti-simple-choice identifier="data">Data</qti-simple-choice><qti-simple-choice identifier="conclusie">Conclusie</qti-simple-choice></qti-order-interaction>`
  ]
] as const;

/* ── The page ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * Lit renders the template to a string, which is then assigned as innerHTML inside a shadow root
 * with the scoped registry: lit's `render()` would bind to the global registry and ignore it (the
 * same trick as kennisnet.stories.ts). The wrapping <div> matters: `show-full-correct-response`
 * inserts its clone through `interaction.parentElement`, which is null for a shadow root's child.
 */
const page = (args: Args) => {
  const css = declarations(args);
  const scratch = document.createElement('div');
  render(
    html`<div class="te">
      <section>
        <h2 class="te-h">Your theme</h2>
        <pre class="te-css">
${css.length
            ? `:root {\n  ${css.join('\n  ')}\n}`
            : '/* Change an input in the Controls panel; its CSS appears here. */'}</pre
        >
      </section>
      <section>
        <h2 class="te-h">At rest and answered</h2>
        <div class="te-g">${answered}</div>
      </section>
      <section>
        <h2 class="te-h">Rubric and feedback</h2>
        <div class="te-g">
          ${content.map(
            ([label]) =>
              html`<figure class="qti-well te-c ${label === 'Modal feedback' ? 'te-c--holds-fixed' : ''}">
                <figcaption>${label}</figcaption>
                <div data-slot=${label}></div>
              </figure>`
          )}
        </div>
      </section>
      <section>
        <h2 class="te-h">Corrected</h2>
        <div class="te-g">${corrected.map(([label]) => card(label, html`<div data-slot=${label}></div>`))}</div>
      </section>
    </div>`,
    scratch
  );
  let markup = scratch.innerHTML;
  render(nothing, scratch);
  for (const [label, specimen] of [...corrected, ...content]) {
    markup = markup.replace(`<div data-slot="${label}"></div>`, specimen);
  }

  const host = document.createElement('div');
  host.setAttribute('data-testid', 'theme-editor');
  host.style.cssText = css.join(' ');
  const shadow = host.attachShadow({ mode: 'open', customElementRegistry: registry });
  shadow.adoptedStyleSheets = [itemSheet, chromeSheet];
  shadow.innerHTML = `<div>${markup}</div>`;
  showFeedback(shadow);
  return host;
};

const meta: Meta<Args> = {
  title: 'Implementation/Theming',
  parameters: { layout: 'fullscreen' },
  argTypes: Object.fromEntries(
    Object.entries(INPUTS).map(([key, { token, control, unit, group }]) => [
      key,
      {
        name: token,
        control,
        description: unit ? `in ${unit}` : undefined,
        table: { category: group }
      }
    ])
  )
};
export default meta;

export const Theming: Story = {
  render: args => page(args)
};

type Story = StoryObj<Args>;
