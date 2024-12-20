import { action } from '@storybook/addon-actions';
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { createRef, ref } from 'lit/directives/ref.js';
import { QtiAssessmentItem, QtiMatchInteraction } from '../../index';

import { expect, fn, waitFor, within } from '@storybook/test';
import drag from '../../../../testing/drag';
import { InputType } from '@storybook/core/types';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import '../../../../item.css';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-match-interaction');

type Story = StoryObj<QtiMatchInteraction & typeof args>;

const meta: Meta<QtiMatchInteraction & { class: InputType; 'response-identifier': string }> = {
  component: 'qti-match-interaction',
  subcomponents: { QtiSimpleAssociableChoice: 'qti-simple-associable-choice' },
  args: { ...args, 'response-identifier': 'RESPONSE' } /* set default value for response-identifier */,
  argTypes: {
    ...argTypes,
    class: {
      options: ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right', 'qti-match-tabular'],
      control: { type: 'select' },
      table: { category: 'Styling' }
    }
  },
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'no-tests']
};
export default meta;

export const Default: Story = {
  render: args => {
    return html`
      ${template(
        /* add data-testid to args, without adding it to the controls of the story */
        { ...args, 'data-testid': 'match-interaction' },
        html`<qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
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
          </qti-simple-match-set>`
      )}
    `;
  }
};

export const Play: Story = {
  render: Default.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Retrieve interaction, source, and target elements from the canvas
    const interaction = canvas.getByTestId<QtiMatchInteraction>('match-interaction');
    const dragC = canvas.getByText('Capulet');
    const dropM = canvas.getByText('A Midsummer-Nights');

    // // Define the interaction response event handler to capture the response
    const interactionResponse = fn(event => {
      // Ensure the interaction response detail contains the expected values
      console.log(event.detail.response);
    });

    // Add the event listener for 'qti-interaction-response'
    canvasElement.addEventListener('qti-interaction-response', interactionResponse);

    try {
      await step('Drag 1 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragC, { to: dropM, duration: 500 });
      });

      await step('Drag capulus to drop and test qti-interaction-response event', async () => {
        console.log('DAAR GAAN WE', dropM);

        // Simulate the drag and drop operation
        await drag(dragC, { to: dropM, duration: 500 });

        // Wait for the interaction response event to be triggered and verify the handler was called
      });
      await waitFor(() => expect(interactionResponse).toHaveBeenCalled());
    } finally {
      // Clean up the event listener to avoid memory leaks
      canvasElement.removeEventListener('qti-interaction-response', interactionResponse);
    }
    await step('Reset interaction and set response manually', async () => {
      // Reset the interaction to ensure it is in a known state after the drag and drop
      interaction.reset();

      // Manually set the interaction response to the expected value
      interaction.value = ['C M'];

      // Verify that after the drag-and-drop action, the target contains the source element
      expect(dropM).toContainElement(dragC); // Descriptive: Verifies that the target now contains the dragged source element
    });
  }
};

export const PlayTwoOneZero: Story = {
  render: Default.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Retrieve interaction, source, and target elements from the canvas
    const interaction = canvas.getByTestId<QtiMatchInteraction>('match-interaction');
    const dragC = canvas.getByText('Capulet');
    const dragD = canvas.getByText('Demetrius');
    const dragL = canvas.getByText('Lysander');

    const dropM = canvas.getByText('A Midsummer-Nights');
    const dropR = canvas.getByText('Romeo and Juliet');

    // // Define the interaction response event handler to capture the response
    const interactionResponse = fn(event => {
      // Ensure the interaction response detail contains the expected values
      console.log(event.detail.response);
    });

    // Add the event listener for 'qti-interaction-response'
    canvasElement.addEventListener('qti-interaction-response', interactionResponse);

    try {
      await step('Drag 1 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragC, { to: dropM, duration: 500 });
      });
      await step('Drag 2 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragD, { to: dropM, duration: 500 });
      });
      await step('Drag 3 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragL, { to: dropR, duration: 500 });
      });
    } finally {
      // Clean up the event listener to avoid memory leaks
      canvasElement.removeEventListener('qti-interaction-response', interactionResponse);
    }
    const correctArray = ['C M', 'D M', 'L R'];
    expect(interaction.value).toEqual(correctArray);
  }
};

export const Tabular = {
  render: () =>
    html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="match"
      title="Characters and Plays"
      adaptive="false"
      time-dependent="false"
      data-testid="qti-assessment-item"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
        <qti-correct-response>
          <qti-value>C R</qti-value>
          <qti-value>D M</qti-value>
          <qti-value>L M</qti-value>
          <qti-value>P T</qti-value>
        </qti-correct-response>
        <qti-mapping default-value="0">
          <qti-map-entry map-key="C R" mapped-value="1"></qti-map-entry>
          <qti-map-entry map-key="D M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="L M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="P T" mapped-value="1"></qti-map-entry>
        </qti-mapping>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-item-body>
        <qti-match-interaction
          @qti-interaction-response="${action(`qti-interaction-response`)}"
          class="qti-match-tabular"
          response-identifier="RESPONSE"
          shuffle="true"
          max-associations="1"
        >
          <qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="M" match-max="4"
              >A Midsummer-Night&apos;s Dream</qti-simple-associable-choice
            >
            <qti-simple-associable-choice identifier="R" match-max="4">Romeo and Juliet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="T" match-max="4">The Tempest</qti-simple-associable-choice>
          </qti-simple-match-set>
        </qti-match-interaction>
      </qti-item-body>
      <qti-response-processing
        template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml"
      ></qti-response-processing>
    </qti-assessment-item>`
};

export const TabularAardrijkskunde = {
  render: () => {
    const testRef = createRef<QtiAssessmentItem>();
    return html`<qti-assessment-item
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd
						http://www.duo.nl/schema/dep_extension ../dep_extension.xsd"
        title="3297cq"
        identifier="ITM-3297cq"
        time-dependent="false"
        label="3297cq"
         ${ref(testRef)}
              @qti-interaction-changed="${e => {
                testRef.value.processResponse();
                action(JSON.stringify(e.detail))();
              }}"
      @qti-outcome-changed="${e => {
        action(JSON.stringify(e.detail))();
      }}"
        xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
        xmlns:dep="http://www.duo.nl/schema/dep_extension"
      >
        <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
          <qti-correct-response interpretation="A&amp;B">
            <qti-value>y_A x_1</qti-value>
            <qti-value>y_B x_2</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
          <qti-default-value>
            <qti-value>0</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
          <qti-default-value>
            <qti-value>1</qti-value>
          </qti-default-value> </qti-outcome-declaration
        >
        <qti-item-body class="defaultBody" xml:lang="nl-NL">
          <qti-match-interaction
          id="matchInteraction1"
          class="qti-match-tabular "
          min-associations="2"
          max-associations="2"
          shuffle="false"
          response-identifier="RESPONSE"
        >
        <qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="y_A" match-max="1">
              <div>
                <p>Als koele lucht botst tegen warme vochtige lucht ontstaat frontale neerslag.</p>
              </div>
            </qti-simple-associable-choice>

            <qti-simple-associable-choice identifier="y_B" match-max="1">
              <div>
                <p>De aanvoer van koude lucht vanuit het noorden wordt door de ligging van gebergtes tegengehouden.</p>
              </div>
            </qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="x_1" match-max="2">
              <div class="cito_genclass_BB_2017_A1-012_1">
                <p>juist</p>
              </div>
            </qti-simple-associable-choice>

            <qti-simple-associable-choice identifier="x_2" match-max="2">
              <div class="cito_genclass_BB_2017_A1-012_2">
                <p>onjuist</p>
              </div>
            </qti-simple-associable-choice>
          </qti-simple-match-set>
        </qti-match-interaction>

      	</qti-item-body>
             <qti-response-processing
    		template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"></qti-response-processing>
    </qti-response-processing>
    </qti-assessment-item>`;
  }
};

export const TabularMultiple = {
  render: () =>
    html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
      identifier="match"
      title="Characters and Plays"
      adaptive="false"
      time-dependent="false"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
        <qti-correct-response>
          <qti-value>C R</qti-value>
          <qti-value>D M</qti-value>
          <qti-value>L M</qti-value>
          <qti-value>P T</qti-value>
        </qti-correct-response>
        <qti-mapping default-value="0">
          <qti-map-entry map-key="C R" mapped-value="1"></qti-map-entry>
          <qti-map-entry map-key="D M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="L M" mapped-value="0.5"></qti-map-entry>
          <qti-map-entry map-key="P T" mapped-value="1"></qti-map-entry>
        </qti-mapping>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
      <qti-item-body>
        <qti-match-interaction
          @qti-interaction-response="${action(`qti-interaction-response`)}"
          class="qti-match-tabular"
          response-identifier="RESPONSE"
          shuffle="true"
          max-associations="4"
        >
          <qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="C" match-max="2">Capulet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="D" match-max="2">Demetrius</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="L" match-max="2">Lysander</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="P" match-max="2">Prospero</qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="M" match-max="4"
              >A Midsummer-Night&apos;s Dream</qti-simple-associable-choice
            >
            <qti-simple-associable-choice identifier="R" match-max="4">Romeo and Juliet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="T" match-max="4">The Tempest</qti-simple-associable-choice>
          </qti-simple-match-set>
        </qti-match-interaction>
      </qti-item-body>
      <qti-response-processing
        template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml"
      ></qti-response-processing>
    </qti-assessment-item>`
};
