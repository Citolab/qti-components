const hasGithubToken = Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);

module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ...(hasGithubToken ? ['@semantic-release/github'] : [])
  ]
};
