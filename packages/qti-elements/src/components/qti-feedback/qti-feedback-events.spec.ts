import '@citolab/qti-components';
import { html, render } from 'lit';

import type { FeedbackEventDetail, QtiAssessmentItem, QtiFeedbackBlock } from '@qti-components/elements';

/** One item with a block, an inline and a modal feedback on FEEDBACK = 'incorrect', and a `hide` block. */
const item = html`<qti-assessment-item identifier="feedback-events">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>ChoiceA</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier">
    <qti-default-value><qti-value>empty</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-simple-choice identifier="ChoiceA">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">Choice B</qti-simple-choice>
    </qti-choice-interaction>
    <qti-feedback-block outcome-identifier="FEEDBACK" identifier="incorrect" show-hide="show">
      <qti-content-body>Block incorrect</qti-content-body>
    </qti-feedback-block>
    <p>
      <qti-feedback-inline outcome-identifier="FEEDBACK" identifier="incorrect" show-hide="show"
        >Inline incorrect</qti-feedback-inline
      >
    </p>
    <qti-feedback-block outcome-identifier="FEEDBACK" identifier="correct" show-hide="hide">
      Not correct
    </qti-feedback-block>
  </qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-match>
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-match>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-base-value base-type="identifier">correct</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-base-value base-type="identifier">incorrect</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
  </qti-response-processing>
  <qti-modal-feedback outcome-identifier="FEEDBACK" identifier="incorrect" show-hide="show">
    Modal incorrect
  </qti-modal-feedback>
</qti-assessment-item>`;

describe('qc-feedback-show / qc-feedback-hide', () => {
  let host: HTMLDivElement;
  let root: ShadowRoot;
  let shown: FeedbackEventDetail[];
  let hidden: FeedbackEventDetail[];

  /** The item sits in a shadow root, as in a test: the listeners are on the host outside it. */
  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = host.attachShadow({ mode: 'open' });
    shown = [];
    hidden = [];
    host.addEventListener('qc-feedback-show', e => shown.push(e.detail));
    host.addEventListener('qc-feedback-hide', e => hidden.push(e.detail));
  });

  afterEach(() => host.remove());

  const setup = async () => {
    render(item, root as unknown as HTMLElement);
    const assessmentItem = root.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await assessmentItem.updateComplete;
    const answer = async (choice: string) => {
      assessmentItem.updateResponseVariable('RESPONSE', choice);
      assessmentItem.processResponse();
      await Promise.all(
        [
          ...root.querySelectorAll<HTMLElement & { updateComplete: Promise<unknown> }>(
            'qti-feedback-block, qti-feedback-inline, qti-modal-feedback'
          )
        ].map(f => f.updateComplete)
      );
    };
    return {
      answer,
      block: root.querySelector<QtiFeedbackBlock>('qti-feedback-block[identifier="incorrect"]')!,
      hideBlock: root.querySelector<QtiFeedbackBlock>('qti-feedback-block[identifier="correct"]')!,
      inline: root.querySelector('qti-feedback-inline')!,
      modal: root.querySelector('qti-modal-feedback')!
    };
  };

  const dialogOf = (el: Element) => el.shadowRoot!.querySelector('dialog')!;

  it('without a listener that cancels, feedback shows as before', async () => {
    const { answer, block, inline, modal, hideBlock } = await setup();
    await answer('ChoiceB');

    expect(block.showStatus).toBe('on');
    expect(inline.showStatus).toBe('on');
    expect(modal.showStatus).toBe('on');
    expect(dialogOf(modal).open).toBe(true);
    expect(hideBlock.showStatus).toBe('on');
    expect(block.shadowRoot!.querySelector('slot')!.getAttribute('part')).toBe('feedback');

    expect(shown.map(d => [d.kind, d.identifier])).toEqual(
      expect.arrayContaining([
        ['block', 'incorrect'],
        ['inline', 'incorrect'],
        ['modal', 'incorrect'],
        ['block', 'correct']
      ])
    );
    expect(shown).toHaveLength(4);
    const blockDetail = shown.find(d => d.element === block)!;
    expect(blockDetail).toMatchObject({ outcomeIdentifier: 'FEEDBACK', itemIdentifier: 'feedback-events' });
  });

  it('preventDefault keeps a block, inline and modal feedback hidden, with its content in the DOM', async () => {
    host.addEventListener('qc-feedback-show', e => e.preventDefault());
    const { answer, block, inline, modal, hideBlock } = await setup();
    await answer('ChoiceB');

    for (const el of [block, inline, modal, hideBlock]) expect(el.showStatus, el.localName).toBe('off');
    expect(dialogOf(modal).open).toBe(false);
    expect(getComputedStyle(block.shadowRoot!.querySelector('slot')!).display).toBe('none');
    expect(getComputedStyle(inline.shadowRoot!.querySelector('slot')!).display).toBe('none');
    expect(block.querySelector('qti-content-body')!.textContent).toContain('Block incorrect');
    expect(shown).toHaveLength(4);
  });

  it('hide comes when the condition turns false, show when it turns true again', async () => {
    const { answer, block } = await setup();
    await answer('ChoiceB');
    expect(shown.filter(d => d.element === block)).toHaveLength(1);

    await answer('ChoiceA');
    expect(block.showStatus).toBe('off');
    // block, inline, modal and the `hide` block all turn off.
    expect(hidden.map(d => d.kind).sort()).toEqual(['block', 'block', 'inline', 'modal']);

    await answer('ChoiceB');
    expect(shown.filter(d => d.element === block)).toHaveLength(2);
  });

  it('a repeat attempt with the same outcome changes nothing: no hide, no second show', async () => {
    const { answer, block } = await setup();
    await answer('ChoiceB');
    await answer('ChoiceB');
    // The item publishes once per attempt, with the final values: FEEDBACK goes from 'incorrect' to
    // 'incorrect' and never passes through the reset to its default in between.
    expect(shown.filter(d => d.element === block)).toHaveLength(1);
    expect(hidden.filter(d => d.element === block)).toHaveLength(0);
    expect(block.showStatus).toBe('on');
  });

  it('cancelling hide keeps the feedback showing: the host hides it itself', async () => {
    host.addEventListener('qc-feedback-hide', e => {
      if (e.detail.kind === 'block' && e.detail.identifier === 'incorrect') e.preventDefault();
    });
    const { answer, block } = await setup();
    await answer('ChoiceB');
    await answer('ChoiceA');
    expect(block.showStatus).toBe('on');
  });

  it('a feedback the host took over stays off and is asked again at every attempt, with no hide', async () => {
    host.addEventListener('qc-feedback-show', e => {
      if (e.detail.kind === 'modal') e.preventDefault();
    });
    const { answer, modal } = await setup();
    await answer('ChoiceB');
    expect(dialogOf(modal).open).toBe(false);
    expect(modal.showStatus).toBe('off');

    await answer('ChoiceA');
    expect(hidden.filter(d => d.element === modal)).toHaveLength(0);

    await answer('ChoiceB');
    expect(shown.filter(d => d.element === modal)).toHaveLength(2);
    expect(modal.showStatus).toBe('off');
  });
});
