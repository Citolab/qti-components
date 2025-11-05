/**
 * ESLint Configuration for QTI Components Monorepo
 *
 * This configuration provides linting for:
 * - TypeScript/JavaScript files across all packages
 * - Lit web components and vanilla web components
 * - Storybook stories and test files
 * - Import organization and ESM compliance
 *
 * Key features:
 * - TypeScript-aware linting with type checking
 * - Web Components best practices (Lit + vanilla)
 * - Import/export organization and validation
 * - Storybook-specific rules
 * - Monorepo path resolution
 */

import pluginJs from '@eslint/js';
import globals from 'globals';
import { configs } from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import litPlugin from 'eslint-plugin-lit';
import storybook from 'eslint-plugin-storybook';
import wcPlugin from 'eslint-plugin-wc';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // File patterns to lint
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },

  // Global environment setup
  { languageOptions: { globals: globals.browser } },

  // Base configurations - order matters!
  pluginJs.configs.recommended, // JavaScript best practices
  ...configs.recommended, // TypeScript recommended rules
  importPlugin.flatConfigs.recommended, // Import/export validation
  litPlugin.configs['flat/recommended'], // Lit web component rules
  wcPlugin.configs['flat/recommended'], // Web Components best practices
  ...storybook.configs['flat/recommended'], // Storybook-specific rules

  // Main configuration block
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },

    // Plugin settings - shared across all rules
    settings: {
      // Web Components: Recognize custom element base classes
      wc: {
        elementBaseClasses: ['LitElement', 'HTMLElement']
      },

      // Import resolution: TypeScript-aware import validation
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },

    // Custom rule overrides and additions
    rules: {
      // === TypeScript Rules ===
      // Let TypeScript compiler handle unused variables
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',

      // Enforce type-only imports for better bundling
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // === Import Organization ===
      // Disable conflicting rules
      'import/no-duplicates': 'off',

      // Import warnings for Node.js usage
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': ['error', { allow: ['path', 'fs'] }],
      'import/no-unresolved': 'error',

      // Organize imports by type and source
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-ins
            'external', // npm packages
            'internal', // Internal monorepo packages
            ['parent', 'sibling', 'index'], // Relative imports
            'type', // Type-only imports
            'unknown'
          ],
          'newlines-between': 'always',
          distinctGroup: true,
          pathGroups: [
            {
              pattern: '@qti-components/**',
              group: 'internal',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['type']
        }
      ]

      // ESM Extensions: Uncomment to enforce .js extensions for relative imports
      // 'import/extensions': [
      //   'error',
      //   'always',
      //   { ignorePackages: true }
      // ]
    }
  },

  // Special rules for test and story files
  {
    files: ['**/*.{test,spec,stories}.{js,ts,tsx}', '**/__tests__/**'],
    rules: {
      // Relax TypeScript strictness in test files
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  },

  // CommonJS files (different rules)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'script'
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-nodejs-modules': 'off'
    }
  },

  // Files and directories to ignore
  {
    ignores: [
      'node_modules/**',
      '**/dist/**', // Build output directories
      'build/**',
      'coverage/**',
      'public/**',
      '**/*.d.ts', // TypeScript declaration files
      '**/*.config.*', // Config files (prettier, etc.)
      '**/*.mjs', // Module JavaScript files
      '**/cdn/**', // CDN build files
      'scripts/**' // Utility scripts
    ]
  }
];
