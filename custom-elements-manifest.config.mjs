import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { customEsLintRuleGeneratorPlugin } from 'custom-element-eslint-rule-generator';
import { customElementJsxPlugin } from 'custom-element-jsx-integration';
import { expandTypesPlugin, getTsProgram } from 'cem-plugin-expanded-types';

console.log('Building the custom element manifest...');

const outdir = './';

const removePrivateMembers = {
  name: 'qti-strip-attributes',
  packageLinkPhase({ customElementsManifest }) {
    customElementsManifest?.modules?.forEach(module => {
      module?.declarations?.forEach(declaration => {
        Object.keys(declaration).forEach(key => {
          if (Array.isArray(declaration[key])) {
            if (key == 'members') declaration[key] = [];
            // declaration[key] = declaration[key].filter((member) => member.hasOwnProperty('attribute'));
            declaration[key] = declaration[key].filter(member => !member.privacy?.includes('private'));
            declaration[key] = declaration[key].filter(member => !member.privacy?.includes('protected'));
            declaration[key] = declaration[key].filter(member => !member.name?.startsWith('_'));
          }
        });
      });
    });
  }
};

export default {
  /** Globs to analyze */
  globs: ['src/lib/qti-components/**/*.ts', 'src/lib/qti-item/**/*.ts', 'src/lib/qti-test/**/*.ts'],
  /** Globs to exclude */
  exclude: ['src/**/qti-*.stories.ts', 'src/**/qti-*.test.ts', 'src/**/qti-*.spec.ts', 'src/**/qti-*.styles.ts'],
  /** Directory to output CEM to */
  outdir: outdir,
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Run in watch mode, runs on file changes */
  watch: false,
  /** Include third party custom elements manifests */
  dependencies: true,
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: false,
  /** Enable special handling for litelement */
  litelement: true,

  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program.getSourceFiles().filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },

  plugins: [
    // removePrivateMembers,
    customElementVsCodePlugin({
      outdir: outdir + 'dist'
    }),
    customElementJsxPlugin({
      outdir: outdir + 'dist',
      exclude: [],
      fileName: `qti-components-jsx.d.ts`
    }),
    customEsLintRuleGeneratorPlugin({
      outdir: outdir + 'dist'
    }),
    expandTypesPlugin()
  ]
};
