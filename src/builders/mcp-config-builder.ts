import type { ProjectConfig } from "../types.js";
import { getFrameworkProvider } from "../providers/frameworks/index.js";
import type { MCPConfigFile } from "../providers/coding-assistants/index.js";

/**
 * Builds MCP configuration object based on project settings.
 *
 * @param params - Parameters object
 * @param params.config - Project configuration
 * @returns MCP configuration object
 *
 * @example
 * ```ts
 * const mcpConfig = buildMCPConfig({ config });
 * // Returns: { mcpServers: { langwatch: {...}, mastra: {...} } }
 * ```
 */
export const buildMCPConfig = ({
  config,
}: {
  config: ProjectConfig;
}): MCPConfigFile => {
  const mcpConfig: MCPConfigFile = {
    mcpServers: {},
  };

  // Always add LangWatch MCP with optional endpoint configuration
  const langwatchServer: {
    command: string;
    args: string[];
    env?: Record<string, string>;
  } = {
    command: "npx",
    args: ["-y", "@langwatch/mcp-server"],
  };

  // If a custom LangWatch endpoint is configured, pass it to the MCP server
  // This ensures Scenario tests and other LangWatch features use the correct endpoint
  if (config.langwatchEndpoint) {
    langwatchServer.env = {
      LANGWATCH_ENDPOINT: config.langwatchEndpoint,
    };
  }

  mcpConfig.mcpServers.langwatch = langwatchServer;

  // Add framework-specific MCP if available
  const frameworkProvider = getFrameworkProvider({
    framework: config.framework,
  });
  const frameworkMCP = frameworkProvider.getMCPConfig?.();
  if (frameworkMCP) {
    mcpConfig.mcpServers[frameworkProvider.id] = frameworkMCP;
  }

  // Note: Coding assistants don't add MCP servers here - they use CLI-specific
  // config files (e.g., ~/.gemini/settings.json, crush.json) which are handled
  // by cli-config-builder.ts

  return mcpConfig;
};

