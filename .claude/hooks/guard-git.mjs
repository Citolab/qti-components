/**
 * PreToolUse hook (Bash): refuses `git commit` and `git push` in the root checkout while it is on a
 * lane branch (`main` or `next`). Work happens in a worktree under `.claude/worktrees/`
 * (CLAUDE.md, "One change, start to finish"). Permission rules cannot see the directory or the
 * branch a command runs in, so this is a hook.
 *
 * The directory is the hook input's `cwd`, moved by every `cd <dir>` earlier in the same compound
 * command, and by a `git -C <dir>`. Exit 2 blocks the call and shows stderr to Claude; exit 0 lets
 * the permission rules decide.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const LANES = new Set(['main', 'next']);
const GUARDED = new Set(['commit', 'push']);

const input = JSON.parse(readFileSync(0, 'utf8'));
const command = input.tool_input?.command ?? '';

const unquote = token => token.replace(/^["']|["']$/g, '').replace(/^~(?=\/|$)/, homedir());
const git = (dir, ...args) => {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

/** The guarded verb and its directory when a segment runs `git [options] commit|push`. */
const gitCall = (tokens, dir) => {
  if (tokens[0] !== 'git') return null;
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '-C') dir = resolve(dir, unquote(tokens[++i] ?? '.'));
    else if (token === '-c') i++;
    else if (token.startsWith('-')) continue;
    else return GUARDED.has(token) ? { verb: token, dir } : null;
  }
  return null;
};

let dir = input.cwd ?? process.cwd();
for (const segment of command.split(/&&|\|\||;|\||\n/)) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean);
  if (tokens[0] === 'cd') {
    dir = resolve(dir, unquote(tokens[1] ?? homedir()));
    continue;
  }
  const call = gitCall(tokens, dir);
  if (!call) continue;

  const gitDir = resolve(call.dir, git(call.dir, 'rev-parse', '--git-dir'));
  const commonDir = resolve(call.dir, git(call.dir, 'rev-parse', '--git-common-dir'));
  const branch = git(call.dir, 'branch', '--show-current');

  if (gitDir === commonDir && LANES.has(branch)) {
    process.stderr.write(
      `Refused: \`git ${call.verb}\` in the root checkout on \`${branch}\`. ` +
        'Make a worktree off origin/<lane> under .claude/worktrees/<branch-dashed> and work there ' +
        '(CLAUDE.md, "One change, start to finish").\n'
    );
    process.exit(2);
  }
}
