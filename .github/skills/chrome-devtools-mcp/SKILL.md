---
name: chrome-devtools-mcp
description: Start, validate, and troubleshoot the Chrome DevTools MCP server used by this repository configuration.
---

# Chrome DevTools MCP

## When To Use
- User asks to start/connect/check Chrome DevTools MCP.
- Browser automation or debugging tasks need MCP connectivity.

## Repository Source Of Truth
- VS Code MCP config: `.vscode/mcp.json`
- Configured server command:
  - `npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222`

## Start Sequence
1. Ensure Chrome is running with remote debugging enabled on port `9222`.
2. Start MCP server:
   - `npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222`
3. Validate connection by listing/opening a page via MCP client.

## Stop Sequence
- Stop the MCP server process from the running terminal session (`Ctrl+C`).

## Troubleshooting
- If connection fails, verify remote-debugging port is open and matches `--browser-url`.
- If `npx` fails, verify Node/npm availability and network/package resolution.
- If pages are not visible, verify the same Chrome profile/session is targeted.

## Boundaries
- Do not assume the browser is already launched with remote debugging.
- Do not change `.vscode/mcp.json` unless explicitly requested.
