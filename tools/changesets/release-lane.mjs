// Which lane a release may come from. Pure on purpose: used by the CLI check and by its spec.
//
// `main` releases stable versions to `latest`. `next` releases prereleases to the `next` dist-tag,
// which only happens while changesets is in pre-release mode (`.changeset/pre.json` exists). The
// two failure cases are the dangerous ones:
//   - a non-main branch without pre mode would publish a stable major to `latest`;
//   - main in pre mode would publish a prerelease nobody asked for.
export function laneProblem(branch, inPreMode) {
  if (branch === 'main' && inPreMode) {
    return 'main is in changesets pre-release mode (.changeset/pre.json exists). Leave pre mode before releasing from main.';
  }
  if (branch !== 'main' && !inPreMode) {
    return `${branch} is not in changesets pre-release mode, so this would publish stable versions to the latest tag. Run \`pnpm exec changeset pre enter next\` on the branch first, or release from main.`;
  }
  return null;
}
