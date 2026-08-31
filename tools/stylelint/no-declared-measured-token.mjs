import stylelint from 'stylelint';

const ruleName = 'qti/no-declared-measured-token';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: prop =>
    `"${prop}" is a MEASURED token. DropzoneAutoSizeMixin writes it at runtime, and declaring it ` +
    `here makes every "var(${prop}, N)" fallback in the component stylesheets unreachable — so the ` +
    `unmeasured branch silently disappears, and "the mixin did not publish a value" stops meaning ` +
    `"no floor". To give drops a size by hand, set this on the interaction instead: an owner of an ` +
    `axis speaks closer than :root, and the mixin never writes there. For a constant every ` +
    `interaction agrees on, use a declared name — --qti-drop-card-min-height, ` +
    `--qti-drop-track-min-width. See DROP-SIZING.md §2.`
});

/**
 * The tokens `applyDropzoneAutoSizing` publishes.
 *
 * Not a style preference. These three are the output of a measurement, and every consumer reads them
 * as `var(--name, N)` where N is what that drop is worth when nothing measured it. A declaration at
 * `:root`/`:host` always substitutes ahead of the fallback, which deletes that branch everywhere at
 * once, from a diff that mentions no component and no drop.
 *
 * It has happened. Declaring the pair at 3rem/8rem shrank match's cards from 4rem to 3rem (they read
 * `var(--qti-dropzone-min-height, 4rem)`), and gave a graphic-gap-match hotspot a 128px min-width
 * that outranked its authored 100px width — because an authored `data-choices-container-width` takes
 * the width axis by having the mixin NOT publish one, which only reads as "no floor" while the token
 * is undeclared. Two failures, one commit, neither visible in the change that caused them.
 *
 * VRT did catch it — three kennisnet baselines moved — but a moved baseline is re-blessable in one
 * command, and it was. This rule fails at lint time instead, where there is nothing to re-bless.
 */
const MEASURED_TOKENS = [/^--qti-dropzone-min-(height|width)$/, /^--qti-drag-min-width$/];

const isMeasuredToken = prop => MEASURED_TOKENS.some(re => re.test(prop.trim().toLowerCase()));

/**
 * A declaration on the interaction is the sanctioned way to own an axis by hand, so only the global
 * roots are policed. `:root` and `:host` reach every drop in the tree at once, which is exactly what
 * makes them the wrong place; `qti-order-interaction { … }` reaches one interaction and is fine.
 */
const isGlobalRootSelector = selector =>
  selector
    .split(',')
    .map(part => part.trim())
    .some(part => part === ':root' || part === ':host' || part === 'html');

const rule = primary => (root, result) => {
  const valid = stylelint.utils.validateOptions(result, ruleName, { actual: primary, possible: [true, false] });
  if (!valid || !primary) return;

  root.walkRules(ruleNode => {
    if (!isGlobalRootSelector(ruleNode.selector)) return;

    for (const node of ruleNode.nodes ?? []) {
      if (node.type !== 'decl' || !isMeasuredToken(node.prop)) continue;

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
