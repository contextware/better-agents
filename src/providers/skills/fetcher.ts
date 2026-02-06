import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { parseSkillMetadata, type SkillMetadata } from './metadata-parser.js';
import { logger } from '../../utils/logger/index.js';

const CACHE_DIR = path.join(os.homedir(), '.better-agents');
const CACHE_FILE = path.join(CACHE_DIR, 'skills-cache.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const SKILLS_REPO_OWNER = 'contextware';
const SKILLS_REPO_NAME = 'skills';
const GITHUB_API_BASE = 'https://api.github.com';

interface CachedSkills {
  timestamp: number;
  skills: SkillMetadata[];
}

interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
}

interface FetchSkillsOptions {
  /** Force refresh from GitHub, ignoring cache */
  forceRefresh?: boolean;
  /** Show user-facing messages about refresh status */
  showStatus?: boolean;
}

/**
 * Check if cache exists and is still fresh (within TTL)
 */
const isCacheValid = async (): Promise<boolean> => {
  try {
    const cacheContent = await fs.readFile(CACHE_FILE, 'utf-8');
    const cached: CachedSkills = JSON.parse(cacheContent);
    const age = Date.now() - cached.timestamp;
    return age < CACHE_TTL_MS;
  } catch {
    return false;
  }
};

/**
 * Load skills from cache
 */
const loadCache = async (): Promise<SkillMetadata[] | null> => {
  try {
    const cacheContent = await fs.readFile(CACHE_FILE, 'utf-8');
    const cached: CachedSkills = JSON.parse(cacheContent);
    return cached.skills;
  } catch (error) {
    // Cache doesn't exist or is corrupt
    if (error instanceof SyntaxError) {
      // Delete corrupt cache
      try {
        await fs.unlink(CACHE_FILE);
      } catch {
        // Ignore deletion errors
      }
    }
    return null;
  }
};

/**
 * Save skills to cache
 */
const saveCache = async (skills: SkillMetadata[]): Promise<void> => {
  try {
    // Ensure cache directory exists
    await fs.mkdir(CACHE_DIR, { recursive: true });

    const cached: CachedSkills = {
      timestamp: Date.now(),
      skills,
    };

    await fs.writeFile(CACHE_FILE, JSON.stringify(cached, null, 2), 'utf-8');
  } catch {
    logger.userWarning('Failed to save skills cache');
  }
};

/**
 * Clear the skills cache, forcing a fresh fetch on next request
 */
export const clearSkillsCache = async (): Promise<void> => {
  try {
    await fs.unlink(CACHE_FILE);
    logger.debug('Skills cache cleared');
  } catch {
    // Cache didn't exist, which is fine
  }
};

/**
 * Fetch skill metadata from a single skill's SKILL.md file
 */
const fetchSkillMetadata = async (skillName: string): Promise<SkillMetadata | null> => {
  try {
    const url = `https://raw.githubusercontent.com/${SKILLS_REPO_OWNER}/${SKILLS_REPO_NAME}/main/skills/${skillName}/SKILL.md`;
    const response = await fetch(url);

    if (!response.ok) {
      logger.debug(`Failed to fetch SKILL.md for ${skillName}: ${response.status}`);
      return null;
    }

    const content = await response.text();
    const metadata = parseSkillMetadata(skillName, content);

    return metadata;
  } catch (error) {
    logger.debug(`Error fetching skill metadata for ${skillName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Fetch list of available skills from GitHub.
 * 
 * Skills are fetched dynamically from the contextware/skills repository,
 * ensuring you always have access to the latest available skills.
 * Results are cached for 24 hours to avoid hitting GitHub API rate limits.
 * 
 * @param options - Fetch options
 * @param options.forceRefresh - Force refresh from GitHub, ignoring cache
 * @param options.showStatus - Show user-facing messages about fetch status
 * @returns Promise resolving to array of skill metadata
 */
export const fetchSkills = async (options: FetchSkillsOptions = {}): Promise<SkillMetadata[]> => {
  const { forceRefresh = false, showStatus = false } = options;

  // Check cache first (unless force refresh requested)
  if (!forceRefresh && await isCacheValid()) {
    logger.debug('Using cached skills list');
    const cached = await loadCache();
    if (cached) {
      if (showStatus) {
        logger.userInfo(`Found ${cached.length} skills (cached)`);
      }
      return cached;
    }
  }

  // Force refresh - clear cache first
  if (forceRefresh) {
    await clearSkillsCache();
  }

  // Try to fetch from GitHub
  try {
    if (showStatus) {
      logger.userInfo('Fetching latest skills from GitHub...');
    }
    logger.debug('Fetching skills from GitHub...');

    const url = `${GITHUB_API_BASE}/repos/${SKILLS_REPO_OWNER}/${SKILLS_REPO_NAME}/contents/skills`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        logger.userWarning('GitHub API rate limit reached');
      } else {
        logger.userWarning(`Failed to fetch skills: HTTP ${response.status}`);
      }
      throw new Error(`GitHub API request failed: ${response.status}`);
    }

    const contents = (await response.json()) as GitHubContent[];

    // Filter to only directories, excluding config files
    const skillDirs = contents.filter(
      (item) =>
        item.type === 'dir' &&
        !['LICENSE', 'README.md', 'CONTRIBUTING.md', 'CONTRIBURING.md', '.git', '.github'].includes(item.name)
    );

    logger.debug(`Found ${skillDirs.length} skill directories`);

    // Fetch metadata for each skill in parallel
    const skillMetadataPromises = skillDirs.map((dir) => fetchSkillMetadata(dir.name));
    const skillMetadata = await Promise.all(skillMetadataPromises);

    // Filter out null values (failed fetches) and sort by name
    const skills = skillMetadata
      .filter((skill): skill is SkillMetadata => skill !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Save to cache
    await saveCache(skills);

    if (showStatus) {
      logger.userInfo(`Found ${skills.length} skills (refreshed from GitHub)`);
    }

    return skills;
  } catch (error) {
    // Try to use cached version even if expired
    const cached = await loadCache();
    if (cached) {
      logger.userWarning('Failed to fetch skills from GitHub, using cached version');
      return cached;
    }

    // No cache available, return empty array
    logger.userWarning('Failed to fetch skills and no cache available');
    logger.debug(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
};

/**
 * Get cached skills without fetching (for offline use)
 */
export const getCachedSkills = async (): Promise<SkillMetadata[] | null> => {
  return loadCache();
};
