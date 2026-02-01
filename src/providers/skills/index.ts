/**
 * Skills Provider
 *
 * Provides functionality for discovering, selecting, and installing skills
 * from the contextware/skills repository.
 */

export type { SkillMetadata } from './metadata-parser.js';
export { parseSkillMetadata } from './metadata-parser.js';
export { fetchSkills, getCachedSkills, clearSkillsCache } from './fetcher.js';
export { installSkills } from './installer.js';
export type { InstallSkillsOptions } from './installer.js';
