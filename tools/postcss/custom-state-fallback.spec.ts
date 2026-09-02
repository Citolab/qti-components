import postcss from 'postcss';

import customStateFallback from './custom-state-fallback.mjs';

const run = (css: string) => postcss([customStateFallback()]).process(css, { from: undefined }).css;

describe('custom-state-fallback', () => {
  it('pairs a state selector with a data-state arm', () => {
    expect(run('qti-simple-choice:state(checked) { color: red; }')).toBe(
      "qti-simple-choice:is(:state(checked), [data-state~='checked']) { color: red; }"
    );
  });

  it('pairs every state in a compound selector', () => {
    expect(run('a:state(radio):state(checked) { color: red; }')).toBe(
      "a:is(:state(radio), [data-state~='radio']):is(:state(checked), [data-state~='checked']) { color: red; }"
    );
  });

  it('pairs states inside a selector list', () => {
    expect(run('a:state(drag), b:state(droppable) { color: red; }')).toBe(
      "a:is(:state(drag), [data-state~='drag']), b:is(:state(droppable), [data-state~='droppable']) { color: red; }"
    );
  });

  it('pairs a state nested in :not()', () => {
    expect(run('a:not(:state(checked)):hover { color: red; }')).toBe(
      "a:not(:is(:state(checked), [data-state~='checked'])):hover { color: red; }"
    );
  });

  it('keeps a state that precedes ::part()', () => {
    expect(run('a:state(radio)::part(ch) { color: red; }')).toBe(
      "a:is(:state(radio), [data-state~='radio'])::part(ch) { color: red; }"
    );
  });

  /**
   * The reason this runs on the parsed tree rather than over the file text: the
   * theme sources mention `:state(...)` in roughly twenty explanatory comments,
   * including forms like `:state(candidate-*)` that are not selectors at all.
   */
  it('leaves state mentions inside comments alone', () => {
    const css = '/* the :state(candidate-*) rule, and :state(filled) */\na { color: red; }';

    expect(run(css)).toBe(css);
  });

  it('leaves a declaration value alone', () => {
    const css = 'a { content: ":state(checked)"; }';

    expect(run(css)).toBe(css);
  });

  it('is idempotent, so an already-paired selector is untouched', () => {
    const css = "a:is(:state(checked), [data-state~='checked']) { color: red; }";

    expect(run(css)).toBe(css);
  });

  it('leaves a rule with no state selector alone', () => {
    const css = 'a:hover { color: red; }';

    expect(run(css)).toBe(css);
  });
});
