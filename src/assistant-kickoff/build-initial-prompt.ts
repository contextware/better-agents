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
2. **CRITICAL: Read ALL installed skill SKILL.md files** - Check the \`.agents/skills/\` directory and read every SKILL.md file cover-to-cover. These skills contain authoritative guidance that overrides your training data. You MUST use the patterns and tools specified in these skills.
3. Update the AGENTS.md with specific details about what this project does
4. Create a comprehensive README.md explaining the project, setup, and usage
5. Set up the ${languageKnowledge.setupInstructions}
6. ${frameworkKnowledge.toolingInstructions}
7. Execute any installation steps needed yourself, for the library dependencies, the CLI tools, etc. **CRITICAL: You must install @langwatch/scenario (for TS) or langwatch-scenario (for Python) to enable rich simulation testing.**
8. Use the LangWatch MCP to learn about prompt management and scenarios
9. **Instrument the agent with LangWatch** - This requires THREE specific steps:
   a. Initialize the LangWatch SDK at the top of your main agent file (\`const langwatch = new LangWatch({ apiKey: process.env.LANGWATCH_API_KEY })\`)
   b. Create prompt YAML files using \`langwatch prompt create <name>\` and fetch them with \`langwatch.prompts.get()\` - NEVER hardcode prompts
   c. Enable \`experimental_telemetry\` in ALL LLM calls (\`generateText\`, \`streamText\`, etc.) so traces are sent to LangWatch
10. Use Scenario tests to ensure the agent is working as expected, integrate with the agent and consider it done only when all scenarios pass, check scenario docs on how to implement. **Ensure you use the \`scenario.run\` pattern to see the simulation results links.**
11. If available from the framework, tell the user how to open a dev server give them the url they will be able to access so they can play with the agent themselves, don't run it for them
12. **Check the .env file** to confirm the selected LLM provider (e.g., OpenRouter, Anthropic) and model requirements. Follow the dynamic examples provided in the AGENTS.md.
13. Run \`langwatch prompt sync\` to upload the initial prompts to the dashboard (use \`LANGWATCH_ENDPOINT\` if custom).

Remember:
- The LLM and LangWatch API keys are already available in the .env file, you don't need to set them up. **READ THE .env FILE FIRST** to see the exact variable names (e.g. OPENROUTER_API_KEY).
- ALWAYS use LangWatch Prompt CLI for prompts (ask the MCP how).
- ALWAYS write Scenario tests for new features using the \`scenario.run\` pattern (ask the MCP how).
- **CRITICAL**: If the agent initialization says "LangWatch initialization failed", you MUST fix it. Do not ignore it. It usually means the API key or endpoint in .env is not being loaded correctly by your code.
- **PROVIDER ERROR**: Many providers (like OpenRouter) use the OpenAI SDK but require different \`baseURL\` and \`apiKey\` settings. Follow the **EXACT** code example in AGENTS.md for your selected provider (${config.llmProvider}).
- DO NOT test it "manually", always use the Scenario tests instead, do not open the dev server for the user, let them do it themselves only at the end of the implementation with everything working.
- Test everything before considering it done.

### Pitfalls to Avoid (Common Failures):
1. **Missing API Keys**: Using \`process.env.OPENAI_API_KEY\` when the project is configured for \`${config.llmProvider}\`.
2. **Skipping LangWatch**: Assuming LangWatch integration is "optional" or "for later". It must be working from Day 1.
3. **Broken Scenarios**: Passing \`undefined\` or null agents to \`scenario.run\`. Ensure your agent is fully initialized before passing it to the test.
4. **Hardcoded Prompts**: Writing prompts directly in the code. Use the LangWatch Prompt CLI.
5. **Missing Telemetry**: Initializing LangWatch SDK but forgetting to add \`experimental_telemetry: { isEnabled: true }\` to LLM calls.
6. **Ignoring Skills**: Not reading SKILL.md files before implementing related features.

### Final Verification Checklist:

Before reporting completion, verify ALL of these:

**Code Checks:**
- [ ] LangWatch SDK initialized: \`const langwatch = new LangWatch({ apiKey: process.env.LANGWATCH_API_KEY })\`
- [ ] ALL prompts fetched with \`langwatch.prompts.get()\` (zero hardcoded prompts)
- [ ] ALL LLM calls have \`experimental_telemetry: { isEnabled: true }\`
- [ ] ALL installed SKILL.md files have been read and their patterns are followed
- [ ] Scenario tests use \`scenario.run()\` and pass agents correctly

**Runtime Checks:**
- [ ] Run agent - no "LangWatch initialization failed" error
- [ ] Run scenario tests - get clickable simulation links
- [ ] Check LangWatch dashboard - traces appear
- [ ] \`.env\` file loaded correctly (check with console.log if needed)

**Only report completion when ALL boxes are checked.**
`;

  return `${instructions}\n\nAgent Goal:\n${config.projectGoal}`;
};
