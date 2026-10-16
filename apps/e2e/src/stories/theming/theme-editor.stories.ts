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
 * The theme editor — the tier-1 inputs (`--cito-*`, packages/qti-theme/CONTRACT.md §8) as controls,
 * and every interaction the theme paints, once, on one page.
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
  .te-c { margin: 0; min-width: 0; border: 1px solid light-dark(#e2e8f0, #334155); border-radius: 8px; overflow: hidden; }
  .te-c > figcaption { padding: 0.375rem 0.75rem; border-bottom: 1px solid light-dark(#e2e8f0, #334155); background: light-dark(#f8fafc, #1e293b);
    font-size: 0.75rem; font-weight: 600; color: light-dark(#334155, #cbd5e1); }
  .te-b { padding: 1rem; overflow-x: auto; }
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
  base100: { token: '--cito-color-base-100', control: 'color', group: 'Surface' },
  baseContent: { token: '--cito-color-base-content', control: 'color', group: 'Surface' },
  primary: { token: '--cito-color-primary', control: 'color', group: 'Brand' },
  primaryContent: { token: '--cito-color-primary-content', control: 'color', group: 'Brand' },
  neutral: { token: '--cito-color-neutral', control: 'color', group: 'Brand' },
  neutralContent: { token: '--cito-color-neutral-content', control: 'color', group: 'Brand' },
  chip: { token: '--cito-color-chip', control: 'color', group: 'Brand' },
  chipContent: { token: '--cito-color-chip-content', control: 'color', group: 'Brand' },
  chipBorder: { token: '--cito-color-chip-border', control: 'color', group: 'Brand' },
  dragIcon: { token: '--cito-color-drag-icon', control: 'color', group: 'Brand' },
  marker: { token: '--cito-color-marker', control: 'color', group: 'Brand' },
  border: { token: '--cito-color-border', control: 'color', group: 'Brand' },
  info: { token: '--cito-color-info', control: 'color', group: 'States' },
  success: { token: '--cito-color-success', control: 'color', group: 'States' },
  warning: { token: '--cito-color-warning', control: 'color', group: 'States' },
  error: { token: '--cito-color-error', control: 'color', group: 'States' },
  radiusField: {
    token: '--cito-radius-field',
    control: { type: 'range', min: 0, max: 24, step: 1 },
    unit: 'px',
    group: 'Shape'
  },
  radiusSelector: {
    token: '--cito-radius-selector',
    control: { type: 'range', min: 0, max: 24, step: 1 },
    unit: 'px',
    group: 'Shape'
  },
  radiusBox: {
    token: '--cito-radius-box',
    control: { type: 'range', min: 0, max: 32, step: 1 },
    unit: 'px',
    group: 'Shape'
  },
  borderWidth: {
    token: '--cito-border-width',
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
    token: '--cito-size-selector',
    control: { type: 'range', min: 0.15, max: 0.5, step: 0.025 },
    unit: 'em',
    group: 'Size'
  },
  sizeField: {
    token: '--cito-size-field',
    control: { type: 'range', min: 0, max: 0.5, step: 0.0625 },
    unit: 'rem',
    group: 'Size'
  },
  fontFamily: { token: '--cito-font-family', control: 'text', group: 'Type' },
  depth: { token: '--cito-depth', control: { type: 'range', min: 0, max: 1, step: 0.25 }, group: 'Feel' }
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
  html`<figure class="te-c ${wide ? 'te-c--wide' : ''}">
    <figcaption>${label}</figcaption>
    <div class="te-b"><qti-item-body>${body}</qti-item-body></div>
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

const answered = [
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
        <h2 class="te-h">Corrected</h2>
        <div class="te-g">${corrected.map(([label]) => card(label, html`<div data-slot=${label}></div>`))}</div>
      </section>
    </div>`,
    scratch
  );
  let markup = scratch.innerHTML;
  render(nothing, scratch);
  for (const [label, specimen] of corrected) markup = markup.replace(`<div data-slot="${label}"></div>`, specimen);

  const host = document.createElement('div');
  host.setAttribute('data-testid', 'theme-editor');
  host.style.cssText = css.join(' ');
  const shadow = host.attachShadow({ mode: 'open', customElementRegistry: registry });
  shadow.adoptedStyleSheets = [itemSheet, chromeSheet];
  shadow.innerHTML = `<div>${markup}</div>`;
  return host;
};

const meta: Meta<Args> = {
  title: 'Implementation/Theming/Theme editor',
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

export const Editor: Story = {
  render: args => page(args)
};

type Story = StoryObj<Args>;
