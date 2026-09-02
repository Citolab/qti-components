import { describe, expect, it } from 'vitest';

import { qtiInteractionElements } from './elements';

/**
 * Every interaction that carries a candidate response must observe the `response` ATTRIBUTE.
 *
 * `response` is half of the codec contract in packages/qti-base/src/lib/response.ts — the same
 * grammar `correct-response` uses — and it is how authored markup, a restored attempt, and the
 * theme bench in apps/e2e all put a value into an interaction. The base class only declares
 * `response` as an abstract accessor, though, so each interaction (or its mixin) re-declares the
 * reactive property itself. Nothing forces that declaration to include `attribute: 'response'`.
 *
 * `qti-extended-text-interaction` is what this test exists for. It declared `response` as
 * `@state`, so Lit never observed the attribute: `response="…"` was silently dropped and the
 * textarea rendered empty. Nothing failed — the property still worked, the component still
 * rendered — so the theme bench screenshotted an empty box labelled "answered" for as long as
 * that card existed. A missing attribute produces no error, only a blank field, which is exactly
 * the kind of defect a test has to catch instead of a person.
 *
 * The assertion is an exact set rather than a per-element check, so drift fails in both
 * directions: a new interaction that forgets the attribute fails, and an interaction that gains
 * one without being moved out of the exclusion list below fails too.
 */

/**
 * Interactions that legitimately do NOT take a `response` attribute, with the reason. An entry
 * here is a claim that the response cannot be expressed as an authored string.
 */
const NO_RESPONSE_ATTRIBUTE: Record<string, string> = {
  // A file. There is no string form, and a file cannot be restored from markup.
  'qti-upload-interaction': 'response is an uploaded file',
  // A boolean raised by pressing the button; never authored.
  'qti-end-attempt-interaction': 'response is set by the button press',
  // Play count, written by the player as the candidate watches.
  'qti-media-interaction': 'response is accumulated by the player',
  // Host-script driven; the script owns the response, not the markup.
  'qti-custom-interaction': 'response is owned by the host script',
  /*
   * Questionable rather than principled: position-object records point coordinates, which the
   * codec can express (`"100 150"`) and which qti-select-point already accepts as an attribute.
   * Listed here to describe what is true today, not to argue it should stay that way — if it
   * gains the attribute, delete this entry and the test goes green again.
   */
  'qti-position-object-interaction': 'not implemented; points would be expressible'
};

const observesResponse = (ctor: CustomElementConstructor): boolean =>
  ((ctor as unknown as { observedAttributes?: string[] }).observedAttributes ?? []).includes('response');

describe('response attribute coverage', () => {
  const interactions = qtiInteractionElements.filter(({ tag }) => tag.endsWith('-interaction'));

  it('finds interactions to check', () => {
    // Guards against the filter silently matching nothing if the elements export is restructured.
    expect(interactions.length).toBeGreaterThan(10);
  });

  it('every interaction observes `response` except the documented exclusions', () => {
    const expected = interactions
      .map(({ tag }) => tag)
      .filter(tag => !(tag in NO_RESPONSE_ATTRIBUTE))
      .sort();

    const actual = interactions
      .filter(({ ctor }) => observesResponse(ctor))
      .map(({ tag }) => tag)
      .sort();

    expect(actual).toEqual(expected);
  });

  it('the exclusion list names only real interactions', () => {
    const tags = new Set<string>(interactions.map(({ tag }) => tag));
    const stale = Object.keys(NO_RESPONSE_ATTRIBUTE).filter(tag => !tags.has(tag));

    // A renamed or removed interaction would otherwise leave a permanent free pass behind.
    expect(stale).toEqual([]);
  });
});
