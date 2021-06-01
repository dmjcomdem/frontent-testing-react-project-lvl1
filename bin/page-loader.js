#!/usr/bin/env node
import { Command } from 'commander';
import pageLoader from '../../page-loader-cli-0ca243661aae04e38bfe395142e8b32e49b8d56f/src';

const program = new Command();
program.option('-o, --output <type>', 'path to save file', process.cwd());

program.parse(process.argv);
const options = program.opts();
pageLoader(program.args[0], options.output)
  .then(() => process.exit(0)).catch(() => process.exit(1));
