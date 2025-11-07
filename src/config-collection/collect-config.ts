import { select, input, password } from "@inquirer/prompts";
import chalk from "chalk";
import type {
  ProjectConfig,
  AgentFramework,
  CodingAssistant,
  LLMProvider,
} from "../types.js";
import { buildLanguageChoices } from "./choice-builders/language-choices.js";
import { buildFrameworkChoices } from "./choice-builders/framework-choices.js";
import { buildCodingAssistantChoices } from "./choice-builders/coding-assistant-choices.js";
import { getAllLLMProviders } from "../providers/llm-providers/index.js";
import { validateOpenAIKey } from "./validators/openai-key.js";
import { validateLangWatchKey } from "./validators/langwatch-key.js";
import { validateProjectGoal } from "./validators/project-goal.js";

/**
 * Collects project configuration from user via interactive CLI prompts.
 *
 * @returns Promise resolving to complete ProjectConfig
 *
 * @example
 * ```ts
 * const config = await collectConfig();
 * // Returns: { language: 'python', framework: 'agno', ... }
 * ```
 */
export const collectConfig = async (): Promise<ProjectConfig> => {
  try {
    console.log(
      chalk.gray("Setting up your agent project following the Superagent Structure.\n")
    );

    const language = await select({
      message: "What programming language do you want to use?",
      choices: buildLanguageChoices(),
    });

    const framework = await select<AgentFramework>({
      message: "What agent framework do you want to use?",
      choices: buildFrameworkChoices({ language }),
    });

    const allProviders = getAllLLMProviders();
    const llmProvider = await select<LLMProvider>({
      message: "What LLM provider is your agent going to use?",
      choices: allProviders.map((p) => ({ name: p.displayName, value: p.id as LLMProvider })),
    });

    const codingAssistant = await select<CodingAssistant>({
      message: "What is your preferred coding assistant for building the agent?",
      choices: await buildCodingAssistantChoices(),
    });

    const selectedProvider = allProviders.find((p) => p.id === llmProvider);
    const providerDisplayName = selectedProvider?.displayName || llmProvider;

    if (selectedProvider?.apiKeyUrl) {
      console.log(chalk.gray(`\nTo get your ${providerDisplayName} API key, visit:`));
      console.log(chalk.blue.underline(`${selectedProvider.apiKeyUrl}\n`));
    }

    const llmApiKey = await password({
      message: `Enter your ${providerDisplayName} API key:`,
      mask: "*",
      validate: llmProvider === "openai" ? validateOpenAIKey : (value) => {
        if (!value || value.length < 5) {
          return "API key is required and must be at least 5 characters";
        }
        return true;
      },
    });

    // Collect additional credentials if the provider needs them
    let llmAdditionalInputs: Record<string, string> | undefined;
    if (selectedProvider?.additionalCredentials && selectedProvider.additionalCredentials.length > 0) {
      llmAdditionalInputs = {};

      for (const credential of selectedProvider.additionalCredentials) {
        if (credential.type === "password") {
          llmAdditionalInputs[credential.key] = await password({
            message: `Enter your ${credential.label}:`,
            mask: "*",
            validate: credential.validate,
          });
        } else {
          llmAdditionalInputs[credential.key] = await input({
            message: `Enter your ${credential.label}:`,
            default: credential.defaultValue,
            validate: credential.validate,
          });
        }
      }
    }

    console.log(chalk.gray("\nTo get your LangWatch API key, visit:"));
    console.log(chalk.blue.underline("https://app.langwatch.ai/authorize\n"));

    const langwatchApiKey = await password({
      message: "Enter your LangWatch API key (for prompt management, scenarios, evaluations and observability):",
      mask: "*",
      validate: validateLangWatchKey,
    });

    const projectGoal = await input({
      message: "What is your agent going to do?",
      validate: validateProjectGoal,
    });

    return {
      language,
      framework,
      codingAssistant,
      llmProvider,
      llmApiKey,
      llmAdditionalInputs,
      langwatchApiKey,
      projectGoal,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("User force closed")) {
      console.log(chalk.yellow("\n\nSetup cancelled by user"));
      process.exit(0);
    }
    throw error;
  }
};
