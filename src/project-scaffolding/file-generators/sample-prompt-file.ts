import * as fs from "fs/promises";
import * as path from "path";
import type { ProjectConfig } from "../../types.js";

/**
 * Generates sample prompt YAML file in prompts/ directory.
 *
 * @param params - Parameters object
 * @param params.projectPath - Absolute path to project root
 * @param params.config - Project configuration
 * @returns Promise that resolves when file is written
 *
 * @example
 * ```ts
 * await generateSamplePrompt({ projectPath: '/path/to/project', config });
 * ```
 */
export const generateSamplePrompt = async ({
  projectPath,
  config,
}: {
  projectPath: string;
  config: ProjectConfig;
}): Promise<void> => {
  const getModelExample = () => {
    switch (config.llmProvider) {
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

  const samplePromptYaml = `# Sample prompt for your agent
model: ${getModelExample()}
temperature: 0.7
messages:
  - role: system
    content: |
      You are a helpful AI assistant.
      
      Your goal is: ${config.projectGoal}
`;

  await fs.writeFile(
    path.join(projectPath, "prompts", "sample_prompt.yaml"),
    samplePromptYaml
  );

  await fs.writeFile(
    path.join(projectPath, "prompts.json"),
    JSON.stringify({ prompts: [] }, null, 2)
  );
};
