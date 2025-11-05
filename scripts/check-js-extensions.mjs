#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Check for missing .js extensions in TypeScript imports
 */

const issues = [];
let totalFiles = 0;
let totalImports = 0;

async function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  totalFiles++;

  lines.forEach((line, index) => {
    // Match import statements with relative paths
    const importMatch = line.match(/(?:import|export).*from\s+['"](\.[^'"]+)['"];?\s*$/);

    if (importMatch) {
      const importPath = importMatch[1];
      totalImports++;

      // Check if it's a relative import without .js extension
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Skip if it already has .js extension
        if (!importPath.endsWith('.js')) {
          // Skip if it's not a TypeScript file import (could be CSS, JSON, etc.)
          if (!importPath.includes('.') || importPath.match(/\.(ts|tsx)$/)) {
            issues.push({
              file: filePath,
              line: index + 1,
              importPath,
              lineContent: line.trim(),
              suggestedFix: importPath + '.js'
            });
          }
        }
      }
    }
  });
}

async function main() {
  const pattern = process.argv[2] || 'packages/*/src/**/*.{ts,tsx}';
  console.log(`🔍 Checking for missing .js extensions in: ${pattern}\n`);

  const files = await glob(pattern, { ignore: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts', '**/*.stories.ts'] });

  for (const file of files) {
    await checkFile(file);
  }

  console.log(`📊 Summary:`);
  console.log(`   Files checked: ${totalFiles}`);
  console.log(`   Imports found: ${totalImports}`);
  console.log(`   Issues found: ${issues.length}\n`);

  if (issues.length === 0) {
    console.log('✅ All relative imports have proper .js extensions!');
    process.exit(0);
  }

  console.log('❌ Found imports missing .js extensions:\n');

  // Group by file
  const issuesByFile = {};
  issues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });

  Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
    console.log(`📄 ${file}`);
    fileIssues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.lineContent}`);
      console.log(`   ${' '.repeat(issue.line.toString().length + 8)}↳ Should be: "${issue.suggestedFix}"`);
    });
    console.log('');
  });

  console.log(`\n💡 To fix these issues, add '.js' extensions to relative imports.`);
  console.log(`   Note: Use .js even in .ts files - this is required for ESM compatibility.`);

  process.exit(1);
}

main().catch(console.error);
