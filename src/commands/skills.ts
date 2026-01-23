/**
 * CodeSyncer Skills Command
 *
 * Integration with skills.sh for skill discovery and installation.
 *
 * @codesyncer-context skills.sh API: https://skills.sh/api/skills
 * @codesyncer-decision [2026-01-23] skills.sh 연동으로 생태계 확장
 */

import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';

const SKILLS_API_URL = 'https://skills.sh/api/skills';

interface Skill {
  id: string;
  name: string;
  installs: number;
  topSource: string;
}

interface SkillsApiResponse {
  skills: Skill[];
}

/**
 * Fetch skills from skills.sh API
 */
async function fetchSkills(): Promise<Skill[]> {
  try {
    const response = await fetch(SKILLS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json() as SkillsApiResponse;
    return data.skills || [];
  } catch (error) {
    throw new Error(`Failed to fetch skills: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Display skills leaderboard
 */
function displayLeaderboard(skills: Skill[], isKo: boolean): void {
  console.log();
  console.log(chalk.bold.cyan(isKo ? '🏆 Skills.sh 리더보드' : '🏆 Skills.sh Leaderboard'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Sort by installs (descending)
  const sorted = [...skills].sort((a, b) => b.installs - a.installs);

  // Find codesyncer position
  const codesyncerIndex = sorted.findIndex(s =>
    s.name.toLowerCase() === 'codesyncer' ||
    s.topSource.includes('bitjaru/codesyncer')
  );

  // Display top 10
  const top10 = sorted.slice(0, 10);

  console.log(chalk.gray(
    `  ${isKo ? '순위' : 'Rank'}  ${(isKo ? '이름' : 'Name').padEnd(25)} ${(isKo ? '설치수' : 'Installs').padStart(10)}`
  ));
  console.log(chalk.gray('  ' + '─'.repeat(45)));

  top10.forEach((skill, index) => {
    const rank = index + 1;
    const isCodesyncer = skill.name.toLowerCase() === 'codesyncer' ||
                         skill.topSource.includes('bitjaru/codesyncer');

    const rankStr = rank <= 3
      ? ['🥇', '🥈', '🥉'][rank - 1]
      : `${rank}.`.padStart(3);

    const nameStr = skill.name.padEnd(25);
    const installsStr = skill.installs.toLocaleString().padStart(10);

    if (isCodesyncer) {
      console.log(chalk.bold.green(`  ${rankStr} ${nameStr} ${installsStr} ← You are here!`));
    } else {
      console.log(chalk.white(`  ${rankStr} ${nameStr} ${installsStr}`));
    }
  });

  // If codesyncer is not in top 10, show its position
  if (codesyncerIndex >= 10) {
    const codesyncer = sorted[codesyncerIndex];
    console.log(chalk.gray('  ...'));
    console.log(chalk.bold.yellow(
      `  ${(codesyncerIndex + 1).toString().padStart(3)}. ${codesyncer.name.padEnd(25)} ${codesyncer.installs.toLocaleString().padStart(10)}`
    ));
  }

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.gray(
    isKo
      ? `  총 ${skills.length}개 스킬 | 데이터: skills.sh`
      : `  Total ${skills.length} skills | Data: skills.sh`
  ));
  console.log();

  // Installation guide
  console.log(chalk.bold(isKo ? '📦 스킬 설치하기' : '📦 Install a Skill'));
  console.log(chalk.gray(
    isKo
      ? '  npx skills add <owner/repo>'
      : '  npx skills add <owner/repo>'
  ));
  console.log();
  console.log(chalk.cyan('  npx skills add bitjaru/codesyncer'));
  console.log();
}

/**
 * Install a skill using npx skills add
 */
async function installSkill(skillName: string, isKo: boolean): Promise<void> {
  const spinner = ora(
    isKo
      ? `${skillName} 설치 중...`
      : `Installing ${skillName}...`
  ).start();

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['skills', 'add', skillName], {
      stdio: 'inherit',
      shell: true,
    });

    spinner.stop();

    child.on('close', (code) => {
      if (code === 0) {
        console.log();
        console.log(chalk.green(
          isKo
            ? `✅ ${skillName} 설치 완료!`
            : `✅ ${skillName} installed successfully!`
        ));
        resolve();
      } else {
        reject(new Error(
          isKo
            ? `설치 실패 (exit code: ${code})`
            : `Installation failed (exit code: ${code})`
        ));
      }
    });

    child.on('error', (error) => {
      spinner.fail(
        isKo
          ? '설치 실패'
          : 'Installation failed'
      );
      reject(error);
    });
  });
}

export interface SkillsOptions {
  // Reserved for future options
}

/**
 * Main skills command
 */
export async function skillsCommand(subcommand?: string, skillName?: string): Promise<void> {
  // Detect language from environment or default to English
  const isKo = process.env.LANG?.startsWith('ko') || false;

  console.log(chalk.bold.cyan('\n🎯 CodeSyncer - Skills\n'));

  // Handle subcommands
  if (subcommand === 'add') {
    if (!skillName) {
      console.log(chalk.red(
        isKo
          ? '❌ 스킬 이름을 지정해주세요'
          : '❌ Please specify a skill name'
      ));
      console.log();
      console.log(chalk.gray(isKo ? '사용법:' : 'Usage:'));
      console.log(chalk.cyan('  codesyncer skills add <owner/repo>'));
      console.log(chalk.cyan('  codesyncer skills add bitjaru/codesyncer'));
      return;
    }

    try {
      await installSkill(skillName, isKo);
    } catch (error) {
      console.log(chalk.red(
        isKo
          ? `❌ 설치 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
          : `❌ Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
    return;
  }

  // Default: show leaderboard
  const spinner = ora(
    isKo
      ? 'skills.sh에서 데이터 가져오는 중...'
      : 'Fetching data from skills.sh...'
  ).start();

  try {
    const skills = await fetchSkills();
    spinner.succeed(
      isKo
        ? '데이터 로드 완료'
        : 'Data loaded'
    );
    displayLeaderboard(skills, isKo);
  } catch (error) {
    spinner.fail(
      isKo
        ? 'skills.sh 연결 실패'
        : 'Failed to connect to skills.sh'
    );
    console.log();
    console.log(chalk.red(
      error instanceof Error ? error.message : 'Unknown error'
    ));
    console.log();
    console.log(chalk.gray(
      isKo
        ? '인터넷 연결을 확인하거나, 나중에 다시 시도해주세요.'
        : 'Check your internet connection or try again later.'
    ));
  }
}
