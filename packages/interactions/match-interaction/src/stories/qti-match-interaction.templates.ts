import { html } from 'lit';

import choiceB3Image from '../fixtures/72c4b1f4ea9f7ba5548683c37806580e.png';
import choiceB2Image from '../fixtures/80378beafd6b12ab7b97899ce39a2b78.jpg';
import choiceB1Image from '../fixtures/8c571f983f691e42e7b3a0dc2664e51d.png';

/** Fixtures shared by the overview demos and the behavior stories. */
export const testTemplate = html`<qti-prompt
    >Match the following characters to the Shakespeare play they appeared in:</qti-prompt
  >
  <qti-match-interaction data-testid="match-interaction" response-identifier="RESPONSE" max-associations="3">
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
    </qti-simple-match-set>

    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="M" match-max="2">A Midsummer-Nights</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="R" match-max="2">Romeo and Juliet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T" match-max="2">The Tempest</qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>`;

export const multipleAssociationsTemplate = html` <qti-match-interaction
  response-identifier="match_languages_countries"
  shuffle="false"
  max-associations="5"
  min-associations="0"
>
  <qti-prompt>Can you match the cities below with the language most likely to be spoken there?</qti-prompt>
  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="french" fixed="false" show-hide="show" match-max="0" match-min="0"
      >French</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="hungarian" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Hungarian</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="polish" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Polish</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="dutch" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Dutch</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="lithuanian" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Lithuanian</qti-simple-associable-choice
    >
  </qti-simple-match-set>
  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="budapest" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Budapest</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="vilnius" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Vilnius</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="paris" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Paris</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="amsterdam" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Amsterdam</qti-simple-associable-choice
    >
    <qti-simple-associable-choice identifier="warsaw" fixed="false" show-hide="show" match-max="0" match-min="0"
      >Warsaw</qti-simple-associable-choice
    >
  </qti-simple-match-set>
</qti-match-interaction>`;

export const multipleAssociations2Template = html`
  <div>
    <p>Which properties do the following animal classes have?</p>

    <qti-match-interaction max-associations="3" response-identifier="RESPONSE">
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="r1" match-max="0">
          <p>Asexual</p>
        </qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="r2" match-max="0">
          <p>Endothermic</p>
        </qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="r3" match-max="0">
          <p>Possess Gills</p>
        </qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="r4" match-max="0">
          <p>Bear Live Young</p>
        </qti-simple-associable-choice>
      </qti-simple-match-set>
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="h1" match-max="2">Birds</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="h2" match-max="2">Reptiles</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="h3" match-max="2">Mammals</qti-simple-associable-choice>
      </qti-simple-match-set>
    </qti-match-interaction>
  </div>
  <p>Select all choices that apply.</p>
`;

export const optionsRightTemplate = html`
  <qti-match-interaction response-identifier="RESPONSE" shuffle="true" max-associations="4" class="qti-choices-right">
    <qti-prompt>Combineer de teksten</qti-prompt>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="A1" match-max="1">Berlijn</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A2" match-max="1">Amsterdam</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A3" match-max="1">Parijs</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A4" match-max="1">Brussel</qti-simple-associable-choice>
    </qti-simple-match-set>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="B1" match-max="1">Duitsland</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B2" match-max="1">Nederland</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B3" match-max="1">Frankrijk</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B4" match-max="1">Belgie</qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>
`;

export const manyOptionsTemplate = html`
  <div>
    <p>
      <strong>Organellen en hun functies.</strong><br /><br />Geef in het overzicht van de verschillende organellen in
      cellen hun functies.
    </p>
  </div>
  <qti-match-interaction response-identifier="RESPONSE" shuffle="true" max-associations="7">
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="A1" fixed="false" match-max="1" match-min="0">
        endoplasmatisch reticulum
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A2" fixed="false" match-max="1" match-min="0">
        ribosomen
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A3" fixed="false" match-max="1" match-min="0">
        mitochondriën
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A4" fixed="false" match-max="1" match-min="0">
        lysosomen
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A5" fixed="false" match-max="1" match-min="0">
        golgi-apparaat
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A6" fixed="false" match-max="1" match-min="0">
        kern
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A7" fixed="false" match-max="1" match-min="0">
        centrosomen
      </qti-simple-associable-choice>
    </qti-simple-match-set>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="B1" fixed="false" match-max="1" match-min="0">
        isolatie en vervoer van eiwitten
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B2" fixed="false" match-max="1" match-min="0">
        aanmaak van eiwitten
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B3" fixed="false" match-max="1" match-min="0">
        energieproductie
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B4" fixed="false" match-max="1" match-min="0">
        afbreken en/of uitstoten van afval uit de cel
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B5" fixed="false" match-max="1" match-min="0">
        opslag van celproducten
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B6" fixed="false" match-max="1" match-min="0">
        besturing en voortplanting van de cel
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B7" fixed="false" match-max="1" match-min="0">
        vorming van draden bij de kerndeling
      </qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>
`;

export const withImagesTemplate = html`
  <qti-match-interaction response-identifier="RESPONSE" shuffle="true" max-associations="3" class="qti-choices-bottom">
    <qti-prompt>Hoe heet iedereen?</qti-prompt>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="A1" match-max="1">Ernie</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A2" match-max="1">Pino</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="A3" match-max="1">Kermit</qti-simple-associable-choice>
    </qti-simple-match-set>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="B1" match-max="1">
        <img src=${choiceB1Image} alt="afbeelding" />
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B2" match-max="1">
        <img src=${choiceB2Image} alt="afbeelding" />
      </qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B3" match-max="1">
        <img src=${choiceB3Image} alt="afbeelding" />
      </qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>
`;

export const duplicateDropRegressionTemplate = html`
  <qti-match-interaction data-testid="match-interaction-duplicates" response-identifier="RESPONSE" max-associations="3">
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="A" match-max="0">Alpha</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B" match-max="0">Beta</qti-simple-associable-choice>
    </qti-simple-match-set>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="T1" match-max="1">Target 1</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T2" match-max="1">Target 2</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T3" match-max="1">Target 3</qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>
`;

export const sortableAppendWhenTargetAllowsMultipleTemplate = html`
  <qti-match-interaction
    data-testid="match-interaction-sortable-append"
    response-identifier="RESPONSE"
    max-associations="4"
  >
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="A" match-max="0">Alpha</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B" match-max="0">Beta</qti-simple-associable-choice>
    </qti-simple-match-set>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="T1" match-max="1">Target 1</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T2" match-max="1">Target 2</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T3" match-max="2">Target 3</qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>
`;

export const sortableAppendWhenTargetUnlimitedTemplate = html`
  <qti-match-interaction
    data-testid="match-interaction-sortable-unlimited-target"
    response-identifier="RESPONSE"
    max-associations="6"
  >
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="A" match-max="0">Alpha</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B" match-max="0">Beta</qti-simple-associable-choice>
    </qti-simple-match-set>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="T1" match-max="1">Target 1</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T2" match-max="1">Target 2</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T3" match-max="0">Target 3</qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>
`;
