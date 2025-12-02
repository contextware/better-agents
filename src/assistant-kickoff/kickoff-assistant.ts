import type { ProjectConfig } from '../types.js';
import { logger } from '../utils/logger/index.js';
import { buildInitialPrompt } from './build-initial-prompt.js';
import { getCodingAssistantProvider } from '../providers/coding-assistants/index.js';

/**
 * Shows manual launch instructions when auto-launch fails or isn't available.
 *
 * @param params - Parameters object
 * @param params.targetPath - The path argument used in init (e.g., ".", "my-project")
 * @param params.assistantName - Name of the coding assistant (optional)
 */
export const showManualLaunchInstructions = ({
  targetPath,
  assistantName,
}: {
  targetPath: string;
  assistantName?: string;
}): void => {
  const isCurrentDir = targetPath === ".";

  logger.userPlain('');
  logger.userPlain('To get started:');
  logger.userPlain('');

  if (isCurrentDir) {
    logger.userPlain(`  1. Open your coding assistant${assistantName ? ` (${assistantName})` : ''}`);
    logger.userPlain('');
    logger.userPlain('  2. Copy and paste the prompt above to start building your agent');
  } else {
    logger.userPlain(`  1. Navigate to your project:`);
    logger.userPlain('');
    logger.userPlain(`     cd ${targetPath}`);
    logger.userPlain('');
    logger.userPlain(`  2. Open your coding assistant${assistantName ? ` (${assistantName})` : ''}`);
    logger.userPlain('');
    logger.userPlain('  3. Copy and paste the prompt above to start building your agent');
  }
  logger.userPlain('');
};

/**
 * Kicks off the coding assistant with initial instructions.
 *
 * @param params - Parameters object
 * @param params.projectPath - Absolute path to project root
 * @param params.targetPath - The path argument used in init (e.g., ".", "my-project")
 * @param params.config - Project configuration
 * @returns Promise that resolves when assistant is launched
 *
 * @example
 * ```ts
 * await kickoffAssistant({ projectPath: '/path/to/project', targetPath: 'my-project', config });
 * ```
 */
export const kickoffAssistant = async ({
  projectPath,
  targetPath,
  config
}: {
  projectPath: string;
  targetPath: string;
  config: ProjectConfig;
}): Promise<void> => {
  const prompt = buildInitialPrompt({ config });
  const provider = getCodingAssistantProvider({ assistant: config.codingAssistant });

  logger.userGreen('');
  logger.userGreen('='.repeat(60));
  logger.userGreen('INITIAL PROMPT (copy this to your coding assistant):');
  logger.userGreen('='.repeat(60));
  logger.userGreen('');
  logger.userInfo(prompt);
  logger.userGreen('');
  logger.userGreen('='.repeat(60));
  logger.userGreen('');

  // Let the provider handle its own launch behavior
  await provider.launch({ projectPath, targetPath, prompt });
};

