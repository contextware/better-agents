import { Command } from 'commander';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('superagents')
  .description('CLI for kicking off production-ready agent projects with LangWatch best practices')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new agent project')
  .argument('[path]', 'Path to initialize the project (defaults to current directory)', '.')
  .action(initCommand);

program.parse();

