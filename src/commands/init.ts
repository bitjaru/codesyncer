import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { InitOptions, Language, MonorepoInfo } from '../types';
import { scanForRepositories, hasMasterSetup, isCurrentDirRepository, hasSingleRepoSetup, detectMonorepo, scanMonorepoPackages } from '../utils/scanner';
import { msg } from '../utils/messages';
import { getMonorepoToolName } from '../utils/monorepo-helpers';
import { getGitHubInfo } from '../utils/git-helpers';
import { displayProgress } from '../utils/progress';
import { saveSetupState, loadSetupState, clearSetupState, SetupState } from '../utils/setup-state';
import { VERSION } from '../utils/version';

export async function initCommand(options: InitOptions) {
  console.log(chalk.bold.cyan(`\n🤖 CodeSyncer v${VERSION} - AI-Powered Collaboration System\n`));
  console.log(chalk.gray('Framework provider for AI coding assistants\n'));

  const currentDir = process.cwd();

  // Check for recoverable state from previous interrupted setup
  const previousState = await loadSetupState(currentDir);
  let resumeFromState = false;

  if (previousState) {
    console.log(chalk.yellow(`\n⚠️  Previous setup was interrupted (${previousState.timestamp})\n`));
    console.log(chalk.gray(`  Project: ${previousState.projectName}`));
    console.log(chalk.gray(`  Mode: ${previousState.workspaceMode}`));
    console.log();

    const { resume } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'resume',
        message: 'Resume previous setup?',
        default: true,
      },
    ]);

    resumeFromState = resume;

    if (!resume) {
      await clearSetupState(currentDir);
    }
  }

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
  displayProgress(0, resumeFromState && previousState ? previousState.lang : 'en');

  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Select language / 언어 선택:',
      choices: [
        { name: '🇰🇷 한국어', value: 'ko' },
        { name: '🇺🇸 English', value: 'en' },
      ],
      default: resumeFromState && previousState ? previousState.lang : (options.lang || 'en'),
    },
  ]);

  const lang = language as Language;

  // STEP 2: Basic project information
  displayProgress(1, lang);

  // Auto-detect GitHub info from .git/config
  const gitInfo = await getGitHubInfo(currentDir);
  const detectedUsername = gitInfo.username;
  const detectedRepoName = gitInfo.repoName;

  if (detectedUsername) {
    console.log(chalk.green('✓') + chalk.gray(` Git remote detected: ${detectedUsername}/${detectedRepoName || '...'}`));
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: lang === 'ko' ? '프로젝트 이름:' : 'Project name:',
      default: (resumeFromState && previousState?.projectName) || detectedRepoName || path.basename(currentDir),
      validate: (input) => input.trim() ? true : (lang === 'ko' ? '프로젝트 이름을 입력하세요' : 'Please enter project name'),
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: lang === 'ko' ? 'GitHub 사용자명:' : 'GitHub username:',
      default: (resumeFromState && previousState?.githubUsername) || detectedUsername,
      validate: (input) => input.trim() ? true : (lang === 'ko' ? 'GitHub 사용자명을 입력하세요' : 'Please enter GitHub username'),
    },
  ]);

  const { projectName, githubUsername } = answers;

  // STEP 3: Check workspace type (monorepo, multi-repo, or single-repo)
  displayProgress(2, lang);

  const spinner = ora(lang === 'ko' ? '워크스페이스 스캔 중...' : 'Scanning workspace...').start();

  // First, check if it's a monorepo
  const monorepoInfo = await detectMonorepo(currentDir);

  // Determine workspace mode and save state for recovery
  const workspaceMode = monorepoInfo ? 'monorepo' : (await isCurrentDirRepository(currentDir) ? 'single' : 'multi-repo');

  // Save state for potential recovery
  await saveSetupState(currentDir, {
    step: 2,
    lang,
    projectName,
    githubUsername,
    workspaceMode,
    timestamp: new Date().toISOString(),
  });

  // === MONOREPO MODE ===
  if (monorepoInfo) {
    spinner.succeed(
      lang === 'ko'
        ? `모노레포 감지됨 (${getMonorepoToolName(monorepoInfo.tool)})`
        : `Monorepo detected (${getMonorepoToolName(monorepoInfo.tool)})`
    );

    console.log(chalk.bold.magenta(`\n${lang === 'ko' ? '📦 모노레포 모드' : '📦 Monorepo Mode'}\n`));
    console.log(chalk.gray(
      lang === 'ko'
        ? `도구: ${getMonorepoToolName(monorepoInfo.tool)} | 설정 파일: ${monorepoInfo.configFile}`
        : `Tool: ${getMonorepoToolName(monorepoInfo.tool)} | Config: ${monorepoInfo.configFile}`
    ));
    console.log(chalk.gray(
      lang === 'ko'
        ? `패턴: ${monorepoInfo.patterns.join(', ')}`
        : `Patterns: ${monorepoInfo.patterns.join(', ')}`
    ));
    console.log();

    // Scan for packages in monorepo
    const scanSpinner = ora(lang === 'ko' ? '패키지 스캔 중...' : 'Scanning packages...').start();
    const foundPackages = await scanMonorepoPackages(currentDir, monorepoInfo);
    scanSpinner.succeed(
      lang === 'ko'
        ? `${foundPackages.length}개의 패키지 발견`
        : `Found ${foundPackages.length} packages`
    );

    if (foundPackages.length === 0) {
      console.log(chalk.yellow(
        lang === 'ko'
          ? '\n워크스페이스 패턴에 해당하는 패키지를 찾을 수 없습니다.'
          : '\nNo packages found matching workspace patterns.'
      ));
      console.log(chalk.gray(
        lang === 'ko'
          ? `패턴: ${monorepoInfo.patterns.join(', ')}\n`
          : `Patterns: ${monorepoInfo.patterns.join(', ')}\n`
      ));
      return;
    }

    // Display found packages
    console.log(chalk.bold(`\n${lang === 'ko' ? '📁 발견된 패키지:' : '📁 Discovered Packages:'}\n`));
    foundPackages.forEach((pkg) => {
      const status = pkg.hasCodeSyncer
        ? chalk.green('✓')
        : chalk.gray('○');
      console.log(`  ${status} ${chalk.bold(pkg.name)} ${chalk.gray(`(${pkg.relativePath})`)}`);
    });

    // STEP 4: Select packages
    displayProgress(3, lang);

    // Select packages to include
    const { selectedPackages } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedPackages',
        message: lang === 'ko'
          ? '포함할 패키지를 선택하세요:'
          : 'Select packages to include:',
        choices: foundPackages.map(pkg => ({
          name: `${pkg.name} (${pkg.relativePath})`,
          value: pkg.name,
          checked: true,
        })),
        validate: (input) => {
          if (input.length === 0) {
            return lang === 'ko'
              ? '최소 하나의 패키지를 선택하세요'
              : 'Please select at least one package';
          }
          return true;
        },
      },
    ]);

    const includedPackages = foundPackages.filter(pkg => selectedPackages.includes(pkg.name));

    console.log();
    console.log(chalk.green(`✓ ${includedPackages.length}${lang === 'ko' ? '개 패키지 선택됨' : ' packages selected'}`));

    // STEP 5: Generate files
    displayProgress(4, lang);

    // Generate SETUP_GUIDE.md for monorepo
    console.log(chalk.bold.cyan(lang === 'ko' ? '📝 설정 가이드 생성 중...\n' : '📝 Generating setup guide...\n'));

    const codeSyncerDir = path.join(currentDir, '.codesyncer');
    await fs.ensureDir(codeSyncerDir);

    // Generate package list for SETUP_GUIDE
    const packageListText = includedPackages.map(pkg => {
      return `- **${pkg.name}** (\`${pkg.relativePath}\`)
  - ${lang === 'ko' ? 'AI가 분석할 내용' : 'To be analyzed by AI'}:
    - ${lang === 'ko' ? '프로젝트 유형 (프론트엔드/백엔드/모바일/풀스택/라이브러리)' : 'Project type (frontend/backend/mobile/fullstack/library)'}
    - ${lang === 'ko' ? '기술 스택' : 'Tech stack'}
    - ${lang === 'ko' ? '패키지 설명' : 'Package description'}
    - ${lang === 'ko' ? '내부 의존성' : 'Internal dependencies'}`;
    }).join('\n\n');

    // Load monorepo SETUP_GUIDE template (use setup_guide.md as base, we'll create monorepo-specific one)
    let setupGuideTemplate: string;
    try {
      setupGuideTemplate = await fs.readFile(
        path.join(__dirname, '..', 'templates', lang, 'setup_guide_monorepo.md'),
        'utf-8'
      );
    } catch {
      // Fallback to regular setup_guide.md if monorepo template doesn't exist
      setupGuideTemplate = await fs.readFile(
        path.join(__dirname, '..', 'templates', lang, 'setup_guide.md'),
        'utf-8'
      );
    }

    const today = new Date().toISOString().split('T')[0];

    const setupGuide = setupGuideTemplate
      .replace(/\[PROJECT_NAME\]/g, projectName)
      .replace(/\[GITHUB_USERNAME\]/g, githubUsername)
      .replace(/\[TODAY\]/g, today)
      .replace(/\[REPO_LIST\]/g, packageListText)
      .replace(/\[MONOREPO_TOOL\]/g, getMonorepoToolName(monorepoInfo.tool))
      .replace(/\[WORKSPACE_PATTERNS\]/g, monorepoInfo.patterns.join(', '));

    await fs.writeFile(
      path.join(codeSyncerDir, 'SETUP_GUIDE.md'),
      setupGuide,
      'utf-8'
    );

    console.log(chalk.green('✓') + ' .codesyncer/SETUP_GUIDE.md');

    // Complete! Clear recovery state
    await clearSetupState(currentDir);
    displayProgress(5, lang);

    // Success message for monorepo mode
    console.log(chalk.bold.green(`✅ ${lang === 'ko' ? 'CodeSyncer 초기화 완료! (모노레포 모드)' : 'CodeSyncer initialized! (Monorepo Mode)'}\n`));

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
    console.log(chalk.cyan('3.') + ' ' + (lang === 'ko' ? 'AI가 각 패키지를 분석하고 문서를 생성합니다' : 'AI will analyze each package and generate documentation'));
    console.log();

    console.log(chalk.gray('─'.repeat(60)));
    console.log();
    console.log(chalk.bold(lang === 'ko' ? '💡 모노레포 모드 정보' : '💡 Monorepo Mode Info'));
    console.log(chalk.gray(
      lang === 'ko'
        ? `• 모노레포 도구: ${getMonorepoToolName(monorepoInfo.tool)}`
        : `• Monorepo tool: ${getMonorepoToolName(monorepoInfo.tool)}`
    ));
    console.log(chalk.gray(
      lang === 'ko'
        ? '• 각 패키지에 .claude/ 폴더가 생성됩니다'
        : '• Each package will have its own .claude/ folder'
    ));
    console.log(chalk.gray(
      lang === 'ko'
        ? '• 패키지 간 의존성이 문서화됩니다'
        : '• Inter-package dependencies will be documented'
    ));
    console.log();
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    return;
  }

  // Check current directory - if it's a repo (not monorepo), use single-repo mode
  const isCurrentDirRepo = await isCurrentDirRepository(currentDir);

  // === SINGLE-REPO MODE === (current directory IS a repository)
  if (isCurrentDirRepo) {
    spinner.succeed(
      lang === 'ko'
        ? '단일 레포지토리 감지됨'
        : 'Single repository detected'
    );

    console.log(chalk.bold.yellow(`\n${lang === 'ko' ? '📦 단일 레포지토리 모드' : '📦 Single Repository Mode'}\n`));
    console.log(chalk.gray(
      lang === 'ko'
        ? `현재 디렉토리 "${path.basename(currentDir)}"를 단일 레포지토리로 설정합니다.`
        : `Setting up "${path.basename(currentDir)}" as a single repository.`
    ));
    console.log();

    // Check if single-repo setup already exists
    if (await hasSingleRepoSetup(currentDir)) {
      console.log(chalk.yellow(
        lang === 'ko'
          ? '⚠️  이 레포지토리에는 이미 .claude/ 설정이 있습니다.'
          : '⚠️  This repository already has .claude/ setup.'
      ));
      const { overwriteSingle } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwriteSingle',
          message: lang === 'ko' ? '기존 설정을 덮어쓰시겠습니까?' : 'Overwrite existing setup?',
          default: false,
        },
      ]);

      if (!overwriteSingle) {
        console.log(chalk.gray(lang === 'ko' ? '\n설정이 취소되었습니다.\n' : '\nSetup cancelled.\n'));
        return;
      }
    }

    // Single-repo: skip select step, go directly to generate
    displayProgress(4, lang);

    // Generate single-repo SETUP_GUIDE.md
    console.log(chalk.bold.cyan(lang === 'ko' ? '📝 설정 가이드 생성 중...\n' : '📝 Generating setup guide...\n'));

    const claudeDir = path.join(currentDir, '.claude');
    await fs.ensureDir(claudeDir);

    // Load single-repo SETUP_GUIDE template
    const setupGuideTemplate = await fs.readFile(
      path.join(__dirname, '..', 'templates', lang, 'setup_guide_single.md'),
      'utf-8'
    );

    const today = new Date().toISOString().split('T')[0];

    const setupGuide = setupGuideTemplate
      .replace(/\[PROJECT_NAME\]/g, projectName)
      .replace(/\[GITHUB_USERNAME\]/g, githubUsername)
      .replace(/\[TODAY\]/g, today);

    await fs.writeFile(
      path.join(claudeDir, 'SETUP_GUIDE.md'),
      setupGuide,
      'utf-8'
    );

    console.log(chalk.green('✓') + ' .claude/SETUP_GUIDE.md');

    // Complete! Clear recovery state
    await clearSetupState(currentDir);
    displayProgress(5, lang);

    // Success message for single-repo mode
    console.log(chalk.bold.green(`✅ ${lang === 'ko' ? 'CodeSyncer 초기화 완료! (단일 레포 모드)' : 'CodeSyncer initialized! (Single Repo Mode)'}\n`));

    console.log(chalk.bold(lang === 'ko' ? '📋 생성된 파일:' : '📋 Created files:'));
    console.log(`  ${chalk.cyan('.claude/SETUP_GUIDE.md')} ${chalk.gray('- AI setup instructions')}\n`);

    console.log(chalk.bold(lang === 'ko' ? '🚀 다음 단계:' : '🚀 Next steps:'));
    console.log();
    console.log(chalk.cyan('1.') + ' ' + (lang === 'ko' ? 'AI 코딩 어시스턴트 실행 (Claude Code 권장)' : 'Launch your AI coding assistant (Claude Code recommended)'));
    console.log();
    console.log(chalk.cyan('2.') + ' ' + (lang === 'ko' ? 'AI에게 다음과 같이 요청:' : 'Ask your AI assistant:'));
    console.log();
    if (lang === 'ko') {
      console.log(chalk.yellow('   ".claude/SETUP_GUIDE.md 파일을 읽고 지시사항대로 설정해줘"'));
    } else {
      console.log(chalk.yellow('   "Read .claude/SETUP_GUIDE.md and follow the instructions to set up"'));
    }
    console.log();
    console.log(chalk.cyan('3.') + ' ' + (lang === 'ko' ? 'AI가 레포지토리를 분석하고 문서를 생성합니다' : 'AI will analyze the repository and generate documentation'));
    console.log();

    console.log(chalk.gray('─'.repeat(60)));
    console.log();
    console.log(chalk.bold(lang === 'ko' ? '💡 단일 레포 모드 정보' : '💡 Single Repo Mode Info'));
    console.log(chalk.gray(
      lang === 'ko'
        ? '• 모든 설정 파일이 .claude/ 폴더에 생성됩니다'
        : '• All config files will be created in .claude/ folder'
    ));
    console.log(chalk.gray(
      lang === 'ko'
        ? '• 멀티 레포가 필요하면 상위 폴더에서 init을 실행하세요'
        : '• For multi-repo, run init in a parent workspace folder'
    ));
    console.log();
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    return;
  }

  // === MULTI-REPO MODE === (current directory is NOT a repository, scan subdirectories)
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
    console.log(`  ${chalk.cyan('●')} ${chalk.bold(repo.name)}`);
  });

  // STEP 4: Select repositories
  displayProgress(3, lang);

  // Select repositories to include
  const { selectedRepos } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRepos',
      message: lang === 'ko'
        ? '포함할 레포지토리를 선택하세요:'
        : 'Select repositories to include:',
      choices: foundRepos.map(repo => {
        return {
          name: repo.name,
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

  // STEP 5: Generate files
  displayProgress(4, lang);

  // Generate SETUP_GUIDE.md
  console.log(chalk.bold.cyan(lang === 'ko' ? '📝 설정 가이드 생성 중...\n' : '📝 Generating setup guide...\n'));

  const codeSyncerDir = path.join(currentDir, '.codesyncer');
  await fs.ensureDir(codeSyncerDir);

  // Generate repository list for SETUP_GUIDE (only selected repos)
  const repoListText = includedRepos.map(repo => {
    return `- **${repo.name}**
  - Path: \`./${repo.name}\`
  - ${lang === 'ko' ? 'AI가 분석할 내용' : 'To be analyzed by AI'}:
    - ${lang === 'ko' ? '프로젝트 유형 (프론트엔드/백엔드/모바일/풀스택)' : 'Project type (frontend/backend/mobile/fullstack)'}
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

  // Complete! Clear recovery state
  await clearSetupState(currentDir);
  displayProgress(5, lang);

  // Success message
  console.log(chalk.bold.green(`✅ ${lang === 'ko' ? 'CodeSyncer 초기화 완료!' : 'CodeSyncer initialized successfully!'}\n`));

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

