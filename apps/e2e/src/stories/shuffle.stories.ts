import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { qtiTransformItem } from '@qti-components/transformers';

import { toBePositionedRelativeTo } from '../../../../tools/testing/setup/toBePositionedRelativeTo';

import type { QtiSimpleChoice } from '@qti-components/interactions';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

// type Story = StoryObj<typeof args>;
const xml = String.raw;

const meta: Meta = {
  component: 'shuffle',
  title: 'Stories/shuffle'
};
export default meta;

export const Choice: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`
            <qti-assessment-item>
              <qti-item-body>
                <qti-choice-interaction shuffle="true">
                  <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
                  <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
                  <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
                </qti-choice-interaction>
              </qti-item-body>
            </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify options are shuffled', async () => {
      const canvas = within(canvasElement);
      const ChoiceA = canvas.getByText<QtiSimpleChoice>('Optie A');
      const ChoiceB = canvas.getByText<QtiSimpleChoice>('Optie B');
      const ChoiceC = canvas.getByText<QtiSimpleChoice>('Optie C');
      const bUnderA = toBePositionedRelativeTo(ChoiceB, ChoiceA, 'below');
      const cUnderb = toBePositionedRelativeTo(ChoiceC, ChoiceB, 'below');
      const result = bUnderA.pass && cUnderb.pass;
      expect(result).toBe(false);
    });
  }
};

export const InlineChoice: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`
            <qti-assessment-item>
              <qti-item-body>
                <qti-inline-choice-interaction data-testid="inline-choice" shuffle="true">
                  <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
                  <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
                  <qti-inline-choice identifier="Y">York</qti-inline-choice>
                </qti-inline-choice-interaction>
              </qti-item-body>
            </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    const interaction = await waitFor(
      () => {
        const interaction = canvasElement.querySelector('qti-inline-choice-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
        return interaction;
      },
      { timeout: 5000 }
    );
    await step('Verify options are shuffled', async () => {
      const originalOrder = ['Gloucester', 'Lancaster', 'York'];
      const renderedOptions = (
        Array.from(interaction.shadowRoot?.querySelectorAll('option') || []) as HTMLOptionElement[]
      )
        .filter(option => option.textContent !== 'select')
        .map(option => option.textContent);

      expect(renderedOptions.join('&')).not.toBe(originalOrder.join('&'));
    });
  }
};

export const MatchInteraction: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-match-interaction shuffle="true" response-identifier="RESPONSE" max-associations="4">
                <qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
                <qti-simple-match-set>
                  <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
                </qti-simple-match-set>
                <qti-simple-match-set>
                  <qti-simple-associable-choice identifier="M" match-max="4"
                    >A Midsummer-Night's Dream</qti-simple-associable-choice
                  >
                  <qti-simple-associable-choice identifier="R" match-max="4">Romeo and Juliet</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="T" match-max="4">The Tempest</qti-simple-associable-choice>
                </qti-simple-match-set>
              </qti-match-interaction>
           </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    const interaction = await waitFor(
      () => {
        const interaction = canvasElement.querySelector('qti-match-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
        return interaction;
      },
      { timeout: 5000 }
    );
    await step('Verify options are shuffled', async () => {
      const capulet = interaction.querySelector('qti-simple-associable-choice[identifier="C"]');
      const demetrius = interaction.querySelector('qti-simple-associable-choice[identifier="D"]');
      const lysander = interaction.querySelector('qti-simple-associable-choice[identifier="L"]');
      const prospero = interaction.querySelector('qti-simple-associable-choice[identifier="P"]');

      const capuletLeftToDemetrius = toBePositionedRelativeTo(capulet, demetrius, 'left');
      const demetriusLeftToLysander = toBePositionedRelativeTo(demetrius, lysander, 'left');
      const lysanderLeftToProspero = toBePositionedRelativeTo(lysander, prospero, 'left');
      const prosperoLeftToLysander = toBePositionedRelativeTo(prospero, lysander, 'left');
      const result =
        capuletLeftToDemetrius.pass &&
        demetriusLeftToLysander.pass &&
        lysanderLeftToProspero.pass &&
        prosperoLeftToLysander.pass;
      expect(result).toBe(false);

      const tempest = interaction.querySelector('qti-simple-associable-choice[identifier="T"]');
      const midsummer = interaction.querySelector('qti-simple-associable-choice[identifier="M"]');
      const romeo = interaction.querySelector('qti-simple-associable-choice[identifier="R"]');
      const midsummerLeftToRomeo = toBePositionedRelativeTo(midsummer, romeo, 'left');
      const romeoLeftToTempest = toBePositionedRelativeTo(romeo, tempest, 'left');
      const result2 = midsummerLeftToRomeo.pass && romeoLeftToTempest.pass;
      expect(result2).toBe(false);
    });
  }
};

export const MatchInteractionTabular: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-match-interaction shuffle="true" class="qti-match-tabular" response-identifier="RESPONSE" max-associations="4">
                <qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
                <qti-simple-match-set>
                  <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
                </qti-simple-match-set>
                <qti-simple-match-set>
                  <qti-simple-associable-choice identifier="M" match-max="4"
                    >A Midsummer-Night's Dream</qti-simple-associable-choice
                  >
                  <qti-simple-associable-choice identifier="R" match-max="4">Romeo and Juliet</qti-simple-associable-choice>
                  <qti-simple-associable-choice identifier="T" match-max="4">The Tempest</qti-simple-associable-choice>
                </qti-simple-match-set>
              </qti-match-interaction>
           </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify options are shuffled', async () => {
      const canvas = within(canvasElement);

      const rows = canvas.getAllByShadowRole('row');

      const columnHeaders = canvas.getAllByShadowRole('columnheader');
      const columnHeadersTextValues = columnHeaders.map(header => header.textContent);

      expect(columnHeadersTextValues).not.toBe(['Capulet', 'Demetrius', 'Lysander', 'Prospero']);

      const firstColumnCells = rows.slice(1).map(row => row.querySelector('td:first-child'));

      const firstColumnTextValues = firstColumnCells.map(cell => cell.textContent);
      expect(firstColumnTextValues.includes("A Midsummer-Night's Dream"));
      expect(firstColumnTextValues).not.toBe(["A Midsummer-Night's Dream", 'Romeo and Juliet', 'The Tempest']);
    });
  }
};

export const OrderInteraction: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
           <qti-order-interaction response-identifier="RESPONSE" shuffle="true">
              <qti-prompt>The following F1 drivers finished on the podium in the first ever Grand Prix
                of Bahrain. Can you rearrange them into the correct finishing order?</qti-prompt>
              <qti-simple-choice identifier="DriverA">Rubens Barrichello</qti-simple-choice>
              <qti-simple-choice identifier="DriverB">Jenson Button</qti-simple-choice>
              <qti-simple-choice identifier="DriverC" fixed="true">Michael Schumacher</qti-simple-choice>
            </qti-order-interaction>
           </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify options are shuffled', async () => {
      const canvas = within(canvasElement);
      const jenson = canvas.getByText<QtiSimpleChoice>('Jenson Button');
      const rubens = canvas.getByText<QtiSimpleChoice>('Rubens Barrichello');
      const schumacher = canvas.getByText<QtiSimpleChoice>('Michael Schumacher');

      const rubensUnderOrRightToJenson =
        toBePositionedRelativeTo(rubens, jenson, 'below').pass ||
        toBePositionedRelativeTo(rubens, jenson, 'right').pass;
      const jensonUnderOfRightToSchumacher =
        toBePositionedRelativeTo(jenson, schumacher, 'below').pass ||
        toBePositionedRelativeTo(jenson, schumacher, 'right').pass;

      const schumacherUnderOrRightToRubens =
        toBePositionedRelativeTo(schumacher, rubens, 'below').pass ||
        toBePositionedRelativeTo(schumacher, rubens, 'right').pass;

      expect(
        rubensUnderOrRightToJenson && jensonUnderOfRightToSchumacher,
        'expect the sequence is different from orginal'
      ).toBe(false);

      // we know what sequence it will be because there's a fixed alternative and only 2 non-fixed alternatives, so only 2 possible sequences where 1 is the orginal one that we don't present.
      expect(rubensUnderOrRightToJenson, 'expect rubens under or right to jenson').toBe(true);
      expect(schumacherUnderOrRightToRubens, 'expect schumacher under or right to rubens').toBe(true);
    });
  }
};

export const OrderInteraction2: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
          		<qti-order-interaction response-identifier="RESPONSE" shuffle="true">
                <qti-prompt>
                  Zet de volgende dagelijkse activiteiten in de juiste volgorde:
                </qti-prompt>
                <qti-simple-choice data-testid="simple" identifier="_7277e44510f33087d07f4066d0ce308b">
                  Opstaan
                </qti-simple-choice>
                <qti-simple-choice data-testid="simple" identifier="_1295359046aa972a407e41a1350316e7">
                  Aankleden
                </qti-simple-choice>
                <qti-simple-choice data-testid="simple" identifier="_97094d4eb5162950ed0f771abed47e4d">
                  Ontbijten
                </qti-simple-choice>
                <qti-simple-choice data-testid="simple" identifier="_1815d0886d3fddd35b602bc0054b868d">
                  Naar school gaan
                </qti-simple-choice>
                <qti-simple-choice data-testid="simple" identifier="_ec46da4638d1a6bc9c7d601efcb88bd2">
                  Naar bed gaan
                </qti-simple-choice>
              </qti-order-interaction>
           </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify options are shuffled', async () => {
      const canvas = within(canvasElement);
      const simples = await canvas.findAllByShadowTestId('simple');
      const simpleTexts = Array.from(simples)
        .map(simple => simple.textContent)
        .join('#');

      const originalOrder = 'Opstaan#Aankleden#Ontbijten#Naar school gaan#Naar bed gaan';
      expect(simpleTexts).not.toBe(originalOrder);
    });
  }
};

export const GapMatchInteraction: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`<qti-assessment-item>
          <qti-item-body>
            <qti-gap-match-interaction response-identifier="RESPONSE" shuffle="true">
                <qti-gap-text data-testid="gap-text" identifier="W1" match-max="1" match-min="1" show-hide="show">
                  plank
                </qti-gap-text>
                <qti-gap-text data-testid="gap-text" identifier="W2" match-max="1" match-min="1" show-hide="show">
                  haring
                </qti-gap-text>
                <qti-gap-text data-testid="gap-text" identifier="W3" match-max="1" match-min="1" show-hide="show">
                  knaagt
                </qti-gap-text>
                <qti-gap-text data-testid="gap-text" identifier="W4" match-max="1" match-min="1" show-hide="show">
                  vlecht
                </qti-gap-text>
                <qti-gap-text data-testid="gap-text" identifier="W5" match-max="1" match-min="1" show-hide="show">
                  eiland
                </qti-gap-text>
                <p>
                  Mijn vader zaagt de&#xa0;
                  <qti-gap identifier="G1" />
                  &#xa0;in vier gelijke stukken.
                </p>
                <p>
                  De visboer verkoopt heerlijke&#xa0;
                  <qti-gap identifier="G2" />
                  .
                </p>
                <p>
                  De hamster&#xa0;
                  <qti-gap identifier="G3" />
                  &#xa0;op een pinda.
                </p>
                <p>
                  Moeder maakt een&#xa0;
                  <qti-gap identifier="G4" />
                  &#xa0;in mijn haar.
                </p>
                <p>
                  De piraat heeft ergens op een&#xa0;
                  <qti-gap identifier="G5" />
                  &#xa0;zijn schat begraven.
                </p>
              </qti-gap-match-interaction>
            </qti-item-body>
            </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify options are shuffled', async () => {
      const canvas = within(canvasElement);
      const gapTexts = await canvas.findAllByShadowTestId('gap-text');
      const gapTextIds = Array.from(gapTexts)
        .map(gapText => gapText.getAttribute('identifier'))
        .join('#');

      expect(gapTextIds).not.toBe('W1#W2#W3#W4#W5');
    });
  }
};

export const AssociateInteraction: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`<qti-assessment-item>
          <qti-item-body>
              <qti-associate-interaction response-identifier="RESPONSE" shuffle="true" max-associations="3">
                <qti-prompt>
                  Hidden in this list of characters from famous
                  Shakespeare plays are three pairs of rivals. Can you match
                  each character to his adversary?
                </qti-prompt>
                <qti-simple-associable-choice data-testid="associable-choice" identifier="A" match-max="1">
                  Antonio
                </qti-simple-associable-choice>
                <qti-simple-associable-choice data-testid="associable-choice" identifier="C" match-max="1">
                  Capulet
                </qti-simple-associable-choice>
                <qti-simple-associable-choice data-testid="associable-choice" identifier="D" match-max="1">
                  Demetrius
                </qti-simple-associable-choice>
                <qti-simple-associable-choice data-testid="associable-choice" identifier="L" match-max="1">
                  Lysander
                </qti-simple-associable-choice>
                <qti-simple-associable-choice data-testid="associable-choice" identifier="M" match-max="1">
                  Montague
                </qti-simple-associable-choice>
                <qti-simple-associable-choice data-testid="associable-choice" identifier="P" match-max="1">
                  Prospero
                </qti-simple-associable-choice>
              </qti-associate-interaction>
            </qti-item-body>
            </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify options are shuffled', async () => {
      const canvas = within(canvasElement);
      const gapTexts = await canvas.findAllByShadowTestId('associable-choice');
      const gapTextIds = Array.from(gapTexts)
        .map(gapText => gapText.getAttribute('identifier'))
        .join('#');

      expect(gapTextIds).not.toBe('A#C#D#L#M#P');
    });
  }
};
