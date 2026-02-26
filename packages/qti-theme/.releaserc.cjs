const hasGithubToken = Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);

module.exports = {
  extends: ['semantic-release-monorepo', '../../.releaserc.cjs'],
  tagFormat: 'theme-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/npm', { npmPublish: true }],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    ...(hasGithubToken ? ['@semantic-release/github'] : [])
  ]
};
