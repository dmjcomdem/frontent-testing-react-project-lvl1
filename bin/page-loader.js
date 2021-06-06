#!/usr/bin/env node

import commander from 'commander';
import { version, description } from '../package.json';
import loadPage from '../src';

commander
  .version(version)
  .description(description)
  .arguments('<pageUrl>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((pageUrl, options) =>
    loadPage(pageUrl, options.output)
      .then((filepath) => console.log(`Page was downloaded into "${filepath}"`))
      .catch((error) => {
        console.error(error.message);
        process.exit(1);
      })
  );

commander.parse(process.argv);
