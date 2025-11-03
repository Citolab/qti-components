#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const packagesDir = path.join(__dirname, 'packages');
const rootDir = __dirname;

// Packages to rename (from qc- to qti-)
const packagesToRename = [
  'qti-components',
  'qti-elements', 
  'qti-interactions',
  'qti-item',
  'qti-loader',
  'qti-processing',
  'qti-shared',
  'qti-test',
  'qti-theme',
  'qti-transformers',
  'qti-utilities'
];

// Files/directories to search for references (excluding node_modules, .git, dist, etc.)
const searchPatterns = [
  '**/*.json',
  '**/*.ts',
  '**/*.js',
  '**/*.mjs',
  '**/*.yaml',
  '**/*.yml',
  '**/*.md',
  '**/*.css',
  '**/*.html'
];

const ignorePatterns = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'cdn/**',
  'coverage/**',
  'storybook-static/**',
  '.pnpm/**',
  'pnpm-lock.yaml'
];

async function runTypeScriptCheck() {
  console.log('🔍 Running TypeScript compilation check...');
  try {
    const { stdout, stderr } = await execAsync('npx tsc --noEmit', { cwd: rootDir });
    console.log('✅ TypeScript check completed');
    if (stdout) console.log('stdout:', stdout);
    if (stderr) console.log('stderr:', stderr);
    return true;
  } catch (error) {
    console.log('⚠️  TypeScript check found issues:');
    console.log(error.stdout || error.message);
    return false;
  }
}

async function getAllFiles(dir, patterns, ignorePatterns) {
  const files = [];
  
  async function walkDir(currentDir, relativePath = '') {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name).replace(/\\/g, '/');
      
      // Check if should ignore this path
      const shouldIgnore = ignorePatterns.some(pattern => {
        const normalizedPattern = pattern.replace('**/', '');
        return relativeFilePath.includes(normalizedPattern) || 
               relativeFilePath.startsWith(normalizedPattern) ||
               entry.name === normalizedPattern;
      });
      
      if (shouldIgnore) continue;
      
      if (entry.isDirectory()) {
        await walkDir(fullPath, relativeFilePath);
      } else if (entry.isFile()) {
        // Check if file matches any pattern
        const matchesPattern = patterns.some(pattern => {
          const ext = pattern.replace('**/*', '');
          return relativeFilePath.endsWith(ext);
        });
        
        if (matchesPattern) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walkDir(dir);
  return files;
}

async function renameDirectories() {
  console.log('📁 Renaming package directories...');
  
  for (const oldName of packagesToRename) {
    const oldPath = path.join(packagesDir, oldName);
    const newName = oldName.replace('qc-', 'qti-');
    const newPath = path.join(packagesDir, newName);
    
    try {
      await fs.access(oldPath);
      await fs.rename(oldPath, newPath);
      console.log(`✅ Renamed ${oldName} → ${newName}`);
    } catch (error) {
      console.log(`⚠️  Could not rename ${oldName}: ${error.message}`);
    }
  }
}

async function updateFileContent(filePath, replacements) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    for (const [from, to] of replacements) {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, to);
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`⚠️  Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

async function updateReferences() {
  console.log('🔍 Finding and updating references...');
  
  const files = await getAllFiles(rootDir, searchPatterns, ignorePatterns);
  console.log(`📄 Found ${files.length} files to check`);
  
  // Create replacement mappings
  const replacements = [];
  
  // Package directory references
  for (const oldName of packagesToRename) {
    const newName = oldName.replace('qc-', 'qti-');
    replacements.push([`packages/${oldName}`, `packages/${newName}`]);
    replacements.push([`./packages/${oldName}`, `./packages/${newName}`]);
  }
  
  // npm package name references (@qti-components scope)
  const packageNameMappings = {
    'qti-components': 'components',
    'qti-elements': 'elements', 
    'qti-interactions': 'interactions',
    'qti-item': 'item',
    'qti-loader': 'loader',
    'qti-processing': 'processing',
    'qti-shared': 'shared',
    'qti-test': 'test',
    'qti-theme': 'theme',
    'qti-transformers': 'transformers',
    'qti-utilities': 'utilities'
  };
  
  // Import/require path references
  for (const [oldName, newName] of Object.entries(packageNameMappings)) {
    // Workspace imports
    replacements.push([`"@qti-components/${newName}"`, `"@qti-components/${newName}"`]); // Already correct
    
    // Relative imports within packages
    replacements.push([`../qc-${newName.replace('qc-', '')}`, `../qti-${newName}`]);
    replacements.push([`../../qc-${newName.replace('qc-', '')}`, `../../qti-${newName}`]);
    replacements.push([`../../../qc-${newName.replace('qc-', '')}`, `../../../qti-${newName}`]);
    
    // Direct path imports
    replacements.push([`/qc-${newName.replace('qc-', '')}`, `/qti-${newName}`]);
  }
  
  // File and class name references
  replacements.push(['qti-components', 'qti-components']);
  replacements.push(['qti-elements', 'qti-elements']);
  replacements.push(['qti-interactions', 'qti-interactions']);
  replacements.push(['qti-item', 'qti-item']);
  replacements.push(['qti-loader', 'qti-loader']);
  replacements.push(['qti-processing', 'qti-processing']);
  replacements.push(['qti-shared', 'qti-shared']);
  replacements.push(['qti-test', 'qti-test']);
  replacements.push(['qti-theme', 'qti-theme']);
  replacements.push(['qti-transformers', 'qti-transformers']);
  replacements.push(['qti-utilities', 'qti-utilities']);
  
  let modifiedFiles = 0;
  
  for (const filePath of files) {
    const wasModified = await updateFileContent(filePath, replacements);
    if (wasModified) {
      modifiedFiles++;
      console.log(`✏️  Updated: ${path.relative(rootDir, filePath)}`);
    }
  }
  
  console.log(`✅ Updated ${modifiedFiles} files`);
}

async function updateWireitDependencies() {
  console.log('🔧 Updating wireit dependencies in root package.json...');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  try {
    const content = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    
    if (packageJson.wireit && packageJson.wireit.build && packageJson.wireit.build.dependencies) {
      // Update wireit build dependencies
      packageJson.wireit.build.dependencies = packageJson.wireit.build.dependencies.map(dep => {
        return dep.replace('./packages/qti-components:build', './packages/qti-components:build');
      });
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
      console.log('✅ Updated wireit dependencies');
    }
  } catch (error) {
    console.log(`⚠️  Error updating wireit dependencies: ${error.message}`);
  }
}

async function updateScripts() {
  console.log('🔧 Updating npm scripts...');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  try {
    const content = await fs.readFile(packageJsonPath, 'utf8');
    const updatedContent = content.replace(/packages\/qti-theme/g, 'packages/qti-theme');
    
    await fs.writeFile(packageJsonPath, updatedContent, 'utf8');
    console.log('✅ Updated npm scripts');
  } catch (error) {
    console.log(`⚠️  Error updating npm scripts: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting package rename process...');
  console.log('');
  
  // Step 1: Pre-rename TypeScript check
  console.log('=== PRE-RENAME CHECKS ===');
  const preRenameSuccess = await runTypeScriptCheck();
  console.log('');
  
  // Step 2: Rename directories
  console.log('=== RENAMING DIRECTORIES ===');
  await renameDirectories();
  console.log('');
  
  // Step 3: Update all references
  console.log('=== UPDATING REFERENCES ===');
  await updateReferences();
  console.log('');
  
  // Step 4: Update wireit dependencies
  console.log('=== UPDATING CONFIGURATIONS ===');
  await updateWireitDependencies();
  await updateScripts();
  console.log('');
  
  // Step 5: Post-rename TypeScript check
  console.log('=== POST-RENAME CHECKS ===');
  const postRenameSuccess = await runTypeScriptCheck();
  console.log('');
  
  // Summary
  console.log('=== SUMMARY ===');
  console.log(`Pre-rename TypeScript check: ${preRenameSuccess ? '✅ Passed' : '❌ Had issues'}`);
  console.log(`Post-rename TypeScript check: ${postRenameSuccess ? '✅ Passed' : '❌ Has issues'}`);
  console.log('');
  console.log('🎉 Package rename process completed!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Review the changes with: git status');
  console.log('2. Test the build: npm run build');
  console.log('3. Run tests: npm test');
  console.log('4. If everything looks good, commit the changes');
}

main().catch(console.error);