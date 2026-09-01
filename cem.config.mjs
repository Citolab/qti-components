// import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { jsxTypesPlugin } from '@wc-toolkit/jsx-types';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { cemValidatorPlugin } from '@wc-toolkit/cem-validator';

console.log('Building the custom element manifest...');

// Allow overriding outdir via environment variable or default to root
const outdir = process.env.CEM_OUTDIR || './';

/**
 * Keep CEM output deterministic.
 *
 * The base CEM analyzer removes empty class arrays (cssProperties/cssParts/
 * cssStates/slots/members/attributes/events), but `cemInheritancePlugin`
 * can re-create those arrays as empty during package link processing.
 * That causes noisy diffs where empty arrays sometimes appear/disappear.
 *
 * This plugin runs last and removes only empty arrays again so generated
 * manifests stay stable across runs.
 *
 * Remove this once upstream inheritance handling no longer re-introduces
 * empty arrays.
 */
function removeEmptyClassArraysPlugin() {
  const fields = ['cssProperties', 'cssParts', 'cssStates', 'slots', 'members', 'attributes', 'events'];

  return {
    name: 'local-remove-empty-class-arrays',
    packageLinkPhase({ customElementsManifest }) {
      for (const moduleDoc of customElementsManifest.modules || []) {
        for (const declaration of moduleDoc.declarations || []) {
          if (declaration.kind !== 'class' && declaration.kind !== 'mixin') {
            continue;
          }

          for (const field of fields) {
            if (Array.isArray(declaration[field]) && declaration[field].length === 0) {
              delete declaration[field];
            }
          }
        }
      }
    }
  };
}

/**
 * The analyzer recognizes decorators and direct `customElements.define` calls, but our scoped-
 * registry manifests intentionally use plain data. Link those tag/constructor pairs back to the
 * class declarations so Storybook and downstream CEM consumers retain the same public metadata.
 */
function elementManifestDefinitionsPlugin() {
  return {
    name: 'local-element-manifest-definitions',
    packageLinkPhase({ customElementsManifest }) {
      const modules = customElementsManifest.modules || [];
      const classesByName = new Map();

      for (const moduleDoc of modules) {
        for (const declaration of moduleDoc.declarations || []) {
          if (declaration.kind === 'class') {
            classesByName.set(declaration.name, { declaration, moduleDoc });
          }
        }
      }

      for (const manifestModule of modules) {
        for (const declaration of manifestModule.declarations || []) {
          if (declaration.kind !== 'variable' || typeof declaration.default !== 'string') {
            continue;
          }

          for (const match of declaration.default.matchAll(/{\s*tag:\s*'([^']+)'\s*,\s*ctor:\s*([A-Za-z0-9_]+)\s*}/g)) {
            const [, tagName, constructorName] = match;
            const classEntry = classesByName.get(constructorName);
            if (!classEntry) {
              continue;
            }

            classEntry.declaration.tagName = tagName;
            classEntry.declaration.customElement = true;
            classEntry.declaration.modulePath = classEntry.moduleDoc.path;
            classEntry.declaration.definitionPath = manifestModule.path;

            classEntry.moduleDoc.exports ||= [];
            if (
              !classEntry.moduleDoc.exports.some(
                entry => entry.kind === 'custom-element-definition' && entry.name === tagName
              )
            ) {
              classEntry.moduleDoc.exports.unshift({
                kind: 'custom-element-definition',
                name: tagName,
                declaration: { name: constructorName, module: classEntry.moduleDoc.path }
              });
            }
          }
        }
      }
    }
  };
}

/**
 * Where the generated JSX types should import each component class from.
 *
 * The generator defaults to the CEM `modulePath`, which is a monorepo source path such as
 * `packages/qti-base/src/abstract/interaction.ts`. That is meaningless to a consumer of the
 * published package, so the emitted `.d.ts` ends up full of unresolvable imports and every
 * prop silently degrades to `any`.
 *
 * The umbrella package re-exports each component from a bundled entry point, so map the source
 * path back to the entry that owns it. Paths are relative to the generated file in `dist/`.
 */
function componentTypePath(_name, _tag, modulePath = '') {
  const entryByPrefix = [
    ['packages/interactions/', './interactions.js'],
    ['packages/qti-test/', './test.js'],
    ['packages/qti-item/', './item.js'],
    ['packages/qti-elements/', './elements.js'],
    ['packages/qti-processing/', './processing.js'],
    ['packages/qti-corrections/', './corrections.js'],
    ['packages/qti-base/', './base.js']
  ];

  const match = entryByPrefix.find(([prefix]) => modulePath.startsWith(prefix));
  return match ? match[1] : './index.js';
}

export default {
  /** Globs to analyze */
  globs: [
    'packages/qti-base/src/**/*.ts',
    'packages/qti-item/src/components/**/*.ts',
    'packages/qti-test/src/components/**/*.ts',
    'packages/qti-elements/src/components/**/*.ts',
    'packages/interactions/*/src/**/*.ts',
    'packages/interactions/core/src/elements/**/*.ts',
    'packages/interactions/core/src/mixins/**/*.ts',
    'packages/qti-processing/src/components/**/*.ts',
    'packages/qti-corrections/src/components/**/*.ts',
    'packages/qti-item/src/elements.ts',
    'packages/qti-test/src/elements.ts',
    'packages/qti-elements/src/elements.ts',
    'packages/qti-processing/src/elements.ts',
    'packages/qti-corrections/src/elements.ts'
  ],
  /** Globs to exclude */
  exclude: ['packages/**/*.stories.ts', 'packages/**/*.spec.ts', 'packages/**/*.styles.ts'],
  /** Directory to output CEM to */
  outdir: outdir,
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Run in watch mode, runs on file changes */
  watch: false,
  /** Include third party custom elements manifests */
  dependencies: false,
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: false,
  /** Enable special handling for litelement */
  litelement: true,

  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    // @wc-toolkit/type-parser currently expects `typeChecker.getProgram()`,
    // but TypeScript 5.4.x does not expose that on the checker instance.
    // Patch the checker instance so type-parser can resolve cross-file types.
    const checker = program.getTypeChecker();
    if (typeof checker.getProgram !== 'function') {
      checker.getProgram = () => program;
    }
    return program.getSourceFiles().filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },

  /** Custom elements manifest plugins */
  plugins: [
    typeParserPlugin({
      outdir: outdir + 'dist'
    }),
    cemInheritancePlugin({}),
    elementManifestDefinitionsPlugin(),
    // customElementVsCodePlugin({
    //   outdir: outdir + 'dist'
    // }),
    jsxTypesPlugin({
      outdir: outdir + 'dist',
      exclude: [],
      fileName: `qti-components-jsx.d.ts`,
      componentTypePath
    }),
    cemSorterPlugin({
      deprecatedLast: true
    }),
    cemValidatorPlugin({
      logErrors: true, // Log errors without stopping the build
      // exclude: ['BaseComponent', 'InternalMixin'], // Skip base classes

      rules: {
        // Override default severity levels for validation
        packageJson: {
          packageType: 'off',
          main: 'off',
          module: 'off',
          types: 'off',
          exports: 'off',
          customElementsProperty: 'off',
          publishedCem: 'off'
        },
        manifest: {
          schemaVersion: 'off',
          modulePath: 'off',
          definitionPath: 'off',
          typeDefinitionPath: 'off',
          exportTypes: 'off',
          tagName: 'off'
        }
      }
    }),
    removeEmptyClassArraysPlugin()
  ]
};
