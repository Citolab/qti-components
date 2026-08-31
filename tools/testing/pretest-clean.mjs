import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const targets = ['.cache/storybook', 'node_modules/.cache', 'node_modules/.vite', '__vitest_browser__'];

const removePath = async relativePath => {
  const fullPath = path.join(root, relativePath);
  try {
    await fs.rm(fullPath, { recursive: true, force: true });
    // Keep output concise and deterministic for CI logs.
    console.log(`cleaned ${relativePath}`);
  } catch (error) {
    console.warn(`skipped ${relativePath}: ${error?.message || String(error)}`);
  }
};

await Promise.all(targets.map(removePath));
