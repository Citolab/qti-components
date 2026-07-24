import stylelint from 'stylelint';

const ruleName = 'qti/no-layout-in-theme';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: prop =>
    `"${prop}" is layout, and the theme does not do layout. It is spacing, sizing and paint — ` +
    `borders being the exception. Move this to the .styles.ts next to the component that owns the ` +
    `box; if no selector there can reach the element, hand the value over as a custom property and ` +
    `spend it there. See CONTRACT.md §7.`
});

/**
 * Properties that decide where a box goes, or whether it is in flow at all.
 *
 * Deliberately absent, because the theme owns them:
 *
 *   margin / padding / gap    spacing
 *   width / height / min-*    sizing
 *   border* / border-radius   the stated exception — a border is paint that happens to have width
 *   box-sizing                a box-model mode, not a placement. reset.css owns it for the document,
 *                             boxSizing for shadow trees, and the chip/drag mixins need it for the
 *                             floating clone, which is appended to document.body and so falls
 *                             outside reset.css's @scope.
 *   transform / rotate        a transform paints elsewhere without reflowing anything
 *   visibility                paints nothing but keeps its box
 */
const LAYOUT_PROPERTIES = [
  /^display$/,
  /^(position|top|right|bottom|left)$/,
  /^inset(-(block|inline))?(-(start|end))?$/,
  /^(float|clear)$/,
  /^flex(-(grow|shrink|basis|direction|wrap|flow))?$/,
  /^grid(-.*)?$/,
  /^(justify|align)-(content|items|self)$/,
  /^place-(content|items|self)$/,
  /^order$/,
  /^overflow(-(x|y|block|inline))?$/,
  /^vertical-align$/,
  /^z-index$/,
  /^white-space$/,
  /^columns$/,
  /^column-(count|width)$/,
  /^aspect-ratio$/,
  /^position-anchor$/
];

const isLayoutProperty = prop => LAYOUT_PROPERTIES.some(re => re.test(prop.toLowerCase()));

/**
 * A pseudo-element the theme itself creates has no component to delegate to.
 *
 * The correction tick, the drop-here glyph, the drag handle: the theme invents these, so the theme
 * is the only thing that can place them. `::before` on a chip is the sharpest case — one of its call
 * sites is `[data-drag-clone]::before`, on a div the drag-drop JS builds at pointer-down and appends
 * to document.body, where there is no shadow root at all.
 *
 * The licence covers the pseudo-element's own box and nothing else. A rule that both matches a
 * pseudo-element and lays out something else is not expressible in one selector, so this is safe:
 * the declarations here can only apply to the generated box.
 */
const isThemeAuthoredPseudoElement = ruleNode => /::(before|after|marker|backdrop)/.test(ruleNode.selector);

const rule = primary => (root, result) => {
  const valid = stylelint.utils.validateOptions(result, ruleName, { actual: primary, possible: [true, false] });
  if (!valid || !primary) return;

  root.walkRules(ruleNode => {
    if (isThemeAuthoredPseudoElement(ruleNode)) return;

    // Own declarations only — a nested `&::after` block is its own rule and gets its own exemption.
    for (const node of ruleNode.nodes ?? []) {
      if (node.type !== 'decl' || !isLayoutProperty(node.prop)) continue;

      stylelint.utils.report({
        result,
        ruleName,
        message: messages.rejected(node.prop),
        node,
        word: node.prop
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;

export default stylelint.createPlugin(ruleName, rule);
