import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { InitOptions, ProjectConfig, RepositoryInfo, ProjectType, MasterDocConfig, RepoSetupConfig, SetupMode, KeywordConfig, Language } from '../types';
import { scanForRepositories, hasMasterSetup } from '../utils/scanner';
import { generateMasterDoc, generateRepoDoc } from '../utils/template-loader';
import { getQuickSetupKeywords, getExpertSetupKeywords, getDefaultTechStack } from '../constants/keywords';
import { msg } from '../utils/messages';

export async function initCommand(options: InitOptions) {
  // STEP 0: Language selection FIRST
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Select language / 언어 선택:',
      choices: [
        { name: '🇰🇷 한국어', value: 'ko' },
        { name: '🇺🇸 English', value: 'en' },
      ],
      default: options.lang || 'ko',
    },
  ]);

  const lang = language as Language;

  console.log(chalk.bold.cyan(`\n${msg(lang, 'title')}\n`));
  console.log(chalk.gray(`${msg(lang, 'currentSupport')}\n`));

  const currentDir = process.cwd();

  // Check if master setup already exists
  if (await hasMasterSetup(currentDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: chalk.yellow(msg(lang, 'overwriteWarning')),
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.gray(`\n${msg(lang, 'setupCancelled')}`));
      return;
    }
  }

  // STEP 1: Choose setup mode
  const { setupMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'setupMode',
      message: msg(lang, 'selectMode'),
      choices: [
        {
          name: chalk.green(msg(lang, 'quickMode')) + chalk.gray(` - ${msg(lang, 'quickModeDesc')}`),
          value: 'quick',
        },
        {
          name: chalk.blue(msg(lang, 'expertMode')) + chalk.gray(` - ${msg(lang, 'expertModeDesc')}`),
          value: 'expert',
        },
      ],
      default: 'quick',
    },
  ]);

  console.log();

  if (setupMode === 'quick') {
    await quickSetup(currentDir, { ...options, lang });
  } else {
    await expertSetup(currentDir, { ...options, lang });
  }
}

/**
 * Quick Setup
 */
async function quickSetup(currentDir: string, options: InitOptions) {
  const lang = options.lang;

  console.log(chalk.bold.cyan(msg(lang, 'quickTitle') + '\n'));
  console.log(chalk.gray(msg(lang, 'quickDesc') + '\n'));

  // Scan repositories
  const spinner = ora(msg(lang, 'scanning')).start();
  const foundRepos = await scanForRepositories(currentDir);
  spinner.succeed(msg(lang, 'foundRepos', foundRepos.length.toString()));

  if (foundRepos.length === 0) {
    console.log(chalk.yellow(`\n${msg(lang, 'noRepos')}`));
    console.log(chalk.gray(`${msg(lang, 'noReposHint')}\n`));
    return;
  }

  // Display found repositories
  console.log(chalk.bold(`\n${msg(lang, 'foundReposTitle')}\n`));
  foundRepos.forEach((repo) => {
    const statusIcon = repo.hasCodeSyncer ? chalk.green('✓') : chalk.gray('○');
    const statusText = repo.hasCodeSyncer ? chalk.green(msg(lang, 'setupComplete')) : chalk.gray(msg(lang, 'setupNew'));
    console.log(`  ${statusIcon} ${chalk.bold(repo.name)} ${statusText} - ${chalk.gray(repo.type)}`);
  });
  console.log();

  // Select repositories
  const { selectedRepos } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRepos',
      message: msg(lang, 'selectRepos'),
      choices: foundRepos.map((repo) => ({
        name: `${repo.name} (${repo.type})${repo.hasCodeSyncer ? ` - ${msg(lang, 'alreadySetup')}` : ''}`,
        value: repo.name,
        checked: !repo.hasCodeSyncer,
      })),
      validate: (answer) => (answer.length > 0 ? true : msg(lang, 'selectAtLeastOne')),
    },
  ]);

  // Basic project info
  const { projectName, githubUsername } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: msg(lang, 'projectName'),
      default: path.basename(currentDir),
      validate: (input) => (input.trim() ? true : msg(lang, 'projectNameRequired')),
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: msg(lang, 'githubUsername'),
      validate: (input) => (input.trim() ? true : msg(lang, 'githubUsernameRequired')),
    },
  ]);

  console.log(chalk.bold.green(`\n${msg(lang, 'basicSetupComplete')}\n`));
  console.log(chalk.gray(`${msg(lang, 'autoConfiguring')}\n`));
  console.log(chalk.gray(`${msg(lang, 'autoProjectType')}\n`));
  console.log(chalk.gray(`${msg(lang, 'autoTechStack')}\n`));
  console.log(chalk.gray(`${msg(lang, 'autoKeywords')}\n`));

  // Auto-configure repositories
  const repoConfigs = selectedRepos.map((repoName: string) => {
    const repo = foundRepos.find((r) => r.name === repoName)!;
    return {
      ...repo,
      description: `${repo.type} repository`,
      techStack: getDefaultTechStack(repo.type),
    };
  });

  // Auto keyword config - only CRITICAL keywords
  const keywordConfig: KeywordConfig = {
    categories: getQuickSetupKeywords('fullstack' as ProjectType),
  };

  // Generate documentation
  await generateDocumentation(currentDir, {
    projectName,
    githubUsername,
    language: lang,
    aiTool: options.ai,
    setupMode: 'quick',
    repositories: repoConfigs,
    keywordConfig,
  });

  displaySuccessMessage(lang, projectName, repoConfigs, 'quick');
}

/**
 * Expert Setup
 */
async function expertSetup(currentDir: string, options: InitOptions) {
  const lang = options.lang;

  console.log(chalk.bold.cyan(msg(lang, 'expertTitle') + '\n'));
  console.log(chalk.gray(msg(lang, 'expertDesc') + '\n'));

  // Scan repositories
  const spinner = ora(msg(lang, 'scanning')).start();
  const foundRepos = await scanForRepositories(currentDir);
  spinner.succeed(msg(lang, 'foundRepos', foundRepos.length.toString()));

  if (foundRepos.length === 0) {
    console.log(chalk.yellow(`\n${msg(lang, 'noRepos')}`));
    return;
  }

  // Display found repositories
  console.log(chalk.bold(`\n${msg(lang, 'foundReposTitle')}\n`));
  foundRepos.forEach((repo) => {
    const statusIcon = repo.hasCodeSyncer ? chalk.green('✓') : chalk.gray('○');
    const statusText = repo.hasCodeSyncer ? chalk.green(msg(lang, 'setupComplete')) : chalk.gray(msg(lang, 'setupNew'));
    console.log(`  ${statusIcon} ${chalk.bold(repo.name)} ${statusText} - ${chalk.gray(repo.type)}`);
  });
  console.log();

  // Select repositories
  const { selectedRepos } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRepos',
      message: msg(lang, 'selectRepos'),
      choices: foundRepos.map((repo) => ({
        name: `${repo.name} (${repo.type})${repo.hasCodeSyncer ? ` - ${msg(lang, 'alreadySetup')}` : ''}`,
        value: repo.name,
        checked: !repo.hasCodeSyncer,
      })),
      validate: (answer) => (answer.length > 0 ? true : msg(lang, 'selectAtLeastOne')),
    },
  ]);

  // Basic project info
  const { projectName, githubUsername } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: msg(lang, 'projectName'),
      default: path.basename(currentDir),
      validate: (input) => (input.trim() ? true : msg(lang, 'projectNameRequired')),
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: msg(lang, 'githubUsername'),
      validate: (input) => (input.trim() ? true : msg(lang, 'githubUsernameRequired')),
    },
  ]);

  // Configure each repository in detail
  const repoConfigs: Array<RepositoryInfo & { techStack: string[] }> = [];

  for (const repoName of selectedRepos) {
    const repo = foundRepos.find((r) => r.name === repoName)!;

    console.log(chalk.bold.cyan(`\n${msg(lang, 'repoDetailConfig', repoName)}\n`));

    const repoAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: msg(lang, 'description'),
        default: repo.description || `${repo.type} repository`,
      },
      {
        type: 'list',
        name: 'type',
        message: msg(lang, 'projectType'),
        choices: ['frontend', 'backend', 'mobile', 'fullstack'],
        default: repo.type,
      },
      {
        type: 'input',
        name: 'techStack',
        message: msg(lang, 'techStack'),
        default: repo.techStack?.join(', ') || getDefaultTechStack(repo.type).join(', '),
        filter: (input: string) => input.split(',').map((s) => s.trim()).filter(s => s),
      },
    ]);

    repoConfigs.push({
      ...repo,
      description: repoAnswers.description,
      type: repoAnswers.type,
      techStack: repoAnswers.techStack,
    });
  }

  // Keyword configuration
  console.log(chalk.bold.cyan(`\n${msg(lang, 'keywordConfigTitle')}\n`));
  console.log(chalk.gray(`${msg(lang, 'keywordConfigDesc')}\n`));

  const projectTypes = [...new Set(repoConfigs.map((r) => r.type))];
  const availableKeywords = getExpertSetupKeywords(projectTypes[0] as ProjectType);

  const { selectedCategories } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedCategories',
      message: msg(lang, 'selectKeywordCategories'),
      choices: availableKeywords.map((cat) => {
        const name = lang === 'ko' ? cat.nameKo : cat.name;
        const desc = lang === 'ko' ? cat.descriptionKo : cat.description;
        return {
          name: `${name} (${cat.severity}) - ${desc}`,
          value: cat.name,
          checked: cat.enabled,
        };
      }),
    },
  ]);

  const keywordConfig: KeywordConfig = {
    categories: availableKeywords.map((cat) => ({
      ...cat,
      enabled: selectedCategories.includes(cat.name),
    })),
  };

  // Custom keywords
  const { addCustomKeywords } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addCustomKeywords',
      message: msg(lang, 'addCustomKeywords'),
      default: false,
    },
  ]);

  if (addCustomKeywords) {
    const { customKeywords, customSeverity, customDescription } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customKeywords',
        message: msg(lang, 'customKeywords'),
        filter: (input: string) => input.split(',').map((s) => s.trim()),
      },
      {
        type: 'list',
        name: 'customSeverity',
        message: msg(lang, 'customSeverity'),
        choices: ['CRITICAL', 'IMPORTANT', 'MINOR'],
        default: 'IMPORTANT',
      },
      {
        type: 'input',
        name: 'customDescription',
        message: msg(lang, 'customDescription'),
      },
    ]);

    keywordConfig.customKeywords = [
      {
        keywords: customKeywords,
        severity: customSeverity,
        description: customDescription,
      },
    ];
  }

  // Generate documentation
  await generateDocumentation(currentDir, {
    projectName,
    githubUsername,
    language: lang,
    aiTool: options.ai,
    setupMode: 'expert',
    repositories: repoConfigs,
    keywordConfig,
  });

  displaySuccessMessage(lang, projectName, repoConfigs, 'expert');
}

/**
 * Generate all documentation files
 */
async function generateDocumentation(currentDir: string, config: ProjectConfig) {
  const lang = config.language;

  console.log(chalk.bold.cyan(`\n${msg(lang, 'generating')}\n`));

  // Create master directory
  const masterDir = path.join(currentDir, '.codesyncer');
  await fs.ensureDir(masterDir);

  // Master document config
  const masterDocConfig: MasterDocConfig = {
    projectName: config.projectName,
    githubUsername: config.githubUsername,
    language: config.language,
    repositories: config.repositories.map((repo) => ({
      name: repo.name,
      folder: repo.name,
      role: repo.description,
      vibeSyncPath: `${repo.name}/.claude/CLAUDE.md`,
      type: repo.type,
    })),
  };

  // Generate master documents
  const masterDoc = await generateMasterDoc(masterDocConfig);
  await fs.writeFile(path.join(masterDir, 'MASTER_CODESYNCER.md'), masterDoc, 'utf-8');

  const workspaceMap = generateWorkspaceMap(masterDocConfig);
  await fs.writeFile(path.join(masterDir, 'WORKSPACE_MAP.md'), workspaceMap, 'utf-8');

  console.log(chalk.green('✓') + ' .codesyncer/MASTER_CODESYNCER.md');
  console.log(chalk.green('✓') + ' .codesyncer/WORKSPACE_MAP.md');

  // Set up each repository
  for (const repo of config.repositories) {
    const repoSpinner = ora(msg(lang, 'settingUp', repo.name)).start();

    const claudeDir = path.join(currentDir, repo.name, '.claude');
    await fs.ensureDir(claudeDir);

    const repoConfig: RepoSetupConfig = {
      projectName: repo.name,
      type: repo.type,
      techStack: repo.techStack || [],
      language: config.language,
      keywordCategories: config.keywordConfig?.categories || [],
    };

    // Generate repository documents
    const claudeDoc = await generateRepoDoc('CLAUDE', repoConfig);
    const commentGuide = await generateRepoDoc('COMMENT_GUIDE', repoConfig);
    const architecture = await generateRepoDoc('ARCHITECTURE', repoConfig);
    const decisions = await generateRepoDoc('DECISIONS', repoConfig);

    await fs.writeFile(path.join(claudeDir, 'CLAUDE.md'), claudeDoc, 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'COMMENT_GUIDE.md'), commentGuide, 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'ARCHITECTURE.md'), architecture, 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'DECISIONS.md'), decisions, 'utf-8');

    repoSpinner.succeed(msg(lang, 'setupCompleted', repo.name));
  }
}

/**
 * Generate workspace map
 */
function generateWorkspaceMap(config: MasterDocConfig): string {
  const date = new Date().toISOString().split('T')[0];
  const lang = config.language;

  const title = lang === 'ko' ? 'Workspace Map' : 'Workspace Map';
  const generatedBy = lang === 'ko' ? 'CodeSyncer에 의해 자동 생성됨' : 'Auto-generated by CodeSyncer';
  const structureTitle = lang === 'ko' ? '📁 프로젝트 구조' : '📁 Project Structure';
  const overviewTitle = lang === 'ko' ? '📊 레포지토리 개요' : '📊 Repository Overview';
  const repoHeader = lang === 'ko' ? '레포지토리' : 'Repository';
  const typeHeader = lang === 'ko' ? '타입' : 'Type';
  const roleHeader = lang === 'ko' ? '역할' : 'Role';
  const setupHeader = lang === 'ko' ? 'CodeSyncer 설정' : 'CodeSyncer Setup';
  const linksTitle = lang === 'ko' ? '🔗 링크' : '🔗 Links';
  const masterDoc = lang === 'ko' ? '마스터 문서' : 'Master Document';
  const notesTitle = lang === 'ko' ? '📝 노트' : '📝 Notes';
  const note1 = lang === 'ko'
    ? '모든 레포지토리는 `@codesyncer-*` 와 `@claude-*` 주석 태그를 모두 지원합니다'
    : 'All repositories support both `@codesyncer-*` and `@claude-*` comment tags';
  const note2 = lang === 'ko'
    ? '새 레포지토리 추가 후 `codesyncer update` 명령어로 문서를 갱신하세요'
    : 'After adding new repositories, update documentation with `codesyncer update`';

  return `# ${config.projectName} - ${title}

> ${generatedBy} (${date})

## ${structureTitle}

\`\`\`
${config.projectName}/
├── .codesyncer/
│   ├── MASTER_CODESYNCER.md
│   └── WORKSPACE_MAP.md
${config.repositories.map((repo) => `├── ${repo.folder}/\n│   └── .claude/`).join('\n')}
\`\`\`

## ${overviewTitle}

| ${repoHeader} | ${typeHeader} | ${roleHeader} | ${setupHeader} |
|-----------|------|------|--------------|
${config.repositories.map((repo) => `| ${repo.name} | ${repo.type} | ${repo.role} | ✓ |`).join('\n')}

## ${linksTitle}

- **GitHub**: https://github.com/${config.githubUsername}/${config.projectName}
- **${masterDoc}**: .codesyncer/MASTER_CODESYNCER.md

## ${notesTitle}

- ${note1}
- ${note2}
`;
}

/**
 * Display success message
 */
function displaySuccessMessage(lang: Language, projectName: string, repoConfigs: any[], mode: SetupMode) {
  console.log(chalk.bold.green(`\n${msg(lang, 'success')}\n`));
  console.log(chalk.bold(`${msg(lang, 'createdStructure')}\n`));
  console.log(`  ${chalk.cyan('.codesyncer/')}`);
  console.log(`    ├── MASTER_CODESYNCER.md   ${chalk.gray(msg(lang, 'masterSwitching'))}`);
  console.log(`    └── WORKSPACE_MAP.md     ${chalk.gray(msg(lang, 'workspaceOverview'))}\n`);

  repoConfigs.forEach((repo) => {
    console.log(`  ${chalk.cyan(`${repo.name}/.claude/`)}`);
    console.log(`    ├── CLAUDE.md           ${chalk.gray(msg(lang, 'codingRules'))}`);
    console.log(`    ├── COMMENT_GUIDE.md    ${chalk.gray(msg(lang, 'commentGuide'))}`);
    console.log(`    ├── ARCHITECTURE.md     ${chalk.gray(msg(lang, 'projectStructure'))}`);
    console.log(`    └── DECISIONS.md        ${chalk.gray(msg(lang, 'decisionLog'))}\n`);
  });

  console.log(chalk.bold(`${msg(lang, 'nextSteps')}\n`));
  console.log(`  1. ${chalk.cyan(msg(lang, 'step1'))}`);
  console.log(`  2. ${chalk.cyan(msg(lang, 'step2', projectName))}`);
  console.log(`  3. ${chalk.cyan(msg(lang, 'step3'))}\n`);

  if (mode === 'quick') {
    console.log(chalk.gray(`${msg(lang, 'quickTip')}\n`));
  }

  console.log(chalk.gray(`${msg(lang, 'tagCompatibility')}\n`));
}
