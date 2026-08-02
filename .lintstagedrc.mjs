/**
 * Pre-commit tasks, staged files only.
 *
 * Moved out of package.json to gain two things the JSON form could not express: a task that runs
 * ONCE for the whole commit rather than once per matched file, and a glob for CSS.
 *
 * ── Why `vitest --changed` and not `vitest related <files>` ─────────────────────────────────────
 *
 * `related` was seeded by the file list lint-staged passes in, and that list came from a
 * `*.{js,jsx,ts,tsx,mjs,cjs}` glob — so **a commit that changed only CSS ran no tests at all**. That
 * is not hypothetical: the drop-sizing regression that produced the 128px hotspot and shrank match's
 * cards was two lines of CSS in qti-variables.css. Nothing in this hook looked at it.
 *
 * `--changed` is seeded from git instead, so it sees every staged file whatever its extension, and
 * a `.css` change reaches the story tests that render the elements reading it.
 *
 * ── Why this is staged-only, which is the part worth being precise about ────────────────────────
 *
 * `--changed` with no value means "uncommitted changes, staged AND unstaged". That would be the
 * wrong gate on its own: an unstaged fix sitting in the working tree can make a staged bug pass, and
 * the commit then goes out green.
 *
 * It is staged-only here because of TWO things together, and both are required:
 *
 *   1. the vitest call lives inside lint-staged rather than in .husky/pre-commit, and
 *   2. the hook passes `--hide-unstaged`, so lint-staged stashes every unstaged change for the
 *      duration of the run.
 *
 * (2) is not the default — lint-staged normally hides only PARTIALLY staged files, which leaves a
 * fully unstaged edit sitting in the working tree for `--changed` to find. Drop either half and the
 * gate quietly stops meaning what it says.
 *
 * ── The one hole, and it is git's, not lint-staged's ────────────────────────────────────────────
 *
 * UNTRACKED files are not stashed, so they survive the hide and are visible to the run. If an
 * untracked spec imports something from a change you left unstaged, the hook fails on an import
 * error that has nothing to do with what you are committing. Seen for real: committing this file
 * on its own, with a new `dropzone-auto-size.mixin.spec.ts` on disk, failed with "does not provide
 * an export named 'applyDropzoneAutoSizing'" — the mixin had been reverted by the hide, the spec
 * had not. The fix is ordering, not configuration: commit a new test alongside the code it tests.
 */
export default {
  '*.{js,jsx,ts,tsx,mjs,cjs}': ['prettier --write', 'eslint --fix'],

  // CSS gets the same treatment. stylelint is not decoration here: `qti/no-declared-measured-token`
  // and `qti/no-layout-in-transient-state` both guard invariants that VRT and the story suite
  // cannot see, and both live in files this glob is the only thing that reaches.
  '*.{css,scss}': ['prettier --write', 'stylelint --fix'],

  /*
   * One test run for the whole commit.
   *
   * A function returning a plain string is what stops lint-staged appending the matched filenames —
   * `vitest --changed` derives its own set from git and would treat a file list as a name filter,
   * which silently narrows the run to nothing.
   */
  '*': () => 'vitest run --changed --passWithNoTests'
};
