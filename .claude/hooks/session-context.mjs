/**
 * SessionStart hook: tells Claude where it is before it does anything. Branch, lane, whether this
 * is the root checkout or a worktree, and the changesets waiting in this branch. Reads only local
 * git state (no fetch), so it is fast and works offline. Stdout becomes session context.
 *
 * The directory is the hook input's `cwd`: in a desktop or `EnterWorktree` session
 * `CLAUDE_PROJECT_DIR` stays at the root checkout while `cwd` is the worktree.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const readInput = () => {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
};
const dir = readInput().cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const git = (...args) => {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const isAncestor = ref => {
  try {
    execFileSync('git', ['-C', dir, 'merge-base', '--is-ancestor', ref, 'HEAD'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const branch = git('branch', '--show-current') || '(detached)';
const isRootCheckout =
  resolve(dir, git('rev-parse', '--git-dir')) === resolve(dir, git('rev-parse', '--git-common-dir'));
// `next` contains `main` (main is merged into next on every push), so test `next` first.
const lane = isAncestor('origin/next') ? 'next' : isAncestor('origin/main') ? 'main' : 'unknown';

let changesets = [];
try {
  changesets = readdirSync(resolve(dir, '.changeset')).filter(f => f.endsWith('.md') && f !== 'README.md');
} catch {
  // no .changeset folder
}

const lines = [
  `Branch: ${branch}. Lane: ${lane} (from local origin refs; fetch if stale).`,
  isRootCheckout
    ? 'Location: the root checkout. Do not commit here; make a worktree under .claude/worktrees/ for a change.'
    : `Location: worktree ${dir}.`,
  `Pending changesets on this branch: ${changesets.length}.`
];
process.stdout.write(lines.join('\n') + '\n');
