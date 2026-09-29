/**
 * The registry behind `<qti-custom-operator definition="…">`.
 *
 * A custom operator is by definition outside the QTI vocabulary, so which ones
 * exist is a property of the delivery engine rather than of an item. An item
 * names one in its `definition` attribute and the engine supplies it — here,
 * through this registry.
 *
 * This is the second of two mechanisms on `qti-custom-operator`. The other runs
 * inline JavaScript out of a CDATA section and is selected with
 * `class="js.org"`; it stays as it is. `definition` is what items authored
 * against the Citolab scoring engine use, and the two do not interact.
 */

export type CustomOperatorValue = string | string[] | number | boolean | null;

/**
 * Handed the calculated values of the element's child expressions, in document
 * order, and returns the value of the expression.
 */
export type CustomOperator = (values: CustomOperatorValue[]) => CustomOperatorValue;

/** The value an operator most often works on: the first child, as text. */
const firstString = (values: CustomOperatorValue[]): string | null => {
  const value = values[0];
  if (value === null || value === undefined) return null;
  return Array.isArray(value) ? (value[0] ?? null) : String(value);
};

/** A text operator that leaves a NULL or absent first value alone. */
const textOperator =
  (transform: (value: string) => string): CustomOperator =>
  values => {
    const value = firstString(values);
    return value === null ? null : transform(value);
  };

/**
 * The three operators the scoring engine ships, under each of the prefixes it
 * registers them with. The prefix is part of the key because `definition` is
 * matched whole, exactly as the item writes it.
 */
const BUILT_IN_PREFIXES = ['depcp', 'questify', 'qade'] as const;

const BUILT_IN_OPERATORS: Record<string, CustomOperator> = {
  Trim: textOperator(value => value.trim()),
  // Decompose, then drop the combining marks that decomposition split off, so
  // "café" compares as "cafe".
  ToAscii: textOperator(value => value.normalize('NFD').replace(/[̀-ͯ]/g, '')),
  // A decimal comma written where the response processing expects a dot. Only
  // the first comma, which is the decimal separator in the locales that use it.
  ParseCommaDecimal: textOperator(value => value.replace(',', '.'))
};

const builtIns = new Map<string, CustomOperator>(
  BUILT_IN_PREFIXES.flatMap(prefix =>
    Object.entries(BUILT_IN_OPERATORS).map(([name, operator]): [string, CustomOperator] => [
      `${prefix}:${name}`,
      operator
    ])
  )
);

/** Registered by the host application; consulted before the built-ins. */
const registered = new Map<string, CustomOperator>();

/**
 * Make an operator available to every `qti-custom-operator` that names it.
 *
 * The key is the `definition` attribute in full, prefix included. Registering a
 * key a built-in already uses overrides that built-in, which is how a delivery
 * engine replaces one it disagrees with.
 */
export const registerCustomOperator = (definition: string, operator: CustomOperator): void => {
  registered.set(definition, operator);
};

/** Undo a {@link registerCustomOperator}, restoring any built-in of that name. */
export const unregisterCustomOperator = (definition: string): void => {
  registered.delete(definition);
};

/** The operator for a `definition`, or null when nothing provides it. */
export const getCustomOperator = (definition: string): CustomOperator | null =>
  registered.get(definition) ?? builtIns.get(definition) ?? null;
