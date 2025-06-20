import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { QtiFeedbackBlock } from './qti-feedback-block';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-feedback-block');

type Story = StoryObj<QtiFeedbackBlock & typeof args>;

/**
 * ### [3.7.3 Feedback](https://www.imsglobal.org/spec/qti/v3p0/impl#h.of39hkegnqll)
 * # qti-feedback-block
 */
const meta: Meta<QtiFeedbackBlock> = {
  component: 'qti-feedback-block',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
};
export default meta;

export const FeedbackBlock: Story = {
  render: args =>
    html` <qti-assessment-item
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0
  https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0p1_v1p0.xsd"
      identifier="adaptive_mh1"
      title="Monty Hall (Take 1)"
      adaptive="true"
      time-dependent="false"
      xml:lang="en-US"
    >
      <qti-response-declaration
        identifier="DOOR"
        cardinality="single"
        base-type="identifier"
      ></qti-response-declaration>
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>switchStrategy</qti-value>
        </qti-correct-response>
      </qti-response-declaration>

      <qti-outcome-declaration identifier="STORY" cardinality="single" base-type="identifier">
        <qti-default-value>
          <qti-value>openingGambit</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FEEDBACK"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-outcome-declaration identifier="CLOSED" cardinality="multiple" base-type="identifier">
        <qti-default-value>
          <qti-value>DoorA</qti-value>
          <qti-value>DoorB</qti-value>
          <qti-value>DoorC</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="GOATS"
        cardinality="multiple"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-outcome-declaration identifier="PRIZE" cardinality="single" base-type="identifier"></qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="FIRSTDOOR"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-outcome-declaration
        identifier="REVEALED"
        cardinality="single"
        base-type="identifier"
      ></qti-outcome-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>

      <qti-item-body>
        <p>Monty Hall has hidden a prize behind one of these doors.</p>

        <qti-feedback-block outcome-identifier="STORY" show-hide="show" identifier="openingGambit">
          <qti-content-body>
            <p>Monty invites you to choose one of the doors but won't let you open it just yet.</p>
          </qti-content-body></qti-feedback-block
        >
        <qti-feedback-block outcome-identifier="STORY" show-hide="show" identifier="tempter">
          <qti-content-body>
            <p>Monty opens one of the other doors to reveal ........ a goat!</p>
            <p>
              He then asks you if you would like to change your mind or to stick with the door you originally chose.
              It's time to make your mind up, which door are you going to open?
            </p>
          </qti-content-body>
        </qti-feedback-block>
        <qti-feedback-block outcome-identifier="STORY" show-hide="show" identifier="goat">
          <qti-content-body>
            <p>Bad luck! When you opened your chosen door it also revealed a goat.</p>
          </qti-content-body>
        </qti-feedback-block>
        <qti-feedback-block outcome-identifier="STORY" show-hide="show" identifier="prize">
          <qti-content-body>
            <p>
              Congratulations! When you opened your chosen door it revealed a fantastic prize that you are now free to
              take home.
            </p>
          </qti-content-body>
        </qti-feedback-block>

        <qti-choice-interaction response-identifier="DOOR" max-choices="1">
          <qti-simple-choice identifier="DoorA">
            <qti-feedback-inline outcome-identifier="CLOSED" show-hide="show" identifier="DoorA">
              <img src="images/red_door.png" alt="The Red Door" />
            </qti-feedback-inline>
            <qti-feedback-inline outcome-identifier="GOATS" show-hide="show" identifier="DoorA">
              <img src="images/open_goat.png" alt="An open door" /> - this door is now open revealing a goat!
            </qti-feedback-inline>
            <qti-feedback-inline outcome-identifier="PRIZE" show-hide="show" identifier="DoorA">
              <img src="images/open_car.png" alt="An open door" /> - this door is now open revealing a fantastic prize!
            </qti-feedback-inline>
          </qti-simple-choice>
          <qti-simple-choice identifier="DoorB">
            <qti-feedback-inline outcome-identifier="CLOSED" show-hide="show" identifier="DoorB">
              <img src="images/green_door.png" alt="The Green Door" />
            </qti-feedback-inline>
            <qti-feedback-inline outcome-identifier="GOATS" show-hide="show" identifier="DoorB">
              <img src="images/open_goat.png" alt="An open door" /> - this door is now open revealing a goat!
            </qti-feedback-inline>
            <qti-feedback-inline outcome-identifier="PRIZE" show-hide="show" identifier="DoorB">
              <img src="images/open_car.png" alt="An open door" /> - this door is now open revealing a fantastic prize!
            </qti-feedback-inline>
          </qti-simple-choice>
          <qti-simple-choice identifier="DoorC">
            <qti-feedback-inline outcome-identifier="CLOSED" show-hide="show" identifier="DoorC">
              <img src="images/blue_door.png" alt="The Blue Door" />
            </qti-feedback-inline>
            <qti-feedback-inline outcome-identifier="GOATS" show-hide="show" identifier="DoorC">
              <img src="images/open_goat.png" alt="An open door" /> - this door is now open revealing a goat!
            </qti-feedback-inline>
            <qti-feedback-inline outcome-identifier="PRIZE" show-hide="show" identifier="DoorC">
              <img src="images/open_car.png" alt="An open door" /> - this door is now open revealing a fantastic prize!
            </qti-feedback-inline>
          </qti-simple-choice>
        </qti-choice-interaction>

        <qti-feedback-block outcome-identifier="FEEDBACK" show-hide="show" identifier="poser">
          <qti-content-body>
            <p>
              Well, whether or not you won the prize did you make your decision by guesswork or logical reasoning? The
              question is, if we allowed you to play this game repeatedly what strategy <em>should</em> you adopt?
            </p>
            <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
              <qti-simple-choice identifier="stickStrategy">
                Always stick to the first door you chose.
              </qti-simple-choice>
              <qti-simple-choice identifier="switchStrategy">
                Always switch to the other closed door when Monty offers you the chance.
              </qti-simple-choice>
              <qti-simple-choice identifier="noStrategy">
                It really doesn't matter whether you stick or switch - the outcome is the same.
              </qti-simple-choice>
            </qti-choice-interaction>
          </qti-content-body>
        </qti-feedback-block>
        <qti-end-attempt-interaction title="End attempt"></qti-end-attempt-interaction>
      </qti-item-body>

      <qti-response-processing>
        <qti-set-outcome-value identifier="completionStatus">
          <qti-base-value base-type="identifier">incomplete</qti-base-value>
        </qti-set-outcome-value>
        <qti-response-condition>
          <qti-response-if>
            <!-- Transition from openingGambit to tempter -->
            <qti-and>
              <qti-match>
                <qti-base-value base-type="identifier">openingGambit</qti-base-value>
                <qti-variable identifier="STORY"></qti-variable>
              </qti-match>
              <qti-not>
                <qti-is-null>
                  <qti-variable identifier="DOOR"></qti-variable>
                </qti-is-null>
              </qti-not>
            </qti-and>
            <!-- Remember the first door chosen -->
            <qti-set-outcome-value identifier="FIRSTDOOR">
              <qti-variable identifier="DOOR"></qti-variable>
            </qti-set-outcome-value>
            <!-- Randomly open one of the other two doors -->
            <qti-response-condition>
              <qti-response-if>
                <qti-match>
                  <qti-variable identifier="DOOR"></qti-variable>
                  <qti-base-value base-type="identifier">DoorA</qti-base-value>
                </qti-match>
                <qti-set-outcome-value identifier="REVEALED">
                  <qti-random>
                    <qti-multiple>
                      <qti-base-value base-type="identifier">DoorB</qti-base-value>
                      <qti-base-value base-type="identifier">DoorC</qti-base-value>
                    </qti-multiple>
                  </qti-random>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else-if>
                <qti-match>
                  <qti-variable identifier="DOOR"></qti-variable>
                  <qti-base-value base-type="identifier">DoorB</qti-base-value>
                </qti-match>
                <qti-set-outcome-value identifier="REVEALED">
                  <qti-random>
                    <qti-multiple>
                      <qti-base-value base-type="identifier">DoorA</qti-base-value>
                      <qti-base-value base-type="identifier">DoorC</qti-base-value>
                    </qti-multiple>
                  </qti-random>
                </qti-set-outcome-value>
              </qti-response-else-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="REVEALED">
                  <qti-random>
                    <qti-multiple>
                      <qti-base-value base-type="identifier">DoorA</qti-base-value>
                      <qti-base-value base-type="identifier">DoorB</qti-base-value>
                    </qti-multiple>
                  </qti-random>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
            <qti-set-outcome-value identifier="CLOSED">
              <qti-delete>
                <qti-variable identifier="REVEALED"></qti-variable>
                <qti-variable identifier="CLOSED"></qti-variable>
              </qti-delete>
            </qti-set-outcome-value>
            <qti-set-outcome-value identifier="GOATS">
              <qti-multiple>
                <qti-variable identifier="REVEALED"></qti-variable>
              </qti-multiple>
            </qti-set-outcome-value>
            <qti-set-outcome-value identifier="STORY">
              <qti-base-value base-type="identifier">tempter</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
          <qti-response-else-if>
            <!-- Transition from tempter to prize or goat -->
            <qti-and>
              <qti-match>
                <qti-base-value base-type="identifier">tempter</qti-base-value>
                <qti-variable identifier="STORY"></qti-variable>
              </qti-match>
              <qti-not>
                <qti-is-null>
                  <qti-variable identifier="DOOR"></qti-variable>
                </qti-is-null>
              </qti-not>
            </qti-and>
            <!-- We score based on whether you switched (and cheat!) -->
            <qti-response-condition>
              <qti-response-if>
                <qti-or>
                  <qti-match>
                    <qti-variable identifier="DOOR"></qti-variable>
                    <qti-variable identifier="FIRSTDOOR"></qti-variable>
                  </qti-match>
                  <qti-match>
                    <qti-variable identifier="DOOR"></qti-variable>
                    <qti-variable identifier="REVEALED"></qti-variable>
                  </qti-match>
                </qti-or>
                <qti-set-outcome-value identifier="SCORE">
                  <qti-base-value base-type="float">0</qti-base-value>
                </qti-set-outcome-value>
                <qti-set-outcome-value identifier="GOATS">
                  <qti-multiple>
                    <qti-variable identifier="GOATS"></qti-variable>
                    <qti-variable identifier="DOOR"></qti-variable>
                  </qti-multiple>
                </qti-set-outcome-value>
                <qti-set-outcome-value identifier="STORY">
                  <qti-base-value base-type="identifier">goat</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-if>
              <qti-response-else>
                <qti-set-outcome-value identifier="SCORE">
                  <qti-base-value base-type="float">1</qti-base-value>
                </qti-set-outcome-value>
                <qti-set-outcome-value identifier="PRIZE">
                  <qti-variable identifier="DOOR"></qti-variable>
                </qti-set-outcome-value>
                <qti-set-outcome-value identifier="STORY">
                  <qti-base-value base-type="identifier">prize</qti-base-value>
                </qti-set-outcome-value>
              </qti-response-else>
            </qti-response-condition>
            <qti-set-outcome-value identifier="CLOSED">
              <qti-delete>
                <qti-variable identifier="DOOR"></qti-variable>
                <qti-variable identifier="CLOSED"></qti-variable>
              </qti-delete>
            </qti-set-outcome-value>
            <qti-set-outcome-value identifier="FEEDBACK">
              <qti-base-value base-type="identifier">poser</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-else-if>
          <qti-response-else-if>
            <qti-and>
              <qti-match>
                <qti-variable identifier="FEEDBACK"></qti-variable>
                <qti-base-value base-type="identifier">poser</qti-base-value>
              </qti-match>
              <qti-not>
                <qti-is-null>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                </qti-is-null>
              </qti-not>
            </qti-and>
            <qti-response-condition>
              <qti-response-if>
                <qti-match>
                  <qti-variable identifier="RESPONSE"></qti-variable>
                  <qti-correct identifier="RESPONSE"></qti-correct>
                </qti-match>
                <qti-set-outcome-value identifier="SCORE">
                  <qti-sum>
                    <qti-variable identifier="SCORE"></qti-variable>>
                    <qti-base-value base-type="float">2</qti-base-value>
                  </qti-sum>
                </qti-set-outcome-value>
              </qti-response-if>
            </qti-response-condition>
            <qti-set-outcome-value identifier="FEEDBACK">
              <qti-variable identifier="RESPONSE"></qti-variable>
            </qti-set-outcome-value>
            <qti-set-outcome-value identifier="completionStatus">
              <qti-base-value base-type="identifier">completed</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-else-if>
        </qti-response-condition>
      </qti-response-processing>

      <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="stickStrategy">
        <qti-content-body
          >No. Initially, the probability of the prize being behind each door is 1/3. Opening a losing door can't
          possibly make this go down for the remaining closed one! In fact you should <em>never</em> stick to your
          original decision.
        </qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="switchStrategy">
        <qti-content-body
          >Yes, you should <em>always</em> switch doors when offered the chance. Congratulations, perhaps you should
          think about a career as a TV game show contestant?
        </qti-content-body>
      </qti-modal-feedback>
      <qti-modal-feedback outcome-identifier="FEEDBACK" show-hide="show" identifier="noStrategy">
        <qti-content-body>
          <p>
            No, you should in fact <em>always</em> switch doors. This problem has fooled many mathematicians since it
            was first posed in an American magazine article and continues to present a seemingly paradoxical answer!
          </p>
          <p>
            The probability of your first choice door hiding the prize is 1/3 and this can't change. But, 2/3 of the
            time you'll be wrong with your first choice and, by revealing a goat, Monty is effectively telling you which
            door the prize is behind the remaining 2/3 of the time! So by switching doors, your chances of getting the
            prize go up to 2/3!
          </p>
        </qti-content-body>
      </qti-modal-feedback>
    </qti-assessment-item>`,
  play: async ({ canvasElement }) => {
    // const canvas = within(canvasElement);
    expect(true).toBe(true);
  }
};
