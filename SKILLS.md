# SKILLS.md

Repository skill catalog for agents and contributors.

## Skill Location
- Installable skills are stored in `.codex/skills/`.
- Each skill has a required `SKILL.md`.

## Skill: `workspace-start-build-test`
- Path: `.codex/skills/workspace-start-build-test/SKILL.md`
- Use when: starting local development, running builds, tests, and baseline checks.
- Typical triggers:
  - "start the project"
  - "build everything"
  - "run tests"
- Inputs:
  - Optional package scope (`qti-interactions`, `qti-theme`, etc.)
  - Optional depth (`quick` vs `full`)
- Expected outputs:
  - Command sequence executed
  - Pass/fail status per step
  - First actionable failure if any
- Boundaries:
  - Must not mutate source files as part of verification.
  - Must not publish artifacts.

## Skill: `storybook-runner`
- Path: `.codex/skills/storybook-runner/SKILL.md`
- Use when: running Storybook locally or building static Storybook output.
- Typical triggers:
  - "run Storybook"
  - "build Storybook"
  - "run interactions Storybook"
- Inputs:
  - Target (`root`, `interactions`, `prosemirror`)
  - Mode (`dev`, `build`)
- Expected outputs:
  - Correct command and endpoint/port details
  - Build status and key warnings/errors
- Boundaries:
  - Must not refactor stories automatically.
  - Must not edit Storybook config unless explicitly asked.

## Skill: `chrome-devtools-mcp`
- Path: `.codex/skills/chrome-devtools-mcp/SKILL.md`
- Use when: starting, checking, and troubleshooting Chrome DevTools MCP server.
- Typical triggers:
  - "start chrome devtools mcp"
  - "connect devtools mcp"
  - "debug mcp browser connection"
- Inputs:
  - Browser debug URL (default `http://127.0.0.1:9222`)
- Expected outputs:
  - Start/check/stop command sequence
  - Connection validation result
  - Remediation steps when unavailable
- Boundaries:
  - Must not assume Chrome is already running with remote debugging.

## Skill: `qti-interactions-story-authoring`
- Path: `.codex/skills/qti-interactions-story-authoring/SKILL.md`
- Use when: creating/refactoring stories for `packages/qti-interactions`.
- Typical triggers:
  - "create stories for qti-interactions"
  - "split interaction stories"
  - "fix story query usage"
- Inputs:
  - Target interaction component
  - Requested story categories
- Expected outputs:
  - One main docs story in component root
  - Split stories in `stories/` taxonomy
  - Query-compliant story `play` tests
- Boundaries:
  - Must not add `autodocs` or `getStorybookHelpers` to split story files.
  - Must keep assertions focused on the interaction under test.
