import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { InitOptions, Language } from '../types';
import { scanForRepositories, hasMasterSetup } from '../utils/scanner';
import { msg } from '../utils/messages';

export async function initCommand(options: InitOptions) {
  console.log(chalk.bold.cyan('\n🤖 CodeSyncer v2.0 - AI-Powered Collaboration System\n'));
  console.log(chalk.gray('Framework provider for AI coding assistants\n'));

  const currentDir = process.cwd();

  // Check if master setup already exists
  if (await hasMasterSetup(currentDir)) {
    console.log(chalk.yellow('\n⚠️  CodeSyncer setup already exists in this directory.\n'));
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Overwrite existing setup?',
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.gray('\nSetup cancelled.\n'));
      return;
    }
  }

  // STEP 1: Language selection
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Select language / 언어 선택:',
      choices: [
        { name: '🇰🇷 한국어', value: 'ko' },
        { name: '🇺🇸 English', value: 'en' },
      ],
      default: options.lang || 'en',
    },
  ]);

  const lang = language as Language;

  // STEP 2: Basic project information
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: lang === 'ko' ? '프로젝트 이름:' : 'Project name:',
      default: path.basename(currentDir),
      validate: (input) => input.trim() ? true : (lang === 'ko' ? '프로젝트 이름을 입력하세요' : 'Please enter project name'),
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: lang === 'ko' ? 'GitHub 사용자명:' : 'GitHub username:',
      validate: (input) => input.trim() ? true : (lang === 'ko' ? 'GitHub 사용자명을 입력하세요' : 'Please enter GitHub username'),
    },
  ]);

  const { projectName, githubUsername } = answers;

  console.log();

  // STEP 3: Scan repositories
  const spinner = ora(lang === 'ko' ? '레포지토리 스캔 중...' : 'Scanning repositories...').start();
  const foundRepos = await scanForRepositories(currentDir);

  if (foundRepos.length === 0) {
    spinner.fail(lang === 'ko' ? '레포지토리를 찾을 수 없습니다' : 'No repositories found');
    console.log(chalk.yellow(
      lang === 'ko'
        ? '\n이 디렉토리에는 package.json, pom.xml, requirements.txt 등의 프로젝트 파일이 없습니다.'
        : '\nNo project files (package.json, pom.xml, requirements.txt, etc.) found in this directory.'
    ));
    console.log(chalk.gray(
      lang === 'ko'
        ? '멀티 레포 워크스페이스에서 실행하거나, 개별 프로젝트 폴더에서 실행하세요.\n'
        : 'Please run in a multi-repo workspace or individual project folder.\n'
    ));
    return;
  }

  spinner.succeed(
    lang === 'ko'
      ? `${foundRepos.length}개의 레포지토리 발견`
      : `Found ${foundRepos.length} repositories`
  );

  // Display found repositories
  console.log(chalk.bold(`\n${lang === 'ko' ? '📁 발견된 레포지토리:' : '📁 Discovered Repositories:'}\n`));
  foundRepos.forEach((repo) => {
    const typeLabel = lang === 'ko'
      ? { frontend: '프론트엔드', backend: '백엔드', mobile: '모바일', fullstack: '풀스택' }[repo.type]
      : repo.type;

    console.log(`  ${chalk.cyan('●')} ${chalk.bold(repo.name)} ${chalk.gray(`(${typeLabel})`)}`);
  });
  console.log();

  // STEP 3.5: Select repositories to include
  const { selectedRepos } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRepos',
      message: lang === 'ko'
        ? '포함할 레포지토리를 선택하세요:'
        : 'Select repositories to include:',
      choices: foundRepos.map(repo => {
        const typeLabel = lang === 'ko'
          ? { frontend: '프론트엔드', backend: '백엔드', mobile: '모바일', fullstack: '풀스택' }[repo.type]
          : repo.type;

        return {
          name: `${repo.name} (${typeLabel})`,
          value: repo.name,
          checked: true, // 기본적으로 모두 선택
        };
      }),
      validate: (input) => {
        if (input.length === 0) {
          return lang === 'ko'
            ? '최소 하나의 레포지토리를 선택하세요'
            : 'Please select at least one repository';
        }
        return true;
      },
    },
  ]);

  // Filter selected repositories
  const includedRepos = foundRepos.filter(repo => selectedRepos.includes(repo.name));

  console.log();
  console.log(chalk.green(`✓ ${includedRepos.length}${lang === 'ko' ? '개 레포지토리 선택됨' : ' repositories selected'}`));
  console.log();

  // STEP 4: Generate SETUP_GUIDE.md
  console.log(chalk.bold.cyan(lang === 'ko' ? '📝 설정 가이드 생성 중...\n' : '📝 Generating setup guide...\n'));

  const codeSyncerDir = path.join(currentDir, '.codesyncer');
  await fs.ensureDir(codeSyncerDir);

  // Generate repository list for SETUP_GUIDE (only selected repos)
  const repoListText = includedRepos.map(repo => {
    const typeLabel = lang === 'ko'
      ? { frontend: '프론트엔드', backend: '백엔드', mobile: '모바일', fullstack: '풀스택' }[repo.type]
      : repo.type;

    return `- **${repo.name}** (${typeLabel})
  - Path: \`./${repo.name}\`
  - ${lang === 'ko' ? 'AI가 분석할 내용' : 'To be analyzed by AI'}:
    - ${lang === 'ko' ? '기술 스택' : 'Tech stack'}
    - ${lang === 'ko' ? '프로젝트 설명' : 'Project description'}
    - ${lang === 'ko' ? '주요 기능' : 'Main features'}`;
  }).join('\n\n');

  // Load SETUP_GUIDE template
  const setupGuideTemplate = await fs.readFile(
    path.join(__dirname, '..', 'templates', lang, 'setup_guide.md'),
    'utf-8'
  );

  const today = new Date().toISOString().split('T')[0];

  const setupGuide = setupGuideTemplate
    .replace(/\[PROJECT_NAME\]/g, projectName)
    .replace(/\[GITHUB_USERNAME\]/g, githubUsername)
    .replace(/\[TODAY\]/g, today)
    .replace(/\[REPO_LIST\]/g, repoListText);

  await fs.writeFile(
    path.join(codeSyncerDir, 'SETUP_GUIDE.md'),
    setupGuide,
    'utf-8'
  );

  console.log(chalk.green('✓') + ' .codesyncer/SETUP_GUIDE.md');

  // STEP 5: Success message
  console.log(chalk.bold.green(`\n✅ ${lang === 'ko' ? 'CodeSyncer 초기화 완료!' : 'CodeSyncer initialized successfully!'}\n`));

  console.log(chalk.bold(lang === 'ko' ? '📋 생성된 파일:' : '📋 Created files:'));
  console.log(`  ${chalk.cyan('.codesyncer/SETUP_GUIDE.md')} ${chalk.gray('- AI setup instructions')}\n`);

  console.log(chalk.bold(lang === 'ko' ? '🚀 다음 단계:' : '🚀 Next steps:'));
  console.log();
  console.log(chalk.cyan('1.') + ' ' + (lang === 'ko' ? 'AI 코딩 어시스턴트 실행 (Claude Code 권장)' : 'Launch your AI coding assistant (Claude Code recommended)'));
  console.log();
  console.log(chalk.cyan('2.') + ' ' + (lang === 'ko' ? 'AI에게 다음과 같이 요청:' : 'Ask your AI assistant:'));
  console.log();
  if (lang === 'ko') {
    console.log(chalk.yellow('   ".codesyncer/SETUP_GUIDE.md 파일을 읽고 지시사항대로 설정해줘"'));
  } else {
    console.log(chalk.yellow('   "Read .codesyncer/SETUP_GUIDE.md and follow the instructions to set up"'));
  }
  console.log();
  console.log(chalk.cyan('3.') + ' ' + (lang === 'ko' ? 'AI가 대화형으로 각 레포지토리를 분석하고 문서를 생성합니다' : 'AI will interactively analyze each repository and generate documentation'));
  console.log();

  console.log(chalk.gray('─'.repeat(60)));
  console.log();
  console.log(chalk.bold(lang === 'ko' ? '💡 CodeSyncer는 프레임워크만 제공합니다' : '💡 CodeSyncer provides the framework'));
  console.log(chalk.gray(
    lang === 'ko'
      ? 'AI 어시스턴트가 실제 코드를 분석하고 문서를 생성합니다.'
      : 'Your AI assistant analyzes actual code and generates documentation.'
  ));
  console.log();
  console.log(chalk.gray(
    lang === 'ko'
      ? '현재 Claude Code에 최적화되어 있습니다 | Cursor, Copilot 향후 지원'
      : 'Currently optimized for Claude Code | Cursor, Copilot support coming soon'
  ));
  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}
