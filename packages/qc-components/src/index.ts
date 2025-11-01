export * from '@qti-components/elements';
export * from '@qti-components/test';
export * from '@qti-components/item';
export * from '@qti-components/transformers';

// Import version from package.json
import packageJson from '../../../package.json' assert { type: 'json' };

console.info(
  '%cC¿TO%cLab%c: qti-components v%c%s%c loaded',
  'font-family: "PT Sans", font-weight:bold; color:green; font-size: smaller;vertical-align: sub',
  'font-weight:bold; color:green',
  'font-weight:unset',
  'font-weight:bold; color:#2563eb',
  packageJson.version,
  'font-weight:unset'
);
