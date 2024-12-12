/* eslint-disable no-undef */
require('dotenv').config();
const { execSync } = require('child_process');

const projectToken = process.env.CHROMATIC_PROJECT_TOKEN;
if (!projectToken) {
  console.error('CHROMATIC_PROJECT_TOKEN is not defined in .env');
  process.exit(1);
}

execSync(`npx chromatic --project-token=${projectToken}`, { stdio: 'inherit' });
