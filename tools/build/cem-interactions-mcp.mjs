/**
 * Reduce the @pwrs/cem output to the minimum the QTI MCP server needs in order to
 * generate QTI interaction markup: the custom elements, their attributes, and the
 * child elements they slot.
 *
 * Members, methods, css parts/properties/states, events, exports, superclass links and
 * non-element declarations are dropped. The full-fidelity manifest for Storybook and JSX
 * types is still produced separately by the wc-toolkit pipeline in `cem.config.mjs`.
 *
 * ## Why attributes are withheld here and not in the source
 *
 * The interaction sources document their COMPLETE attribute contract in JSDoc `@attr`
 * blocks — that is the QTI contract and it stays exhaustive. This filter narrows that
 * contract down to what an item GENERATOR should be allowed to emit. An attribute is
 * withheld when getting it wrong produces broken items more often than omitting it
 * produces incomplete ones.
 *
 * ## What is added
 *
 * `correct-response` is injected per interaction — see CORRECT_RESPONSE below. It is not
 * declared on the elements, so analysis cannot find it, but a generator writing an item with
 * an answer key cannot do without it.
 *
 * Usage: node tools/build/cem-interactions-mcp.mjs <raw.json> <out.json>
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';

/**
 * Attributes the MCP server must never emit, by name prefix.
 *
 * - `min-`   — cardinality floors (min-choices, min-associations, min-strings). A generator
 *              that guesses these turns otherwise-valid items invalid.
 * - `max-`   — cardinality ceilings, except the carve-out below.
 * - `match-` — match-max / match-min / match-group encode the pairing topology of a specific
 *              item; they are authored per item, never derived from the element contract.
 */
const DROP_PREFIXES = ['min-', 'max-', 'match-'];

/**
 * Attributes withheld on every element.
 *
 * - `fixed`                — only meaningful in combination with `shuffle`.
 * - `shuffle`              — applied by the `qti-transformers` pipeline, not by the element.
 *                            Emitting it implies a delivery capability the markup alone lacks.
 * - `show-hide`            — bound to `template-identifier` and template processing.
 * - `template-identifier`  — same reason: it names a template variable, so it is meaningless
 *                            unless the generator also emits the matching template processing.
 * - `tabindex`             — a platform focus attribute that leaks in from `@property`
 *                            declarations; it is not part of any QTI content model.
 */
const DROP_NAMES = new Set(['fixed', 'shuffle', 'show-hide', 'template-identifier', 'tabindex']);

/**
 * Attributes withheld on one element only, keyed `<tagName>:<attribute>`.
 *
 * `orientation` is deprecated by QTI **for choice interactions only**, in favour of the
 * `qti-orientation-*` class vocabulary. The same attribute is current and non-deprecated on
 * `qti-order-interaction`, so this cannot be a blanket name drop.
 */
const DROP_SCOPED = new Set(['qti-choice-interaction:orientation']);

/**
 * Carve-outs that survive the rules above, keyed `<tagName>:<attribute>`.
 *
 * `qti-choice-interaction` genuinely needs `max-choices`: it is the only thing distinguishing
 * a single-response item (`max-choices="1"`) from a multiple-response one (`max-choices="0"`,
 * unlimited). Kennisnet ITEM001 and ITEM002 differ by exactly this attribute and nothing else.
 */
const KEEP = new Set(['qti-choice-interaction:max-choices']);

/**
 * `correct-response` is injected here rather than documented per element, because it is not
 * declared on the interactions at all: `CorrectResponseMixin`
 * (packages/qti-corrections/src/mixins/correct-response.mixin.ts) adds it, and that mixin is
 * only applied by the correction registry. cem sees the base constructors, so the attribute
 * is invisible to analysis — but a generator emitting an item with an answer key needs it.
 *
 * The grammar is one codec for every interaction
 * (packages/qti-base/src/lib/response.ts): a comma separates VALUES, a space separates PARTS
 * within one value. There is no escaping, so an identifier containing a comma cannot be
 * expressed. The per-interaction text below states what a value IS for that interaction —
 * getting this wrong produces an item that renders but scores incorrectly, which is worse
 * than one that fails loudly.
 *
 * `qti-extended-text-interaction` is the one entry that does NOT describe a machine-scorable
 * key. Free prose has nothing to compare against, so the base component omits the mixin
 * entirely and a verdict is pushed in from outside by a teacher, a marking service, or a
 * model. Its value is a model answer — the anchor a rubric is generated from downstream — and
 * its description says so, because an authoring tool that treats it as an exact-match key
 * would mark every candidate wrong.
 */
const CORRECT_RESPONSE = {
  'qti-choice-interaction': {
    type: 'identifier | identifier[]',
    description:
      'Answer key. `identifier` of each correct `qti-simple-choice`, comma-separated. One value ' +
      'for a single-response item (`choice3`), several for a multiple-response one ' +
      '(`choice1,choice2,choice4`). Order is not significant.'
  },
  'qti-inline-choice-interaction': {
    type: 'identifier',
    description: 'Answer key. `identifier` of the single correct `qti-inline-choice` (`choice_hoger`).'
  },
  'qti-hottext-interaction': {
    type: 'identifier | identifier[]',
    description:
      'Answer key. `identifier` of each correct `qti-hottext`, comma-separated (`ht_door` or ' +
      '`ht_door,ht_langs`). Order is not significant.'
  },
  'qti-order-interaction': {
    type: 'identifier[]',
    description:
      'Answer key. `identifier` of every `qti-simple-choice` in the one correct sequence, ' +
      'comma-separated (`step_hypothese,step_data,step_conclusies`). Order IS the answer here — ' +
      'unlike every other interaction, reordering these values changes what is correct.'
  },
  'qti-match-interaction': {
    type: 'directedPair[]',
    description:
      'Answer key. One `source target` pair per association, space inside the pair and comma ' +
      'between pairs (`left_vermogen right_watt,left_druk right_pascal`). `source` is an ' +
      'identifier from the FIRST `qti-simple-match-set`, `target` from the second — the ' +
      'direction matters. A target whose `match-max` is greater than 1 appears in several pairs ' +
      '(`enzym biologie,mitochondrion biologie`).'
  },
  'qti-gap-match-interaction': {
    type: 'directedPair[]',
    description:
      'Answer key. One `gaptext gap` pair per filled gap, space inside the pair and comma ' +
      'between pairs (`ht_zuur gap_low,ht_basisch gap_high`). The `qti-gap-text` identifier ' +
      'comes first and the `qti-gap` identifier second; reversing them scores nothing.'
  },
  'qti-text-entry-interaction': {
    type: 'string',
    description:
      'Answer key. The single expected string (`refractie`). Matching is exact unless the ' +
      'response processing template folds case. A value containing a comma cannot be expressed: ' +
      'the codec has no escape and would read it as two answers — use a mapping in the ' +
      '`qti-response-declaration` for multiple accepted answers.'
  },
  'qti-extended-text-interaction': {
    type: 'string',
    description:
      'Model answer, NOT a machine-scorable key. Free prose cannot be compared to an expected ' +
      'string, so nothing in the runtime reads this: the component omits `CorrectResponseMixin` ' +
      'and takes its verdict from outside (a teacher, a marking service, or a model). Write one ' +
      'exemplary answer that demonstrates what full credit looks like, dense with the specific ' +
      'facts, terms and reasoning steps a response must contain — that content is what a rubric ' +
      'is generated from downstream. Do not phrase it as instructions to the candidate, and do ' +
      'not expect an exact-match comparison against it.'
  },
  'qti-select-point-interaction': {
    type: 'point | point[]',
    description:
      "Answer key. `x y` integer coordinates in the background image's own pixel space, space " +
      'inside the point and comma between points (`100 150` or `100 150,220 340`). Most ' +
      'point items score by region rather than by exact pixel — prefer a `qti-area-mapping` in ' +
      'the `qti-response-declaration`, or the `area-mappings` attribute, over this.'
  }
};

/** Description markers the source uses to qualify an attribute. Stripped from the output. */
const REQUIRED_MARKER = /^Required\.\s*/;
const NOT_IMPLEMENTED_MARKER = /^Not implemented\.\s*/;

/**
 * Near-misses of the marker above, e.g. "Not implemented, and not planned." — the comma alone is
 * enough to miss `NOT_IMPLEMENTED_MARKER`, and the attribute then silently enters the MCP contract
 * claiming a behaviour that does not exist. Cheap to detect, so detect it rather than trust prose.
 */
const NOT_IMPLEMENTED_NEAR_MISS = /not implemented/i;

/** A type consisting only of quoted string literals joined by `|`, e.g. `'a'|'b'`. */
const STRING_UNION = /^\s*'[^']*'\s*(\|\s*'[^']*'\s*)+$/;

function dropReason(tagName, attribute) {
  const scoped = `${tagName}:${attribute.name}`;

  if (KEEP.has(scoped)) return null;
  if (NOT_IMPLEMENTED_MARKER.test(attribute.description ?? '')) return 'not implemented';
  if (DROP_SCOPED.has(scoped)) return 'deprecated for this element';
  if (DROP_NAMES.has(attribute.name)) return 'withheld by name';
  if (DROP_PREFIXES.some(prefix => attribute.name.startsWith(prefix))) return 'withheld by prefix';

  return null;
}

/** Collapse JSDoc hard wraps so descriptions survive as single readable sentences. */
const unwrap = text => text.replace(/\s*\n\s*/g, ' ').trim();

function toAttribute(attribute) {
  const typeText = attribute.type?.text;
  const description = attribute.description ? unwrap(attribute.description) : '';
  const required = REQUIRED_MARKER.test(description);

  return {
    name: attribute.name,
    ...(required ? { required: true } : {}),
    ...(typeText ? { type: typeText } : {}),
    // A closed vocabulary is far more useful to a generator than the raw union text.
    ...(typeText && STRING_UNION.test(typeText)
      ? { values: typeText.split('|').map(value => value.trim().replace(/^'|'$/g, '')) }
      : {}),
    ...(attribute.default !== undefined ? { default: attribute.default } : {}),
    ...(description ? { description: description.replace(REQUIRED_MARKER, '') } : {})
  };
}

const [, , rawPath, outPath] = process.argv;

if (!rawPath || !outPath) {
  console.error('usage: cem-interactions-filter.mjs <raw.json> <out.json>');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(rawPath, 'utf8'));

const elements = [];
const withheld = [];
const injected = [];
const nearMisses = [];

for (const module of raw.modules ?? []) {
  for (const declaration of module.declarations ?? []) {
    if (!declaration.tagName) continue;

    const attributes = [];

    for (const attribute of declaration.attributes ?? []) {
      const reason = dropReason(declaration.tagName, attribute);

      if (reason) {
        withheld.push(`${declaration.tagName}/${attribute.name} (${reason})`);
        continue;
      }

      const description = attribute.description ?? '';
      if (NOT_IMPLEMENTED_NEAR_MISS.test(description) && !NOT_IMPLEMENTED_MARKER.test(unwrap(description))) {
        nearMisses.push(`${declaration.tagName}/${attribute.name}`);
      }

      attributes.push(toAttribute(attribute));
    }

    const correctResponse = CORRECT_RESPONSE[declaration.tagName];

    if (correctResponse) {
      injected.push(`${declaration.tagName}/correct-response`);
      attributes.push({ name: 'correct-response', ...correctResponse });
    }

    elements.push({
      tagName: declaration.tagName,
      ...(declaration.description ? { description: unwrap(declaration.description) } : {}),
      module: module.path,
      attributes,
      // Slots are the only content-model signal cem preserves — unknown JSDoc tags are
      // discarded. Without them a generator can emit an interaction but not its children.
      ...(declaration.slots?.length
        ? {
            slots: declaration.slots.map(slot => ({
              name: slot.name || '(default)',
              ...(slot.description ? { description: unwrap(slot.description) } : {})
            }))
          }
        : {})
    });
  }
}

elements.sort((a, b) => a.tagName.localeCompare(b.tagName));

writeFileSync(outPath, `${JSON.stringify({ schemaVersion: raw.schemaVersion, elements }, null, 2)}\n`);
rmSync(rawPath, { force: true });

console.log(`Wrote ${outPath}: ${elements.length} elements.`);
console.log(`Injected into the MCP contract: ${injected.length} attribute(s).`);
for (const entry of injected.sort()) {
  console.log(`  + ${entry}`);
}
console.log(`Withheld from the MCP contract: ${withheld.length} attribute(s).`);
for (const entry of withheld.sort()) {
  console.log(`  - ${entry}`);
}

if (nearMisses.length > 0) {
  console.warn(
    `\nWarning: ${nearMisses.length} attribute(s) say "not implemented" but do not start with the\n` +
      `literal marker "Not implemented." — they are IN the MCP contract. Fix the wording:\n` +
      nearMisses.map(entry => `  ${entry}`).join('\n')
  );
}

// A tag renamed in the source would otherwise silently stop receiving its answer key.
const unmatched = Object.keys(CORRECT_RESPONSE).filter(
  tagName => !elements.some(element => element.tagName === tagName)
);

if (unmatched.length > 0) {
  console.warn(
    `\nWarning: CORRECT_RESPONSE names ${unmatched.length} tag(s) not present in the manifest:\n` +
      unmatched.map(tagName => `  ${tagName}`).join('\n')
  );
}

const withoutAttributes = elements.filter(element => element.attributes.length === 0);

if (withoutAttributes.length > 0) {
  console.warn(
    `\nWarning: ${withoutAttributes.length} element(s) expose no attributes — add a JSDoc @attr block:\n` +
      withoutAttributes.map(element => `  ${element.tagName}`).join('\n')
  );
}
