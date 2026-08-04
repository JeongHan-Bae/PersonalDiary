import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import { createRequire } from 'node:module';
import { PurgeCSS } from 'purgecss';

const require = createRequire(import.meta.url);
const purgeCssConfig = require('../purgecss.config.cjs');
const projectRoot = process.cwd();

const listFiles = (dirPath, extension) => {
  if (!existsSync(dirPath)) {
    return [];
  }

  const entries = readdirSync(dirPath);
  const files = [];

  for (const entry of entries) {
    const entryPath = join(dirPath, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      files.push(...listFiles(entryPath, extension));
      continue;
    }

    if (extname(entryPath) === extension) {
      files.push(entryPath);
    }
  }

  return files;
};

const relativePath = (filePath) => relative(projectRoot, filePath);

const checkBusinessScopedStyles = () => {
  const businessVueFiles = [
    ...listFiles(join(projectRoot, 'src/desktop/pages'), '.vue'),
    ...listFiles(join(projectRoot, 'src/mobile/pages'), '.vue'),
  ];

  return businessVueFiles
    .filter((filePath) => readFileSync(filePath, 'utf8').includes('<style scoped'))
    .map(relativePath);
};

const checkFunctionalComponentInlineStyles = () => {
  const componentVueFiles = listFiles(join(projectRoot, 'src/app/components'), '.vue');

  return componentVueFiles
    .filter((filePath) => /<style\b/.test(readFileSync(filePath, 'utf8')))
    .map(relativePath);
};

const checkVueBusinessImports = () => {
  const vueFiles = listFiles(join(projectRoot, 'src'), '.vue');
  const forbiddenImportPattern =
    /from\s+['"]@\/(?:services|application|adapters|database|ports)\//;

  return vueFiles
    .filter((filePath) => forbiddenImportPattern.test(readFileSync(filePath, 'utf8')))
    .map(relativePath);
};

const checkComponentCssOwnership = () => {
  const componentCssDir = join(projectRoot, 'src/app/styles/components');
  const componentVueDir = join(projectRoot, 'src/app/components');
  const componentNames = new Set(
    listFiles(componentVueDir, '.vue').map((filePath) => basename(filePath, '.vue')),
  );

  return listFiles(componentCssDir, '.css')
    .filter((filePath) => !componentNames.has(basename(filePath, '.css')))
    .map(relativePath);
};

const reportFailures = (title, failures) => {
  if (failures.length === 0) {
    return false;
  }

  console.error(title);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  return true;
};

const scopedStyleFailures = checkBusinessScopedStyles();
const inlineComponentStyleFailures = checkFunctionalComponentInlineStyles();
const vueBusinessImportFailures = checkVueBusinessImports();
const componentCssOwnershipFailures = checkComponentCssOwnership();
let hasFailures = false;

hasFailures =
  reportFailures(
    'Business Vue pages must not contain scoped CSS. Move page styles into src/desktop/styles or src/mobile/styles:',
    scopedStyleFailures,
  ) || hasFailures;
hasFailures =
  reportFailures(
    'Functional Vue components must not contain inline CSS. Move component styles into src/app/styles/components:',
    inlineComponentStyleFailures,
  ) || hasFailures;
hasFailures =
  reportFailures(
    'Vue templates must not import business, persistence, or adapter layers directly. Move that behavior into page/composable TypeScript:',
    vueBusinessImportFailures,
  ) || hasFailures;
hasFailures =
  reportFailures(
    'Component CSS files must match a component name so ownership stays explicit:',
    componentCssOwnershipFailures,
  ) || hasFailures;

const purgeResults = await new PurgeCSS().purge(purgeCssConfig);
const rejectedSelectors = [
  ...new Set(purgeResults.flatMap((result) => result.rejected ?? [])),
].sort();

hasFailures =
  reportFailures('PurgeCSS rejected selectors:', rejectedSelectors) || hasFailures;

if (hasFailures) {
  process.exit(1);
}

console.log('CSS checks passed: no rejected selectors or invalid style ownership.');
