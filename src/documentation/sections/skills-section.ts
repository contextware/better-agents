import type { SkillMetadata } from '../../providers/skills/index.js';

/**
 * Builds the skills section for AGENTS.md following Vercel's best practices.
 * 
 * Based on Vercel's research (https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals),
 * this section uses several techniques that achieved 100% pass rate in evals:
 * 
 * 1. Passive context - Skills info is always present, no decision to load needed
 * 2. Compressed index - Minimal token usage while preserving discoverability  
 * 3. Retrieval-led instruction - Explicit instruction to prefer docs over training
 * 4. Clear file paths - Agent knows exactly where to find skill documentation
 * 
 * @param skills - List of installed skill names
 * @param skillsMetadata - Optional metadata for richer skill descriptions
 * @returns Markdown string for skills section
 */
export const buildSkillsSection = (
  skills: string[],
  skillsMetadata?: SkillMetadata[]
): string => {
  if (!skills || skills.length === 0) {
    return buildSkillsDiscoverySection();
  }

  // Build compressed skills index (following Vercel's pipe-delimited optimization)
  const skillsIndex = buildCompressedSkillsIndex(skills, skillsMetadata);

  return `## Installed Skills

**IMPORTANT**: Prefer retrieval-led reasoning over pre-training-led reasoning for any tasks involving installed skills. Always read the skill's SKILL.md file before implementing related features.

${skillsIndex}

### Skill Usage Protocol

When working on tasks related to installed skills:

1. **Read First**: Open and read the skill's \`SKILL.md\` cover-to-cover before writing any code
2. **Follow Exactly**: Adhere strictly to patterns, tools, and architectural decisions in the skill
3. **Use Recommended Tools**: Skills define specific MCP tools or libraries that MUST be used
4. **Verify Compliance**: After implementation, re-check the skill docs to ensure full compliance

**CRITICAL**: Skills contain non-obvious requirements and mandatory patterns NOT documented elsewhere. Failure to follow skill instructions leads to broken implementations.

If unsure about implementation, the skill documentation is the source of truth.

### Adding More Skills

Browse available skills: \`npx skills add contextware/skills --list\`

Install a skill:
\`\`\`bash
npx skills add https://github.com/contextware/skills --skill <skill-name>
\`\`\`

After installing, read the new SKILL.md immediately before proceeding.

---
`;
};

/**
 * Builds a compressed skills index optimized for context efficiency.
 * Uses a compact format that preserves key information while minimizing tokens.
 */
const buildCompressedSkillsIndex = (
  skills: string[],
  metadata?: SkillMetadata[]
): string => {
  const lines: string[] = ['[Skills Index]|root:.agent/skills'];

  for (const skillName of skills) {
    const meta = metadata?.find(m => m.name === skillName);
    const desc = meta?.description || skillName.replace(/-/g, ' ');
    const tags = meta?.tags?.join(',') || '';
    const mcpServer = meta?.requiredMCPServer || '';

    // Compressed format: skill-name|description|tags|mcp-server
    // Example: connect-to-nango-mcp|Connect to external APIs via Nango|integration,oauth|nango
    const compressedLine = mcpServer || tags
      ? `|${skillName}:{SKILL.md}|${desc}${tags ? `|tags:${tags}` : ''}${mcpServer ? `|mcp:${mcpServer}` : ''}`
      : `|${skillName}:{SKILL.md}|${desc}`;

    lines.push(compressedLine);
  }

  // Also provide human-readable list for clarity
  const readableList = skills.map(skill => {
    const meta = metadata?.find(m => m.name === skill);
    const desc = meta?.description || skill.replace(/-/g, ' ');
    return `- **${skill}**: \`.agent/skills/${skill}/SKILL.md\` - ${desc}`;
  }).join('\n');

  return `${lines.join('')}

${readableList}`;
};

/**
 * Builds a section for projects without skills installed,
 * guiding the agent on how to discover and add skills.
 */
const buildSkillsDiscoverySection = (): string => {
  return `## Skills (None Installed)

This project does not have any skills installed yet. Skills provide specialized knowledge, patterns, and workflows for specific domains.

### Why Use Skills?

Skills give you:
- **Expert patterns** for complex integrations (MCP servers, OAuth, external APIs)
- **Battle-tested workflows** that follow security best practices
- **Consistent architecture** across different capabilities

### Browse Available Skills

\`\`\`bash
npx skills add https://github.com/contextware/skills --list
\`\`\`

### Install a Skill

\`\`\`bash
npx skills add https://github.com/contextware/skills --skill <skill-name>
\`\`\`

After installing a skill, its documentation will appear in \`.agent/skills/<skill-name>/SKILL.md\`.

---
`;
};
