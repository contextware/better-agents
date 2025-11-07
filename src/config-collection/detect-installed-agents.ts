import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Checks if a command is available in the system PATH.
 *
 * @param command - The command to check (e.g., 'claude', 'cursor-agent')
 * @returns Promise resolving to true if command exists, false otherwise
 *
 * @example
 * ```ts
 * const hasCommand = await isCommandAvailable('claude');
 * // Returns: true if claude is installed
 * ```
 */
export const isCommandAvailable = async (command: string): Promise<boolean> => {
  try {
    await execAsync(`which ${command}`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Detects which coding assistants are installed on the system.
 *
 * @returns Promise resolving to a map of assistant IDs to installation status
 *
 * @example
 * ```ts
 * const installed = await detectInstalledAgents();
 * // Returns: { 'claude-code': true, 'cursor': false, 'kilocode': true }
 * ```
 */
export const detectInstalledAgents = async (): Promise<
  Record<string, boolean>
> => {
  const [hasClaude, hasCursor, hasKilocode] = await Promise.all([
    isCommandAvailable("claude"),
    isCommandAvailable("cursor-agent"),
    isCommandAvailable("kilocode"),
  ]);

  return {
    "claude-code": hasClaude,
    "cursor-cli": hasCursor,
    kilocode: hasKilocode,
    none: true, // Always available since it doesn't require installation
  };
};

