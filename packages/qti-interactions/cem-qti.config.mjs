import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { cemValidatorPlugin } from '@wc-toolkit/cem-validator';
import path from 'node:path';

console.log('Building the QTI custom element manifest...');

const outdir = process.env.CEM_OUTDIR || './';
const workspaceRoot = path.resolve(process.cwd(), '../..');

// Explicit allowlist for qti manifest generation.
// Remove entries here to exclude tags from custom-elements.qti.json.
const allowedQtiTags = new Set([
  'qti-choice-interaction',
  'qti-extended-text-interaction',
  'qti-gap',
  'qti-gap-img',
  'qti-gap-text',
  'qti-hottext',
  'qti-hottext-interaction',
  'qti-inline-choice',
  'qti-match-interaction',
  'qti-order-interaction',
  'qti-simple-associable-choice',
  'qti-simple-choice',
  'qti-text-entry-interaction'
]);

function toWorkspaceRelativePath(modulePath) {
  if (!modulePath || typeof modulePath !== 'string') {
    return modulePath;
  }

  const absolutePath = path.isAbsolute(modulePath) ? modulePath : path.resolve(process.cwd(), modulePath);
  const relativePath = path.relative(workspaceRoot, absolutePath);
  return relativePath.split(path.sep).join('/');
}

function inferTagNameFromModulePath(modulePath) {
  const normalized = toWorkspaceRelativePath(modulePath || '');
  const fileName = normalized.split('/').pop() || '';
  if (!fileName.endsWith('.ts')) {
    return null;
  }

  const candidate = fileName.slice(0, -3);
  return candidate.startsWith('qti-') ? candidate : null;
}

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

function attributesOnlyQtiManifestPlugin() {
  return {
    name: 'local-attributes-only-qti-manifest',
    packageLinkPhase({ customElementsManifest }) {
      customElementsManifest.modules = (customElementsManifest.modules || [])
        .map(moduleDoc => {
          const isQtiModulePath = /\/qti-[^/]+\.ts$/i.test(moduleDoc.path || '');
          const moduleInferredTag = inferTagNameFromModulePath(moduleDoc.path);

          const declarations = (moduleDoc.declarations || [])
            .filter(declaration => {
              if (!declaration || declaration.kind !== 'class') {
                return false;
              }

              const declaredTag = typeof declaration.tagName === 'string' ? declaration.tagName : null;
              const effectiveTag = declaredTag || moduleInferredTag;
              const hasQtiClassName = typeof declaration.name === 'string' && declaration.name.startsWith('Qti');
              const isAllowedTag = effectiveTag ? allowedQtiTags.has(effectiveTag) : false;

              return isAllowedTag && (Boolean(declaredTag) || (isQtiModulePath && hasQtiClassName));
            })
            .map(declaration => {
              const effectiveTag = declaration.tagName || moduleInferredTag;
              const attributes = (declaration.attributes || [])
                .filter(attribute => attribute?.name)
                .map(attribute => ({
                  name: attribute.name,
                  ...(attribute.type ? { type: attribute.type } : {}),
                  ...(attribute.default !== undefined ? { default: attribute.default } : {}),
                  ...(attribute.description ? { description: attribute.description } : {}),
                  ...(attribute.fieldName ? { fieldName: attribute.fieldName } : {})
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

              if (!attributes.length) {
                return null;
              }

              return {
                kind: declaration.kind,
                name: declaration.name,
                ...(effectiveTag ? { tagName: effectiveTag } : {}),
                ...(declaration.description ? { description: declaration.description } : {}),
                attributes
              };
            })
            .filter(Boolean)
            .sort((a, b) => (a.tagName || a.name).localeCompare(b.tagName || b.name));

          if (!declarations.length) {
            return null;
          }

          return {
            kind: moduleDoc.kind || 'javascript-module',
            path: toWorkspaceRelativePath(moduleDoc.path),
            declarations,
            exports: []
          };
        })
        .filter(Boolean);
    }
  };
}

export default {
  globs: ['../interactions/*/src/**/*.ts', '../interactions/core/src/elements/**/*.ts'],
  exclude: [
    '../interactions/*/src/**/*.stories.ts',
    '../interactions/*/src/**/*.spec.ts',
    '../interactions/*/src/**/*.styles.ts',
    '../interactions/*/src/**/*.commands.ts',
    '../interactions/*/src/**/*.keymap.ts',
    '../interactions/*/src/**/*.schema.ts'
  ],
  outdir: outdir,
  dev: false,
  watch: false,
  dependencies: false,
  packagejson: false,
  litelement: true,

  overrideModuleCreation({ ts, globs }) {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    const checker = program.getTypeChecker();
    if (typeof checker.getProgram !== 'function') {
      checker.getProgram = () => program;
    }

    const includePathParts = ['/packages/interactions/', '/packages/qti-interactions/src/'];
    const excludePathParts = ['/node_modules/', '/dist/'];

    return program.getSourceFiles().filter(sf => {
      const fileName = sf.fileName || '';
      if (sf.isDeclarationFile) {
        return false;
      }
      if (excludePathParts.some(part => fileName.includes(part))) {
        return false;
      }
      return includePathParts.some(part => fileName.includes(part));
    });
  },

  plugins: [
    typeParserPlugin(),
    cemInheritancePlugin({}),
    cemSorterPlugin({ deprecatedLast: true }),
    cemValidatorPlugin({
      logErrors: true,
      rules: {
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
    removeEmptyClassArraysPlugin(),
    attributesOnlyQtiManifestPlugin()
  ]
};
