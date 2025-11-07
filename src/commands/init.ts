import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";
import { collectConfig } from "../config-collection/collect-config.js";
import { createProjectStructure } from "../project-scaffolding/create-project-structure.js";
import { getFrameworkProvider } from "../providers/frameworks/index.js";
import { buildAgentsGuide } from "../builders/agents-guide-builder.js";
import { buildMCPConfig } from "../builders/mcp-config-builder.js";
import { kickoffAssistant } from "../assistant-kickoff/kickoff-assistant.js";
import type { ProjectConfig } from "../types.js";

/**
 * Initializes a new agent project with best practices.
 *
 * @param targetPath - Path where the project should be created (relative to cwd)
 * @returns Promise that resolves when initialization is complete
 *
 * @example
 * ```ts
 * await initCommand('my-agent-project');
 * ```
 */
export const initCommand = async (targetPath: string): Promise<void> => {
  try {
    // ASCII art banner
    console.log(
      chalk.cyan(`
███████╗██╗   ██╗██████╗ ███████╗██████╗  █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗
██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝
███████╗██║   ██║██████╔╝█████╗  ██████╔╝███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗
╚════██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
███████║╚██████╔╝██║     ███████╗██║  ██║██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║
╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
    `)
    );
    console.log(
      chalk.bold.gray(
        "                         Building the future of AI agents\n"
      )
    );

    const config: ProjectConfig = await collectConfig();
    const absolutePath = path.resolve(process.cwd(), targetPath);

    const spinner = ora("Setting up your agent project...").start();

    try {
      await fs.mkdir(absolutePath, { recursive: true });

      await createProjectStructure({ projectPath: absolutePath, config });
      spinner.text = "Project structure created";

      // Set up framework-specific tools
      const frameworkProvider = getFrameworkProvider({
        framework: config.framework,
      });
      await frameworkProvider.setup({ projectPath: absolutePath });
      spinner.text = "Framework configuration set up";

      // Build MCP config using builder
      await buildMCPConfig({ projectPath: absolutePath, config });
      spinner.text = "MCP configuration set up";

      // Build AGENTS.md using builder
      await buildAgentsGuide({ projectPath: absolutePath, config });
      spinner.text = "AGENTS.md generated";

      spinner.succeed(chalk.green("Project setup complete!"));

      console.log(chalk.bold.cyan("\n✨ Your agent project is ready!\n"));
      console.log(chalk.gray(`Project location: ${absolutePath}\n`));

      await kickoffAssistant({ projectPath: absolutePath, config });
    } catch (error) {
      spinner.fail("Failed to set up project");
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    } else {
      console.error(chalk.red("\n❌ An unexpected error occurred"));
    }
    process.exit(1);
  }
};
