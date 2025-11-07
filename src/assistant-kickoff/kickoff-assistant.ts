import chalk from 'chalk';
import type { ProjectConfig } from '../types.js';
import { buildInitialPrompt } from './build-initial-prompt.js';
import { getCodingAssistantProvider } from '../providers/coding-assistants/index.js';

/**
 * Kicks off the coding assistant with initial instructions.
 *
 * @param params - Parameters object
 * @param params.projectPath - Absolute path to project root
 * @param params.config - Project configuration
 * @returns Promise that resolves when assistant is launched
 *
 * @example
 * ```ts
 * await kickoffAssistant({ projectPath: '/path/to/project', config });
 * ```
 */
export const kickoffAssistant = async ({
  projectPath,
  config
}: {
  projectPath: string;
  config: ProjectConfig;
}): Promise<void> => {
  const prompt = buildInitialPrompt({ config });
  const provider = getCodingAssistantProvider({ assistant: config.codingAssistant });

  // If user selected "none", just show them the initial prompt and exit
  if (config.codingAssistant === 'none') {
    console.log(chalk.bold.cyan('\n✨ Project setup complete!\n'));
    console.log(chalk.gray('When you\'re ready to start, use this initial prompt with your coding assistant:\n'));
    console.log(chalk.white(`"${prompt}"\n`));
    console.log(chalk.gray(`Project location: ${projectPath}\n`));
    return;
  }

  console.log(chalk.bold.cyan(`\n🤖 Launching ${provider.displayName}...\n`));

  console.log(chalk.gray('\nInitial prompt:'));
  console.log(chalk.white(`"${prompt}"`));

  try {
    await provider.launch({ projectPath, prompt });
    // execSync is blocking, so if we get here, the assistant has finished
    console.log(chalk.bold.green('\n✨ Session complete!\n'));
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Failed to launch ${provider.displayName}: ${error.message}`));
      console.log(chalk.yellow('\nYou can manually start the assistant by running:'));
      console.log(chalk.cyan(`  cd ${projectPath}`));
      console.log(chalk.cyan(`  ${provider.command} "${prompt}"`));
    }
    process.exit(1);
  }
};

