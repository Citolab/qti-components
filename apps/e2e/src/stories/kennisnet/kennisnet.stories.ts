import { html, nothing, render } from 'lit';

import { qtiBaseElements } from '@qti-components/base/elements';
import { qtiContentElements } from '@qti-components/elements/elements';
import { qtiInteractionElements } from '@qti-components/interactions/elements';
import { qtiItemElements } from '@qti-components/item/elements';
import { qtiProcessingElements } from '@qti-components/processing/elements';
// The qti-corrections package only exports the correction interactions themselves — building a
// registry from them is the implementor's job, done right here.
import { qtiCorrectionElements } from '@qti-components/qti-corrections/elements';
import { qtiTestElements } from '@qti-components/test/elements';

// The raw theme stylesheet is a build-time asset (the theme package only exports its index).

import itemCss from '../../../../../packages/qti-theme/src/item.css?inline';
// The Kennisnet brand overlay lives with this story now (no longer bundled into the theme).
import kennisnetCss from './kennisnet.css?inline';

import type { Decorator, Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * Registration lives here, on the implementor side. qti-corrections only ships the correction
 * interactions (`qtiCorrectionElements`, keyed by their standard QTI tag); wiring them into a scoped
 * custom element registry (https://developer.chrome.com/blog/scoped-registries) is this file's job.
 *
 * Inside a shadow root created with this registry, `qti-choice-interaction` &co resolve to their
 * `…Correction` variants instead of the standard classes registered globally, so
 * `show-candidate-correction` / `show-full-correct-response` actually paint — and the mapping stays
 * local to these stories.
 *
 * A scoped registry has NO global fallback: it must define every tag the items render. So the full
 * set of standard QTI manifests is merged in, with the correction variants overriding by tag.
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
 * Parsed once — every story's shadow root adopts both sheets. item.css declares the full `@layer`
 * order; kennisnet.css only adds rules to the already-declared `brand` / `states` layers, so it is
 * adopted after item.css.
 */
const itemSheet = new CSSStyleSheet();
itemSheet.replaceSync(itemCss);
const kennisnetSheet = new CSSStyleSheet();
kennisnetSheet.replaceSync(kennisnetCss);

/**
 * Render each item into a shadow root backed by the scoped correction registry, in the Kennisnet
 * brand.
 *
 * The markup is assigned via `innerHTML` so the browser upgrades its custom elements against the
 * scoped registry (lit's `render()` binds elements to the global registry at creation time, which
 * would ignore the scoped mapping); the lit template is serialized to a string first.
 *
 * `item.css` and the Kennisnet brand overlay (`kennisnet.css`) are both adopted into the shadow,
 * because a document sheet can't cross the boundary. The overlay carries no scoping class — being
 * adopted into this shadow (and nowhere else) is what scopes it — so its rules reach every chip
 * here, including the corrections chips that live in this shadow.
 */
const withKennisnetCorrection: Decorator = story => {
  const scratch = document.createElement('div');
  render(story() as Parameters<typeof render>[0], scratch);
  const markup = scratch.innerHTML;
  render(nothing, scratch);

  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open', customElementRegistry: correctionRegistry });
  shadow.adoptedStyleSheets = [itemSheet, kennisnetSheet];

  // Wrapped in a container `<div>` on purpose: `show-full-correct-response` inserts its clone through
  // `interaction.parentElement`, which is null for a direct child of a shadow root. Real items always
  // nest the interaction inside `qti-item-body`.
  shadow.innerHTML = `<div>${markup}</div>`;

  for (const container of shadow.querySelectorAll<HTMLElement & { customElementRegistry: CustomElementRegistry }>(
    'item-container, test-container'
  )) {
    container.customElementRegistry = correctionRegistry;
  }

  return host;
};

const meta: Meta = {
  title: 'Kennisnet',
  tags: ['autodocs', 'no-tests', 'vrt'],
  decorators: [withKennisnetCorrection],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'vrtBaseline',
      options: {
        vrtBaseline: {
          name: 'VRT baseline',
          styles: {
            width: '960px',
            height: '900px'
          }
        }
      }
    }
  }
};

export default meta;

type Story = StoryObj;

export const MeerkeuzevraagEenAntwoord: Story = {
  name: 'ITEM001 — Meerkeuzevraag één antwoord',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col3">
          <img src="/assets/api/kennisnet/resources/atom.png" alt="Atoom" width="250" />
        </div>
        <div class="qti-layout-col9">
          <qti-choice-interaction
            response-identifier="RESPONSE"
            shuffle="true"
            min-choices="1"
            max-choices="1"
            response="choice1"
            correct-response="choice3"
            show-candidate-correction
            show-full-correct-response
          >
            <qti-prompt> Welke van de onderstaande elementen heeft de hoogste atoommassa? </qti-prompt>
            <qti-simple-choice identifier="choice1" fixed show-hide="show"> Tin (Sn) </qti-simple-choice>
            <qti-simple-choice identifier="choice2" fixed show-hide="show"> Jodium (I) </qti-simple-choice>
            <qti-simple-choice identifier="choice3" fixed show-hide="show"> Xenon (Xe) </qti-simple-choice>
          </qti-choice-interaction>
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body> Xenon — atoommassa ≈ 131,29 u; Tin ≈ 118,71 u; Jodium ≈ 126,90 u </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const MeerkeuzevraagMeerdereAntwoorden: Story = {
  name: 'ITEM002 — Meerkeuzevraag meerdere antwoorden',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col5">
          <qti-choice-interaction
            response-identifier="RESPONSE"
            shuffle="true"
            min-choices="0"
            max-choices="0"
            response="choice1,choice3"
            correct-response="choice1,choice2,choice4"
            show-candidate-correction
            show-full-correct-response
          >
            <qti-prompt> Welke van de volgende landen zijn volledig door één enkel ander land ingesloten? </qti-prompt>
            <qti-simple-choice identifier="choice1" fixed show-hide="show"> Lesotho </qti-simple-choice>
            <qti-simple-choice identifier="choice2" fixed show-hide="show"> San Marino </qti-simple-choice>
            <qti-simple-choice identifier="choice3" fixed show-hide="show"> Bolivia </qti-simple-choice>
            <qti-simple-choice identifier="choice4" fixed show-hide="show"> Vaticaanstad </qti-simple-choice>
          </qti-choice-interaction>
        </div>
        <div class="qti-layout-col7">
          <img src="/assets/api/kennisnet/resources/world-map.jpg" alt="Wereldkaart" />
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Lesotho ligt volledig binnen Zuid-Afrika</li>
            <li>San Marino en Vaticaanstad liggen volledig binnen Italië</li>
            <li>Bolivia is niet ingesloten</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const TekstvraagHoofdletterongevoelig: Story = {
  name: 'ITEM003 — Tekstvraag – hoofdletterongevoelig',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col4">
          <img src="/assets/api/kennisnet/resources/refraction.jpeg" alt="Licht" width="250" />
        </div>
        <div class="qti-layout-col8">
          <p>
            Hoe heet het verschijnsel dat licht van richting verandert wanneer het een andere stof binnengaat, zoals van
            lucht naar water?
          </p>
          <qti-text-entry-interaction
            response-identifier="RESPONSE"
            expected-length="20"
            response="reflectie"
            correct-response="refractie"
            show-candidate-correction
            show-full-correct-response
          ></qti-text-entry-interaction>
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Goede antwoorden: "breking" of "refractie" (hoofdletterongevoelig).</li>
            <li>"refractie" is de officiele term; "breking" wordt ook goed gerekend.</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const TekstvraagExacteMatch: Story = {
  name: 'ITEM004 — Tekstvraag – exacte match',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col6">
          <p>Wat is het decimale getal dat overeenkomt met het Romeinse cijfer <strong>XLIV</strong>?</p>
          <qti-text-entry-interaction
            response-identifier="RESPONSE"
            expected-length="3"
            response="46"
            correct-response="44"
            show-candidate-correction
            show-full-correct-response
          ></qti-text-entry-interaction>
        </div>
        <div class="qti-layout-col6">
          <img src="/assets/api/kennisnet/resources/ancient-rome.jpeg" alt="Rome" />
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Correct: 44</li>
            <li>Uitleg: XL = 40, IV = 4, samen 44.</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const OpenTekstvraag: Story = {
  name: 'ITEM005 — Open tekstvraag',
  render: () => html`
    <qti-item-body>
      <div>
        <img src="/assets/api/kennisnet/resources/solarpark-wind-park.jpg" alt="Wereldkaart" width="100%" />

        <p>
          Leg in 3-5 zinnen uit waarom veel landen overstappen op een mix van zonne- en windenergie in plaats van op een
          enkele bron te vertrouwen.
        </p>
        <qti-extended-text-interaction
          response-identifier="RESPONSE"
          expected-lines="5"
          show-candidate-correction
          show-full-correct-response
        ></qti-extended-text-interaction>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <p>Beoordelingscriteria (controle):</p>
          <ul>
            <li>
              Antwoord noemt minstens twee rationale factoren (bijv. variatie in opbrengst, leveringszekerheid, kosten,
              netstabiliteit).
            </li>
            <li>Toelichting waarom mix betrouwbaarder is.</li>
            <li>Begrijpelijke argumentatie.</li>
          </ul>
          <p>Opmerking: handmatige beoordeling vereist; automatische scoring is niet geconfigureerd.</p>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const Dropdownvraag: Story = {
  name: 'ITEM006 — Dropdownvraag',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col4">
          <img src="/assets/api/kennisnet/resources/doppler.png" alt="Doppler" width="250" />
        </div>
        <div class="qti-layout-col8">
          <p>
            De Doppler-verschuiving treedt op wanneer een geluidsbron en een waarnemer zich ten opzichte van elkaar
            bewegen.
          </p>
          Het waargenomen geluid wordt dan
          <qti-inline-choice-interaction
            response-identifier="RESPONSE"
            shuffle="false"
            data-prompt="kies het juiste antwoord…"
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
        </div>
      </div>
    </qti-item-body>
  `
};

export const SleepvraagOptiesBoven: Story = {
  name: 'ITEM007 — Sleepvraag - opties boven',
  render: () => html`
    <qti-item-body>
      <div>
        <p>Koppel het natuurkundige verschijnsel aan de juiste eenheid:</p>
        <qti-match-interaction
          response-identifier="RESPONSE"
          response="left_vermogen right_pascal,left_frequentie right_hertz"
          correct-response="left_vermogen right_watt,left_druk right_pascal,left_frequentie right_hertz"
          show-candidate-correction
          show-full-correct-response
        >
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="left_vermogen" match-max="1"
              >Vermogen</qti-simple-associable-choice
            >
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
            <qti-simple-associable-choice identifier="right_hertz" match-max="1"
              >hertz (Hz)</qti-simple-associable-choice
            >
          </qti-simple-match-set>
        </qti-match-interaction>

        <img src="/assets/api/kennisnet/resources/icons-physics.png" alt="Eenheden" />
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Vermogen → watt (W)</li>
            <li>Druk → pascal (Pa)</li>
            <li>Frequentie → hertz (Hz)</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const SleepvraagOptiesRechts: Story = {
  name: 'ITEM008 — Sleepvraag - opties rechts',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col8">
          <p>Koppel de historicus/auteur aan het bijbehorende werk:</p>
          <qti-match-interaction
            response-identifier="RESPONSE"
            class="qti-choices-right"
            response="left_harari right_ggs,left_arendt right_thc"
            correct-response="left_diamond right_ggs,left_harari right_sapiens,left_arendt right_thc"
            show-candidate-correction
            show-full-correct-response
          >
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
              <qti-simple-associable-choice identifier="right_sapiens" match-max="1"
                >Sapiens</qti-simple-associable-choice
              >
              <qti-simple-associable-choice identifier="right_ggs" match-max="1"
                >Guns, Germs and Steel</qti-simple-associable-choice
              >
              <qti-simple-associable-choice identifier="right_thc" match-max="1"
                >The Human Condition</qti-simple-associable-choice
              >
            </qti-simple-match-set>
          </qti-match-interaction>
        </div>
        <div class="qti-layout-col4 qti-margin-t-5">
          <img src="/assets/api/kennisnet/resources/books.png" alt="Boeken" class="qti-valign-middle" width="250" />
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Diamond → Guns, Germs and Steel</li>
            <li>Harari → Sapiens</li>
            <li>Arendt → The Human Condition</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const SleepvraagMeerdereAntwoordenPerCategorie: Story = {
  name: 'ITEM009 — Sleepvraag – meerdere antwoorden per categorie',
  render: () => html`
    <qti-item-body>
      <div>
        <p>
          Sleep de onderstaande begrippen naar het juiste vak: <strong>Biologie</strong> of <strong>Scheikunde</strong>.
        </p>
        <qti-match-interaction
          response-identifier="RESPONSE"
          response="enzym scheikunde,isotoop scheikunde,mitochondrion scheikunde,molmassa biologie"
          correct-response="enzym biologie,isotoop scheikunde,katalysator scheikunde,mitochondrion biologie,molmassa scheikunde"
          show-candidate-correction
          show-full-correct-response
        >
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="enzym" match-max="1">enzym</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="isotoop" match-max="1">isotoop</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="katalysator" match-max="1"
              >katalysator</qti-simple-associable-choice
            >
            <qti-simple-associable-choice identifier="mitochondrion" match-max="1"
              >mitochondrion</qti-simple-associable-choice
            >
            <qti-simple-associable-choice identifier="molmassa" match-max="1">molmassa</qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="biologie" match-max="5">Biologie</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="scheikunde" match-max="5"
              >Scheikunde</qti-simple-associable-choice
            >
          </qti-simple-match-set>
        </qti-match-interaction>

        <img src="/assets/api/kennisnet/resources/physics-chemistry.png" alt="Natuur- en scheikunde" />
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Biologie: enzym, mitochondrion</li>
            <li>Scheikunde: isotoop, katalysator, molmassa</li>
          </ul>
          <p>
            Toelichting: een katalysator komt ook in biologie voor, maar als algemeen begrip past het primair bij
            chemie.
          </p>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const SleepvraagAfbeeldingenKoppelen: Story = {
  name: 'ITEM017 — Sleepvraag – afbeeldingen koppelen',
  render: () => html`
    <qti-item-body>
      <p>Koppel elk vervoermiddel aan de bijbehorende energiebron:</p>
      <qti-match-interaction
        response-identifier="RESPONSE"
        response="left_auto right_elektriciteit,left_trein right_brandstof,left_fiets right_spierkracht"
        correct-response="left_auto right_brandstof,left_trein right_elektriciteit,left_fiets right_spierkracht"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="left_auto" match-max="1">
            <img src="/assets/api/kennisnet/resources/vehicle-car.svg" alt="Auto" width="100" height="65" />
          </qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="left_trein" match-max="1">
            <img src="/assets/api/kennisnet/resources/vehicle-train.svg" alt="Trein" width="110" height="65" />
          </qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="left_fiets" match-max="1">
            <img src="/assets/api/kennisnet/resources/vehicle-bike.svg" alt="Fiets" width="100" height="75" />
          </qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="right_brandstof" match-max="1">
            <img src="/assets/api/kennisnet/resources/energy-fuel.svg" alt="Brandstof" width="70" height="90" />
          </qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="right_elektriciteit" match-max="1">
            <img src="/assets/api/kennisnet/resources/energy-electric.svg" alt="Elektriciteit" width="70" height="90" />
          </qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="right_spierkracht" match-max="1">
            <img src="/assets/api/kennisnet/resources/energy-human.svg" alt="Spierkracht" width="70" height="90" />
          </qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Auto → Brandstof</li>
            <li>Trein → Elektriciteit</li>
            <li>Fiets → Spierkracht</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const Matrixvraag: Story = {
  name: 'ITEM010 — Matrixvraag',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col10">
          <p>Geef voor elk van de onderstaande stellingen aan of ze juist of onjuist zijn.</p>
          <qti-match-interaction
            response-identifier="RESPONSE"
            class="qti-match-tabular"
            response="evenaar onjuist,helium onjuist,pluto juist"
            correct-response="evenaar juist,helium juist,pluto onjuist"
            show-candidate-correction
            show-full-correct-response
          >
            <qti-simple-match-set>
              <qti-simple-associable-choice identifier="evenaar" match-max="1"
                >De evenaar loopt door drie continenten</qti-simple-associable-choice
              >
              <qti-simple-associable-choice identifier="helium" match-max="1"
                >Helium is lichter dan lucht</qti-simple-associable-choice
              >
              <qti-simple-associable-choice identifier="pluto" match-max="1"
                >Pluto wordt officieel beschouwd als een planeet</qti-simple-associable-choice
              >
            </qti-simple-match-set>
            <qti-simple-match-set>
              <qti-simple-associable-choice identifier="juist" match-max="3">Juist</qti-simple-associable-choice>
              <qti-simple-associable-choice identifier="onjuist" match-max="3">Onjuist</qti-simple-associable-choice>
            </qti-simple-match-set>
          </qti-match-interaction>

          <p>Vink per continent aan welke landen erop liggen (meerdere antwoorden mogelijk).</p>
          <qti-match-interaction
            response-identifier="RESPONSE_CHECK"
            class="qti-match-tabular"
            response="egypte afrika,brazilie zuidamerika,japan azie,japan afrika"
            correct-response="egypte afrika,brazilie zuidamerika,japan azie"
            show-candidate-correction
            show-full-correct-response
          >
            <qti-simple-match-set>
              <qti-simple-associable-choice identifier="egypte" match-max="0">Egypte</qti-simple-associable-choice>
              <qti-simple-associable-choice identifier="brazilie" match-max="0">Brazilië</qti-simple-associable-choice>
              <qti-simple-associable-choice identifier="japan" match-max="0">Japan</qti-simple-associable-choice>
            </qti-simple-match-set>
            <qti-simple-match-set>
              <qti-simple-associable-choice identifier="afrika" match-max="0">Afrika</qti-simple-associable-choice>
              <qti-simple-associable-choice identifier="zuidamerika" match-max="0"
                >Zuid-Amerika</qti-simple-associable-choice
              >
              <qti-simple-associable-choice identifier="azie" match-max="0">Azië</qti-simple-associable-choice>
            </qti-simple-match-set>
          </qti-match-interaction>
        </div>
        <div class="qti-layout-col2">
          <img src="/assets/api/kennisnet/resources/question-marks.png" alt="Vragen" width="130" />
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <table>
            <thead>
              <tr>
                <th>Stelling</th>
                <th>Antwoord</th>
                <th>Toelichting</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Evenaar door drie continenten</td>
                <td>Juist</td>
                <td>Zuid-Amerika, Afrika, Azië</td>
              </tr>
              <tr>
                <td>Helium is lichter dan lucht</td>
                <td>Juist</td>
                <td>Helium heeft een lagere dichtheid dan lucht</td>
              </tr>
              <tr>
                <td>Pluto officieel planeet</td>
                <td>Onjuist</td>
                <td>Pluto is sinds 2006 geclassificeerd als dwergplaneet</td>
              </tr>
            </tbody>
          </table>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const WoordenSelecteren: Story = {
  name: 'ITEM011 — Woorden selecteren',
  render: () => html`
    <qti-item-body>
      <div>
        <p>Selecteer het woord dat duidt op oorzaak:</p>
        <qti-hottext-interaction
          response-identifier="RESPONSE1"
          max-choices="1"
          response="ht_daalde"
          correct-response="ht_door"
          show-candidate-correction
          show-full-correct-response
        >
          <div class="qti-margin-s-5 qti-italic">
            De productiviteit <qti-hottext identifier="ht_daalde">daalde</qti-hottext> aanzienlijk
            <qti-hottext identifier="ht_door">door</qti-hottext> een
            <qti-hottext identifier="ht_tekort">tekort</qti-hottext> aan grondstoffen.
          </div>
        </qti-hottext-interaction>
      </div>
      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <strong>Uitleg:</strong> Het woord <em>door</em> geeft in deze zin de oorzaak aan. Het beschrijft waarom de
          productiviteit daalde, namelijk als gevolg van een tekort aan grondstoffen. De andere woorden beschrijven
          respectievelijk de handeling (<em>daalde</em>) en de oorzaak zelf (<em>tekort</em>), maar niet het
          oorzakelijke verband.
        </qti-content-body>
      </qti-rubric-block>

      <div class="qti-padding-t-5">
        <p>Selecteer het synoniem van 'onderzoek':</p>
        <qti-hottext-interaction
          response-identifier="RESPONSE2"
          max-choices="1"
          response="ht_rapport"
          correct-response="ht_analyse"
          show-candidate-correction
          show-full-correct-response
        >
          <div class="qti-padding-s-5 qti-italic">
            In het <qti-hottext identifier="ht_rapport">rapport</qti-hottext> wordt beschreven hoe de
            <qti-hottext identifier="ht_analyse">analyse</qti-hottext> tot stand is gekomen.
          </div>
        </qti-hottext-interaction>
      </div>
      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <strong>Uitleg:</strong> Het woord <em>analyse</em> fungeert in deze context als synoniem van
          <em>onderzoek</em>. Een analyse is een vorm van systematisch onderzoek waarbij gegevens worden bestudeerd om
          tot inzichten te komen. Het woord <em>rapport</em> verwijst alleen naar de uitwerking of het document van een
          onderzoek, niet naar het onderzoek zelf.
        </qti-content-body>
      </qti-rubric-block>

      <div class="qti-padding-t-5">
        <p>Selecteer het woord dat een voordeel aanduidt:</p>
        <qti-hottext-interaction
          response-identifier="RESPONSE3"
          max-choices="1"
          response="ht_werkmodel"
          correct-response="ht_flexibiliteit"
          show-candidate-correction
          show-full-correct-response
        >
          <div class="qti-padding-s-5 qti-italic">
            Een hybride <qti-hottext identifier="ht_werkmodel">werkmodel</qti-hottext> biedt meer
            <qti-hottext identifier="ht_flexibiliteit">flexibiliteit</qti-hottext> voor
            <qti-hottext identifier="ht_medewerkers">medewerkers</qti-hottext>.
          </div>
        </qti-hottext-interaction>
      </div>
      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <strong>Uitleg:</strong> Het woord <em>flexibiliteit</em> duidt het voordeel van een hybride werkmodel aan.
          Het benoemt een positieve eigenschap die medewerkers extra mogelijkheden geeft. De andere woorden (<em
            >werkmodel</em
          >
          en <em>medewerkers</em>) zijn neutrale begrippen zonder waardeoordeel en beschrijven geen voordeel.
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const WoordenSelecterenNietHerkenbaar: Story = {
  name: 'ITEM012 — Woorden selecteren (niet herkenbaar)',
  render: () => html`
    <qti-item-body>
      <p>Selecteer alle werkwoorden in de volgende zin (de woorden zijn niet herkenbaar gemarkeerd):</p>
      <div class="qti-bordered qti-padding-3 qti-margin-x-2 qti-margin-y-4">
        <qti-hottext-interaction
          max-choices="0"
          response-identifier="RESPONSE"
          class="qti-unselected-hidden"
          response="ht_technicus,ht_apparaat"
          correct-response="ht_onderzocht,ht_verving"
          show-candidate-correction
          show-full-correct-response
          show-correct-response
        >
          <div>
            “De
            <qti-hottext identifier="ht_technicus">technicus</qti-hottext>
            <qti-hottext identifier="ht_onderzocht">onderzocht</qti-hottext>
            het
            <qti-hottext identifier="ht_apparaat">apparaat</qti-hottext>
            en
            <qti-hottext identifier="ht_verving">verving</qti-hottext>
            uiteindelijk de
            <qti-hottext identifier="ht_defecte">defecte</qti-hottext>
            <qti-hottext identifier="ht_sensor">sensor</qti-hottext>
            .”
          </div>
        </qti-hottext-interaction>
      </div>
    </qti-item-body>
  `
};

export const VolgordevraagHorizontaal: Story = {
  name: 'ITEM013 — Volgordevraag (horizontaal)',
  render: () => html`
    <qti-item-body>
      <p>Zet de volgende stappen van het wetenschappelijke proces in de juiste volgorde (van links naar rechts):</p>
      <qti-order-interaction
        response-identifier="RESPONSE"
        shuffle="false"
        orientation="horizontal"
        response="step_hypothese,step_conclusies,step_data"
        correct-response="step_hypothese,step_data,step_conclusies"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-simple-choice identifier="step_hypothese">Hypothese formuleren</qti-simple-choice>
        <qti-simple-choice identifier="step_conclusies">Conclusies trekken</qti-simple-choice>
        <qti-simple-choice identifier="step_data">Data verzamelen</qti-simple-choice>
      </qti-order-interaction>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Correcte volgorde: Hypothese formuleren → Data verzamelen → Conclusies trekken</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const VolgordevraagVerticaal: Story = {
  name: 'ITEM014 — Volgordevraag (verticaal)',
  render: () => html`
    <qti-item-body>
      <p>Sorteer de volgende getallen van klein naar groot:</p>
      <qti-order-interaction
        response-identifier="RESPONSE"
        shuffle="false"
        orientation="vertical"
        response="num_sqrt2,num_1,num_pi"
        correct-response="num_1,num_sqrt2,num_pi"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-simple-choice identifier="num_sqrt2">√2 (≈ 1,414)</qti-simple-choice>
        <qti-simple-choice identifier="num_1">1</qti-simple-choice>
        <qti-simple-choice identifier="num_pi">π (≈ 3,14159)</qti-simple-choice>
      </qti-order-interaction>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>Correcte volgorde: 1 → √2 → π</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const Gatentekst: Story = {
  name: 'ITEM015 — Gatentekst',
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col4">
          <img src="/assets/api/kennisnet/resources/chemistry.png" alt="Vragen" width="300" class="qti-margin-3" />
        </div>
        <div class="qti-layout-col8">
          <p>Vul de juiste termen in:</p>
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
              “Een oplossing met een pH lager dan 7 noemen we
              <qti-gap identifier="gap_low"></qti-gap>
              , terwijl een oplossing met een pH hoger dan 7
              <qti-gap identifier="gap_high"></qti-gap>
              is.”
            </p>
          </qti-gap-match-interaction>
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <ul>
            <li>pH &lt; 7 → zuur</li>
            <li>pH &gt; 7 → basisch</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

export const PuntSelecteren: Story = {
  name: 'ITEM016 — Punt selecteren',
  render: () => html`
    <qti-item-body>
      <div>
        <qti-select-point-interaction
          response-identifier="RESPONSE"
          max-choices="1"
          response="50 100"
          area-mappings='[{"shape":"circle","coords":"191,393,10","mappedValue":1}]'
          show-candidate-correction
          show-correct-response
        >
          <qti-prompt>
            <p>Klik op één punt op de kaart van Europa waar het land ligt met de hoogste bevolkingsdichtheid.</p>
          </qti-prompt>
          <img src="/assets/api/kennisnet/resources/europe.svg" width="600" height="513" alt="Kaart van Europa" />
        </qti-select-point-interaction>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body>
          <p>
            Correct land: Monaco. Monaco heeft met ruime afstand de hoogste bevolkingsdichtheid (~26.000 personen/km²).
          </p>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};
