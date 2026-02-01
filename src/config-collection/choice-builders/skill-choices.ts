import type { SkillMetadata } from "../../providers/skills/index.js";

export interface SkillChoice {
  name: string;
  value: string;
}

/**
 * Build choices for skill selection prompt
 * Formats skills with name and description for display
 */
export const buildSkillChoices = (skills: SkillMetadata[]): SkillChoice[] => {
  return skills.map((skill) => ({
    name: skill.description
      ? `${skill.name} - ${skill.description}`
      : skill.name,
    value: skill.name,
  }));
};
