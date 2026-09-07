/**
 * Number formatting for `qti-printed-variable`.
 *
 * QTI's `format` attribute carries a C `printf`-style conversion string — QTI 3.0 calls this
 * "the QTI number formatting rules" and points at printf for the grammar. A printed variable has
 * exactly one value to print, so every conversion specifier in the string receives that same
 * value; `%%` is a literal percent and any other text is passed through.
 *
 * Supported: flags `-`, `+`, ` `, `0`, `#`; a width; a precision; and the conversions
 * `d i u o x X f F e E g G s c`. Anything the grammar does not cover is left in place, so a
 * malformed format string degrades to visible text rather than throwing inside `render()`.
 */

const CONVERSION = /%(?:(%)|([-+ 0#]*)(\d+)?(?:\.(\d+))?([diuoxXfFeEgGsc]))/g;

/** JS writes `1e+3`; C (and therefore QTI) writes at least two exponent digits. */
function padExponent(exponential: string): string {
  return exponential.replace(/e([+-])(\d)$/, 'e$10$2');
}

export function toExponential(value: number, precision?: number): string {
  return padExponent(precision === undefined ? value.toExponential() : value.toExponential(precision));
}

function stripTrailingZeros(formatted: string): string {
  const [mantissa, exponent] = formatted.split(/e/i);
  const trimmed = mantissa.includes('.') ? mantissa.replace(/\.?0+$/, '') : mantissa;
  const suffix = exponent === undefined ? '' : `e${exponent}`;
  return `${trimmed}${suffix}`;
}

/** C's `%g`: exponential when the exponent falls outside `[-4, precision)`, else fixed, zeros trimmed. */
function toGeneral(value: number, precision: number): string {
  const significant = precision === 0 ? 1 : precision;
  const exponent = value === 0 ? 0 : Math.floor(Math.log10(value));

  if (exponent < -4 || exponent >= significant) {
    return stripTrailingZeros(toExponential(value, significant - 1));
  }
  return stripTrailingZeros(value.toFixed(Math.max(0, significant - 1 - exponent)));
}

function convert(conversion: string, flags: string, precision: number | undefined, raw: string): string {
  if (conversion === 's' || conversion === 'c') {
    const text = conversion === 'c' ? raw.slice(0, 1) : raw;
    return precision === undefined ? text : text.slice(0, precision);
  }

  const numeric = Number(raw);
  // Not a number after all — print what the author gave us instead of `NaN`.
  if (raw.trim() === '' || !Number.isFinite(numeric)) return raw;

  const magnitude = Math.abs(numeric);
  let body: string;
  let negative = numeric < 0;

  switch (conversion) {
    case 'd':
    case 'i':
      body = String(Math.trunc(magnitude));
      break;
    case 'u':
      body = String(Math.trunc(magnitude));
      negative = false;
      break;
    case 'o':
      body = `${flags.includes('#') ? '0' : ''}${Math.trunc(magnitude).toString(8)}`;
      break;
    case 'x':
      body = `${flags.includes('#') ? '0x' : ''}${Math.trunc(magnitude).toString(16)}`;
      break;
    case 'X':
      body = `${flags.includes('#') ? '0X' : ''}${Math.trunc(magnitude).toString(16).toUpperCase()}`;
      break;
    case 'f':
    case 'F':
      body = magnitude.toFixed(precision ?? 6);
      break;
    case 'e':
      body = toExponential(magnitude, precision ?? 6);
      break;
    case 'E':
      body = toExponential(magnitude, precision ?? 6).toUpperCase();
      break;
    case 'g':
      body = toGeneral(magnitude, precision ?? 6);
      break;
    case 'G':
      body = toGeneral(magnitude, precision ?? 6).toUpperCase();
      break;
    default:
      return raw;
  }

  const sign = negative ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '';
  return `${sign}${body}`;
}

function pad(text: string, flags: string, width: number): string {
  if (text.length >= width) return text;
  const fill = width - text.length;

  if (flags.includes('-')) return `${text}${' '.repeat(fill)}`;
  if (flags.includes('0')) {
    // Zero padding goes between the sign and the digits, never before the sign.
    const [, sign, digits] = /^([-+ ]?)(.*)$/.exec(text)!;
    return `${sign}${'0'.repeat(fill)}${digits}`;
  }
  return `${' '.repeat(fill)}${text}`;
}

/**
 * Renders `value` through a QTI `format` string. The value is passed as the raw string held in
 * the item context, so integers and floats arrive as `"5"` / `"3.14"` and are coerced per
 * conversion.
 */
export function applyFormat(format: string, value: string): string {
  return format.replace(CONVERSION, (_match, percent, flags, width, precision, conversion) => {
    if (percent) return '%';
    return pad(
      convert(conversion, flags ?? '', precision === undefined ? undefined : Number(precision), value),
      flags ?? '',
      width === undefined ? 0 : Number(width)
    );
  });
}
