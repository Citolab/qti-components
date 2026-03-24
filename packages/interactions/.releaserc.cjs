const path = require('path');
const hasGithubToken = Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);

// Derive the tag prefix from the package folder name.
// The `core` package uses `interactions-core` to avoid collision with other `core` tags.
const folderName = path.basename(process.cwd());
const tagPrefix = folderName === 'core' ? 'interactions-core' : folderName;

module.exports = {
  extends: ['semantic-release-monorepo', '../../.releaserc.cjs'],
  tagFormat: `${tagPrefix}-v\${version}`,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/npm', { npmPublish: false }],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]'
      }
    ],
    ...(hasGithubToken ? [['@semantic-release/github', { successComment: false, releasedLabels: false }]] : [])
  ]
};
