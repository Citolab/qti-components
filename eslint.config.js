import pluginJs from '@eslint/js';
import globals from 'globals';
import { configs } from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import litPlugin from 'eslint-plugin-lit';
import storybook from 'eslint-plugin-storybook';
import wcPlugin from 'eslint-plugin-wc';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...configs.recommended,
  importPlugin.flatConfigs.recommended,
  litPlugin.configs['flat/recommended'],
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'off',
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': ['error', { allow: ['path', 'fs'] }],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type', 'unknown'],
          'newlines-between': 'always',
          distinctGroup: true,
          pathGroups: [
            {
              pattern: '@citolab/**',
              group: 'external',
              position: 'after'
            }
          ],
          pathGroupsExcludedImportTypes: ['type']
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports'
        }
      ],
      'lit/no-boolean-in-attribute-binding': 'off'
    },
    settings: {
      wc: {
        elementBaseClasses: ['LitElement'] // Recognize `LitElement` as a Custom Element base class
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      'import/resolver': {
        // You will also need to install and configure the TypeScript resolver
        // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
        typescript: {
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
          // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json by default
          // use <root>/path/to/folder/tsconfig.json
          project: 'tsconfig.json'
        }
      }
    }
  },

  // ...wcPlugin.configs.recommended,
  { ignores: ['node_modules', 'dist', 'build', 'coverage', 'public'] }
];
