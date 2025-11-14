import * as fs from "fs/promises";
import * as path from "path";
import type { CodingAssistantProvider } from "../index.js";

/**
 * Cursor assistant provider implementation.
 * Writes MCP configuration as .cursor/mcp.json in project root.
 */
export const CursorCodingAssistantProvider: CodingAssistantProvider = {
  id: "cursor",
  displayName: "Cursor",
  command: "",

  async writeMCPConfig({ projectPath, config }) {
    // Create .cursor directory
    const cursorDir = path.join(projectPath, ".cursor");
    await fs.mkdir(cursorDir, { recursive: true });

    // Write MCP config to .cursor/mcp.json
    const mcpConfigPath = path.join(cursorDir, "mcp.json");
    await fs.writeFile(mcpConfigPath, JSON.stringify(config, null, 2));
  },

  async launch({
    projectPath,
  }: {
    projectPath: string;
    prompt: string;
  }): Promise<void> {
    const chalk = (await import("chalk")).default;

    // Cursor doesn't support CLI launching, show instructions instead
    console.log(chalk.yellow("To start with Cursor:\n"));
    console.log(chalk.cyan(`  1. Open Cursor`));
    console.log(chalk.cyan(`  2. Open the folder: ${projectPath}`));
    console.log(
      chalk.cyan(`  3. Use the initial prompt above with Cursor Composer\n`)
    );
  },
};
