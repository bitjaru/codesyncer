import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AddRepoOptions, RepoSetupConfig, ProjectType } from '../types';
import { scanForRepositories, hasMasterSetup } from '../utils/scanner';
import { generateRepoDoc } from '../utils/template-loader';

export async function addRepoCommand(options: AddRepoOptions) {
  console.log(chalk.bold.cyan('\n➕ CodeSyncer - Add Repository\n'));

  const currentDir = process.cwd();

  // Check if master setup exists
  if (!(await hasMasterSetup(currentDir))) {
    console.log(chalk.red('✗ No CodeSyncer master setup found.'));
    console.log(chalk.gray('Run `codesyncer init` first.\n'));
    return;
  }

  // Scan for repositories
  const spinner = ora('Scanning for repositories...').start();
  const foundRepos = await scanForRepositories(currentDir);
  spinner.succeed(`Found ${foundRepos.length} repositories`);

  // Filter out repos that already have CodeSyncer setup
  const reposWithoutSetup = foundRepos.filter((r) => !r.hasCodeSyncer);

  if (reposWithoutSetup.length === 0) {
    console.log(chalk.green('\n✓ All repositories already have CodeSyncer setup!\n'));
    return;
  }

  console.log(chalk.bold('\n📁 Repositories without CodeSyncer:\n'));
  reposWithoutSetup.forEach((repo) => {
    console.log(`  ${chalk.gray('○')} ${chalk.bold(repo.name)} - ${chalk.gray(repo.type)}`);
  });

  // Select repository to add
  const { selectedRepo } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedRepo',
      message: 'Select repository to add CodeSyncer:',
      choices: reposWithoutSetup.map((repo) => ({
        name: `${repo.name} (${repo.type})`,
        value: repo.name,
      })),
    },
  ]);

  const repo = foundRepos.find((r) => r.name === selectedRepo)!;

  // Collect repository configuration
  console.log(chalk.bold.cyan(`\n📦 Configure ${repo.name}:\n`));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project/Repository name:',
      default: repo.name,
    },
    {
      type: 'list',
      name: 'type',
      message: 'Project type:',
      choices: ['frontend', 'backend', 'mobile', 'fullstack'],
      default: repo.type,
    },
    {
      type: 'input',
      name: 'techStack',
      message: 'Tech stack (comma-separated):',
      default: 'TypeScript, Node.js',
      filter: (input: string) => input.split(',').map((s) => s.trim()),
    },
  ]);

  // Generate documents
  const setupSpinner = ora(`Setting up ${repo.name}...`).start();

  try {
    const claudeDir = path.join(currentDir, repo.name, '.claude');
    await fs.ensureDir(claudeDir);

    const repoConfig: RepoSetupConfig = {
      projectName: answers.projectName,
      type: answers.type as ProjectType,
      techStack: answers.techStack,
      language: options.lang,
      keywordCategories: [],  // Add-repo doesn't configure keywords
    };

    // Generate all repository documents
    const claudeDoc = await generateRepoDoc('CLAUDE', repoConfig);
    const commentGuide = await generateRepoDoc('COMMENT_GUIDE', repoConfig);
    const architecture = await generateRepoDoc('ARCHITECTURE', repoConfig);
    const decisions = await generateRepoDoc('DECISIONS', repoConfig);

    await fs.writeFile(path.join(claudeDir, 'CLAUDE.md'), claudeDoc, 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'COMMENT_GUIDE.md'), commentGuide, 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'ARCHITECTURE.md'), architecture, 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'DECISIONS.md'), decisions, 'utf-8');

    setupSpinner.succeed(`Set up ${repo.name}`);

    // Success message
    console.log(chalk.bold.green('\n✅ Repository setup complete!\n'));
    console.log(chalk.bold('📁 Created:\n'));
    console.log(`  ${chalk.cyan(`${repo.name}/.claude/`)}`);
    console.log(`    ├── CLAUDE.md           ${chalk.gray('(Coding rules)')}`);
    console.log(`    ├── COMMENT_GUIDE.md    ${chalk.gray('(Comment tags guide)')}`);
    console.log(`    ├── ARCHITECTURE.md     ${chalk.gray('(Project structure)')}`);
    console.log(`    └── DECISIONS.md        ${chalk.gray('(Decision log)')}\n`);

    console.log(chalk.bold('📝 Next step:\n'));
    console.log(`  ${chalk.cyan('Run:')} codesyncer update ${chalk.gray('(to update master documentation)')}\n`);
  } catch (error) {
    setupSpinner.fail(`Failed to set up ${repo.name}`);
    console.error(chalk.red('\nError:'), error);
  }
}
