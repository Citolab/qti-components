import { CustomStateSetShim, classifyCustomStateSupport } from './custom-state-set';

/**
 * The browser these tests run in supports custom states natively, so
 * `installCustomStateSetFallback` is a no-op here by design — it classifies as
 * `modern` and leaves `attachInternals` alone. The behaviour worth pinning is
 * therefore exercised directly: the shim against a real host element, and the
 * classifier against each of the three profiles it has to tell apart.
 */
describe('CustomStateSetShim', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => host.remove());

  it('mirrors added states into data-state', () => {
    const states = new CustomStateSetShim(host);

    states.add('checked');
    expect(host.getAttribute('data-state')).toBe('checked');

    states.add('radio');
    expect(host.getAttribute('data-state')).toBe('checked radio');
  });

  it('accepts bare names, which the legacy native set rejects', () => {
    const states = new CustomStateSetShim(host);

    // The whole point: no `--` prefix required.
    expect(() => states.add('correct-response')).not.toThrow();
    expect(states.has('correct-response')).toBe(true);
  });

  it('supports the has() reads the interactions rely on', () => {
    const states = new CustomStateSetShim(host);

    expect(states.has('checked')).toBe(false);
    states.add('checked');
    expect(states.has('checked')).toBe(true);
  });

  it('removes the attribute once the last state goes', () => {
    const states = new CustomStateSetShim(host);

    states.add('drag');
    states.delete('drag');
    expect(host.hasAttribute('data-state')).toBe(false);
  });

  it('clears every state at once', () => {
    const states = new CustomStateSetShim(host);

    states.add('idle');
    states.add('playing');
    states.clear();
    expect(host.hasAttribute('data-state')).toBe(false);
  });

  it('defers the write for an element that is not connected yet', async () => {
    const detached = document.createElement('div');
    const states = new CustomStateSetShim(detached);

    states.add('checked');
    // A custom element must not gain attributes while upgrading.
    expect(detached.hasAttribute('data-state')).toBe(false);

    await Promise.resolve();
    expect(detached.getAttribute('data-state')).toBe('checked');
  });
});

describe('classifyCustomStateSupport', () => {
  it('reports modern when a bare name is accepted', () => {
    const attachInternals = () => ({ states: new Set<string>() }) as unknown as ElementInternals;

    expect(classifyCustomStateSupport(attachInternals)).toBe('modern');
  });

  it('reports legacy when a bare name throws, as pre-spec Chrome and Edge do', () => {
    const attachInternals = () =>
      ({
        states: {
          add(value: string) {
            if (!value.startsWith('--')) {
              throw new SyntaxError(`The specified value '${value}' must start with '--'.`);
            }
          },
          delete: () => true
        }
      }) as unknown as ElementInternals;

    expect(classifyCustomStateSupport(attachInternals)).toBe('legacy');
  });

  it('reports missing when internals carry no states, as Safari 16.4 to 17.3 do', () => {
    const attachInternals = () => ({}) as unknown as ElementInternals;

    expect(classifyCustomStateSupport(attachInternals)).toBe('missing');
  });
});
