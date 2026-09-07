/**
 * Correction-mode entry point: the standard delivery elements with the correction variants
 * substituted, registered globally.
 *
 *   <script type="module">import '@citolab/qti-components/corrections';</script>
 *
 * The sibling of the package root. `@citolab/qti-components` registers the standard elements;
 * this registers the same set with the correction variants winning for the tags they cover, plus
 * the correction-only controls (`item-show-correct-response`, `test-show-correct-response`,
 * `item-correct-response-mode`, `item-show-candidate-correction`). Import ONE of the two.
 *
 * Why substitution rather than "corrections on top": the correction classes are keyed by the
 * STANDARD tag names — `QtiChoiceInteractionCorrection` is `ChoiceCorrectionMixin(
 * QtiChoiceInteraction)` registered as `qti-choice-interaction`. A registry holds one constructor
 * per tag, so this is a replacement, never an addition. Everything without a correction variant —
 * the processing operators, most test controls, interactions like media and upload — still gets
 * its standard constructor, because a page needs those to work at all.
 *
 * Every import below is a `/elements` subpath, deliberately. The package ROOTS run their
 * `register.ts` on evaluation and would define the standard constructors before this file gets to
 * choose; `/elements` exports the `{ tag, ctor }` arrays and defines nothing.
 */
import { qtiBaseElements } from '@qti-components/base/elements';
import { qtiContentElements } from '@qti-components/elements/elements';
import { qtiItemElements } from '@qti-components/item/elements';
import { qtiProcessingElements } from '@qti-components/processing/elements';
import { qtiTestElements } from '@qti-components/test/elements';
import { qtiInteractionElements } from '@qti-components/interactions/elements';
import { qtiCorrectionElements } from '@qti-components/corrections/elements';

const standardElements = [
  ...qtiBaseElements,
  ...qtiProcessingElements,
  ...qtiContentElements,
  ...qtiItemElements,
  ...qtiTestElements,
  ...qtiInteractionElements
];

// Keyed as `string`, not the inferred literal union: the lookup below is driven by the standard
// tag lists, most of whose tags have no correction variant.
const correctionByTag = new Map<string, CustomElementConstructor>(
  qtiCorrectionElements.map(({ tag, ctor }) => [tag, ctor])
);

/**
 * Registration is first-wins and silent — every `register.ts` in the workspace guards with
 * `if (!customElements.get(tag))` so that a module graph holding two copies of a package does not
 * throw `NotSupportedError` on the second define.
 *
 * That guard makes the failure mode here invisible: if anything already pulled in
 * `@citolab/qti-components` (or a package root) the standard constructor holds the tag, this file
 * skips it, and the page renders correctly EXCEPT that nothing ever shows a correct answer.
 * Nothing throws and nothing logs. So say it out loud.
 */
const alreadyTaken = qtiCorrectionElements
  .filter(({ tag, ctor }) => {
    const registered = customElements.get(tag);
    return registered !== undefined && registered !== ctor;
  })
  .map(({ tag }) => tag);

if (alreadyTaken.length > 0) {
  console.warn(
    `[@citolab/qti-components/corrections] ${alreadyTaken.length} tag(s) were already registered ` +
      `by another entry point, so the correction variants for them are inactive: ` +
      `${alreadyTaken.join(', ')}. Import EITHER '@citolab/qti-components' OR ` +
      `'@citolab/qti-components/corrections', not both.`
  );
}

for (const { tag, ctor } of standardElements) {
  if (!customElements.get(tag)) customElements.define(tag, correctionByTag.get(tag) ?? ctor);
}

// The correction-only controls, which replace no standard tag.
for (const { tag, ctor } of qtiCorrectionElements) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

export * from '@qti-components/corrections';
