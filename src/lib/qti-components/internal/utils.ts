export const decimalSeparator = () => {
  return new Intl.NumberFormat().format(0.1).replace(/\d/g, '');
};

export const convertNumberToUniveralFormat = (number: number | string) => {
  // check if type is string
  if (typeof number === 'string') {
    return number;
  }
  const dSep = decimalSeparator();
  if (dSep === '.') {
    return number.toLocaleString();
  } else {
    return number.toString().replace('.', '').replace(dSep, '.');
  }
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
