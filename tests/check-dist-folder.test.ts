import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { describe, it, expect } from 'vitest';

describe('Distribution Folder Structure', () => {
  const rootDir = process.cwd();
  const distDir = join(rootDir, 'dist');
  const cdnDir = join(rootDir, 'cdn');
  const exportsDir = join(distDir, 'exports');
  const packageJsonPath = join(rootDir, 'package.json');

  it('should have a dist folder', () => {
    expect(existsSync(distDir)).toBe(true);
  });

  it('should have item.css in the dist folder', () => {
    const itemCssPath = join(distDir, 'item.css');
    expect(existsSync(itemCssPath)).toBe(true);
  });

  it('should have qti-components-jsx.d.ts in the dist folder', () => {
    const qtiComponentsPath = join(distDir, 'qti-components-jsx.d.ts');
    expect(existsSync(qtiComponentsPath)).toBe(true);
  });

  it('should have custom-elements.json in the dist folder', () => {
    const customElementsPath = join(distDir, 'custom-elements.json');
    expect(existsSync(customElementsPath)).toBe(true);
  });

  it('should have a cdn folder', () => {
    expect(existsSync(cdnDir)).toBe(true);
  });

  it('should have index.js in the cdn folder', () => {
    const cdnIndexPath = join(cdnDir, 'index.js');
    expect(existsSync(cdnIndexPath)).toBe(true);
  });

  it('should have index.global.js in the cdn folder', () => {
    const globalIndexPath = join(cdnDir, 'index.global.js');
    expect(existsSync(globalIndexPath)).toBe(true);
  });

  it('should have an exports folder in dist with all required files', () => {
    expect(existsSync(exportsDir)).toBe(true);

    const requiredFiles = [
      'computed-item.context.d.ts',
      'computed-item.context.js',
      'computed-item.context.js.map',
      'computed.context.d.ts',
      'computed.context.js',
      'computed.context.js.map',
      'config.context.d.ts',
      'config.context.js',
      'config.context.js.map',
      'expression-result.d.ts',
      'expression-result.js',
      'expression-result.js.map',
      'interaction.d.ts',
      'interaction.interface.d.ts',
      'interaction.interface.js',
      'interaction.interface.js.map',
      'interaction.js',
      'interaction.js.map',
      'item.context.d.ts',
      'item.context.js',
      'item.context.js.map',
      'qti-assessment-item.context.d.ts',
      'qti-assessment-item.context.js',
      'qti-assessment-item.context.js.map',
      'qti-condition-expression.d.ts',
      'qti-condition-expression.js',
      'qti-condition-expression.js.map',
      'qti-expression.d.ts',
      'qti-expression.js',
      'qti-expression.js.map',
      'qti-test.d.ts',
      'qti-test.js',
      'qti-test.js.map',
      'qti.context.d.ts',
      'qti.context.js',
      'qti.context.js.map',
      'session.context.d.ts',
      'session.context.js',
      'session.context.js.map',
      'test.context.d.ts',
      'test.context.js',
      'test.context.js.map',
      'variables.d.ts',
      'variables.js',
      'variables.js.map'
    ];

    requiredFiles.forEach(file => {
      const filePath = join(exportsDir, file);
      expect(existsSync(filePath), `Missing file: ${file}`).toBe(true);
    });
  });

  it('should have correct exports configuration in package.json', () => {
    expect(existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const expectedExports = {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js'
      },
      './exports/*': {
        import: './dist/exports/*'
      },
      './qti-components': {
        types: './dist/qti-components/index.d.ts',
        import: './dist/qti-components/index.js'
      },
      './qti-item': {
        types: './dist/qti-item/index.d.ts',
        import: './dist/qti-item/index.js'
      },
      './qti-test': {
        types: './dist/qti-test/index.d.ts',
        import: './dist/qti-test/index.js'
      },
      './qti-loader': {
        types: './dist/qti-loader/index.d.ts',
        import: './dist/qti-loader/index.js'
      },
      './qti-transformers': {
        types: './dist/qti-transformers/index.d.ts',
        import: './dist/qti-transformers/index.js'
      },
      './react': './dist/qti-components-jsx.d.ts',
      './item.css': './dist/item.css',
      './cdn/*': './cdn/*',
      './package.json': './package.json'
    };

    expect(packageJson.exports).toEqual(expectedExports);
  });

  it('should have correct files configuration in package.json', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const expectedFiles = ['dist', 'cdn', 'custom-elements.json'];

    expect(packageJson.files).toEqual(expectedFiles);
  });
});
