import { html } from 'lit';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import { findAllByShadowRole, findByShadowText } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

type ItemDefinition = {
  identifier: string;
  title: string;
  href: string;
};

type ScoreState = {
  score: number;
  maxScore: number;
  status: 'correct' | 'incorrect' | 'partially-correct' | 'unchecked';
};

type FormativeState = {
  resultVisible: boolean;
};

type QtiTestElement = HTMLElement & {
  navigateTo(type: 'item', id: string): void;
  sessionContext?: { navItemRefId?: string | null };
  testContext?: {
    items: {
      identifier?: string;
      variables?: {
        identifier: string;
        value: string | string[] | null;
        type?: string;
      }[];
    }[];
  };
};

type AssessmentItemElement = HTMLElement & {
  processResponse(countNumAttempts?: boolean, reportValidityAfterScoring?: boolean): boolean;
  variables: {
    identifier: string;
    value: string | string[] | null;
    type?: string;
  }[];
};

const items: ItemDefinition[] = [
  {
    identifier: 'ITEM011-TEST',
    title: 'Meerkeuzevraag',
    href: '/assets/api/kennisnet-2/ITEM011.xml'
  },
  {
    identifier: 'ITEM004-TEST',
    title: 'Tekst invullen',
    href: '/assets/api/kennisnet-2/ITEM004.xml'
  },
  {
    identifier: 'ITEM012-TEST',
    title: 'Meerdere antwoorden',
    href: '/assets/api/kennisnet-2/ITEM012.xml'
  }
];

const stateByRoot = new WeakMap<HTMLElement, FormativeState>();

const assessmentXML = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="KENNISNET-FORMATIVE-REGRESSION" title="Kennisnet formative regression">
  <qti-test-part identifier="TEST-PART" navigation-mode="linear" submission-mode="individual">
    <qti-assessment-section identifier="SECTION" title="Section" visible="true">
      ${items
        .map(item => `<qti-assessment-item-ref identifier="${item.identifier}" href="${item.href}" />`)
        .join('\n      ')}
    </qti-assessment-section>
  </qti-test-part>
</qti-assessment-test>`;

const meta: Meta = {
  title: 'kennisnet/formative correction',
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;

const getRoot = (target: EventTarget | null): HTMLElement | null =>
  target instanceof HTMLElement ? target.closest<HTMLElement>('[data-kennisnet-formative]') : null;

const getState = (root: HTMLElement): FormativeState => {
  let state = stateByRoot.get(root);
  if (!state) {
    state = { resultVisible: false };
    stateByRoot.set(root, state);
  }
  return state;
};

const getQtiTest = (root: HTMLElement): QtiTestElement | null => root.querySelector<QtiTestElement>('qti-test');

const getCurrentItemId = (root: HTMLElement): string => {
  const qtiTest = getQtiTest(root);
  return qtiTest?.sessionContext?.navItemRefId || items[0].identifier;
};

const getContextItem = (root: HTMLElement, identifier = getCurrentItemId(root)) =>
  getQtiTest(root)?.testContext?.items?.find(item => item.identifier === identifier);

const getVariableValue = (root: HTMLElement, itemIdentifier: string, variableIdentifier: string) =>
  getContextItem(root, itemIdentifier)?.variables?.find(variable => variable.identifier === variableIdentifier)?.value;

const getScoreState = (root: HTMLElement, itemIdentifier = getCurrentItemId(root)): ScoreState => {
  const completionStatus = getVariableValue(root, itemIdentifier, 'completionStatus');
  const numAttempts = Number.parseInt(String(getVariableValue(root, itemIdentifier, 'numAttempts') ?? '0'), 10);
  const checked = completionStatus === 'completed' && numAttempts > 0;

  if (!checked) {
    return { score: Number.NaN, maxScore: Number.NaN, status: 'unchecked' };
  }

  const score = Number.parseFloat(String(getVariableValue(root, itemIdentifier, 'SCORE') ?? 'NaN'));
  const maxScore = Number.parseFloat(String(getVariableValue(root, itemIdentifier, 'MAXSCORE') ?? '1'));

  if (score === maxScore) {
    return { score, maxScore, status: 'correct' };
  }

  if (score <= 0) {
    return { score, maxScore, status: 'incorrect' };
  }

  return { score, maxScore, status: 'partially-correct' };
};

const hasAnsweredResponse = (assessmentItem: AssessmentItemElement): boolean =>
  assessmentItem.variables.some(variable => {
    if (variable.type !== 'response') {
      return false;
    }
    return Array.isArray(variable.value) ? variable.value.length > 0 : variable.value !== null && variable.value !== '';
  });

const getActiveAssessmentItem = async (root: HTMLElement): Promise<AssessmentItemElement> => {
  const testContainer = root.querySelector('test-container') as HTMLElement | null;
  const currentId = getCurrentItemId(root);

  return waitFor(() => {
    const itemRef = testContainer?.shadowRoot?.querySelector<HTMLElement>(
      `qti-assessment-item-ref[identifier="${currentId}"]`
    ) as (HTMLElement & { assessmentItem?: AssessmentItemElement }) | null;
    const assessmentItem =
      itemRef?.assessmentItem ??
      itemRef?.querySelector<AssessmentItemElement>('qti-assessment-item') ??
      testContainer?.shadowRoot?.querySelector<AssessmentItemElement>('qti-assessment-item');

    if (!assessmentItem) {
      throw new Error(`No active qti-assessment-item found for ${currentId}`);
    }

    return assessmentItem;
  });
};

const itemCanBeReached = (root: HTMLElement, targetIndex: number): boolean => {
  for (let index = 0; index < targetIndex; index++) {
    if (getScoreState(root, items[index].identifier).status === 'unchecked') {
      return false;
    }
  }

  return true;
};

const navigateToItem = (root: HTMLElement, identifier: string): void => {
  getState(root).resultVisible = false;
  getQtiTest(root)?.navigateTo('item', identifier);
  window.setTimeout(() => updateControls(root), 0);
};

const updateControls = (root: HTMLElement): void => {
  const state = getState(root);
  const currentId = getCurrentItemId(root);
  const currentIndex = Math.max(
    0,
    items.findIndex(item => item.identifier === currentId)
  );
  const currentItem = items[currentIndex];
  const score = getScoreState(root, currentId);
  const nextButton = root.querySelector<HTMLButtonElement>('[data-testid="next-button"]');
  const previousButton = root.querySelector<HTMLButtonElement>('[data-testid="previous-button"]');
  const checkButton = root.querySelector<HTMLButtonElement>('[data-testid="check-button"]');
  const status = root.querySelector<HTMLElement>('[data-testid="status"]');
  const progress = root.querySelector<HTMLElement>('[data-testid="progress"]');
  const result = root.querySelector<HTMLElement>('[data-testid="result"]');

  root.querySelectorAll<HTMLButtonElement>('[data-item-id]').forEach((button, index) => {
    const reachable = itemCanBeReached(root, index);
    button.disabled = !reachable;
    button.classList.toggle('active', button.dataset.itemId === currentId);
    button.dataset.state = getScoreState(root, button.dataset.itemId).status;
  });

  if (progress) {
    progress.textContent = state.resultVisible
      ? 'Resultaat'
      : `Vraag ${currentIndex + 1} van ${items.length}: ${currentItem.title}`;
  }

  if (status) {
    if (score.status === 'unchecked') {
      status.textContent = 'Open';
      status.dataset.state = 'unchecked';
    } else if (score.status === 'correct') {
      status.textContent = `Goed (${score.score}/${score.maxScore})`;
      status.dataset.state = 'correct';
    } else if (score.status === 'incorrect') {
      status.textContent = `Onjuist (${score.score}/${score.maxScore})`;
      status.dataset.state = 'incorrect';
    } else {
      status.textContent = `Gedeeltelijk goed (${score.score}/${score.maxScore})`;
      status.dataset.state = 'partially-correct';
    }
  }

  if (previousButton) {
    previousButton.disabled = currentIndex === 0 || state.resultVisible;
  }

  if (checkButton) {
    checkButton.hidden = state.resultVisible || score.status === 'correct';
  }

  if (nextButton) {
    const currentChecked = score.status !== 'unchecked';
    const isLastItem = currentIndex === items.length - 1;
    nextButton.textContent = isLastItem ? 'Naar resultaat' : 'Volgende';
    nextButton.disabled = state.resultVisible || !currentChecked;
  }

  if (result) {
    result.hidden = !state.resultVisible;
    if (state.resultVisible) {
      const totalScore = items.reduce((sum, item) => sum + (getScoreState(root, item.identifier).score || 0), 0);
      const totalMaxScore = items.reduce((sum, item) => sum + (getScoreState(root, item.identifier).maxScore || 0), 0);
      result.textContent = `Resultaat: ${totalScore}/${totalMaxScore}`;
    }
  }
};

const checkCurrentItem = async (root: HTMLElement): Promise<void> => {
  const assessmentItem = await getActiveAssessmentItem(root);
  const status = root.querySelector<HTMLElement>('[data-testid="status"]');

  if (!hasAnsweredResponse(assessmentItem)) {
    if (status) {
      status.textContent = 'Vul eerst een antwoord in';
      status.dataset.state = 'unanswered';
    }
    return;
  }

  assessmentItem.processResponse(true, true);

  await waitFor(() => {
    const score = getScoreState(root);
    if (score.status === 'unchecked') {
      throw new Error('Item has not been checked yet');
    }
    return score;
  });

  root.querySelector('test-navigation')?.dispatchEvent(
    new CustomEvent('test-show-candidate-correction', {
      bubbles: true,
      composed: true,
      detail: true
    })
  );

  updateControls(root);
};

const handleNext = (root: HTMLElement): void => {
  const currentIndex = items.findIndex(item => item.identifier === getCurrentItemId(root));
  if (currentIndex === items.length - 1) {
    getState(root).resultVisible = true;
    updateControls(root);
    return;
  }

  navigateToItem(root, items[currentIndex + 1].identifier);
};

const handlePrevious = (root: HTMLElement): void => {
  const currentIndex = items.findIndex(item => item.identifier === getCurrentItemId(root));
  if (currentIndex > 0) {
    navigateToItem(root, items[currentIndex - 1].identifier);
  }
};

export const FormativeCorrection: Story = {
  name: 'Kennisnet formative correction flow',
  render: () => html`
    <div data-kennisnet-formative class="kennisnet-formative">
      <style>
        .kennisnet-formative {
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 16px;
          min-height: 100vh;
          padding: 16px;
          background: #f6f8fb;
          color: #1d2433;
          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            sans-serif;
        }

        .kennisnet-formative * {
          box-sizing: border-box;
        }

        .side,
        .main {
          min-width: 0;
        }

        .side {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-right: 1px solid #d8dee8;
          padding-right: 16px;
        }

        .item-button,
        .control-button {
          min-height: 38px;
          border: 1px solid #aeb9c9;
          border-radius: 6px;
          background: #ffffff;
          color: #1d2433;
          font: inherit;
          cursor: pointer;
        }

        .item-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 10px;
          text-align: left;
        }

        .item-button.active {
          border-color: #1b65c9;
          box-shadow: inset 3px 0 0 #1b65c9;
        }

        .item-button[data-state='correct']::after {
          color: #247a3d;
          content: 'Goed';
        }

        .item-button[data-state='incorrect']::after {
          color: #b42318;
          content: 'Onjuist';
        }

        .item-button[data-state='partially-correct']::after {
          color: #8a5a00;
          content: 'Deels';
        }

        .item-button:disabled,
        .control-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .main {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-row,
        .controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .status {
          border: 1px solid #ccd5e2;
          border-radius: 6px;
          background: #ffffff;
          padding: 6px 10px;
          min-width: 180px;
          text-align: center;
        }

        .status[data-state='correct'] {
          border-color: #87c795;
          background: #eef8f0;
        }

        .status[data-state='incorrect'] {
          border-color: #f0a7a1;
          background: #fff1f0;
        }

        .status[data-state='partially-correct'] {
          border-color: #e3c36b;
          background: #fff8df;
        }

        qti-test {
          display: block;
          min-height: 440px;
        }

        test-container {
          display: block;
          min-height: 420px;
          overflow: auto;
          border: 1px solid #d8dee8;
          border-radius: 6px;
          background: #ffffff;
          padding: 16px;
        }

        .controls {
          justify-content: flex-end;
        }

        .control-button {
          padding: 8px 14px;
        }

        .control-button.primary {
          border-color: #1b65c9;
          background: #1b65c9;
          color: #ffffff;
        }

        .result {
          border: 1px solid #aeb9c9;
          border-radius: 6px;
          background: #ffffff;
          padding: 12px;
        }
      </style>

      <aside class="side" aria-label="Vragen">
        ${items.map(
          (item, index) => html`
            <button
              class="item-button"
              type="button"
              data-item-id=${item.identifier}
              @click=${(event: Event) => {
                const root = getRoot(event.currentTarget);
                if (root && itemCanBeReached(root, index)) {
                  navigateToItem(root, item.identifier);
                }
              }}
            >
              <span>${index + 1}. ${item.title}</span>
            </button>
          `
        )}
      </aside>

      <main class="main">
        <div class="status-row">
          <strong data-testid="progress">Vraag 1 van ${items.length}: ${items[0].title}</strong>
          <span class="status" data-testid="status" data-state="unchecked">Open</span>
        </div>

        <qti-test
          navigate="item"
          @qti-test-loaded=${(event: Event) => {
            const root = getRoot(event.currentTarget);
            if (root) {
              updateControls(root);
            }
          }}
          @qti-test-context-updated=${(event: Event) => {
            const root = getRoot(event.currentTarget);
            if (root) {
              updateControls(root);
            }
          }}
          @qti-interaction-changed=${(event: Event) => {
            const root = getRoot(event.currentTarget);
            if (root) {
              window.setTimeout(() => updateControls(root), 0);
            }
          }}
        >
          <test-navigation>
            <test-container
              .testXML=${assessmentXML}
              @qti-test-loaded=${(event: Event) => {
                const root = getRoot(event.currentTarget);
                if (root) {
                  updateControls(root);
                }
              }}
            ></test-container>
          </test-navigation>
        </qti-test>

        <div class="controls">
          <button
            class="control-button"
            type="button"
            data-testid="previous-button"
            @click=${(event: Event) => {
              const root = getRoot(event.currentTarget);
              if (root) {
                handlePrevious(root);
              }
            }}
          >
            Vorige
          </button>
          <button
            class="control-button"
            type="button"
            data-testid="check-button"
            @click=${async (event: Event) => {
              const root = getRoot(event.currentTarget);
              if (root) {
                await checkCurrentItem(root);
              }
            }}
          >
            Nakijken
          </button>
          <button
            class="control-button primary"
            type="button"
            data-testid="next-button"
            disabled
            @click=${(event: Event) => {
              const root = getRoot(event.currentTarget);
              if (root) {
                handleNext(root);
              }
            }}
          >
            Volgende
          </button>
        </div>

        <div class="result" data-testid="result" hidden></div>
      </main>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const nextButton = canvasElement.querySelector<HTMLButtonElement>('[data-testid="next-button"]');
    const checkButton = canvasElement.querySelector<HTMLButtonElement>('[data-testid="check-button"]');
    const status = canvasElement.querySelector<HTMLElement>('[data-testid="status"]');
    const testContainer = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>('test-container');
      if (!element?.shadowRoot) {
        throw new Error('test-container not ready');
      }
      return element;
    });

    await step('Checked incorrect answers reveal correction and unlock navigation', async () => {
      const incorrectChoiceText = await findByShadowText(testContainer, 'Fout');
      const incorrectChoice = incorrectChoiceText.closest('qti-simple-choice') as HTMLElement & {
        internals: { states: CustomStateSet };
      };

      expect(nextButton).toBeDisabled();
      await fireEvent.click(incorrectChoiceText);
      await fireEvent.click(checkButton);

      await waitFor(() => {
        expect(status?.dataset.state).toBe('incorrect');
        expect(nextButton).toBeEnabled();
        expect(incorrectChoice.internals.states.has('candidate-incorrect')).toBe(true);
      });
    });

    await step('Changing the answer hides candidate correction, then a correct check updates the state', async () => {
      const correctChoiceText = await findByShadowText(testContainer, 'Goed');
      const correctChoice = correctChoiceText.closest('qti-simple-choice') as HTMLElement & {
        internals: { states: CustomStateSet };
      };

      await fireEvent.click(correctChoiceText);

      await waitFor(() => {
        expect(correctChoice.internals.states.has('candidate-correct')).toBe(false);
      });

      await fireEvent.click(checkButton);

      await waitFor(() => {
        expect(status?.dataset.state).toBe('correct');
        expect(nextButton).toBeEnabled();
        expect(checkButton).not.toBeVisible();
        expect(correctChoice.internals.states.has('candidate-correct')).toBe(true);
      });
    });

    await step('A partially correct checked answer also allows moving to the next question', async () => {
      await fireEvent.click(nextButton);

      const textboxes = await findAllByShadowRole<HTMLInputElement>(testContainer, 'textbox');
      await userEvent.type(textboxes[0], 'tekst');
      await userEvent.type(textboxes[1], 'verkeerd');
      await fireEvent.click(checkButton);

      await waitFor(() => {
        expect(status?.dataset.state).toBe('partially-correct');
        expect(nextButton).toBeEnabled();
      });

      await fireEvent.click(nextButton);
      await findByShadowText(testContainer, 'Kies meerdere antwoorden');
    });
  }
};
