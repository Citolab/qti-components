import stylelint from 'stylelint';

const ruleName = 'qti/no-layout-in-transient-state';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (prop, state) =>
    `"${prop}" changes layout inside :state(${state}). A transient state may repaint an element, ` +
    `never resize or move it — toggling it mid-interaction would reflow the page under the user's ` +
    `cursor. Use a paint-only equivalent (border-color: transparent, not border: none).`
});

/**
 * Some states classify an element rather than describe a moment in an interaction.
 *
 * :state(drag) means "this element is a drag chip" — it is set once, when the interaction
 * publishes its draggablesSelector, and it is where a theme legitimately gives a chip its padding
 * and drag handle. :state(radio) and :state(checkbox) are the same kind of thing: they say what a
 * control *is*.
 *
 * Everything else — dragging, placeholder, checked, hover, candidate-correct — toggles while the
 * user is interacting. Those may only paint.
 */
const STRUCTURAL_STATES = new Set(['drag', 'radio', 'checkbox']);

/**
 * Properties that change an element's box or its position in flow.
 *
 * `border-color` and `border-style` are deliberately absent: they repaint a border without
 * resizing it, which is exactly the escape hatch this rule wants people to reach for. `border`
 * and `border-width` are present, because `border: none` silently removes two pixels per axis —
 * the bug that started all this.
 */
const LAYOUT_PROPERTIES = [
  /^display$/,
  /^box-sizing$/,
  /^(width|height)$/,
  /^(min|max)-(width|height)$/,
  /^padding(-(top|right|bottom|left|block|inline))?/,
  /^margin(-(top|right|bottom|left|block|inline))?/,
  /^border$/,
  /^border-(top|right|bottom|left|block|inline)?-?width$/,
  /^font-size$/,
  /^line-height$/,
  /^gap$/,
  /^(position|top|right|bottom|left|inset)$/,
  /^flex(-(grow|shrink|basis|direction|wrap))?$/
];

const STATE_PATTERN = /:state\(\s*([a-zA-Z0-9_-]+)\s*\)/g;

/** The transient states a selector tests for, ignoring the structural ones. */
const transientStatesIn = selector => {
  const states = [];
  for (const [, state] of selector.matchAll(STATE_PATTERN)) {
    if (!STRUCTURAL_STATES.has(state)) states.push(state);
  }
  return [...new Set(states)];
};

const isLayoutProperty = prop => LAYOUT_PROPERTIES.some(re => re.test(prop.toLowerCase()));

/**
 * A pseudo-element taken out of flow cannot reflow anything, so it is free to size and place
 * itself however it likes. This is how a correction tick or a drop indicator is drawn: an
 * absolutely positioned ::after over the element, costing zero pixels of layout.
 *
 * An *in-flow* pseudo-element is a different matter — the drag handle glyph is an inline-block
 * ::before, and it takes real width. Those are still checked.
 */
const isOutOfFlowPseudoElement = ruleNode => {
  if (!/::(before|after|marker|backdrop)/.test(ruleNode.selector)) return false;
  return (ruleNode.nodes ?? []).some(
    node => node.type === 'decl' && /^position$/i.test(node.prop) && /^(absolute|fixed)$/i.test(node.value.trim())
  );
};

/**
 * The answer key is not a state, it is a second rendering.
 *
 * `.full-correct-response` is a wrapper the correct-response mixin builds once, around a clone, and
 * it never toggles — the clone is created when the key is shown and removed when it is hidden. So a
 * rule scoped to it cannot reflow anything under the candidate's cursor, which is the entire reason
 * this rule exists. It may size and space freely.
 *
 * The `:state(...)` in those selectors is doing a different job: picking which choices the key
 * should mark, not describing a moment in an interaction.
 *
 * This replaces `ignoreStates: ['checked', 'correct-response']`, which switched the rule off for
 * every `checked` and `correct-response` rule in the repo in order to permit these few.
 */
const isAnswerKeyScope = ruleNode => {
  for (let node = ruleNode; node; node = node.parent) {
    if (node.type === 'rule' && /\.full-correct-response\b/.test(node.selector)) return true;
  }
  return false;
};

const rule = (primary, secondary) => (root, result) => {
  const valid = stylelint.utils.validateOptions(
    result,
    ruleName,
    { actual: primary, possible: [true, false] },
    { actual: secondary, possible: { ignoreStates: [v => typeof v === 'string'] }, optional: true }
  );
  if (!valid || !primary) return;

  const ignored = new Set(secondary?.ignoreStates ?? []);

  root.walkRules(ruleNode => {
    const states = transientStatesIn(ruleNode.selector).filter(s => !ignored.has(s));
    if (states.length === 0) return;
    if (isOutOfFlowPseudoElement(ruleNode)) return;
    if (isAnswerKeyScope(ruleNode)) return;

    // Own declarations only. `walkDecls` would descend into nested SCSS rules and blame this
    // selector for a child's declarations — including the absolutely positioned `&::after`
    // blocks that the exemption above exists to allow.
    for (const node of ruleNode.nodes ?? []) {
      if (node.type !== 'decl' || !isLayoutProperty(node.prop)) continue;

      stylelint.utils.report({
        result,
        ruleName,
        message: messages.rejected(node.prop, states.join(', ')),
        node,
        word: node.prop
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;

export default stylelint.createPlugin(ruleName, rule);
