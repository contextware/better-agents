import type { ProjectConfig } from '../../types.js';

/**
 * Builds project structure and workflow sections for AGENTS.md.
 * 
 * @param params - Parameters object
 * @param params.config - Project configuration
 * @returns Markdown string for structure and workflow sections
 * 
 * @example
 * ```ts
 * const section = buildWorkflowSection({ config });
 * ```
 */
export const buildWorkflowSection = ({ config }: { config: ProjectConfig }): string => {
  const srcDir = config.framework === 'mastra' || config.framework === 'langgraph-ts' ? 'src' : 'app';
  const scenarioPattern =
    config.language === 'python' ? 'test_*.py' : '*.test.ts';

  return `## Project Structure

This project follows a standardized structure for production-ready agents:

\`\`\`
|__ ${srcDir}/           # Main application code
|__ prompts/          # Versioned prompt files (YAML)
|_____ *.yaml
|__ tests/
|_____ evaluations/   # Jupyter notebooks for component evaluation
|________ *.ipynb
|_____ scenarios/     # End-to-end scenario tests
|________ ${scenarioPattern}
|__ prompts.json      # Prompt registry
|__ .env              # Environment variables (never commit!)
\`\`\`

---

## Development Workflow

### When Starting a New Feature:

1. **Read Relevant SKILL.md Files First**: Before writing ANY code, check \`.agents/skills/\` and read the SKILL.md file for any skill related to your task. Skills contain authoritative patterns and tools that MUST be used.
2. **Understand Requirements**: Clarify what the agent should do
3. **Design the Approach**: Plan which components and skills you'll need (based on what you read in step 1)
4. **Implement with Prompts**: Use LangWatch Prompt CLI to create/manage prompts (NEVER hardcode prompts)
5. **Write Unit Tests**: Test deterministic components
6. **Create Evaluations**: Build evaluation notebooks for probabilistic components
7. **Write Scenario Tests**: Create end-to-end tests using Scenario
8. **Run Tests**: Verify everything works before moving on

### Always:

- ✅ Read SKILL.md files BEFORE implementing related features
- ✅ Initialize LangWatch SDK and enable \`experimental_telemetry\` in all LLM calls
- ✅ Fetch prompts from LangWatch using \`langwatch.prompts.get()\`
- ✅ Version control your prompts using \`langwatch prompt sync\`
- ✅ Write Scenario tests for new features using \`scenario.run()\`
- ✅ Use LangWatch MCP to learn best practices and to work with Scenario tests and evaluations
- ✅ Follow the Agent Testing Pyramid
- ✅ Verify traces appear in LangWatch dashboard after running tests

### Never:

- ❌ Hardcode prompts in application code (always use \`langwatch.prompts.get()\`)
- ❌ Initialize LangWatch without enabling telemetry in LLM calls
- ❌ Skip reading SKILL.md files when working on related features
- ❌ Skip testing new features
- ❌ Commit API keys or sensitive data
- ❌ Optimize without measuring (use evaluations first)

---

## Using LangWatch MCP

The LangWatch MCP server provides expert guidance on:

- Prompt management with Prompt CLI
- Writing and maintaining Scenario tests (use LangWatch MCP to learn)
- Creating evaluations
- Best practices for agent development

The MCP will provide up-to-date documentation and examples. For Scenario specifically, always navigate its documentation and examples through the LangWatch MCP instead of accessing it directly.

---

## Getting Started

1. **Set up your environment**: Copy \`.env.example\` to \`.env\` and fill in your API keys
2. **Learn the tools**: Ask the LangWatch MCP about prompt management and testing
3. **Start building**: Implement your agent in the \`${srcDir}/\` directory
4. **Write tests**: Create scenario tests for your agent's capabilities
5. **Iterate**: Use evaluations to improve your agent's performance

---

## Resources

- **Scenario Documentation**: https://scenario.langwatch.ai/
- **Agent Testing Pyramid**: https://scenario.langwatch.ai/best-practices/the-agent-testing-pyramid
- **LangWatch Dashboard**: ${config.langwatchEndpoint || "https://app.langwatch.ai/"}
    ${config.framework === 'agno'
      ? '- **Agno Documentation**: https://docs.agno.com/'
      : config.framework === 'langgraph-py'
        ? '- **LangGraph/LangChain Documentation**: Use the LangGraph MCP for up-to-date docs'
        : config.framework === 'langgraph-ts'
          ? '- **LangGraph.js Documentation**: Use the LangGraph MCP for up-to-date docs'
          : config.framework === 'google-adk'
            ? '- **Google ADK Documentation**: Use the Google ADK MCP for up-to-date docs'
            : config.framework === 'vercel-ai'
              ? '- **AI SDK Documentation**: Use the AI SDK MCP for up-to-date docs'
              : '- **Mastra Documentation**: Use the Mastra MCP for up-to-date docs'}

---

Remember: Building production-ready agents means combining great AI capabilities with solid software engineering practices. Follow these guidelines to create agents that are reliable, testable, and maintainable.
`;
};

