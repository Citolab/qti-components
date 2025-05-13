import { html } from 'lit';

export default {};

export const Inline = () => {
  return html`<qti-assessment-item>
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>true</qti-value>
      </qti-correct-response>
    </qti-response-declaration>

    <qti-outcome-declaration
      identifier="FEEDBACK"
      cardinality="single"
      base-type="identifier"
    ></qti-outcome-declaration>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" normal-maximum="10.0">
      <qti-default-value>
        <qti-value>0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
      <qti-default-value>
        <qti-value>10.0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
        <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
        <qti-simple-choice identifier="true" fixed="true"
          >True
          <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="true" show-hide="show"
            >That's correct</qti-feedback-inline
          ></qti-simple-choice
        >
        <qti-simple-choice identifier="false" fixed="true"
          >False
          <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="false" show-hide="show"
            >That's not correct</qti-feedback-inline
          ></qti-simple-choice
        >
      </qti-choice-interaction>
      <qti-end-attempt-interaction title="end attempt"></qti-end-attempt-interaction>
    </qti-item-body>
    <qti-response-processing>
      <!--￼This time, FEEDBACK is given the value of the identifier of the option which was selected.-->
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-variable identifier="RESPONSE"></qti-variable>
      </qti-set-outcome-value>
      <qti-response-condition>
        <qti-response-if>
          <qti-match>
            <qti-variable identifier="RESPONSE"></qti-variable>
            <qti-correct identifier="RESPONSE"></qti-correct>
          </qti-match>
          <qti-set-outcome-value identifier="SCORE">
            <qti-variable identifier="MAXSCORE"></qti-variable>
          </qti-set-outcome-value>
        </qti-response-if>
      </qti-response-condition>
    </qti-response-processing>
  </qti-assessment-item>`;
};

export const Modal = () => {
  return html`<qti-assessment-item>
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>true</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-outcome-declaration
      identifier="FEEDBACK"
      cardinality="single"
      base-type="identifier"
    ></qti-outcome-declaration>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" normal-maximum="10.0">
      <qti-default-value>
        <qti-value>0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
      <qti-default-value>
        <qti-value>10.0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
        <qti-prompt>Sigmund Freud and Carl Jung both belong to the psychoanalytic school of psychology.</qti-prompt>
        <qti-simple-choice identifier="true" fixed="true">True </qti-simple-choice>
        <qti-simple-choice identifier="false" fixed="true">False </qti-simple-choice>
      </qti-choice-interaction>
      <qti-end-attempt-interaction title="end attempt"></qti-end-attempt-interaction>
    </qti-item-body>
    <qti-response-processing>
      <qti-set-outcome-value identifier="FEEDBACK">
        <qti-variable identifier="RESPONSE"></qti-variable>
      </qti-set-outcome-value>
      <qti-response-condition>
        <qti-response-if>
          <qti-match>
            <qti-variable identifier="RESPONSE"></qti-variable>
            <qti-correct identifier="RESPONSE"></qti-correct>
          </qti-match>
          <qti-set-outcome-value identifier="SCORE">
            <qti-variable identifier="MAXSCORE"></qti-variable>
          </qti-set-outcome-value>
        </qti-response-if>
      </qti-response-condition>
    </qti-response-processing>

    <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="true">
      <qti-content-body>correct</qti-content-body>
    </qti-modal-feedback>
    <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="false">
      <qti-content-body>incorrect</qti-content-body>
    </qti-modal-feedback>
  </qti-assessment-item>`;
};

export const ModalKennisnet = () => {
  return html`
    <qti-assessment-item title="Plantenanatomie" identifier="QUE_2_1">
      <qti-response-declaration identifier="RESPONSE" base-type="identifier" cardinality="single">
        <qti-correct-response>
          <qti-value>choice2</qti-value>
        </qti-correct-response>
        <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
          <qti-map-entry map-key="choice1" mapped-value="0"></qti-map-entry>
          <qti-map-entry map-key="choice2" mapped-value="2"></qti-map-entry>
          <qti-map-entry map-key="choice3" mapped-value="0"></qti-map-entry>
          <qti-map-entry map-key="choice4" mapped-value="0"></qti-map-entry>
        </qti-mapping>
      </qti-response-declaration>
      <qti-outcome-declaration
        identifier="SCORE"
        base-type="float"
        cardinality="single"
        normal-minimum="0"
        normal-maximum="2"
      >
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration identifier="MAXSCORE" base-type="float" cardinality="single">
        <qti-default-value>
          <qti-value>2</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration identifier="FEEDBACK" base-type="identifier" cardinality="single">
      </qti-outcome-declaration>
      <qti-item-body>
        <p>
          <strong>Uitdroging bij planten.</strong><br /><br />Bij bladeren van planten kunnen de volgende eigenschappen
          voorkomen:<br /><br />1. diep verzonken huidmondjes,<br />2. huidmondjes aan de bovenkant,<br />3. groot
          oppervlak met veel huidmondjes,<br />4. klein oppervlak met een waslaag.<br /><br />Welke van bovenstaande
          eigenschappen beschermen het meest tegen uitdroging?
        </p>
        <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" min-choices="0" max-choices="1">
          <qti-simple-choice identifier="choice1" fixed="false" show-hide="show"> 1 en 3 </qti-simple-choice>
          <qti-simple-choice identifier="choice2" fixed="false" show-hide="show"> 1 en 4 </qti-simple-choice>
          <qti-simple-choice identifier="choice3" fixed="false" show-hide="show"> 2 en 3 </qti-simple-choice>
          <qti-simple-choice identifier="choice4" fixed="false" show-hide="show"> 2 en 4 </qti-simple-choice>
        </qti-choice-interaction>
        <qti-end-attempt-interaction title="end attempt"></qti-end-attempt-interaction>
      </qti-item-body>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-match>
              <qti-variable identifier="RESPONSE"></qti-variable>
              <qti-correct identifier="RESPONSE"></qti-correct>
            </qti-match>
            <qti-set-outcome-value identifier="SCORE">
              <qti-variable identifier="MAXSCORE"></qti-variable>
            </qti-set-outcome-value>
          </qti-response-if>
        </qti-response-condition>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-variable identifier="RESPONSE"></qti-variable>
        </qti-set-outcome-value>
      </qti-response-processing>

      <qti-modal-feedback identifier="choice2" outcome-identifier="FEEDBACK" show-hide="hide">
        <qti-content-body>
          Het juiste antwoord is:
          <p>1 en 4</p>
        </qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback identifier="choice2" outcome-identifier="FEEDBACK" show-hide="show">
        <qti-content-body>Antwoord is goed</qti-content-body>
      </qti-modal-feedback>
    </qti-assessment-item>
  `;
};

export const Woordmars = () => {
  return html`
    <qti-assessment-item identifier="blah" 2>
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>A</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-item-body>
        <qti-choice-interaction class="qti-input-control-hidden" response-identifier="RESPONSE" max-choices="1">
          <qti-prompt> Wat betekent stuk? </qti-prompt>
          <qti-simple-choice identifier="A">
            Een deel
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="A" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="B" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="C" show-hide="show"
              >goed</qti-feedback-inline
            >
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="D" show-hide="show"
              >goed</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="B"
            >Een gat
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="B" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="C"
            >Een krant
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="C" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
          <qti-simple-choice identifier="D">
            Een steen
            <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="D" show-hide="show"
              >fout</qti-feedback-inline
            >
          </qti-simple-choice>
        </qti-choice-interaction>
        <qti-end-attempt-interaction title="end attempt"></qti-end-attempt-interaction>
      </qti-item-body>

      <qti-response-processing>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-variable identifier="RESPONSE"></qti-variable>
        </qti-set-outcome-value>

        <qti-response-condition>
          <qti-response-if>
            <qti-match>
              <qti-variable identifier="RESPONSE"></qti-variable>
              <qti-correct identifier="RESPONSE"></qti-correct>
            </qti-match>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">1</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
          <qti-response-else>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">0</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-else>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>
  `;
};

export const Kringloop = () => {
  return html`
    <qti-assessment-item identifier="kringloop1">
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="float">
        <qti-correct-response interpretation="562 kilo">
          <qti-value>562</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value>
          <qti-value>0</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-item-body>
        <qti-printed-variable identifier="RESPONSE"></qti-printed-variable>
        <div class="qti-layout-row">
          <div class="qti-layout-col12">
            <p>
              <strong>Hoeveel kilo afval werd er 2021 in Nederland per persoon weggegooid?</strong>
            </p>
            <div>
              <qti-slider-interaction
                response-identifier="RESPONSE"
                lower-bound="0"
                step="100"
                upper-bound="1000"
              ></qti-slider-interaction>
              <qti-feedback-block
                id="feedbackblock-correct-exact"
                identifier="correct-exact"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Helemaal goed! Dat is net zoveel als het gewicht van een groot paard! 🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-correct"
                identifier="correct"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Bijna! We rekenen het goed! 562 kilo 😮 Dat is net zoveel als het gewicht van een groot paard!🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-incorrect-less"
                identifier="incorrect-less"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Helaas het is nog meer! 562 kilo 😮! Dat is net zoveel als het gewicht van een groot paard 🐎
              </qti-feedback-block>
              <qti-feedback-block
                id="feedbackblock-incorrect-more"
                identifier="incorrect-more"
                outcome-identifier="FEEDBACK"
                show-hide="show"
              >
                Dat is niet goed, gelukkig is het minder, maar toch 562 kilo! Dat is net zoveel als het gewicht van een
                groot paard!🐎
              </qti-feedback-block>
            </div>
          </div>
        </div>
        <qti-end-attempt-interaction title="end attempt"></qti-end-attempt-interaction>
      </qti-item-body>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-and>
              <qti-gte>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="float">500</qti-base-value>
              </qti-gte>
              <qti-lte>
                <qti-variable identifier="RESPONSE"></qti-variable>
                <qti-base-value base-type="float">600</qti-base-value>
              </qti-lte>
            </qti-and>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">1</qti-base-value>
            </qti-set-outcome-value>
            <qti-response-condition>
              <qti-response-if>
                <qti-equal>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-correct identifier="RESPONSE"></qti-correct>
                </qti-equal>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="identifier">correct-exact</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">correct</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
          </qti-response-if>
          <qti-response-else>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">0</qti-base-value>
            </qti-set-outcome-value>
            <qti-response-condition>
              <qti-response-if>
                <qti-lt>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-base-value base-type="float">500</qti-base-value>
                </qti-lt>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">incorrect-less</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="FEEDBACK">
                  <qti-base-value base-type="string">incorrect-more</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
          </qti-response-else>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>
  `;
};

export const ComplexScoring = () => {
  return html`<qti-assessment-item
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0p1_v1p0.xsd"
    xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
    xmlns:xi="http://www.w3.org/2001/XInclude"
    xmlns:m="http://www.w3.org/1998/Math/MathML"
    identifier="Example05-feedbackBlock-adaptive"
    title="Adaptive - choice of input type"
    time-dependent="false"
    adaptive="true"
    xml:lang="en"
  >
    <qti-response-declaration
      identifier="RESPONSE1"
      cardinality="single"
      base-type="identifier"
    ></qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE21" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>OPTION210</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE22" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>OPTION221</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE23" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>OPTION231</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE24" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>OPTION241</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE25" cardinality="single" base-type="string">
      <qti-correct-response>
        <qti-value>cooks</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE26" cardinality="single" base-type="string">
      <qti-correct-response>
        <qti-value>spoil</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE27" cardinality="single" base-type="string">
      <qti-correct-response>
        <qti-value>broth</qti-value>
      </qti-correct-response>
    </qti-response-declaration>

    <qti-outcome-declaration
      base-type="float"
      cardinality="single"
      identifier="SCORE"
      normal-maximum="10.0"
      normal-minimum="0.0"
    >
      <qti-default-value>
        <qti-value>0.0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <qti-outcome-declaration
      base-type="identifier"
      cardinality="single"
      identifier="FEEDBACK"
    ></qti-outcome-declaration>

    <!--￼Define
      a feedback variable; its cardinality is "multiple" so that it can contain the
      identifiers of several feedback elements, and in this case it is initialised to the identifier,
      part1, of the first part of this adaptive question-->
    <qti-outcome-declaration base-type="identifier" cardinality="multiple" identifier="BODY">
      <qti-default-value>
        <qti-value>part1</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>

    <qti-item-body class="">
      <div class="">
        <!--￼This
              feedbackBlock is the first part of this adaptive question to appear, since the BODY
              variable
                initially contains its identifier, part1; it contains the first multiple choice interaction in this
              question.
                When BODY is set to part2, this feedbackBlock is no longer visible.-->
        <qti-feedback-block id="feedbackBlock0" identifier="part1" outcome-identifier="BODY" show-hide="show">
          <qti-content-body>
            <p>This is the first part of this question: Which of these input methods do you wish to use?</p>
            <qti-choice-interaction
              id="choiceInteraction0"
              max-choices="1"
              response-identifier="RESPONSE1"
              shuffle="true"
            >
              <qti-simple-choice id="simpleChoice0" identifier="OPTION1">Multiple choice </qti-simple-choice>
              <qti-simple-choice id="simpleChoice1" identifier="OPTION2">Drop-down menu </qti-simple-choice>
              <qti-simple-choice id="simpleChoice2" identifier="OPTION3">Typed input </qti-simple-choice>
            </qti-choice-interaction>
          </qti-content-body>
        </qti-feedback-block>

        <!--￼This
              feedbackBlock is the second part of the question; it appears when the BODY variable
              contains
                its identifier,   part2. BODY is a multiple cardinality variable, so it can contain the identifiers
              of
                several feedbackBlocks   (and feedbackInlines) at the same time, each of which is visible if their
              show
                attribute is set to show, or hidden if their show attribute is set to hide.-->
        <qti-feedback-block identifier="part2" outcome-identifier="BODY" show-hide="show">
          <qti-content-body>
            <p>
              OK, this is the type of input you have chosen. Now please answer this, the second part of the question.
            </p>
          </qti-content-body>
        </qti-feedback-block>

        <!--￼This
              feedbackBlock appears if the user chose to use multiple choice in the first part of the
              question –
                it contains the selected type of interaction.-->
        <qti-feedback-block identifier="option1" outcome-identifier="BODY" show-hide="show">
          <qti-content-body>
            <p>Choose the correct saying:</p>
            <qti-choice-interaction max-choices="1" response-identifier="RESPONSE21" shuffle="true">
              <qti-simple-choice identifier="OPTION210">Too many cooks spoil the broth</qti-simple-choice>
              <qti-simple-choice identifier="OPTION211">Too many cooks burn the dinner</qti-simple-choice>
              <qti-simple-choice identifier="OPTION212">Too many children spill the broth</qti-simple-choice>
              <qti-simple-choice identifier="OPTION213">Too many hands spill the beans</qti-simple-choice>
              <qti-simple-choice identifier="OPTION214">Too many children spoil the broth</qti-simple-choice>
            </qti-choice-interaction>
          </qti-content-body>
        </qti-feedback-block>

        <!--￼This
              feedbackBlock appears if the user chose to use drop-down menus in the first part of the
              question –
                it contains the selected type of interaction.-->
        <qti-feedback-block identifier="option2" outcome-identifier="BODY" show-hide="show">
          <qti-content-body>
            <p class="">Complete the saying below by selecting from the lists:</p>
            <p class="">
              Too many
              <qti-inline-choice-interaction response-identifier="RESPONSE22" shuffle="true">
                <qti-inline-choice identifier="OPTION221">cooks</qti-inline-choice>
                <qti-inline-choice identifier="OPTION222">children</qti-inline-choice>
                <qti-inline-choice identifier="OPTION223">hands</qti-inline-choice>
              </qti-inline-choice-interaction>
              <qti-inline-choice-interaction response-identifier="RESPONSE23" shuffle="true">
                <qti-inline-choice identifier="OPTION231">spoil</qti-inline-choice>
                <qti-inline-choice identifier="OPTION232">spill</qti-inline-choice>
                <qti-inline-choice identifier="OPTION233">burn</qti-inline-choice>
              </qti-inline-choice-interaction>
              the
              <qti-inline-choice-interaction response-identifier="RESPONSE24" shuffle="true">
                <qti-inline-choice identifier="OPTION241">broth</qti-inline-choice>
                <qti-inline-choice identifier="OPTION242">dinner</qti-inline-choice>
                <qti-inline-choice identifier="OPTION243">beans</qti-inline-choice>
              </qti-inline-choice-interaction>
              .
            </p>
          </qti-content-body>
        </qti-feedback-block>

        <!--￼This
              feedbackBlock appears if the user chose to type answers in text boxes in the first part
              of the question – it contains the selected type of interaction.-->
        <qti-feedback-block identifier="option3" outcome-identifier="BODY" show-hide="show">
          <qti-content-body>
            <p class="">Complete the saying below:</p>
            <p class="">
              Too many
              <qti-text-entry-interaction
                expected-length="20"
                response-identifier="RESPONSE25"
              ></qti-text-entry-interaction>
              <qti-text-entry-interaction
                expected-length="20"
                response-identifier="RESPONSE26"
              ></qti-text-entry-interaction
              >the
              <qti-text-entry-interaction
                expected-length="20"
                response-identifier="RESPONSE27"
              ></qti-text-entry-interaction
              >.
            </p>
          </qti-content-body>
        </qti-feedback-block>
        <div>
          <!--￼These
                  feedbackInline elements provide feedback on the input given by the user in the
                  second part of the question.-->
          <qti-feedback-inline id="feedbackInline1" identifier="CORRECT" outcome-identifier="FEEDBACK" show-hide="show">
            That's the correct answer.
          </qti-feedback-inline>
          <qti-feedback-inline id="feedbackInline2" identifier="PARTIAL" outcome-identifier="FEEDBACK" show-hide="show">
            Your answer is partially correct; the correct answer is "Too many <b>cooks</b> <b>spoil</b> the
            <b>broth</b>".
          </qti-feedback-inline>
          <qti-feedback-inline
            id="feedbackInline3"
            identifier="INCORRECT"
            outcome-identifier="FEEDBACK"
            show-hide="show"
          >
            Sorry, that's not correct; the correct answer is "Too many <b> cooks</b> <b>spoil</b> the <b>broth</b>".
          </qti-feedback-inline>
        </div>
        <qti-end-attempt-interaction response-identifier="END" title="end attempt"></qti-end-attempt-interaction>
      </div>
    </qti-item-body>

    <qti-response-processing>
      <qti-response-condition>
        <qti-response-if>
          <qti-member>
            <!--￼Check
                      whether "part1" is contained in the BODY variable, and if it is,
                      set up the second part of thequestion.-->
            <qti-base-value base-type="identifier">part1</qti-base-value>
            <qti-variable identifier="BODY"></qti-variable>
          </qti-member>
          <qti-set-outcome-value identifier="BODY">
            <qti-multiple>
              <!--Put
                          "part2" into the BODY variable.-->
              <qti-base-value base-type="identifier">part2</qti-base-value>
            </qti-multiple>
          </qti-set-outcome-value>
          <qti-response-condition>
            <qti-response-if>
              <qti-match>
                <qti-variable identifier="RESPONSE1"></qti-variable>
                <!--￼If
                              the user selected OPTION1 (MCQ) put the identifier, option1,
                              of the feedbackBlock containing the second MCQ into BODY .-->
                <qti-base-value base-type="identifier">OPTION1</qti-base-value>
              </qti-match>
              <qti-set-outcome-value identifier="BODY">
                <qti-multiple>
                  <qti-variable identifier="BODY"></qti-variable>
                  <qti-base-value base-type="identifier">option1</qti-base-value>
                </qti-multiple>
              </qti-set-outcome-value>
            </qti-response-if>
            <qti-response-else-if>
              <qti-match>
                <qti-variable identifier="RESPONSE1"></qti-variable>
                <!--￼If
                              the user selected OPTION2 (drop-down menus) put the identifier, option2,
                              of the feedbackBlock containing the drop-down menus into BODY .-->
                <qti-base-value base-type="identifier">OPTION2</qti-base-value>
              </qti-match>
              <qti-set-outcome-value identifier="BODY">
                <qti-multiple>
                  <qti-variable identifier="BODY"></qti-variable>
                  <qti-base-value base-type="identifier">option2</qti-base-value>
                </qti-multiple>
              </qti-set-outcome-value>
            </qti-response-else-if>
            <qti-response-else-if>
              <qti-match>
                <qti-variable identifier="RESPONSE1"></qti-variable>
                <!--￼If
                              the user selected OPTION3 (text input) put the identifier, option3,
                              of the feedbackBlock containing the text boxes into BODY .-->
                <qti-base-value base-type="identifier">OPTION3</qti-base-value>
              </qti-match>
              <qti-set-outcome-value identifier="BODY">
                <qti-multiple>
                  <qti-variable identifier="BODY"></qti-variable>
                  <qti-base-value base-type="identifier">option3</qti-base-value>
                </qti-multiple>
              </qti-set-outcome-value>
            </qti-response-else-if>
          </qti-response-condition>
        </qti-response-if>
        <qti-response-else-if>
          <qti-member>
            <!--￼If
                      BODY contains part2, the second part of the question has been displayed,
                      so we process the user’s input to the chosen interaction.-->
            <qti-base-value base-type="identifier">part2</qti-base-value>
            <qti-variable identifier="BODY"></qti-variable>
          </qti-member>
          <qti-response-condition>
            <qti-response-if>
              <qti-member>
                <qti-base-value base-type="identifier">option1</qti-base-value>
                <qti-variable identifier="BODY"></qti-variable>
              </qti-member>
              <qti-response-condition>
                <qti-response-if>
                  <qti-match>
                    <qti-variable identifier="RESPONSE21"></qti-variable>
                    <qti-correct identifier="RESPONSE21"></qti-correct>
                  </qti-match>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">CORRECT</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">10.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-if>
                <qti-response-else>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">INCORRECT</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">0.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-else>
              </qti-response-condition>
            </qti-response-if>
            <qti-response-else-if>
              <qti-member>
                <qti-base-value base-type="identifier">option2</qti-base-value>
                <qti-variable identifier="BODY"></qti-variable>
              </qti-member>
              <qti-response-condition>
                <qti-response-if>
                  <qti-and>
                    <qti-match>
                      <qti-variable identifier="RESPONSE22"></qti-variable>
                      <qti-correct identifier="RESPONSE22"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE23"></qti-variable>
                      <qti-correct identifier="RESPONSE23"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE24"></qti-variable>
                      <qti-correct identifier="RESPONSE24"></qti-correct>
                    </qti-match>
                  </qti-and>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">CORRECT</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">10.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-if>
                <qti-response-else-if>
                  <qti-or>
                    <qti-match>
                      <qti-variable identifier="RESPONSE22"></qti-variable>
                      <qti-correct identifier="RESPONSE22"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE23"></qti-variable>
                      <qti-correct identifier="RESPONSE23"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE24"></qti-variable>
                      <qti-correct identifier="RESPONSE24"></qti-correct>
                    </qti-match>
                  </qti-or>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">PARTIAL</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">5.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-else-if>
                <qti-response-else>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">INCORRECT</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">0.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-else>
              </qti-response-condition>
            </qti-response-else-if>
            <qti-response-else-if>
              <qti-member>
                <qti-base-value base-type="identifier">option3</qti-base-value>
                <qti-variable identifier="BODY"></qti-variable>
              </qti-member>
              <qti-response-condition>
                <qti-response-if>
                  <qti-and>
                    <qti-match>
                      <qti-variable identifier="RESPONSE25"></qti-variable>
                      <qti-correct identifier="RESPONSE25"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE26"></qti-variable>
                      <qti-correct identifier="RESPONSE26"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE27"></qti-variable>
                      <qti-correct identifier="RESPONSE27"></qti-correct>
                    </qti-match>
                  </qti-and>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">CORRECT</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">10.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-if>
                <qti-response-else-if>
                  <qti-or>
                    <qti-match>
                      <qti-variable identifier="RESPONSE25"></qti-variable>
                      <qti-correct identifier="RESPONSE25"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE26"></qti-variable>
                      <qti-correct identifier="RESPONSE26"></qti-correct>
                    </qti-match>
                    <qti-match>
                      <qti-variable identifier="RESPONSE27"></qti-variable>
                      <qti-correct identifier="RESPONSE27"></qti-correct>
                    </qti-match>
                  </qti-or>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">PARTIAL</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">5.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-else-if>
                <qti-response-else>
                  <qti-set-outcome-value identifier="FEEDBACK">
                    <qti-base-value base-type="identifier">INCORRECT</qti-base-value>
                  </qti-set-outcome-value>
                  <qti-set-outcome-value identifier="SCORE">
                    <qti-base-value base-type="float">0.0</qti-base-value>
                  </qti-set-outcome-value>
                </qti-response-else>
              </qti-response-condition>
            </qti-response-else-if>
          </qti-response-condition>
          <!-- completionStatus must be specifically set to completed in adaptive questions -->
          <qti-set-outcome-value identifier="completionStatus">
            <qti-base-value base-type="identifier">completed</qti-base-value>
          </qti-set-outcome-value>
        </qti-response-else-if>
      </qti-response-condition>
    </qti-response-processing>
  </qti-assessment-item>`;
};
