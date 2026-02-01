import type { FrameworkKnowledge } from "../index.js";
import type { ProjectConfig } from "../../../types.js";

/**
 * Returns Agno framework knowledge for documentation and prompts.
 *
 * @returns Framework knowledge object
 *
 * @example
 * ```ts
 * const knowledge = getKnowledge();
 * console.log(knowledge.setupInstructions);
 * ```
 */
export const getKnowledge = ({
  config,
}: {
  config: ProjectConfig;
}): FrameworkKnowledge => {
  const llmProvider = config.llmProvider || "openai";

  const getModelId = () => {
    switch (llmProvider) {
      case "anthropic":
        return "claude-3-5-sonnet-latest";
      case "gemini":
        return "gemini-1.5-pro";
      case "openrouter":
        return "openai/gpt-4o";
      case "bedrock":
        return "anthropic.claude-3-5-sonnet-20240620-v1:0";
      case "grok":
        return "grok-1";
      default:
        return "gpt-4o";
    }
  };

  const getModelImport = () => {
    switch (llmProvider) {
      case "anthropic":
        return "from agno.models.anthropic import AnthropicChat";
      case "gemini":
        return "from agno.models.google import Gemini";
      case "openrouter":
        return "from agno.models.openai import OpenAIChat";
      default:
        return "from agno.models.openai import OpenAIChat";
    }
  };

  const getModelInit = () => {
    const modelId = getModelId();
    switch (llmProvider) {
      case "anthropic":
        return `AnthropicChat(id="${modelId}")`;
      case "gemini":
        return `Gemini(id="${modelId}")`;
      case "openrouter":
        return `OpenAIChat(id="${modelId}", base_url="https://openrouter.ai/api/v1", api_key=os.getenv("OPENROUTER_API_KEY"))`;
      default:
        return `OpenAIChat(id="${modelId}")`;
    }
  };

  const modelImport = getModelImport();
  const modelInit = getModelInit();

  return {
    setupInstructions: "Python w/uv + pytest",
    toolingInstructions:
      "Use the Agno MCP to learn about Agno and how to build agents",
    agentsGuideSection: `## Framework-Specific Guidelines

### Agno Framework

**Always use the Agno MCP for learning:**

- The Agno MCP server provides real-time documentation
- Ask it questions about Agno APIs and best practices
- Follow Agno's recommended patterns for agent development

**Core Rules:**
- NEVER create agents in loops - reuse them for performance
- Always use output_schema for structured responses
- PostgreSQL in production, SQLite for dev only
- Start with single agent, scale up only when needed

**Basic Agent:**
\`\`\`python
import os
from agno.agent import Agent
${modelImport}

agent = Agent(
    model=${modelInit},
    instructions="You are a helpful assistant",
    markdown=True,
)
agent.print_response("Your query", stream=True)
\`\`\`

**Agent with Tools:**
\`\`\`python
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=${modelInit},
    tools=[DuckDuckGoTools()],
    instructions="Search the web for information",
)
\`\`\`

**CRITICAL - Agent Reuse:**
\`\`\`python
# WRONG - Recreates agent every time (significant overhead)
for query in queries:
    agent = Agent(...)  # DON'T DO THIS

# CORRECT - Create once, reuse
agent = Agent(...)
for query in queries:
    agent.run(query)
\`\`\`

**When to Use Each Pattern:**
- **Single Agent (90% of use cases):** One clear task, solved with tools + instructions
- **Team (autonomous):** Multiple specialized agents with different expertise
- **Workflow (programmatic):** Sequential steps with conditional logic

**Structured Output:**
\`\`\`python
from pydantic import BaseModel

class Result(BaseModel):
    summary: str
    findings: list[str]

agent = Agent(
    model=${modelInit},
    output_schema=Result,
)
result: Result = agent.run(query).content
\`\`\`

**Common Mistakes to Avoid:**
- Creating agents in loops (massive performance hit)
- Using Team when single agent would work
- Forgetting search_knowledge=True with knowledge
- Using SQLite in production
- Missing output_schema validation

**Resources:** https://docs.agno.com/

---
`,
  };
};

