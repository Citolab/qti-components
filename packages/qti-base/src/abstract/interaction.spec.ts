import { describe, expect, it, vi } from 'vitest';

import { Interaction } from './interaction';

type Mode = 'inline' | 'native' | 'both' | 'none' | undefined;

type TestHost = {
  configContext?: { validationDisplayMode?: Mode };
  _internals: {
    validity: { valid: boolean };
    reportValidity: ReturnType<typeof vi.fn>;
    setValidity: ReturnType<typeof vi.fn>;
  };
  updateInlineValidationMessage: ReturnType<typeof vi.fn>;
  clearInlineValidationMessage: ReturnType<typeof vi.fn>;
};

const createHost = (mode: Mode, valid = false): TestHost => {
  const host = Object.create(Interaction.prototype) as TestHost;
  host.configContext = mode ? { validationDisplayMode: mode } : {};
  host._internals = {
    validity: { valid },
    reportValidity: vi.fn(),
    setValidity: vi.fn()
  };
  host.updateInlineValidationMessage = vi.fn();
  host.clearInlineValidationMessage = vi.fn();
  return host;
};

describe('Interaction validation display policy', () => {
  it('defaults to inline behavior when config value is not set', () => {
    const host = createHost(undefined, false);

    const result = Interaction.prototype.reportValidity.call(host as unknown as Interaction);

    expect(result).toBe(false);
    expect(host._internals.reportValidity).not.toHaveBeenCalled();
    expect(host.updateInlineValidationMessage).toHaveBeenCalledTimes(1);
    expect(host.clearInlineValidationMessage).not.toHaveBeenCalled();
  });

  it('uses native-only behavior when validationDisplayMode is native', () => {
    const host = createHost('native', false);

    const result = Interaction.prototype.reportValidity.call(host as unknown as Interaction);

    expect(result).toBe(false);
    expect(host._internals.reportValidity).toHaveBeenCalledTimes(1);
    expect(host.updateInlineValidationMessage).not.toHaveBeenCalled();
    expect(host.clearInlineValidationMessage).toHaveBeenCalledTimes(1);
  });

  it('uses both native and inline behavior when validationDisplayMode is both', () => {
    const host = createHost('both', false);

    const result = Interaction.prototype.reportValidity.call(host as unknown as Interaction);

    expect(result).toBe(false);
    expect(host._internals.reportValidity).toHaveBeenCalledTimes(1);
    expect(host.updateInlineValidationMessage).toHaveBeenCalledTimes(1);
    expect(host.clearInlineValidationMessage).not.toHaveBeenCalled();
  });

  it('uses none behavior when validationDisplayMode is none', () => {
    const host = createHost('none', false);

    const result = Interaction.prototype.reportValidity.call(host as unknown as Interaction);

    expect(result).toBe(false);
    expect(host._internals.reportValidity).not.toHaveBeenCalled();
    expect(host.updateInlineValidationMessage).not.toHaveBeenCalled();
    expect(host.clearInlineValidationMessage).toHaveBeenCalledTimes(2);
  });

  it('setInteractionValidity sets validity and updates inline message in inline mode', () => {
    const host = createHost('inline', false);
    const anchor = {} as HTMLElement;

    (Interaction.prototype as any).setInteractionValidity.call(host, false, 'Invalid selection.', anchor);

    expect(host._internals.setValidity).toHaveBeenCalledWith({ customError: true }, 'Invalid selection.', anchor);
    expect(host.updateInlineValidationMessage).toHaveBeenCalledTimes(1);
  });

  it('setInteractionValidity honors suppressInline option', () => {
    const host = createHost('both', false);

    (Interaction.prototype as any).setInteractionValidity.call(host, false, 'Invalid selection.', undefined, {
      suppressInline: true
    });

    expect(host._internals.setValidity).toHaveBeenCalledWith({ customError: true }, 'Invalid selection.', host);
    expect(host.updateInlineValidationMessage).not.toHaveBeenCalled();
  });
});
