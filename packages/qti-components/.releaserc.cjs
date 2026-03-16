const hasGithubToken = Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
const releaseCommitPrefix = 'chore(release): umbrella ';

const parseSemver = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
};

const toSemver = ({ major, minor, patch }) => `${major}.${minor}.${patch}`;

const bumpVersion = (currentVersion, releaseType) => {
  const parsed = parseSemver(currentVersion);
  if (!parsed) {
    return null;
  }

  if (releaseType === 'patch') {
    return toSemver({ major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 });
  }

  if (releaseType === 'minor') {
    return toSemver({ major: parsed.major, minor: parsed.minor + 1, patch: 0 });
  }

  if (releaseType === 'major') {
    return toSemver({ major: parsed.major + 1, minor: 0, patch: 0 });
  }

  return null;
};

const resolveReleaseRequest = (commits) => {
  const commit = commits.find(({ message }) => message?.startsWith(releaseCommitPrefix));
  if (!commit) {
    return null;
  }

  const marker = commit.message.split('\n')[0].slice(releaseCommitPrefix.length).trim();
  if (!marker) {
    throw new Error(
      `Invalid umbrella release commit. Expected "${releaseCommitPrefix}<patch|minor|major|x.y.z>".`
    );
  }

  if (['patch', 'minor', 'major'].includes(marker)) {
    return { marker, releaseType: marker };
  }

  if (!parseSemver(marker)) {
    throw new Error(
      `Invalid umbrella release marker "${marker}". Use patch, minor, major, or exact semver x.y.z.`
    );
  }

  return { marker, exactVersion: marker };
};

const umbrellaReleasePlugin = {
  analyzeCommits: (_pluginConfig, context) => {
    const request = resolveReleaseRequest(context.commits);
    if (!request) {
      return null;
    }

    if (request.releaseType) {
      if (
        process.env.UMBRELLA_RELEASE_MODE &&
        process.env.UMBRELLA_RELEASE_MODE !== request.releaseType
      ) {
        throw new Error(
          `Requested umbrella release mode (${process.env.UMBRELLA_RELEASE_MODE}) does not match commit marker (${request.releaseType}).`
        );
      }

      return request.releaseType;
    }

    const lastVersion = context.lastRelease?.version;
    if (!parseSemver(lastVersion)) {
      throw new Error(
        `Cannot resolve exact umbrella release "${request.exactVersion}" without a valid previous release version.`
      );
    }

    for (const releaseType of ['patch', 'minor', 'major']) {
      if (bumpVersion(lastVersion, releaseType) === request.exactVersion) {
        if (
          process.env.UMBRELLA_RELEASE_MODE &&
          process.env.UMBRELLA_RELEASE_MODE !== releaseType
        ) {
          throw new Error(
            `Requested umbrella release mode (${process.env.UMBRELLA_RELEASE_MODE}) does not match exact version ${request.exactVersion}.`
          );
        }

        return releaseType;
      }
    }

    throw new Error(
      `Exact umbrella version ${request.exactVersion} is invalid for last release ${lastVersion}. It must be the immediate next patch, minor, or major version.`
    );
  },
  verifyRelease: (_pluginConfig, context) => {
    const request = resolveReleaseRequest(context.commits);
    if (!request?.exactVersion) {
      if (process.env.UMBRELLA_EXACT_VERSION) {
        throw new Error(
          `UMBRELLA_EXACT_VERSION (${process.env.UMBRELLA_EXACT_VERSION}) is set, but release commit does not request an exact version.`
        );
      }

      return;
    }

    if (
      process.env.UMBRELLA_EXACT_VERSION &&
      process.env.UMBRELLA_EXACT_VERSION !== request.exactVersion
    ) {
      throw new Error(
        `UMBRELLA_EXACT_VERSION (${process.env.UMBRELLA_EXACT_VERSION}) does not match release commit exact version (${request.exactVersion}).`
      );
    }

    if (context.nextRelease?.version !== request.exactVersion) {
      throw new Error(
        `Exact umbrella version mismatch. Requested ${request.exactVersion}, computed ${context.nextRelease?.version}.`
      );
    }
  }
};

module.exports = {
  extends: ['../../.releaserc.cjs'],
  tagFormat: 'qti-components-v${version}',
  plugins: [
    umbrellaReleasePlugin,
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/npm', { npmPublish: false }],
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
