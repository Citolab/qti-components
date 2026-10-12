import { describe, expect, it, vi } from 'vitest';

// Modules are cached in the browser runner, so `./register` runs once per file: this one test
// pre-registers a single tag with another constructor, then lets the plugin register.
describe('text-to-speech register', () => {
  it('warns about a tag taken by another constructor, leaves it alone, and defines the rest', async () => {
    class Other extends HTMLElement {}
    customElements.define('test-tts-stop', Other);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { ttsElements } = await import('./elements');
    await import('./register');

    const ours = warn.mock.calls
      .map(([message]) => String(message))
      .filter(m => m.includes('@qti-components/test/tts'));
    expect(ours).toHaveLength(1);
    expect(ours[0]).toContain('test-tts-stop');
    expect(ours[0]).not.toContain('test-tts-next');

    for (const { tag, ctor } of ttsElements) {
      expect(customElements.get(tag)).toBe(tag === 'test-tts-stop' ? Other : ctor);
    }
    warn.mockRestore();
  });
});
