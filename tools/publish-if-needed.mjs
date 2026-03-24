#!/usr/bin/env node
/**
 * Why this script exists:
 * - Added during the manual-release pipeline refactor (umbrella-driven publish + Storybook deploy).
 * - You asked for publishing to be idempotent: do not fail if a package version is already on npm.
 * - You also asked to only publish when a version is not yet published, and to fail on real infra/auth errors.
 *
 * Why it lives in-repo:
 * - It gives every package in `packages/*` one shared, auditable publish behavior.
 * - CI and local/manual release use the same logic, avoiding workflow-specific shell duplication.
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const pkgPath = resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const { name, version } = pkg;

if (!name || !version) {
  console.error('Missing package name or version in package.json');
  process.exit(1);
}

const packageRef = `${name}@${version}`;
const registry = 'https://registry.npmjs.org/';

function isTruthy(value) {
  return /^(1|true|yes|on)$/i.test(`${value ?? ''}`.trim());
}

function shouldUseProvenance() {
  const provenanceRequested = isTruthy(
    process.env.NPM_CONFIG_PROVENANCE ?? process.env.npm_config_provenance
  );

  if (!provenanceRequested) {
    return false;
  }

  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const hasOidcTokenRequest =
    Boolean(process.env.ACTIONS_ID_TOKEN_REQUEST_URL) &&
    Boolean(process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN);

  if (!isGitHubActions) {
    console.warn('Skipping npm provenance: supported trusted publishing provider not detected.');
    return false;
  }

  if (!hasOidcTokenRequest) {
    console.error(
      'npm provenance was requested in GitHub Actions, but OIDC token request environment variables are missing.'
    );
    process.exit(1);
  }

  return true;
}

const view = spawnSync('npm', ['view', packageRef, 'version', '--registry', registry], {
  stdio: 'pipe',
  encoding: 'utf8'
});

if (view.error) {
  console.error(`Failed to check publish state for ${packageRef}:`, view.error.message);
  process.exit(1);
}

if (view.status === 0) {
  console.log(`Skipping publish: ${packageRef} is already published.`);
  process.exit(0);
}

const viewOutput = `${view.stdout ?? ''}\n${view.stderr ?? ''}`.trim();
const isNotFound = /E404|404 Not Found|is not in this registry|No match found for version/i.test(viewOutput);

if (!isNotFound) {
  console.error(`Failed to verify whether ${packageRef} is published.`);
  if (viewOutput) {
    console.error(viewOutput);
  }
  process.exit(view.status ?? 1);
}

console.log(`Version not found in npm registry, publishing ${packageRef}.`);

const publishArgs = ['publish', '--access', 'public', '--ignore-scripts', '--no-git-checks'];

if (shouldUseProvenance()) {
  publishArgs.splice(1, 0, '--provenance');
}

const publish = spawnSync('pnpm', publishArgs, {
  stdio: 'pipe',
  encoding: 'utf8'
});

if (publish.error) {
  console.error(`Failed to publish ${packageRef}:`, publish.error.message);
  process.exit(1);
}

if (publish.stdout) {
  process.stdout.write(publish.stdout);
}

if (publish.stderr) {
  process.stderr.write(publish.stderr);
}

if (publish.status !== 0) {
  const publishOutput = `${publish.stdout ?? ''}\n${publish.stderr ?? ''}`.trim();
  const isRegistryPermission404 =
    /PUT https:\/\/registry\.npmjs\.org\/.+\s404/i.test(publishOutput) &&
    /could not be found or you do not have permission to access it/i.test(publishOutput);

  if (isRegistryPermission404) {
    console.error(
      `Publish failed for ${packageRef}: npm accepted the registry URL but rejected the publish request for this scope/package.`
    );
    console.error(
      'This usually means the current npm account or token does not have publish rights for the @qti-components scope.'
    );
    console.error('Verify with `npm whoami` and confirm that account can publish @qti-components packages.');
  }
}

process.exit(publish.status ?? 1);
