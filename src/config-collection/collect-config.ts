import { select, input, password, confirm, checkbox } from "@inquirer/prompts";
import { spawn } from "child_process";
import type {
  ProjectConfig,
  AgentFramework,
  CodingAssistant,
  LLMProvider,
  ProgrammingLanguage,
  CLIOptions,
} from "../types.js";
import { logger } from "../utils/logger/index.js";
import { buildLanguageChoices } from "./choice-builders/language-choices.js";
import { buildFrameworkChoices } from "./choice-builders/framework-choices.js";
import { buildCodingAssistantChoices } from "./choice-builders/coding-assistant-choices.js";
import { buildSkillChoices } from "./choice-builders/skill-choices.js";
import { getAllLLMProviders } from "../providers/llm-providers/index.js";
import { getAllCodingAssistants } from "../providers/coding-assistants/index.js";
import { fetchSkills } from "../providers/skills/index.js";
import { validateOpenAIKey } from "./validators/openai-key.js";
import { validateLangWatchKey } from "./validators/langwatch-key.js";
import { validateProjectGoal } from "./validators/project-goal.js";
import { trackEvent, trackEventAndShutdown } from "../analytics/index.js";
import {
  isNonInteractiveMode,
  validateNonInteractiveOptions,
} from "../utils/validate-cli-options.js";

/**
 * Validates framework is compatible with language.
 * @param language - Selected programming language
 * @param framework - Selected framework
 * @throws Error if framework is incompatible with language
 */
const validateFrameworkLanguage = (
  language: ProgrammingLanguage,
  framework: AgentFramework
): void => {
  const pythonFrameworks: AgentFramework[] = ["agno", "langgraph-py", "google-adk"];
  const typescriptFrameworks: AgentFramework[] = ["mastra", "langgraph-ts", "vercel-ai"];

  if (language === "python" && !pythonFrameworks.includes(framework)) {
    throw new Error(
      `Framework "${framework}" is not compatible with Python. Use: ${pythonFrameworks.join(", ")}`
    );
  }

  if (language === "typescript" && !typescriptFrameworks.includes(framework)) {
    throw new Error(
      `Framework "${framework}" is not compatible with TypeScript. Use: ${typescriptFrameworks.join(", ")}`
    );
  }
};

/**
 * Collects project configuration from user via interactive CLI prompts,
 * or uses provided CLI options for non-interactive mode.
 * Non-interactive mode is automatically detected when all required options are provided.
 *
 * @param cliOptions - Optional CLI options for non-interactive mode
 * @returns Promise resolving to complete ProjectConfig
 *
 * @example
 * ```ts
 * // Interactive mode
 * const config = await collectConfig();
 *
 * // Non-interactive mode (automatically detected)
 * const config = await collectConfig({
 *   language: 'python',
 *   framework: 'agno',
 *   llmProvider: 'anthropic',
 *   llmKey: 'sk-ant-...',
 *   langwatchKey: 'sk-lw-...',
 *   codingAssistant: 'claude-code',
 *   goal: 'Build an agent that...'
 * });
 * ```
 */
export const collectConfig = async (
  cliOptions: CLIOptions = {}
): Promise<ProjectConfig> => {
  const configStart = Date.now();

  // Prime skills cache early and handle force refresh immediately if requested
  // This ensures the latest skills are available for selection and provides early feedback
  await fetchSkills({
    showStatus: cliOptions.refreshSkills || false,
    forceRefresh: cliOptions.refreshSkills || false,
  }).catch(() => {
    // Silent fail here, we'll handle actual errors later in the flow
  });

  try {
    // Auto-detect non-interactive mode: if all required options are provided, skip prompts
    if (isNonInteractiveMode(cliOptions)) {
      validateNonInteractiveOptions(cliOptions);

      // Validate framework/language compatibility
      validateFrameworkLanguage(cliOptions.language!, cliOptions.framework!);

      // LangWatch Endpoint - check CLI option, then environment variable
      const langwatchEndpoint =
        cliOptions.langwatchEndpoint ||
        process.env.LANGWATCH_ENDPOINT ||
        undefined;

      // Determine the base URL for error messages
      const langwatchBaseUrl = langwatchEndpoint || "https://app.langwatch.ai";

      // Read API keys from environment variables
      const langwatchApiKey = process.env.LANGWATCH_API_KEY;
      if (!langwatchApiKey) {
        throw new Error(
          `Missing required environment variable: LANGWATCH_API_KEY\n\n` +
          `When using Better Agents, you must set the LANGWATCH_API_KEY environment variable.\n\n` +
          `Get your LangWatch API key at: ${langwatchBaseUrl}/authorize`
        );
      }

      // Get LLM provider-specific API key from environment
      const allProviders = getAllLLMProviders();
      let llmApiKey: string;
      let llmAdditionalInputs: Record<string, string> | undefined;

      if (cliOptions.llmProvider === "openai") {
        llmApiKey = process.env.OPENAI_API_KEY || "";
        if (!llmApiKey) {
          throw new Error(
            `Missing required environment variable: OPENAI_API_KEY. See 'better-agents init --help' for setup.`
          );
        }
      } else if (cliOptions.llmProvider === "anthropic") {
        llmApiKey = process.env.ANTHROPIC_API_KEY || "";
        if (!llmApiKey) {
          throw new Error(
            `Missing required environment variable: ANTHROPIC_API_KEY. See 'better-agents init --help' for setup.`
          );
        }
      } else if (cliOptions.llmProvider === "gemini") {
        llmApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
        if (!llmApiKey) {
          throw new Error(
            `Missing required environment variable: GOOGLE_API_KEY or GEMINI_API_KEY. See 'better-agents init --help' for setup.`
          );
        }
      } else if (cliOptions.llmProvider === "bedrock") {
        llmApiKey = process.env.AWS_ACCESS_KEY_ID || "";
        const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
        const awsRegion = process.env.AWS_REGION || cliOptions.awsRegion || "us-east-1";

        if (!llmApiKey || !awsSecretAccessKey) {
          const missing = [];
          if (!llmApiKey) missing.push("AWS_ACCESS_KEY_ID");
          if (!awsSecretAccessKey) missing.push("AWS_SECRET_ACCESS_KEY");
          throw new Error(
            `Missing required environment variable(s): ${missing.join(", ")}. See 'better-agents init --help' for setup.`
          );
        }

        llmAdditionalInputs = {
          awsSecretAccessKey,
          awsRegion,
        };
      } else if (cliOptions.llmProvider === "openrouter") {
        llmApiKey = process.env.OPENROUTER_API_KEY || "";
        if (!llmApiKey) {
          throw new Error(
            `Missing required environment variable: OPENROUTER_API_KEY. See 'better-agents init --help' for setup.`
          );
        }
      } else if (cliOptions.llmProvider === "grok") {
        llmApiKey = process.env.XAI_API_KEY || "";
        if (!llmApiKey) {
          throw new Error(
            `Missing required environment variable: XAI_API_KEY. See 'better-agents init --help' for setup.`
          );
        }
      } else {
        throw new Error(`Unknown LLM provider: ${cliOptions.llmProvider}`);
      }

      // Check for Gemini API key if using gemini-cli coding assistant
      if (cliOptions.codingAssistant === "gemini-cli") {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
          throw new Error(
            `Missing required environment variable: GEMINI_API_KEY. See 'better-agents init --help' for setup.`
          );
        }
      }

      // Parse skills option
      let skills: string[] | undefined;
      if (cliOptions.skills) {
        if (cliOptions.skills === 'all') {
          try {
            const allSkills = await fetchSkills({
              forceRefresh: cliOptions.refreshSkills || false,
              showStatus: cliOptions.refreshSkills || false,
            });
            skills = allSkills.map(s => s.name);
          } catch {
            logger.userWarning('Failed to fetch skills list. Skipping skill installation.');
          }
        } else {
          skills = cliOptions.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      }

      // Return config directly without prompts
      return {
        language: cliOptions.language!,
        framework: cliOptions.framework!,
        codingAssistant: cliOptions.codingAssistant!,
        llmProvider: cliOptions.llmProvider!,
        llmApiKey,
        llmAdditionalInputs,
        langwatchApiKey,
        langwatchEndpoint,
        projectGoal: cliOptions.goal!,
        skills,
      };
    }

    // Interactive mode - prompt for missing values
    logger.userInfo(
      "Setting up your agent project following the Better Agent Structure.\n"
    );

    // Language - use CLI option or prompt
    const language: ProgrammingLanguage = cliOptions.language || await select({
      message: "What programming language do you want to use?",
      choices: buildLanguageChoices(),
    });

    // Framework - use CLI option or prompt
    const framework: AgentFramework = cliOptions.framework || await select<AgentFramework>({
      message: "What agent framework do you want to use?",
      choices: buildFrameworkChoices({ language }),
    });

    // Validate if both were provided via CLI
    if (cliOptions.language && cliOptions.framework) {
      validateFrameworkLanguage(language, framework);
    }

    // LLM Provider - use CLI option or prompt
    const allProviders = getAllLLMProviders();
    const llmProvider: LLMProvider = cliOptions.llmProvider || await select<LLMProvider>({
      message: "What LLM provider is your agent going to use?",
      choices: allProviders.map((p) => ({
        name: p.displayName,
        value: p.id as LLMProvider,
      })),
    });

    const selectedProvider = allProviders.find((p) => p.id === llmProvider);
    const providerDisplayName = selectedProvider?.displayName || llmProvider;

    // LLM API Key - check environment variable first, then prompt
    let llmApiKey: string | undefined;

    // Check for provider-specific env var
    if (llmProvider === "openai") {
      llmApiKey = process.env.OPENAI_API_KEY;
    } else if (llmProvider === "anthropic") {
      llmApiKey = process.env.ANTHROPIC_API_KEY;
    } else if (llmProvider === "gemini") {
      llmApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    } else if (llmProvider === "bedrock") {
      llmApiKey = process.env.AWS_ACCESS_KEY_ID;
    } else if (llmProvider === "openrouter") {
      llmApiKey = process.env.OPENROUTER_API_KEY;
    } else if (llmProvider === "grok") {
      llmApiKey = process.env.XAI_API_KEY;
    }

    // If not found in env, prompt for it
    if (!llmApiKey) {
      if (selectedProvider?.apiKeyUrl) {
        logger.userInfo(`To get your ${providerDisplayName} API key, visit:`);
        logger.userInfo(`${selectedProvider.apiKeyUrl}`);
      }

      llmApiKey = await password({
        message: `Enter your ${providerDisplayName} API key:`,
        mask: "*",
        validate:
          llmProvider === "openai"
            ? validateOpenAIKey
            : (value) => {
              if (!value || value.length < 5) {
                return "API key is required and must be at least 5 characters";
              }
              return true;
            },
      });
    }

    // Collect additional credentials if the provider needs them
    let llmAdditionalInputs: Record<string, string> | undefined;
    if (
      selectedProvider?.additionalCredentials &&
      selectedProvider.additionalCredentials.length > 0
    ) {
      llmAdditionalInputs = {};

      for (const credential of selectedProvider.additionalCredentials) {
        // Check environment variables first
        if (credential.key === "awsSecretAccessKey") {
          const envValue = process.env.AWS_SECRET_ACCESS_KEY;
          if (envValue) {
            llmAdditionalInputs[credential.key] = envValue;
            continue;
          }
        }
        if (credential.key === "awsRegion") {
          const envValue = process.env.AWS_REGION || cliOptions.awsRegion;
          if (envValue) {
            llmAdditionalInputs[credential.key] = envValue;
            continue;
          }
        }

        // Otherwise prompt
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

    // LangWatch Endpoint - check CLI option, then environment variable, then prompt if not provided
    let langwatchEndpoint =
      cliOptions.langwatchEndpoint ||
      process.env.LANGWATCH_ENDPOINT;

    // If not provided via CLI or env var, ask user (with option to skip for default)
    if (!langwatchEndpoint && !cliOptions.langwatchEndpoint) {
      const customEndpoint = await confirm({
        message: "Are you using a private LangWatch installation?",
        default: false,
      });

      if (customEndpoint) {
        langwatchEndpoint = await input({
          message: "Enter your LangWatch endpoint URL:",
          default: "https://app.langwatch.ai",
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return "LangWatch endpoint URL is required";
            }
            try {
              new URL(value);
              return true;
            } catch {
              return "Please enter a valid URL (e.g., https://langwatch.example.com)";
            }
          },
        });
      }
    }

    // Determine the base URL for LangWatch (for displaying where to get API key)
    const langwatchBaseUrl = langwatchEndpoint || "https://app.langwatch.ai";

    // LangWatch API Key - check environment variable first, then prompt
    let langwatchApiKey = process.env.LANGWATCH_API_KEY;

    if (!langwatchApiKey) {
      logger.userInfo("To get your LangWatch API key, visit:");
      logger.userInfo(`${langwatchBaseUrl}/authorize`);

      langwatchApiKey = await password({
        message:
          "Enter your LangWatch API key (for prompt management, scenarios, evaluations and observability):",
        mask: "*",
        validate: validateLangWatchKey,
      });
    }

    const codingAssistant: CodingAssistant = cliOptions.codingAssistant || await select<CodingAssistant>({
      message:
        "What is your preferred coding assistant for building the agent?",
      choices: await buildCodingAssistantChoices(),
    });

    // Check if the selected coding assistant is available (skip in non-interactive parts)
    if (!cliOptions.codingAssistant) {
      const codingAssistantProviders = getAllCodingAssistants();
      const selectedCodingProvider = codingAssistantProviders.find(
        (p) => p.id === codingAssistant
      );

      if (selectedCodingProvider) {
        let availability = await selectedCodingProvider.isAvailable();
        if (!availability.installed && availability.installCommand) {
          logger.userWarning(
            `${selectedCodingProvider.displayName} is not installed.`
          );
          logger.userInfo(`To install it, run:`);
          logger.userInfo(`${availability.installCommand}`);

          const shouldInstall = await confirm({
            message: "Would you like me to install it for you?",
            default: true,
          });

          if (shouldInstall) {
            logger.userInfo("Installing...");
            try {
              await new Promise<void>((resolve, reject) => {
                const [cmd, ...args] = availability.installCommand!.split(" ");
                const child = spawn(cmd, args, { stdio: "inherit" });

                child.on("close", (code: number) => {
                  if (code === 0) {
                    resolve();
                  } else {
                    reject(
                      new Error(`Installation failed with exit code ${code}`)
                    );
                  }
                });

                child.on("error", reject);
              });

              // Check availability again after installation
              availability = await selectedCodingProvider.isAvailable();
              if (availability.installed) {
                logger.userSuccess(
                  `${selectedCodingProvider.displayName} installed successfully!`
                );
              } else {
                logger.userError(
                  "Installation may have failed. Please try installing manually."
                );
              }
            } catch (error) {
              logger.userError(
                `Installation failed: ${error instanceof Error ? error.message : "Unknown error"
                }`
              );
              logger.userInfo("Please try installing manually.");
            }
          }
        }
      }

      logger.userInfo("✔︎ Your coding assistant will finish setup later if needed\n");
    }

    // Check for Gemini API key if using Gemini CLI
    if (codingAssistant === "gemini-cli") {
      if (!process.env.GEMINI_API_KEY) {
        logger.userInfo("When using Gemini CLI, you must specify the GEMINI_API_KEY environment variable.");
        logger.userInfo("Get your Gemini API key at: https://aistudio.google.com/app/apikey");
        const geminiApiKey = await password({
          message: "Enter your Gemini API key:",
          mask: "*",
          validate: (value) => {
            if (!value || value.length < 5) {
              return "API key is required and must be at least 5 characters";
            }
            return true;
          },
        });
        process.env.GEMINI_API_KEY = geminiApiKey;
        logger.userInfo("GEMINI_API_KEY has been set for this session.");
      }
    }

    // Prompt for skills selection (before project goal)
    let selectedSkills: string[] = [];
    try {
      // If refresh wasn't already forced via CLI, ask the user in interactive mode
      if (!cliOptions.refreshSkills) {
        const shouldRefresh = await confirm({
          message:
            "Would you like to refresh the skills list from GitHub to ensure you have the latest available skills?",
          default: false,
        });

        if (shouldRefresh) {
          await fetchSkills({
            forceRefresh: true,
            showStatus: true,
          }).catch(() => {
            logger.userWarning(
              "Failed to refresh skills list, using cached version."
            );
          });
        }
      }

      logger.debug("Fetching available skills from GitHub...");
      // This call will be instant as it was already primed at the start (or just refreshed above)
      const availableSkills = await fetchSkills({ showStatus: true });
      logger.debug(`Fetched ${availableSkills.length} skills`);

      if (availableSkills.length > 0) {
        selectedSkills = await checkbox({
          message: "Select skills to install (optional - space to select, enter to confirm):",
          choices: buildSkillChoices(availableSkills),
          pageSize: 10,
        });
        logger.debug(`User selected ${selectedSkills.length} skills: ${selectedSkills.join(', ')}`);
      } else {
        logger.userWarning("No skills available to select");
      }
    } catch (error) {
      logger.userWarning("Failed to fetch available skills");
      logger.debug(`Error details: ${error instanceof Error ? error.message : String(error)}`);
      logger.userInfo("You can add skills later with: npx skills add contextware/skills --skill <skill-name>");
    }

    let projectGoal: string = cliOptions.goal || await input({
      message: "What is your agent going to do?",
      validate: validateProjectGoal,
    });

    // If skills are selected and it's interactive (not provided via CLI goal option),
    // prepend the skills to the goal to make it more directive as requested by user.
    if (selectedSkills.length > 0 && !cliOptions.goal) {
      const skillsList = selectedSkills.map(s => `"${s}"`).join(', ');
      const skillsPrefix = `Using the ${skillsList} skill${selectedSkills.length > 1 ? 's' : ''}, `;

      // Check if the goal already starts with a similar prefix to avoid duplication
      if (!projectGoal.toLowerCase().startsWith('using the')) {
        projectGoal = `${skillsPrefix}${projectGoal.charAt(0).toLowerCase()}${projectGoal.slice(1)}`;
      }
    }

    // Treat prompt_shown as "configuration done" to avoid redundant events
    await trackEvent("cli_prompt_shown", {
      language,
      framework,
      codingAssistant,
      llmProvider,
      durationSec: (Date.now() - configStart) / 1000,
    });

    return {
      language,
      framework,
      codingAssistant,
      llmProvider,
      llmApiKey,
      llmAdditionalInputs,
      langwatchApiKey,
      langwatchEndpoint,
      projectGoal,
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("User force closed")) {
      // User pressed Ctrl+C during prompts
      logger.userWarning("Setup cancelled by user");
      // Track cancellation directly here since inquirer intercepts SIGINT
      await trackEventAndShutdown("cli_init_failed", {
        step: "config-collection",
        errorType: "cancelled",
        durationSec: (Date.now() - configStart) / 1000,
        success: false,
      });
      process.exit(0);
    }
    throw error;
  }
};
