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

  const frameworkKnowledge = frameworkProvider.getKnowledge({ config });
  const languageKnowledge = languageProvider.getKnowledge();

  const instructions = `You are an expert AI agent developer. This project has been set up with Better Agents best practices.

First steps:
1. Read and understand the AGENTS.md file - it contains all the guidelines for this project
2. Update the AGENTS.md with specific details about what this project does
3. Create a comprehensive README.md explaining the project, setup, and usage
4. Set up the ${languageKnowledge.setupInstructions}
5. ${frameworkKnowledge.toolingInstructions}
6. Execute any installation steps needed yourself, for the library dependencies, the CLI tools, etc. **CRITICAL: You must install @langwatch/scenario (for TS) or langwatch-scenario (for Python) to enable rich simulation testing.**
7. Use the LangWatch MCP to learn about prompt management and scenarios
8. Instrument the agent with LangWatch
9. Use Scenario tests to ensure the agent is working as expected, integrate with the agent and consider it done only when all scenarios pass, check scenario docs on how to implement. **Ensure you use the \`scenario.run\` pattern to see the simulation results links.**
10. If available from the framework, tell the user how to open a dev server give them the url they will be able to access so they can play with the agent themselves, don't run it for them
11. **Check the .env file** to confirm the selected LLM provider (e.g., OpenRouter, Anthropic) and model requirements. Follow the dynamic examples provided in the AGENTS.md.

Remember:
- The LLM and LangWatch API keys are already available in the .env file, you don't need to set them up
- ALWAYS use LangWatch Prompt CLI for prompts (ask the MCP how)
- ALWAYS write Scenario tests for new features using the \`scenario.run\` pattern (ask the MCP how)
- DO NOT test it "manually", always use the Scenario tests instead, do not open the dev server for the user, let them do it themselves only at the end of the implementation with everything working
- Test everything before considering it done
`;

  return `${instructions}\n\nAgent Goal:\n${config.projectGoal}`;
};
