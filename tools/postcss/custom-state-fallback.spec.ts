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
   * `[attr]` may not follow a pseudo-element, and `data-state` is on the host, not the part, so the
   * paired form only ever worked through forgiving `:is()` parsing. Left as written instead.
   */
  it('leaves a state that follows ::part() as written', () => {
    const css = 'a::part(drag):state(candidate-correct) { color: red; }';

    expect(run(css)).toBe(css);
  });

  it('pairs only the states before ::part()', () => {
    expect(run('a:state(radio)::part(drag):state(candidate-correct) { color: red; }')).toBe(
      "a:is(:state(radio), [data-state~='radio'])::part(drag):state(candidate-correct) { color: red; }"
    );
  });

  /**
   * One unparseable selector drops the whole list. A browser without `:state()` cannot parse the
   * post-::part arm, so kept in one rule it would take the bank chip's fallback arm down with it.
   */
  it('moves post-::part states out of a mixed list into a rule of their own', () => {
    expect(run('a:state(drag):state(candidate-correct),\nb::part(drag):state(candidate-correct) { color: red; }')).toBe(
      "a:is(:state(drag), [data-state~='drag']):is(:state(candidate-correct), [data-state~='candidate-correct']) { color: red; }\n" +
        'b::part(drag):state(candidate-correct) { color: red; }'
    );
  });

  it('does not split a selector list on the commas inside :is()', () => {
    expect(run(':is(a, b):state(checked) { color: red; }')).toBe(
      ":is(a, b):is(:state(checked), [data-state~='checked']) { color: red; }"
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
