import { laneProblem } from './release-lane.mjs';

describe('laneProblem', () => {
  it('lets main release stable and next release in pre mode', () => {
    expect(laneProblem('main', false)).toBeNull();
    expect(laneProblem('next', true)).toBeNull();
  });

  it('blocks a stable release from a non-main branch', () => {
    expect(laneProblem('next', false)).toMatch(/latest tag/);
  });

  it('blocks main while it is in pre mode', () => {
    expect(laneProblem('main', true)).toMatch(/pre-release mode/);
  });
});
