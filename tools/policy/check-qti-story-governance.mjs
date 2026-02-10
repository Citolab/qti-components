#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const COMPONENTS_ROOT = path.join(ROOT, 'packages/qti-interactions/src/components');
const failOnIssues = process.argv.includes('--fail-on-issues');
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

const splitSuffixes = [
  '.a11y.stories.ts',
  '.api.stories.ts',
  '.behavior.stories.ts',
  '.config.stories.ts',
  '.correctresponse.stories.ts',
  '.dom.stories.ts',
  '.forms.stories.ts',
  '.theming.stories.ts',
  '.validation.stories.ts',
  '.vocabulary.stories.ts'
];

const disallowedDomPatterns = [/\bquerySelector\s*\(/, /shadowRoot\?\.querySelector\s*\(/];

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

function color(text, code) {
  if (!useColor) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

function truncatePath(filePath, max = 68) {
  const compacted = filePath
    .replace(/^packages\/qti-interactions\/src\/components\//, 'qi/c/')
    .replace(/\/stories\//g, '/s/');

  if (compacted.length <= max) return compacted;

  const parts = compacted.split('/');
  if (parts.length <= 3) {
    return `${compacted.slice(0, max - 1)}…`;
  }

  const first = parts.slice(0, 2).join('/');
  const last = parts.slice(-2).join('/');
  const merged = `${first}/…/${last}`;
  if (merged.length <= max) return merged;
  return `…/${parts.at(-1)}`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listDirNames(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

async function readMaybe(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

function classifySplitStory(filename) {
  return splitSuffixes.find(suffix => filename.endsWith(suffix));
}

async function audit() {
  const issues = [];
  const infos = [];

  if (!(await fileExists(COMPONENTS_ROOT))) {
    console.error(`Missing components path: ${rel(COMPONENTS_ROOT)}`);
    process.exit(2);
  }

  const componentDirs = await listDirNames(COMPONENTS_ROOT);

  for (const componentDirName of componentDirs) {
    const componentDir = path.join(COMPONENTS_ROOT, componentDirName);
    const entries = await fs.readdir(componentDir, { withFileTypes: true });

    const rootStories = entries.filter(e => e.isFile() && e.name.endsWith('.stories.ts')).map(e => e.name);

    const expectedMainStory = `${componentDirName}.stories.ts`;
    const mainStoryPath = path.join(componentDir, expectedMainStory);

    if (!(await fileExists(mainStoryPath))) {
      issues.push({
        type: 'missing-main-story',
        file: rel(componentDir),
        message: `Expected main docs story ${expectedMainStory}`
      });
    }

    if (rootStories.length > 1) {
      issues.push({
        type: 'multiple-root-stories',
        file: rel(componentDir),
        message: `Found multiple root stories: ${rootStories.join(', ')}`
      });
    }

    const storiesDir = path.join(componentDir, 'stories');
    const hasStoriesDir = await fileExists(storiesDir);
    if (!hasStoriesDir) {
      infos.push({
        type: 'no-split-stories-dir',
        file: rel(componentDir),
        message: 'No stories/ directory present'
      });
      continue;
    }

    const splitEntries = (await fs.readdir(storiesDir, { withFileTypes: true }))
      .filter(e => e.isFile() && e.name.endsWith('.stories.ts'))
      .map(e => e.name);

    for (const splitName of splitEntries) {
      const splitPath = path.join(storiesDir, splitName);
      const content = (await readMaybe(splitPath)) || '';

      if (!classifySplitStory(splitName)) {
        issues.push({
          type: 'unexpected-split-taxonomy',
          file: rel(splitPath),
          message: 'File does not match approved split-story taxonomy'
        });
      }

      if (/getStorybookHelpers\s*\(/.test(content)) {
        issues.push({
          type: 'helpers-in-split-story',
          file: rel(splitPath),
          message: 'Split story uses getStorybookHelpers(...)'
        });
      }

      if (/tags\s*:\s*\[\s*['\"]autodocs['\"]\s*\]/.test(content)) {
        issues.push({
          type: 'autodocs-in-split-story',
          file: rel(splitPath),
          message: 'Split story contains tags: ["autodocs"]'
        });
      }

      for (const pattern of disallowedDomPatterns) {
        if (pattern.test(content)) {
          issues.push({
            type: 'dom-probing-in-story',
            file: rel(splitPath),
            message: `Found direct DOM probing pattern: ${pattern}`
          });
        }
      }
    }
  }

  return { issues, infos };
}

function printReport({ issues, infos }) {
  const issueCount = issues.length;
  const infoCount = infos.length;
  const status = issueCount > 0 ? color('FAIL', '31;1') : color('PASS', '32;1');

  console.log(`${color('QTI story governance', '1')} ${status}`);
  console.log(
    `${color('issues', '31;1')}:${color(String(issueCount), '31')}  ${color('info', '36;1')}:${color(
      String(infoCount),
      '36'
    )}`
  );

  if (issues.length) {
    console.log(`\n${color('[ISSUES]', '31;1')}`);
    for (const issue of issues) {
      const shortPath = truncatePath(issue.file);
      console.log(`${color('!', '31;1')} ${color(issue.type, '33;1')} ${color(shortPath, '2')}`);
      console.log(`  ${color('->', '90')} ${issue.message}`);
    }
  }

  if (infos.length) {
    console.log(`\n${color('[INFO]', '36;1')}`);
    for (const info of infos) {
      const shortPath = truncatePath(info.file);
      console.log(`${color('i', '36;1')} ${color(info.type, '36')} ${color(shortPath, '2')}`);
      console.log(`  ${color('->', '90')} ${info.message}`);
    }
  }
}

const result = await audit();
printReport(result);

if (failOnIssues && result.issues.length > 0) {
  process.exit(1);
}
