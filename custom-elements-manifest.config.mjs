import { customElementVsCodePlugin } from "custom-element-vs-code-integration";


const outdir = './'

// import ceProps from "./custom-elements.json";
// type cePropTypes = typeof ceProps;
const options = {};

export default {
  // blijkbaar mag ik niet ['src/lib/**/qti-*.ts'] doen, omdat inherited props dan niet mee worden genomen
  // zoals de props in choices die overgeerfd wordt in qti-choice-interaction
  globs: ['src/lib/**'],
  exclude: [
    'src/**/qti-*.stories.ts',
    'src/**/qti-*.test.ts',
    'src/**/qti-*.spec.ts',
    'src/**/qti-*.styles.ts'
  ],
  outdir: '',
  litelement: true,
  plugins: [
    {
      name: 'qti-strip-attributes',
      packageLinkPhase({ customElementsManifest }) {
        customElementsManifest?.modules?.forEach((module) => {
          module?.declarations?.forEach((declaration) => {
            Object.keys(declaration).forEach((key) => {
              if (Array.isArray(declaration[key])) {
                if (key == "members") declaration[key] = [];
                // declaration[key] = declaration[key].filter((member) => member.hasOwnProperty('attribute'));
                declaration[key] = declaration[key].filter((member) => !member.privacy?.includes('private'));
                declaration[key] = declaration[key].filter((member) => !member.privacy?.includes('protected'));
                declaration[key] = declaration[key].filter((member) => !member.name?.startsWith('_'));
              }
            });
          });
        });
      }
    },
    customElementVsCodePlugin(options)
  ],
};