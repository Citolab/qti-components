import { applyFormat, toExponential } from './printed-variable-format';

describe('applyFormat', () => {
  it('prints integers with %d and %i', () => {
    expect(applyFormat('%d', '5')).toBe('5');
    expect(applyFormat('%i', '-42')).toBe('-42');
    expect(applyFormat('%d', '3.9')).toBe('3');
  });

  it('prints floats with a precision', () => {
    expect(applyFormat('%f', '3.5')).toBe('3.500000');
    expect(applyFormat('%.2f', '3.14159')).toBe('3.14');
    expect(applyFormat('%.0f', '3.6')).toBe('4');
  });

  it('keeps the literal text around the conversion', () => {
    expect(applyFormat('Score: %.1f points', '3.14159')).toBe('Score: 3.1 points');
  });

  it('honours the width and the padding flags', () => {
    expect(applyFormat('%5d', '42')).toBe('   42');
    expect(applyFormat('%-5d|', '42')).toBe('42   |');
    expect(applyFormat('%05.1f', '3.14159')).toBe('003.1');
    expect(applyFormat('%05d', '-42')).toBe('-0042');
  });

  it('honours the sign flags', () => {
    expect(applyFormat('%+d', '5')).toBe('+5');
    expect(applyFormat('%+d', '-5')).toBe('-5');
    expect(applyFormat('% d', '5')).toBe(' 5');
  });

  it('prints other bases with %o, %x and %X', () => {
    expect(applyFormat('%o', '8')).toBe('10');
    expect(applyFormat('%x', '255')).toBe('ff');
    expect(applyFormat('%X', '255')).toBe('FF');
    expect(applyFormat('%#x', '255')).toBe('0xff');
    expect(applyFormat('%#X', '255')).toBe('0XFF');
  });

  it('prints exponential form with at least two exponent digits', () => {
    expect(applyFormat('%e', '1234.5')).toBe('1.234500e+03');
    expect(applyFormat('%.2e', '1234.5')).toBe('1.23e+03');
    expect(applyFormat('%.2E', '1234.5')).toBe('1.23E+03');
  });

  it('picks fixed or exponential for %g and trims trailing zeros', () => {
    expect(applyFormat('%g', '0.0001')).toBe('0.0001');
    expect(applyFormat('%g', '100')).toBe('100');
    expect(applyFormat('%g', '1234567')).toBe('1.23457e+06');
    expect(applyFormat('%G', '1234567')).toBe('1.23457E+06');
  });

  it('prints strings with %s and %c', () => {
    expect(applyFormat('%s', 'ChoiceA')).toBe('ChoiceA');
    expect(applyFormat('%.3s', 'abcdef')).toBe('abc');
    expect(applyFormat('%c', 'abc')).toBe('a');
  });

  it('unescapes %%', () => {
    expect(applyFormat('100%%', '7')).toBe('100%');
    expect(applyFormat('%d%%', '7')).toBe('7%');
  });

  it('applies the single value to every conversion in the string', () => {
    expect(applyFormat('%d of %d', '7')).toBe('7 of 7');
  });

  it('leaves a non-numeric value alone rather than printing NaN', () => {
    expect(applyFormat('%d', 'ChoiceA')).toBe('ChoiceA');
    expect(applyFormat('%.2f', '')).toBe('');
  });

  it('passes through text that is not a conversion', () => {
    expect(applyFormat('no conversion here', '5')).toBe('no conversion here');
    expect(applyFormat('%q', '5')).toBe('%q');
  });
});

describe('toExponential', () => {
  it('pads the exponent to two digits', () => {
    expect(toExponential(1234.5)).toBe('1.2345e+03');
    expect(toExponential(0.005)).toBe('5e-03');
    expect(toExponential(1e21)).toBe('1e+21');
  });
});
