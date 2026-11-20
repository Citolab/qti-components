/**
 * What response variable each interaction must be bound to, as the QTI 3 information model states it
 * in the interaction's description (section in each comment). `max` is the attribute that, when it is
 * greater than 1 or 0, requires multiple cardinality, with its default. A record declaration has no
 * base-type of its own, so the base-type is only checked for the other cardinalities.
 *
 * Custom and portable custom interactions state no binding rule, so they are not listed.
 */
const BINDING_RULES: Record<
  string,
  { baseTypes: string[]; cardinalities: string[]; max?: { attribute: string; default: number } }
> = {
  // §5.8
  'qti-associate-interaction': {
    baseTypes: ['pair'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-associations', default: 1 }
  },
  // §5.30
  'qti-choice-interaction': {
    baseTypes: ['identifier'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-choices', default: 1 }
  },
  // §5.44
  'qti-drawing-interaction': { baseTypes: ['file'], cardinalities: ['single'] },
  // §5.45
  'qti-end-attempt-interaction': { baseTypes: ['boolean'], cardinalities: ['single'] },
  // §5.48
  'qti-extended-text-interaction': {
    baseTypes: ['string', 'integer', 'float'],
    cardinalities: ['single', 'multiple', 'ordered', 'record']
  },
  // §5.57
  'qti-gap-match-interaction': {
    baseTypes: ['directedPair'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-associations', default: 1 }
  },
  // §5.59
  'qti-graphic-associate-interaction': {
    baseTypes: ['pair'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-associations', default: 1 }
  },
  // §5.60
  'qti-graphic-gap-match-interaction': { baseTypes: ['directedPair'], cardinalities: ['multiple'] },
  // §5.61
  'qti-graphic-order-interaction': { baseTypes: ['identifier'], cardinalities: ['ordered'] },
  // §5.68
  'qti-hotspot-interaction': {
    baseTypes: ['identifier'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-choices', default: 1 }
  },
  // §5.66
  'qti-hottext-interaction': {
    baseTypes: ['identifier'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-choices', default: 1 }
  },
  // §5.74
  'qti-inline-choice-interaction': { baseTypes: ['identifier'], cardinalities: ['single'] },
  // §5.89
  'qti-match-interaction': {
    baseTypes: ['directedPair'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-associations', default: 1 }
  },
  // §5.92
  'qti-media-interaction': { baseTypes: ['integer'], cardinalities: ['single'] },
  // §2.4.1.2; its own §5.97 states no rule
  'qti-order-interaction': { baseTypes: ['identifier'], cardinalities: ['ordered'] },
  // §5.107
  'qti-position-object-interaction': {
    baseTypes: ['point'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-choices', default: 1 }
  },
  // §5.128
  'qti-select-point-interaction': {
    baseTypes: ['point'],
    cardinalities: ['single', 'multiple'],
    max: { attribute: 'max-choices', default: 0 }
  },
  // §5.134
  'qti-slider-interaction': { baseTypes: ['integer', 'float'], cardinalities: ['single'] },
  // §5.162
  'qti-text-entry-interaction': { baseTypes: ['string', 'integer', 'float'], cardinalities: ['single', 'record'] },
  // §5.165
  'qti-upload-interaction': { baseTypes: ['file'], cardinalities: ['single'] }
};

const either = (values: string[]) =>
  values.length === 1 ? values[0] : `${values.slice(0, -1).join(', ')} or ${values[values.length - 1]}`;

/**
 * Rejects an item that binds an interaction to a response it cannot hold.
 *
 * The document can be well-formed and schema-valid and still break this: no XSD ties an interaction's
 * `response-identifier` to the declaration it names. Every violation is listed in one error. An
 * interaction whose response is not declared is left alone; nothing here says what it should be.
 */
export function validateBindings(xmlFragment: XMLDocument): void {
  const declarations = new Map(
    Array.from(xmlFragment.querySelectorAll('qti-response-declaration'), d => [d.getAttribute('identifier'), d])
  );
  const violations: string[] = [];

  for (const [tagName, rule] of Object.entries(BINDING_RULES)) {
    for (const interaction of Array.from(xmlFragment.querySelectorAll(tagName))) {
      const responseIdentifier = interaction.getAttribute('response-identifier');
      const declaration = declarations.get(responseIdentifier);
      if (!declaration) continue;

      const where = `${tagName} (response "${responseIdentifier}")`;
      const cardinality = declaration.getAttribute('cardinality');
      const baseType = declaration.getAttribute('base-type');

      if (cardinality && !rule.cardinalities.includes(cardinality)) {
        violations.push(
          `${where}: ${cardinality} cardinality is not permitted; it must be ${either(rule.cardinalities)}`
        );
      } else if (cardinality && rule.max && cardinality !== 'multiple') {
        const value = interaction.getAttribute(rule.max.attribute);
        const max = value === null ? rule.max.default : Number(value);
        if (max === 0 || max > 1) {
          violations.push(`${where}: ${rule.max.attribute} ${max} requires multiple cardinality, not ${cardinality}`);
        }
      }

      if (cardinality !== 'record' && baseType && !rule.baseTypes.includes(baseType)) {
        violations.push(`${where}: base-type ${baseType} is not permitted; it must be ${either(rule.baseTypes)}`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(`QTI validation error: ${violations.join('; ')}.`);
  }
}
