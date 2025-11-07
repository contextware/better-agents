import { execSync } from "child_process";

/**
 * Replaces the current process with another command, similar to POSIX execv().
 * This is the cleanest handover - the Node.js process is completely replaced.
 *
 * @param command - The command to execute
 * @param args - Arguments for the command
 * @param options - Execution options
 *
 * @example
 * ```ts
 * replaceProcess('cursor-agent', ['prompt text'], { cwd: '/path' });
 * // Node.js process is replaced, no code after this runs
 * ```
 */
export const replaceProcess = (
  command: string,
  args: string[],
  options: { cwd: string }
): void => {
  try {
    // Try to use posix.execv for true process replacement
    // This only works on Unix-like systems (Linux, macOS)
    const posix = require("posix");

    // Change directory first
    process.chdir(options.cwd);

    // Use execv to replace the current process
    // After this call, Node.js is gone - the command takes over completely
    posix.execv(command, [command, ...args]);

    // This line never executes if execv succeeds
  } catch (error) {
    // Fallback: posix module not available or execv failed
    // Use execSync which blocks until completion
    const fullCommand = `${command} ${args.map((arg) => `"${arg.replace(/"/g, '\\"')}"`).join(" ")}`;

    try {
      execSync(fullCommand, {
        cwd: options.cwd,
        stdio: "inherit",
      });
    } catch (execError) {
      // Re-throw with more context
      if (execError instanceof Error) {
        throw new Error(`Failed to execute ${command}: ${execError.message}`);
      }
      throw execError;
    }
  }
};

