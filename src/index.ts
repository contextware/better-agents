import { Command } from 'commander';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('superagents')
  .description('CLI for kicking off production-ready agent projects with LangWatch best practices')
  .version('0.1.0')
  .option('-d, --debug', 'Enable debug logging with structured JSON output');

program
  .command('init')
  .description('Initialize a new agent project')
  .argument('[path]', 'Path to initialize the project (defaults to current directory)', '.')
  .action((path, options) => {
    // Pass debug option to init command (default to false if not provided)
    const debug = options.parent?.debug || false;
    return initCommand(path, debug);
  });

program.parse();

