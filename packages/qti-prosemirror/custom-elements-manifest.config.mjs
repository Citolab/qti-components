import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';

console.log('Building the custom element manifest...');

// Allow overriding outdir via environment variable or default to root
const outdir = process.env.CEM_OUTDIR || './';

/**
 * Plugin to strip everything except custom elements and their attributes
 */
function stripToAttributesOnlyPlugin() {
  return {
    name: 'strip-to-attributes-only',
    packageLinkPhase({ customElementsManifest }) {
      // Flatten modules to just declarations
      const elements = [];

      customElementsManifest.modules?.forEach(mod => {
        mod.declarations?.forEach(decl => {
          if (decl.customElement) {
            // Keep only essential fields
            const element = {
              tagName: decl.tagName,
              name: decl.name
            };

            // Keep attributes if present
            if (decl.attributes?.length > 0) {
              element.attributes = decl.attributes.map(attr => {
                const cleanAttr = { name: attr.name };
                if (attr.type) cleanAttr.type = attr.type;
                if (attr.default !== undefined) cleanAttr.default = attr.default;
                return cleanAttr;
              });
            }

            elements.push(element);
          }
        });
      });

      // Replace modules with flat elements array
      delete customElementsManifest.modules;
      customElementsManifest.elements = elements;
    }
  };
}

export default {
  /** Globs to analyze */
  globs: ['src/components/**/*.ts'],
  /** Globs to exclude */
  exclude: [
    'src/components/**/*.stories.ts',
    'src/components/**/*.spec.ts',
    'src/components/**/*.styles.ts',
    'src/components/**/*.commands.ts',
    'src/components/**/*.keymap.ts',
    'src/components/**/*.schema.ts'
  ],
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
    return program.getSourceFiles().filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },

  /** Custom elements manifest plugins */
  plugins: [
    typeParserPlugin({
      outdir: outdir + 'dist'
    }),
    cemInheritancePlugin({}),
    cemSorterPlugin({
      deprecatedLast: true
    }),
    stripToAttributesOnlyPlugin()
  ]
};
