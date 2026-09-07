/**
 * Regression for issue #145: the item from the report has a second match set holding a single
 * target, which renders full-width, and drops into it were silently refused — the chip animated
 * back to the source set and RESPONSE stayed empty.
 *
 * The trigger was geometric rather than "one target": the inventory-priority collision heuristic
 * ranks zones by average corner distance, which grows with a zone's own size, so a full-width
 * target lost to the source set beside it. Hence the width cases below.
 */
import '@citolab/qti-components';

import drag from '../../../../tools/testing/drag';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiMatchInteraction } from './qti-match-interaction';

// 60x60 transparent PNG, so image choices get a real box like the reported item's diagrams.
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAJ0lEQVR42u3RAQ0AAAjDsOPfNBp2' +
  'gVvTJDkPCAgICAgICAgICAj8FfgAoS4B4pR5jkgAAAAASUVORK5CYII=';

const reportedItem = `
<qti-assessment-item identifier="match" title="Characters and Plays" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="directedPair">
    <qti-correct-response><qti-value>D S</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="string"></qti-outcome-declaration>
  <qti-item-body>
    <qti-match-interaction response-identifier="RESPONSE" shuffle="true" min-associations="1">
      <qti-prompt>Drag the diagram that represents the biggest obtuse angle into the box below.</qti-prompt>
      <qti-simple-match-set>
        ${['A', 'B', 'C', 'D']
          .map(
            id =>
              `<qti-simple-associable-choice identifier="${id}" match-max="1"><img src="${PNG}" width="60" height="60" alt="angle ${id}"/></qti-simple-associable-choice>`
          )
          .join('')}
      </qti-simple-match-set>
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="S" match-max="1">The biggest obtuse angle</qti-simple-associable-choice>
      </qti-simple-match-set>
    </qti-match-interaction>
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
</qti-assessment-item>`;

describe('qti-match-interaction: dropping into a single full-width target', () => {
  let host: HTMLElement;
  let item: QtiAssessmentItem;
  let interaction: QtiMatchInteraction;

  beforeEach(async () => {
    host = document.createElement('div');
    /*
     * 360px, not wider: the `tests` project runs a 414px-wide viewport, and the drag helper
     * resolves its release target with document.elementFromPoint. A host wider than the viewport
     * puts the target's centre off-screen and the drag lands nowhere — a false failure that looks
     * exactly like the bug under test.
     */
    host.style.cssText = 'position:relative;width:360px;padding:20px;background:#fff';
    document.body.appendChild(host);
    host.innerHTML = reportedItem;

    item = host.querySelector('qti-assessment-item') as QtiAssessmentItem;
    interaction = host.querySelector('qti-match-interaction') as QtiMatchInteraction;
    await item.updateComplete;
    await interaction.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => host.remove());

  const choice = (identifier: string) =>
    host.querySelector(`qti-simple-associable-choice[identifier="${identifier}"]`) as HTMLElement;

  const feedback = () => item['_context'].variables.find((v: { identifier: string }) => v.identifier === 'FEEDBACK');

  it('gives every choice and the target a real box', () => {
    for (const identifier of ['A', 'B', 'C', 'D', 'S']) {
      const rect = choice(identifier).getBoundingClientRect();
      expect(rect.width, `choice ${identifier} has no width`).toBeGreaterThan(0);
      expect(rect.height, `choice ${identifier} has no height`).toBeGreaterThan(0);
    }
    // The single target spans the interaction — the geometry that used to refuse the drop.
    expect(choice('S').getBoundingClientRect().width).toBeGreaterThan(choice('D').getBoundingClientRect().width * 2);
  });

  it('records the directed pair when a choice is dropped on the target', async () => {
    await drag(choice('D'), { to: choice('S'), duration: 400 });
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(interaction.response).toEqual('D S');
  });

  it('scores the drop through response processing', async () => {
    await drag(choice('D'), { to: choice('S'), duration: 400 });
    await new Promise(resolve => setTimeout(resolve, 150));
    item.processResponse();
    expect(feedback()!.value).toBe('correct');
  });

  it('scores a wrong drop as incorrect', async () => {
    await drag(choice('A'), { to: choice('S'), duration: 400 });
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(interaction.response).toEqual('A S');
    item.processResponse();
    expect(feedback()!.value).toBe('incorrect');
  });

  // A full single-capacity target only swaps for a chip dragged out of ANOTHER target — see
  // isSwapTarget in drag-drop-slotted.mixin.ts. From the source set it stays blocked.
  it('leaves a full match-max="1" target alone on a second drop from the source set', async () => {
    await drag(choice('A'), { to: choice('S'), duration: 400 });
    await new Promise(resolve => setTimeout(resolve, 150));
    await drag(choice('D'), { to: choice('S'), duration: 400 });
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(interaction.response).toEqual('A S');
  });
});
