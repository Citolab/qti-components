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
import litPlugin, { configs as litConfigs } from 'eslint-plugin-lit';
import { configs as storybookConfigs } from 'eslint-plugin-storybook';
import wcPlugin, { configs as wcConfigs } from 'eslint-plugin-wc';

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
  litConfigs['flat/recommended'], // Lit web component rules
  wcConfigs['flat/recommended'], // Web Components best practices
  ...storybookConfigs['flat/recommended'], // Storybook-specific rules

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

      // Prevent circular dependencies - handled by madge for better performance
      // Use: pnpm run madge
      // 'import/no-cycle': ['error', { maxDepth: 2, ignoreExternal: true }],

      // Monorepo-specific import rules
      // 1. Prevent direct package path imports - use relative or named imports
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['packages/*', 'packages/*/src', 'packages/*/src/*'],
              message: 'Use relative imports within the same package or @qti-components/* for cross-package imports'
            }
          ]
        }
      ],

      // 2. Prevent relative imports from going outside package boundaries
      'import/no-relative-packages': 'error',

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
      '@typescript-eslint/no-unsafe-return': 'off',

      // Allow cross-package relative imports in test files
      'import/no-relative-packages': 'off'
    }
  },

  // Special rules for Storybook configuration
  {
    files: ['.storybook/**/*.{js,ts}'],
    rules: {
      // Allow cross-package relative imports in Storybook config
      'import/no-relative-packages': 'off',
      // Allow direct package path imports in Storybook config
      'no-restricted-imports': 'off'
    }
  }, // CommonJS files (different rules)
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
      'storybook-static/**', // Storybook build output
      '**/*.d.ts', // TypeScript declaration files
      '**/*.config.*', // Config files (prettier, etc.)
      '**/*.mjs', // Module JavaScript files
      '**/cdn/**', // CDN build files
      'scripts/**' // Utility scripts
    ]
  }
];
