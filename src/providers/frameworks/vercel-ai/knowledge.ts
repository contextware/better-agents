import type { FrameworkKnowledge } from "../index.js";

import type { ProjectConfig } from "../../../types.js";

/**
 * Returns Vercel AI SDK framework knowledge for documentation and prompts.
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
    "Use the Vercel MCP to learn about Vercel AI SDK and how to build agents",
  agentsGuideSection: `## Framework-Specific Guidelines

### Vercel AI SDK Framework

**Always use the Vercel MCP for learning:**

- The Vercel MCP server provides real-time documentation for Vercel AI SDK
- Ask it questions about Vercel AI SDK APIs and best practices
- Follow Vercel AI SDK's recommended patterns for agent development

**When implementing agent features:**
1. Consult the Vercel MCP: "How do I [do X] in Vercel AI SDK?"
2. Use Vercel AI SDK's unified provider architecture
3. Follow Vercel AI SDK's TypeScript patterns and conventions
4. Leverage Vercel AI SDK's framework integrations (Next.js, React, Svelte, Vue, Node.js)

**Tool Definition Best Practices:**

When defining tools using the \`tool()\` helper function, follow these critical requirements:

1. **ALWAYS use \`inputSchema\` (not \`parameters\`)** for the tool's input schema:
   \`\`\`typescript
   // CORRECT ✅
   tool({
     description: 'Your tool description',
     inputSchema: z.object({
       param: z.string(),
     }),
     execute: async ({ param }) => { ... },
   })

   // INCORRECT ❌
   tool({
     description: 'Your tool description',
     parameters: z.object({ ... }),  // Wrong property name!
     execute: async ({ param }) => { ... },
   })
   \`\`\`

2. Tool schema must be an object type - even if the tool takes no parameters, use \`z.object({})\`:
   \`\`\`typescript
   // CORRECT ✅
   inputSchema: z.object({})

   // INCORRECT ❌
   inputSchema: z.void()
   inputSchema: z.null()
   \`\`\`

3. Always consult Vercel AI SDK docs through the Vercel MCP for the latest tool API:
   - Ask: "How do I define tools in Vercel AI SDK?"
   - Check: The exact properties for tool definitions
   - Verify: The correct property names before implementing

**Initial setup:**
1. Use \`pnpm init\` to create a new project
2. Install dependencies (using compatible versions for LangWatch):
   \`pnpm add ai@^5.0.0 langwatch @ai-sdk/openai@^2.0.0 @langwatch/scenario\`
   *(Note: LangWatch currently requires @ai-sdk/openai < 3.0.0, which is compatible with AI SDK v5)*
3. Set up TypeScript configuration
4. Proceed with the user definition request to implement the agent and test it out
5. Run the agent using \`pnpm dev\` (configured with \`tsx watch src/index.ts\`) or integrate with your chosen framework

**Key Concepts:**
- **Unified Provider Architecture**: Consistent interface across multiple AI model providers
- **generateText**: Generate text using any supported model
- **streamText**: Stream text responses for real-time interactions
- **Framework Integration**: Works with Next.js, React, Svelte, Vue, and Node.js

---
`,
});
