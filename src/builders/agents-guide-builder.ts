import * as fs from "fs/promises";
import * as path from "path";
import type { ProjectConfig } from "../types.js";
import type { SkillMetadata } from "../providers/skills/index.js";
import { getFrameworkProvider } from "../providers/frameworks/index.js";
import { buildOverviewSection } from "../documentation/sections/overview-section.js";
import { buildPrinciplesSection } from "../documentation/sections/principles-section.js";
import { buildWorkflowSection } from "../documentation/sections/workflow-section.js";
import { buildSkillsSection } from "../documentation/sections/skills-section.js";

/**
 * Builds and writes AGENTS.md using provider knowledge.
 * 
 * Section ordering follows Vercel's research on AGENTS.md effectiveness:
 * 1. Overview with retrieval-led reasoning instruction (critical for agent accuracy)
 * 2. Skills section immediately after (skills need to be prominent and always visible)
 * 3. Core principles (testing, prompt management)
 * 4. Framework-specific guidance
 * 5. Project structure and workflow
 *
 * @param params - Parameters object
 * @param params.projectPath - Absolute path to project root
 * @param params.config - Project configuration
 * @param params.skillsMetadata - Optional metadata for installed skills
 * @returns Promise that resolves when file is written
 *
 * @example
 * ```ts
 * await buildAgentsGuide({ projectPath: '/path/to/project', config, skillsMetadata });
 * ```
 */
export const buildAgentsGuide = async ({
  projectPath,
  config,
  skillsMetadata,
}: {
  projectPath: string;
  config: ProjectConfig;
  skillsMetadata?: SkillMetadata[];
}): Promise<void> => {
  const frameworkProvider = getFrameworkProvider({
    framework: config.framework,
  });
  const frameworkKnowledge = frameworkProvider.getKnowledge({ config });

  // Section ordering is intentional following Vercel's AGENTS.md research:
  // - Overview first with retrieval-led reasoning instruction
  // - Skills immediately after (needs to be prominent and always visible)
  // - Principles for core development guidelines
  // - Framework-specific guidance
  // - Workflow last as reference material
  const content = [
    buildOverviewSection({ config }),
    buildSkillsSection(config.skills || [], skillsMetadata),
    buildPrinciplesSection({ config }),
    frameworkKnowledge.agentsGuideSection,
    buildWorkflowSection({ config }),
  ].join("\n");

  await fs.writeFile(path.join(projectPath, "AGENTS.md"), content);
};

