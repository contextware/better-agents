import { spawn } from 'child_process';
import type { Ora } from 'ora';
import { logger } from '../../utils/logger/index.js';

export interface InstallSkillsOptions {
  skills: string[];
  projectPath: string;
  spinner?: Ora;
}

/**
 * Install a single skill using npx skills add command
 */
const installSkill = async (
  skillName: string,
  projectPath: string,
  spinner?: Ora
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (spinner) {
      spinner.text = `Installing skill: ${skillName}...`;
    }

    logger.debug(`Running: npx skills add https://github.com/contextware/skills --skill ${skillName} -y`);
    logger.debug(`Working directory: ${projectPath}`);

    const child = spawn(
      'npx',
      ['skills', 'add', 'https://github.com/contextware/skills', '--skill', skillName, '-y'],
      {
        cwd: projectPath,
        stdio: 'pipe',
        shell: process.platform === 'win32', // Use shell on Windows for npx compatibility
      }
    );

    let stdout = '';
    let stderr = '';
    let completed = false;

    // Timeout after 30 seconds
    const timeout = setTimeout(() => {
      if (!completed) {
        completed = true;
        logger.debug(`Skill installation timed out for: ${skillName}`);
        child.kill('SIGTERM');
        reject(new Error(`Skill installation timed out: ${skillName}`));
      }
    }, 30000);

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      logger.debug(`[${skillName}] stdout: ${output.trim()}`);
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      logger.debug(`[${skillName}] stderr: ${output.trim()}`);
    });

    child.on('close', (code) => {
      if (completed) return; // Already handled by timeout
      completed = true;
      clearTimeout(timeout);

      if (code === 0) {
        logger.debug(`Successfully installed skill: ${skillName}`);
        resolve();
      } else {
        const errorMessage = stderr || stdout || `Process exited with code ${code}`;
        logger.debug(`Failed to install skill ${skillName}: ${errorMessage}`);
        reject(new Error(`Failed to install skill: ${skillName}`));
      }
    });

    child.on('error', (error) => {
      if (completed) return; // Already handled by timeout
      completed = true;
      clearTimeout(timeout);
      logger.debug(`Error installing skill ${skillName}: ${error.message}`);
      reject(error);
    });
  });
};

/**
 * Install multiple skills sequentially
 * Sequential installation is used to provide better progress tracking
 * and avoid potential conflicts
 */
export const installSkills = async ({
  skills,
  projectPath,
  spinner,
}: InstallSkillsOptions): Promise<void> => {
  const failedSkills: string[] = [];

  for (const skill of skills) {
    try {
      await installSkill(skill, projectPath, spinner);
    } catch (error) {
      failedSkills.push(skill);
      logger.userWarning(`Failed to install skill: ${skill}`);

      if (error instanceof Error) {
        logger.debug(`Error details: ${error.message}`);
      }
    }
  }

  if (failedSkills.length > 0) {
    const message = `Some skills failed to install: ${failedSkills.join(', ')}`;
    logger.userWarning(message);
    logger.userInfo(
      `You can install them manually later with: npx skills add https://github.com/contextware/skills --skill <skill-name>`
    );
  } else if (skills.length > 0) {
    logger.debug(`Successfully installed ${skills.length} skill(s)`);
  }
};
