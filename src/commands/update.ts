import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { UpdateOptions, Language } from '../types';
import { scanForRepositories, hasMasterSetup } from '../utils/scanner';

export async function updateCommand(options: UpdateOptions) {
  console.log(chalk.bold.cyan('\n🔄 CodeSyncer - Update System\n'));

  const currentDir = process.cwd();

  // Check if master setup exists
  if (!(await hasMasterSetup(currentDir))) {
    console.log(chalk.red('✗ No CodeSyncer master setup found.'));
    console.log(chalk.gray('Run `codesyncer init` first.\n'));
    return;
  }

  // Detect language from existing SETUP_GUIDE
  let lang: Language = 'en';
  const setupGuidePath = path.join(currentDir, '.codesyncer', 'SETUP_GUIDE.md');
  try {
    const setupGuide = await fs.readFile(setupGuidePath, 'utf-8');
    if (setupGuide.includes('한국어') || setupGuide.includes('레포지토리')) {
      lang = 'ko';
    }
  } catch {
    // Default to English
  }

  const spinner = ora('Scanning for changes...').start();

  // Scan for repositories
  const foundRepos = await scanForRepositories(currentDir);

  // Read existing master doc to get current config
  const masterPath = path.join(currentDir, '.codesyncer', 'MASTER_CODESYNCER.md');
  let existingRepos: string[] = [];

  try {
    const masterContent = await fs.readFile(masterPath, 'utf-8');
    // Extract repository names from the master doc (simple parsing)
    const repoMatches = masterContent.match(/\|\s+([^|]+)\s+\|[^|]+\|[^|]+\|[^|]+\|/g);
    if (repoMatches) {
      existingRepos = repoMatches
        .slice(1) // Skip header
        .map((match) => match.split('|')[1].trim())
        .filter(Boolean);
    }
  } catch (error) {
    // Ignore if can't read
  }

  // Find new repositories
  const currentRepoNames = foundRepos.map((r) => r.name);
  const newRepos = foundRepos.filter((r) => !existingRepos.includes(r.name));
  const removedRepos = existingRepos.filter((name) => !currentRepoNames.includes(name));

  spinner.succeed('Scan complete');

  // Display changes
  if (newRepos.length === 0 && removedRepos.length === 0) {
    console.log(chalk.green('\n✓ Everything is up to date!\n'));
    console.log(chalk.gray(`  Total repositories: ${foundRepos.length}`));
    console.log(chalk.gray(`  With CodeSyncer setup: ${foundRepos.filter((r) => r.hasCodeSyncer).length}\n`));
    return;
  }

  console.log(chalk.bold('\n📊 Changes detected:\n'));

  if (newRepos.length > 0) {
    console.log(chalk.green(`  + ${newRepos.length} new repository(ies):`));
    newRepos.forEach((repo) => {
      console.log(chalk.gray(`    - ${repo.name} (${repo.type})`));
    });
    console.log();
  }

  if (removedRepos.length > 0) {
    console.log(chalk.yellow(`  - ${removedRepos.length} removed repository(ies):`));
    removedRepos.forEach((name) => {
      console.log(chalk.gray(`    - ${name}`));
    });
    console.log();
  }

  // Update workspace map
  const updateSpinner = ora('Updating WORKSPACE_MAP.md...').start();

  try {
    const workspaceMapPath = path.join(currentDir, '.codesyncer', 'WORKSPACE_MAP.md');
    const currentDate = new Date().toISOString().split('T')[0];

    // Simple update: add a note about the scan
    const updateNote = `\n## 🔄 Last Update: ${currentDate}\n\n`;
    const statsNote = `**Repositories found:** ${foundRepos.length}\n`;
    const newReposNote = newRepos.length > 0 ? `**New repositories:** ${newRepos.map((r) => r.name).join(', ')}\n` : '';

    // Append update info
    await fs.appendFile(workspaceMapPath, updateNote + statsNote + newReposNote);

    updateSpinner.succeed('Updated WORKSPACE_MAP.md');
  } catch (error) {
    updateSpinner.fail('Failed to update WORKSPACE_MAP.md');
  }

  // Check if root CLAUDE.md exists
  const rootClaudePath = path.join(currentDir, 'CLAUDE.md');
  const hasRootClaude = await fs.pathExists(rootClaudePath);

  if (!hasRootClaude) {
    console.log(chalk.bold.yellow('\n⚠️  Missing root CLAUDE.md (new in v2.1.2)\n'));
    console.log(chalk.gray('This file allows Claude to automatically load context at session start.\n'));

    const { createRootClaude } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'createRootClaude',
        message: lang === 'ko' ? '루트 CLAUDE.md를 생성할까요?' : 'Create root CLAUDE.md?',
        default: true,
      },
    ]);

    if (createRootClaude) {
      const spinner = ora(lang === 'ko' ? '루트 CLAUDE.md 생성 중...' : 'Creating root CLAUDE.md...').start();

      try {
        // Read template
        const templatePath = path.join(__dirname, '..', 'templates', lang, 'root_claude.md');
        let template = await fs.readFile(templatePath, 'utf-8');

        // Extract project info from existing MASTER_CODESYNCER.md
        const masterPath = path.join(currentDir, '.codesyncer', 'MASTER_CODESYNCER.md');
        let projectName = path.basename(currentDir);
        let githubUsername = 'your-username';

        try {
          const masterContent = await fs.readFile(masterPath, 'utf-8');
          const nameMatch = masterContent.match(/프로젝트[:\s]*([^\n]+)|Project[:\s]*([^\n]+)/i);
          const githubMatch = masterContent.match(/github\.com\/([^/\s]+)/i);

          if (nameMatch) projectName = (nameMatch[1] || nameMatch[2]).trim();
          if (githubMatch) githubUsername = githubMatch[1];
        } catch {
          // Use defaults
        }

        const repoCount = foundRepos.length;
        const today = new Date().toISOString().split('T')[0];

        // Replace placeholders
        template = template
          .replace(/\[PROJECT_NAME\]/g, projectName)
          .replace(/\[GITHUB_USERNAME\]/g, githubUsername)
          .replace(/\[TODAY\]/g, today)
          .replace(/\[REPO_COUNT\]/g, String(repoCount));

        // Write root CLAUDE.md
        await fs.writeFile(rootClaudePath, template, 'utf-8');

        spinner.succeed(lang === 'ko' ? '루트 CLAUDE.md 생성 완료!' : 'Root CLAUDE.md created!');
        console.log(chalk.green(`  ✓ ${rootClaudePath}\n`));
        console.log(chalk.cyan(lang === 'ko'
          ? '💡 이제 Claude가 세션 시작 시 자동으로 컨텍스트를 로드합니다!'
          : '💡 Claude will now automatically load context at session start!\n'));
      } catch (error) {
        spinner.fail(lang === 'ko' ? '루트 CLAUDE.md 생성 실패' : 'Failed to create root CLAUDE.md');
        console.error(chalk.red(`Error: ${error}\n`));
      }
    }
  }

  console.log(chalk.bold.green('\n✅ Update complete!\n'));

  if (newRepos.length > 0) {
    console.log(chalk.bold('📝 Next steps:\n'));
    console.log(`  ${chalk.cyan('Run:')} codesyncer add-repo ${chalk.gray('(to set up new repositories)')}\n`);
  }
}
