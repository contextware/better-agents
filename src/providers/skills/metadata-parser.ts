export interface SkillMetadata {
  name: string;
  description: string;
  created?: string;
  requiredMCPServer?: string;
  authentication?: string;
  mcpServers?: string[];
  dependsOn?: string[];
  tags?: string[];
}

/**
 * Parse skill metadata from SKILL.md content
 * Extracts metadata section and description from the markdown file
 */
export const parseSkillMetadata = (skillName: string, content: string): SkillMetadata => {
  const metadata: SkillMetadata = {
    name: skillName,
    description: '',
  };

  // Extract metadata section (looks for ## Metadata section)
  const metadataMatch = content.match(/## Metadata\s+([\s\S]*?)(?=\n##|$)/);

  if (metadataMatch) {
    const metadataSection = metadataMatch[1];

    // Parse metadata fields
    const nameMatch = metadataSection.match(/\*\*Name:\*\*\s*(.+)/);
    if (nameMatch) metadata.name = nameMatch[1].trim();

    const createdMatch = metadataSection.match(/\*\*Created:\*\*\s*(.+)/);
    if (createdMatch) metadata.created = createdMatch[1].trim();

    const mcpServerMatch = metadataSection.match(/\*\*Required MCP Server:\*\*\s*(.+)/);
    if (mcpServerMatch) {
      metadata.requiredMCPServer = mcpServerMatch[1].trim();
      metadata.mcpServers = [mcpServerMatch[1].trim()];
    }

    const authMatch = metadataSection.match(/\*\*Authentication:\*\*\s*(.+)/);
    if (authMatch) metadata.authentication = authMatch[1].trim();
  }

  // Extract purpose/description (from ## Purpose section)
  const purposeMatch = content.match(/## Purpose\s+([\s\S]*?)(?=\n##|$)/);
  if (purposeMatch) {
    metadata.description = purposeMatch[1].trim().split('\n')[0].trim();
  }

  // Fallback: Extract first summary section if available
  if (!metadata.description) {
    const summaryMatch = content.match(/# Skill Summary:\s*(.+)/);
    if (summaryMatch) {
      const summaryLine = summaryMatch[1].trim();
      // Try to get description from next lines
      const lines = content.split('\n');
      const summaryIndex = lines.findIndex(l => l.includes('# Skill Summary:'));
      if (summaryIndex >= 0 && summaryIndex + 2 < lines.length) {
        metadata.description = lines[summaryIndex + 2].trim();
      } else {
        metadata.description = skillName.replace(/-/g, ' ');
      }
    }
  }

  // Final fallback: use skill name as description
  if (!metadata.description) {
    metadata.description = skillName.replace(/-/g, ' ');
  }

  return metadata;
};
