import { logger } from "../../../utils/logger/index.js";
import type { CodingAssistantProvider } from "../index.js";

/**
 * Cursor assistant provider implementation.
 * Handles availability checking and launch instructions for Cursor IDE.
 */
export const CursorCodingAssistantProvider: CodingAssistantProvider = {
  id: "cursor",
  displayName: "Cursor",
  command: "",

  async isAvailable(): Promise<{
    installed: boolean;
    installCommand?: string;
  }> {
    // Cursor is always available as it's an IDE, not a CLI tool
    return { installed: true };
  },

  async launch({
    targetPath,
  }: {
    projectPath: string;
    targetPath: string;
    prompt: string;
  }): Promise<void> {
    const isCurrentDir = targetPath === ".";

    logger.userPlain('');
    logger.userPlain('To get started with Cursor:');
    logger.userPlain('');
    if (isCurrentDir) {
      logger.userPlain('  1. Open the current folder in Cursor:');
      logger.userPlain('');
      logger.userPlain('     cursor .');
    } else {
      logger.userPlain('  1. Open the project in Cursor:');
      logger.userPlain('');
      logger.userPlain(`     cursor ${targetPath}`);
    }
    logger.userPlain('');
    logger.userPlain('  2. Open Cursor Composer (Cmd+I or Ctrl+I)');
    logger.userPlain('');
    logger.userPlain('  3. Copy and paste the prompt above to start building your agent');
    logger.userPlain('');
  },
};
