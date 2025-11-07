import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";
import type { CodingAssistantProvider, MCPConfigFile } from "../index.js";

/**
 * Cursor CLI assistant provider implementation.
 * Writes MCP configuration as .mcp.json in project root.
 */
export const CursorCodingAssistantProvider: CodingAssistantProvider = {
  id: "cursor-cli",
  displayName: "Cursor CLI",
  command: "cursor-agent",

  async writeMCPConfig({ projectPath, config }) {
    const mcpConfigPath = path.join(projectPath, ".mcp.json");
    await fs.writeFile(mcpConfigPath, JSON.stringify(config, null, 2));
  },

  async launch({ projectPath, prompt }: { projectPath: string; prompt: string }): Promise<void> {
    // Properly escape the prompt for shell execution
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

    try {
      // Use execSync to run synchronously and hand over full control
      execSync(`cursor-agent "${escapedPrompt}"`, {
        cwd: projectPath,
        stdio: "inherit",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to launch Cursor CLI: ${error.message}`);
      }
      throw error;
    }
  },
};

