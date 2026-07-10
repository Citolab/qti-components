import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const KENNISNET_ITEM_WIDTH = 906;

/**
 * Kennisnet themed QTI items. Each story renders a single `<qti-item-body>` with
 * hard-coded incorrect responses and correct-responses so `show-candidate-correction`
 * and `show-full-correct-response` visualisations are triggered immediately.
 */
const meta: Meta = {
  title: 'Kennisnet All Items',
  tags: ['autodocs', 'no-tests', 'vrt'],
  // Fullscreen removes Storybook's default padded-canvas padding, so the story renders
  // from the same origin in the dev canvas and the addon-vitest capture — keeping the VRT
  // baseline overlay aligned.
  parameters: {
    // These stories exist to lock in the Kennisnet look, so prefer that substrate rather than
    // inheriting the toolbar default (`citolab`). A parameter, not meta-level `globals`: the
    // latter would disable the Style picker in the toolbar for these stories.
    styleSubstrate: 'kennisnet',
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
  },
  decorators: [
    story => html`
      <style>
        /* Plain descendant selectors rather than @scope, which is dropped in the
           addon-vitest portable-story render. The fixed width keeps the Kennisnet
           layout identical between Storybook review and VRT capture. */
        .kennisnet-item qti-rubric-block {
          display: block !important;
        }
        .kennisnet-item {
          width: ${KENNISNET_ITEM_WIDTH}px;
          min-width: ${KENNISNET_ITEM_WIDTH}px;
        }
        .kennisnet-item qti-item-body {
          display: block;
          width: ${KENNISNET_ITEM_WIDTH}px;
          min-width: ${KENNISNET_ITEM_WIDTH}px;
          max-width: ${KENNISNET_ITEM_WIDTH}px;
          box-sizing: border-box;
        }
      </style>
      <div class="kennisnet-item">${story()}</div>
    `
  ]
};
export default meta;

type Story = StoryObj;

/** ITEM001 — Meerkeuzevraag één antwoord (single-choice). */
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

/** ITEM002 — Meerkeuzevraag meerdere antwoorden (multi-choice). */
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

/** ITEM003 — Tekstvraag – hoofdletterongevoelig (text entry, case-insensitive). */
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
            <li>"refractie" is de officiële term; "breking" wordt ook goed gerekend.</li>
          </ul>
        </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};

/** ITEM004 — Tekstvraag – exacte match (text entry, exact match). */
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

/** ITEM005 — Open tekstvraag (extended text, manual scoring). */
export const OpenTekstvraag: Story = {
  name: 'ITEM005 — Open tekstvraag',
  render: () => html`
    <qti-item-body>
      <div>
        <img src="/assets/api/kennisnet/resources/solarpark-wind-park.jpg" alt="Wereldkaart" width="100%" />

        <p>
          Leg in 3-5 zinnen uit waarom veel landen overstappen op een mix van zonne- en windenergie in plaats van op één
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

/** ITEM006 — Dropdownvraag (inline choice). */
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

/** ITEM007 — Sleepvraag - opties boven (drag-drop match, options above). */
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

/** ITEM008 — Sleepvraag - opties rechts (drag-drop match, options right). */
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

/** ITEM009 — Sleepvraag – meerdere antwoorden per categorie (drag-drop match, multiple per bucket). */
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

/** ITEM010 — Matrixvraag (tabular match). */
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
            .response=${['egypte afrika', 'brazilie zuidamerika', 'japan azie', 'japan afrika']}
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

/** ITEM011 — Woorden selecteren (hottext selection). */
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

/** ITEM012 — Woorden selecteren (woorden niet herkenbaar) (hottext, hidden choices). */
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
          readonly
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

/** ITEM013 — Volgordevraag (horizontaal) (order interaction, horizontal). */
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

/** ITEM014 — Volgordevraag (verticaal) (order interaction, vertical). */
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

/** ITEM015 — Gatentekst (gap-match). */
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

/** ITEM016 — Punt selecteren (select-point). */
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

/*
 * ITEM017 onwards cover the interactions the sixteen Kennisnet items never reached.
 *
 * Every drag-and-drop interaction except gap-match and match was invisible to VRT, which is how a
 * change to the chip styling of graphic-gap-match could land with a green suite. They carry a
 * pre-filled `response` and a `correct-response` for the same reason the items above do: it puts a
 * placed chip, a candidate correction and the answer key into the frame without a drag.
 *
 * Not covered, deliberately: media (a <video> frame is not reproducible), upload (a native file
 * input renders per-OS), and the two custom-interaction packages (they execute author-supplied
 * script).
 *
 * ITEM018 and ITEM019 are weaker than they look. `qti-hotspot-interaction` and
 * `qti-graphic-order-interaction` ignore a preset `response`: their `qti-hotspot-choice` children
 * come up carrying only `radio` — no `checked`, no `candidate-*`, no `correct-response` — so both
 * baselines capture an untouched question and neither shows a selection, a correction or an answer
 * key. Their baselines still lock the layout, and they will move the day that bug is fixed. Do not
 * read a green ITEM018 as "hotspot selection still renders correctly"; nothing there renders it.
 */

/** ITEM017 — Combineervraag (associate). */
export const Combineervraag: Story = {
  name: 'ITEM017 — Combineervraag',
  render: () => html`
    <qti-item-body>
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
    </qti-item-body>
  `
};

/** ITEM018 — Hotspotvraag (hotspot). */
export const Hotspotvraag: Story = {
  name: 'ITEM018 — Hotspotvraag',
  render: () => html`
    <qti-item-body>
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
    </qti-item-body>
  `
};

/** ITEM019 — Volgorde op afbeelding (graphic-order). */
export const VolgordeOpAfbeelding: Story = {
  name: 'ITEM019 — Volgorde op afbeelding',
  render: () => html`
    <qti-item-body>
      <qti-graphic-order-interaction
        response-identifier="RESPONSE"
        response="A B C"
        correct-response="C B A"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Zet de luchthavens op volgorde van noord naar zuid.</qti-prompt>
        <img src="/assets/qti-graphic-order-interaction/uk.png" height="280" width="206" alt="Kaart van het VK" />
        <qti-hotspot-choice coords="78,102,8" identifier="A" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="117,171,8" identifier="B" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="166,227,8" identifier="C" shape="circle"></qti-hotspot-choice>
      </qti-graphic-order-interaction>
    </qti-item-body>
  `
};

/** ITEM020 — Sleepvraag op afbeelding (graphic-gap-match). */
export const SleepvraagOpAfbeelding: Story = {
  name: 'ITEM020 — Sleepvraag op afbeelding',
  render: () => html`
    <qti-item-body>
      <qti-graphic-gap-match-interaction
        response-identifier="RESPONSE"
        response="DraggerB A,DraggerC B"
        correct-response="DraggerB B,DraggerC C"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Sleep elke gebeurtenis naar het juiste vak op de tijdlijn.</qti-prompt>
        <img
          alt="Tijdlijn van 1939 tot 1991"
          src="/assets/qti-graphic-gap-match-interaction/timeline-558.png"
          height="326"
          width="558"
        />
        <qti-gap-img identifier="DraggerB" match-max="1">
          <img src="/assets/qti-graphic-gap-match-interaction/b-ww2.png" alt="Einde WO2" height="63" width="78" />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerC" match-max="1">
          <img
            src="/assets/qti-graphic-gap-match-interaction/c-vietnam.png"
            alt="Einde Vietnam"
            height="63"
            width="78"
          />
        </qti-gap-img>
        <qti-associable-hotspot
          coords="55,256,133,319"
          identifier="A"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="190,256,268,319"
          identifier="B"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="325,256,403,319"
          identifier="C"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>
    </qti-item-body>
  `
};

/** ITEM021 — Verbind de punten (graphic-associate). */
export const VerbindDePunten: Story = {
  name: 'ITEM021 — Verbind de punten',
  render: () => html`
    <qti-item-body>
      <qti-graphic-associate-interaction
        response-identifier="RESPONSE"
        max-associations="2"
        response="A B"
        correct-response="A B,B C"
        show-candidate-correction
        show-full-correct-response
      >
        <qti-prompt>Teken de nieuwe routes van de luchtvaartmaatschappij.</qti-prompt>
        <img
          src="/assets/qti-graphic-associate-interaction/uk.png"
          alt="Kaart van luchthavens in het VK"
          width="206"
          height="280"
        />
        <qti-associable-hotspot shape="circle" coords="78,102,8" identifier="A" match-max="2"></qti-associable-hotspot>
        <qti-associable-hotspot shape="circle" coords="117,171,8" identifier="B" match-max="2"></qti-associable-hotspot>
        <qti-associable-hotspot shape="circle" coords="166,227,8" identifier="C" match-max="2"></qti-associable-hotspot>
      </qti-graphic-associate-interaction>
    </qti-item-body>
  `
};

/** ITEM022 — Schuifbalk (slider). */
export const Schuifbalk: Story = {
  name: 'ITEM022 — Schuifbalk',
  render: () => html`
    <qti-item-body>
      <qti-slider-interaction response-identifier="RESPONSE" lower-bound="0" upper-bound="100" step="5" response="35">
        <qti-prompt>Hoeveel procent van het aardoppervlak is bedekt met water?</qti-prompt>
      </qti-slider-interaction>
    </qti-item-body>
  `
};
