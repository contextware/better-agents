import * as fs from "fs/promises";
import * as path from "path";
import type { CodingAssistantProvider, MCPConfigFile } from "../index.js";

/**
 * None provider - for users who want to set up the project but prompt their assistant manually.
 * Writes MCP configuration as .mcp.json in project root.
 */
export const NoneCodingAssistantProvider: CodingAssistantProvider = {
  id: "none",
  displayName: "None - I will prompt it myself",
  command: "",

  async writeMCPConfig({ projectPath, config }) {
    const mcpConfigPath = path.join(projectPath, ".mcp.json");
    await fs.writeFile(mcpConfigPath, JSON.stringify(config, null, 2));
  },

  async launch({ projectPath, prompt }: { projectPath: string; prompt: string }): Promise<void> {
    // No-op - user will launch their own assistant
    return Promise.resolve();
  },
};

