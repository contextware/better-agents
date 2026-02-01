import type { FrameworkKnowledge } from "../index.js";

import type { ProjectConfig } from "../../../types.js";

/**
 * Returns Mastra framework knowledge for documentation and prompts.
 *
 * @param params - Parameters object
 * @param params.config - Project configuration
 * @returns Framework knowledge object
 *
 * @example
 * ```ts
 * const knowledge = getKnowledge({ config });
 * console.log(knowledge.setupInstructions);
 * ```
 */
export const getKnowledge = (_params: {
  config: ProjectConfig;
}): FrameworkKnowledge => ({
  setupInstructions: "TypeScript w/pnpm + vitest",
  toolingInstructions:
    "Use the Mastra MCP to learn about Mastra and how to build agents",
  agentsGuideSection: `## Framework-Specific Guidelines

### Mastra Framework

**Always use the Mastra MCP for learning:**

- The Mastra MCP server provides real-time documentation
- Ask it questions about Mastra APIs and best practices
- Follow Mastra's recommended patterns for agent development

**When implementing agent features:**
1. Consult the Mastra MCP: "How do I [do X] in Mastra?"
2. Use Mastra's built-in agent capabilities
3. Follow Mastra's TypeScript patterns and conventions
4. Leverage Mastra's integration ecosystem

**LLM Provider:**
- Check the \`.env\` file for the configured LLM provider and API keys
- Use the appropriate AI SDK provider (e.g., \`openai\`, \`anthropic\`, \`google\`)
- If using OpenRouter, use the \`openai\` provider with \`baseURL: "https://openrouter.ai/api/v1"\` and the \`OPENROUTER_API_KEY\`

**Initial setup:**
1. Use \`pnpx mastra init --default\` to create a new mastra project, do it before setting up the rest of the project, right after having done \`pnpm init\`.
2. Then explore the setup it created, the folders, remove what not needed
3. Proceed with the user definition request to implement the agent and test it out
4. Open the UI for user to see using \`pnpx mastra dev\`

---
`,
});
