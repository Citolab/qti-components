/**
 * Type-checks the published surface of @citolab/qti-components the way a CONSUMER sees it.
 *
 * `pnpm tsc` only proves the monorepo compiles, where every `@qti-components/*` package is
 * on disk. Consumers get none of them — they are devDependencies, bundled into the JS — so a
 * declaration that imports one type-checks here and fails there. That is exactly how 8.0.0
 * shipped: the runtime worked, the types were unresolvable, and downstream projects had to
 * install the devDependencies by hand to compile at all.
 *
 * attw does not cover this. It resolves ENTRYPOINTS — verifying `./corrections` maps to a
 * .d.ts that exists — and never type-checks what those declarations import. Measured: attw
 * reports every entrypoint green on the broken 8.0.1.
 *
 * So: pack the package, install the tarball into a scratch project outside the workspace,
 * and run tsc over a fixture that uses the public API. Any unresolvable import shows up as
 * the member types collapsing, which the fixture's assignments then reject.
 *
 * Pack with `pnpm pack`, never `npm pack`. Workspace manifests declare their cross-cutting
 * runtime deps as `"lit": "catalog:"` (see the catalog in pnpm-workspace.yaml). pnpm rewrites
 * that to the real range while packing — in dependencies, devDependencies AND peerDependencies
 * — exactly as `pnpm publish` does. npm knows nothing about the protocol and copies the literal
 * string through, so an npm-packed tarball declares `"lit": "catalog:"`, which is not a version
 * range. That tarball is not what gets published, so testing it would prove nothing about the
 * real artifact.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(here, '../../packages/qti-components');
const fixture = join(here, 'consumer-types');

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const scratch = mkdtempSync(join(tmpdir(), 'qti-consumer-types-'));
let failed = false;
try {
  console.log(`consumer-types: packing @citolab/qti-components…`);
  // `--out` rather than parsing stdout: pnpm pack prints a "Tarball Details" report, not a bare
  // filename the way `npm pack --silent` does.
  const packed = join(scratch, 'package.tgz');
  run('pnpm', ['pack', '--out', packed], pkgDir);

  // The packed manifest is the artifact consumers actually get. Assert pnpm resolved every
  // workspace-only protocol out of it — a literal `catalog:` or `workspace:` range would make the
  // tarball uninstallable, and reaching this point with one means something packed it with npm.
  const packedManifest = JSON.parse(run('tar', ['xzOf', packed, 'package/package.json'], scratch));
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, range] of Object.entries(packedManifest[field] ?? {})) {
      if (/^(catalog|workspace):/.test(range)) {
        throw new Error(
          `consumer-types: the packed manifest still declares ${field}.${name} as "${range}". ` +
            'pnpm rewrites these while packing; npm does not. Pack with pnpm.'
        );
      }
    }
  }

  cpSync(fixture, scratch, { recursive: true });
  writeFileSync(
    join(scratch, 'package.json'),
    JSON.stringify({ name: 'consumer-types', private: true, type: 'module' }, null, 2)
  );

  // The fixture's tsconfig carries `paths` so the file also resolves inside the workspace,
  // where the package is not installed and the editor would show nothing but unresolved
  // imports. Those mappings must not survive into the scratch project: the point is to
  // resolve @citolab/qti-components through node_modules, from the tarball.
  const { config, error } = ts.parseConfigFileTextToJson(
    join(fixture, 'tsconfig.json'),
    readFileSync(join(fixture, 'tsconfig.json'), 'utf8')
  );
  if (error) throw new Error(`consumer-types: cannot read the fixture tsconfig: ${error.messageText}`);
  delete config.compilerOptions.paths;
  writeFileSync(join(scratch, 'tsconfig.json'), JSON.stringify(config, null, 2));

  console.log('consumer-types: installing the tarball into a scratch project…');
  run('npm', ['install', '--silent', '--no-audit', '--no-fund', 'typescript@5.9.3', 'lit@3.3.3', packed], scratch);

  console.log('consumer-types: type-checking…');
  try {
    run('npx', ['tsc', '-p', 'tsconfig.json'], scratch);
    console.log('consumer-types: ✓ the published types check out for a consumer');
  } catch (error) {
    failed = true;
    console.error('\nconsumer-types: ✗ the published types do NOT check out for a consumer:\n');
    console.error(error.stdout || error.message);
    console.error(
      'Most likely a declaration imports a package that is not shipped. See ' +
        'packages/qti-components/tsup.config.ts — the dts build maps @qti-components/* to ' +
        "each sibling's built .d.ts so the emitted declarations stay self-contained."
    );
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
