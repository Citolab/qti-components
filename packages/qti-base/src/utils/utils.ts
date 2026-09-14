export const decimalSeparator = () => {
  return new Intl.NumberFormat().format(0.1).replace(/\d/g, '');
};

/**
 * Renders a number the way QTI stores one: a plain decimal string with `.` as the separator and no
 * grouping, whatever the browser's locale is. Strings are already in that form and pass through.
 *
 * `Number.prototype.toString()` is exactly that format. The locale-aware versions this used to call
 * are not: under a comma-decimal locale (nl, de, fr, ...) it ran `.replace('.', '')` over a string
 * that always uses `.`, so a score of 0.5 was stored as "05" and 1.5 as "15" — an item's SCORE came
 * out ten times too big for every value with a fraction. Under a dot-decimal locale
 * `toLocaleString()` grouped thousands instead, turning 1234.5 into "1,234.5".
 */
export const convertNumberToUniversalFormat = (number: number | string) => {
  return typeof number === 'string' ? number : number.toString();
};

export function IsNullOrUndefined(value: unknown) {
  return value === null || value === undefined;
}

export function removeDoubleSlashes(str: string) {
  const singleForwardSlashes = str
    .replace(/([^:]\/)\/+/g, '$1')
    .replace(/\/\//g, '/')
    .replace('http:/', 'http://')
    .replace('https:/', 'https://');
  return singleForwardSlashes;
}
