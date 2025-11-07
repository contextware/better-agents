import type { ProjectConfig } from "../types.js";
import { getFrameworkProvider } from "../providers/frameworks/index.js";
import { getLanguageProvider } from "../providers/languages/index.js";

/**
 * Builds the initial instructions prompt for the coding assistant.
 *
 * @param params - Parameters object
 * @param params.config - Project configuration
 * @returns Formatted instruction string
 *
 * @example
 * ```ts
 * const prompt = buildInitialPrompt({ config });
 * ```
 */
export const buildInitialPrompt = ({
  config,
}: {
  config: ProjectConfig;
}): string => {
  const frameworkProvider = getFrameworkProvider({
    framework: config.framework,
  });
  const languageProvider = getLanguageProvider({ language: config.language });

  const frameworkKnowledge = frameworkProvider.getKnowledge();
  const languageKnowledge = languageProvider.getKnowledge();

  const instructions = `You are an expert AI agent developer. This project has been set up with Superagents best practices.

First steps:
1. Read and understand the AGENTS.md file - it contains all the guidelines for this project
2. Update the AGENTS.md with specific details about what this project does
3. Create a comprehensive README.md explaining the project, setup, and usage
4. Set up the ${languageKnowledge.setupInstructions}
5. ${frameworkKnowledge.toolingInstructions}
6. Execute any installation steps needed yourself, for the library dependencies, the CLI tools, etc
7. Use the LangWatch MCP to learn about prompt management and testing
8. Start implementing the core agent functionality


Remember:
- ALWAYS use LangWatch Prompt CLI for prompts (ask the MCP how)
- ALWAYS write Scenario tests for new features (ask the MCP how)
- Test everything before considering it done`;

  return `${instructions}\n\nProject Goal: ${config.projectGoal}`;
};
