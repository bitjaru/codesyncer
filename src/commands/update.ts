import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { UpdateOptions, Language, RepositoryInfo } from '../types';
import { scanForRepositories, hasMasterSetup, detectMonorepo, scanMonorepoPackages } from '../utils/scanner';
import { getMonorepoToolName } from '../utils/monorepo-helpers';
import {
  scanTemplateVersions,
  getOutdatedTemplates,
  TemplateStatus,
  getCurrentVersion,
} from '../utils/template-version';
import {
  upgradeTemplatesWithSmartMerge,
  getTemplateVarsFromContext,
  formatUpgradeSummary,
  UpgradeResult,
} from '../utils/template-upgrader';

export async function updateCommand(options: UpdateOptions) {
  const isDryRun = options.dryRun || false;

  if (isDryRun) {
    console.log(chalk.bold.yellow('\n🔍 CodeSyncer - Update (DRY RUN)\n'));
    console.log(chalk.gray('No files will be modified. This is a preview of changes.\n'));
  } else {
    console.log(chalk.bold.cyan('\n🔄 CodeSyncer - Update\n'));
  }

  const currentDir = process.cwd();

  // Check if master setup exists
  if (!(await hasMasterSetup(currentDir))) {
    console.log(chalk.red('✗ No CodeSyncer setup found.'));
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

  // Show detected language and offer to change
  const { confirmLang } = await inquirer.prompt([
    {
      type: 'list',
      name: 'confirmLang',
      message: `Detected language: ${lang === 'ko' ? '한국어 (Korean)' : 'English'}. Continue?`,
      choices: [
        { name: 'Yes', value: 'yes' },
        { name: 'Change language', value: 'change' },
      ],
      default: 'yes',
    },
  ]);

  if (confirmLang === 'change') {
    const { newLang } = await inquirer.prompt([
      {
        type: 'list',
        name: 'newLang',
        message: 'Select language:',
        choices: [
          { name: 'English', value: 'en' },
          { name: '한국어 (Korean)', value: 'ko' },
        ],
      },
    ]);
    lang = newLang;
  }

  console.log();

  // Ask user for update mode (unless --hard flag is provided)
  let isHardUpdate = options.hard || false;

  if (!options.hard) {
    const { updateMode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'updateMode',
        message: 'Update mode:',
        choices: [
          {
            name: '📝 Normal - Missing files only',
            value: 'normal',
          },
          {
            name: '🔍 Deep - Review all files',
            value: 'hard',
          },
        ],
        default: 'normal',
      },
    ]);

    isHardUpdate = updateMode === 'hard';
  }

  if (isHardUpdate) {
    console.log(chalk.bold.blue('\n🔍 Deep scan mode\n'));
  }

  const spinner = ora('Scanning...').start();

  // Check if it's a monorepo first
  const monorepoInfo = await detectMonorepo(currentDir);
  let foundRepos: RepositoryInfo[];

  if (monorepoInfo) {
    // Monorepo mode: scan packages
    foundRepos = await scanMonorepoPackages(currentDir, monorepoInfo);
    spinner.succeed(
      lang === 'ko'
        ? `모노레포 감지됨 (${foundRepos.length}개 패키지)`
        : `Monorepo detected (${foundRepos.length} packages)`
    );
    console.log(chalk.gray(
      lang === 'ko'
        ? `  도구: ${getMonorepoToolName(monorepoInfo.tool)}`
        : `  Tool: ${getMonorepoToolName(monorepoInfo.tool)}`
    ));
  } else {
    // Multi-repo mode: scan subdirectories
    foundRepos = await scanForRepositories(currentDir);
    spinner.succeed('Scan complete');
  }

  // Check each repository for missing .claude files
  const requiredFiles = ['CLAUDE.md', 'ARCHITECTURE.md', 'COMMENT_GUIDE.md', 'DECISIONS.md'];
  const reposNeedingSetup: { repo: string; missingFiles: string[] }[] = [];

  for (const repo of foundRepos) {
    const claudeDir = path.join(repo.path, '.claude');
    const missingFiles: string[] = [];

    // Check if .claude directory exists
    if (!(await fs.pathExists(claudeDir))) {
      missingFiles.push(...requiredFiles);
    } else {
      // Check each required file
      for (const file of requiredFiles) {
        const filePath = path.join(claudeDir, file);
        if (!(await fs.pathExists(filePath))) {
          missingFiles.push(file);
        }
      }
    }

    if (missingFiles.length > 0) {
      reposNeedingSetup.push({ repo: repo.name, missingFiles });
    }
  }

  spinner.succeed('Scan complete');

  // Check if root CLAUDE.md exists
  const rootClaudePath = path.join(currentDir, 'CLAUDE.md');
  const hasRootClaude = await fs.pathExists(rootClaudePath);

  // Display changes (Hard update always requires work)
  const hasChanges = reposNeedingSetup.length > 0 || !hasRootClaude || isHardUpdate;

  if (!hasChanges) {
    console.log(chalk.green('\n✓ Everything is up to date!\n'));
    console.log(chalk.gray(`  Total repositories: ${foundRepos.length}`));
    console.log(chalk.gray(`  With CodeSyncer: ${foundRepos.filter((r) => r.hasCodeSyncer).length}\n`));
    return;
  }

  console.log(chalk.bold('\n📊 Scan Results:\n'));

  // Show repository summary
  console.log(chalk.cyan(`  Total repositories: ${foundRepos.length}`));
  console.log();

  if (isHardUpdate) {
    // Hard update mode: Show all repositories
    console.log(chalk.bold.blue(`  🔍 Deep mode - All repositories will be reviewed:`));
    console.log();
    foundRepos.forEach((repo) => {
      const needsSetup = reposNeedingSetup.find(r => r.repo === repo.name);
      if (needsSetup) {
        console.log(chalk.yellow(`    📁 ${repo.name}: ${chalk.red(`${needsSetup.missingFiles.length} missing`)}`));
        needsSetup.missingFiles.forEach((file) => {
          console.log(chalk.gray(`      ✗ .claude/${file}`));
        });
      } else {
        console.log(chalk.cyan(`    📁 ${repo.name}: ${chalk.green('✓ Setup')} ${chalk.gray('(needs review)')}`));
      }
    });
    console.log();
  } else {
    // Normal update mode: Show only repos needing setup
    if (reposNeedingSetup.length > 0) {
      console.log(chalk.bold.yellow(`  ⚠️  ${reposNeedingSetup.length} repo(s) with missing files:`));
      reposNeedingSetup.forEach(({ repo, missingFiles }) => {
        const allMissing = missingFiles.length === requiredFiles.length;
        if (allMissing) {
          console.log(chalk.gray(`    📁 ${repo}: ${chalk.red('No CodeSyncer')}`));
        } else {
          console.log(chalk.gray(`    📁 ${repo}:`));
          missingFiles.forEach((file) => {
            console.log(chalk.gray(`      ✗ .claude/${file}`));
          });
        }
      });
      console.log();
    }

    // Show fully configured repos
    const fullyConfiguredRepos = foundRepos.filter(
      repo => !reposNeedingSetup.find(r => r.repo === repo.name)
    );
    if (fullyConfiguredRepos.length > 0) {
      console.log(chalk.green(`  ✓ ${fullyConfiguredRepos.length} repo(s) fully configured`));
      console.log();
    }
  }

  // Check and create root CLAUDE.md if missing
  if (!hasRootClaude) {
    console.log(chalk.bold.yellow('\n⚠️  Missing root CLAUDE.md\n'));
    console.log(chalk.gray('Allows AI to auto-load context at session start.\n'));

    const { createRootClaude } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'createRootClaude',
        message: 'Create root CLAUDE.md?',
        default: true,
      },
    ]);

    if (createRootClaude) {
      if (isDryRun) {
        // Dry run: just show what would be created
        console.log(chalk.yellow(`  [DRY RUN] Would create: ${rootClaudePath}`));
        console.log(chalk.gray('  Content: Root CLAUDE.md with project context\n'));
      } else {
        const spinner = ora('Creating...').start();

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

          spinner.succeed('Root CLAUDE.md created!');
          console.log(chalk.green(`  ✓ ${rootClaudePath}\n`));
          console.log(chalk.cyan('💡 AI will auto-load context at session start!\n'));

        // Show next steps for AI
        console.log(chalk.bold('\n🤖 Next Steps:'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log();
        console.log(chalk.bold('Option 1) Start a new AI session'));
        console.log(chalk.gray('  Auto-loads root CLAUDE.md'));
        console.log();
        console.log(chalk.bold('Option 2) Apply now'));
        console.log(chalk.yellow('  Tell AI: "Read CLAUDE.md"'));
        console.log();
        console.log(chalk.gray('─'.repeat(50)));
        console.log();
        } catch (error) {
          spinner.fail('Failed to create root CLAUDE.md');
          console.error(chalk.red(`Error: ${error}\n`));
        }
      }
    }
  }

  // Generate UPDATE_GUIDE.md if there are repos needing setup OR if hard update
  const needsUpdateGuide = reposNeedingSetup.length > 0 || isHardUpdate;

  if (needsUpdateGuide) {
    if (reposNeedingSetup.length > 0 && !isHardUpdate) {
      console.log(chalk.bold.yellow('\n⚠️  Some repos have missing files\n'));
    }

    if (isHardUpdate) {
      console.log(chalk.bold.blue('\n🔍 Deep mode: Review all files\n'));
    }

    const { generateUpdateGuide } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'generateUpdateGuide',
        message: 'Generate UPDATE_GUIDE.md for AI?',
        default: true,
      },
    ]);

    if (generateUpdateGuide) {
      const updateGuidePath = path.join(currentDir, '.codesyncer', 'UPDATE_GUIDE.md');

      if (isDryRun) {
        // Dry run: just show what would be created
        console.log(chalk.yellow(`  [DRY RUN] Would create: ${updateGuidePath}`));
        console.log(chalk.gray(`  Content: UPDATE_GUIDE.md with ${reposNeedingSetup.length} repos to update`));
        if (isHardUpdate) {
          console.log(chalk.gray('  Mode: Hard update (review all files)'));
        }
        console.log();
      } else {
        const spinner = ora('Creating UPDATE_GUIDE...').start();

        try {
          const today = new Date().toISOString().split('T')[0];

        // Extract project info
        let projectName = path.basename(currentDir);
        try {
          const masterPath = path.join(currentDir, '.codesyncer', 'MASTER_CODESYNCER.md');
          const masterContent = await fs.readFile(masterPath, 'utf-8');
          const nameMatch = masterContent.match(/프로젝트[:\s]*([^\n]+)|Project[:\s]*([^\n]+)/i);
          if (nameMatch) projectName = (nameMatch[1] || nameMatch[2]).trim();
        } catch {
          // Use default
        }

        // Generate update guide content
        let updateGuide = '';

        if (lang === 'ko') {
          updateGuide = `# UPDATE_GUIDE.md - CodeSyncer 업데이트 작업

> **AI 어시스턴트용**: 이 문서의 지시사항을 따라 ${isHardUpdate ? '모든 파일을 스캔하고 업데이트하세요' : '누락된 파일들을 생성하세요'}.
>
> **프로젝트**: ${projectName}
> **업데이트 날짜**: ${today}
> **업데이트 모드**: ${isHardUpdate ? '🔍 하드 업데이트' : '📝 일반 업데이트'}

---

${isHardUpdate ? `
## 🔍 하드 업데이트 모드

**모든 레포지토리의 기존 파일들을 스캔하고 업데이트합니다:**

### 작업 목록

1. **각 레포지토리의 .claude/ 폴더 스캔**
2. **기존 파일 분석 및 업데이트:**
   - \`ARCHITECTURE.md\` - 최신 폴더 구조 반영 (새 파일/폴더 추가 여부 확인)
   - \`CLAUDE.md\` - 새로운 패턴/규칙 발견 시 추가
   - \`COMMENT_GUIDE.md\` - 템플릿 최신 버전과 비교
   - \`DECISIONS.md\` - 형식 검증 (누락 없는지 확인)
3. **누락된 파일 생성** (아래 목록 참고)

---
` : ''}

## 📋 레포지토리 목록 및 작업

${isHardUpdate ? `
**모든 레포지토리 (${foundRepos.length}개):**

${foundRepos.map(repo => {
  const needsSetup = reposNeedingSetup.find(r => r.repo === repo.name);
  const missingFiles = needsSetup ? needsSetup.missingFiles : [];

  return `
### 📁 ${repo.name}/

${missingFiles.length > 0 ? `
**⚠️ 누락된 파일:**
${missingFiles.map(f => `- \`.claude/${f}\``).join('\n')}
` : '**✓ 모든 필수 파일 존재**'}

**🔍 하드 업데이트 작업:**
1. \`${repo.name}/.claude/\` 폴더로 이동
2. **기존 파일 스캔 및 업데이트:**
   - \`ARCHITECTURE.md\`: 최신 폴더 구조 반영
     - 새 파일/폴더 추가되었는지 확인
     - 파일 통계 업데이트 (총 파일 수, 코드 라인 수 등)
   - \`CLAUDE.md\`: 새로운 패턴/규칙 추가
     - 반복되는 코드 패턴 발견 시 템플릿으로 추가
     - 새로운 코딩 규칙 발견 시 추가
   - \`COMMENT_GUIDE.md\`: 템플릿 최신 버전 확인
   - \`DECISIONS.md\`: 형식 검증
${missingFiles.length > 0 ? `3. **누락된 파일 생성:**
${missingFiles.map(f => `   - \`.claude/${f}\``).join('\n')}
` : ''}
**중요 원칙:**
- ❌ **절대 추론 금지**: 비즈니스 로직 수치, API URL, 보안 설정
- ✅ **반드시 질문**: 알 수 없는 정보는 사용자에게 확인
- ✅ **실제 코드 읽기**: 추측하지 말고 실제 파일 내용 확인
- ✅ **사용자 확인**: 업데이트 전에 변경사항 보여주고 확인 받기
`;
}).join('\n---\n')}
` : `
**누락된 파일이 있는 레포지토리:**

${reposNeedingSetup.map(({ repo, missingFiles }) => `
### 📁 ${repo}/

**누락된 파일:**
${missingFiles.map(f => `- \`.claude/${f}\``).join('\n')}

**작업:**
1. \`${repo}/.claude/\` 폴더로 이동
2. 레포지토리 분석:
   - 실제 파일 구조 스캔
   - package.json 또는 의존성 파일 읽기
   - 코드 패턴 확인
   - 프로젝트 타입 파악 (frontend/backend/mobile/fullstack)
3. 누락된 각 파일 생성:
${missingFiles.map(f => `   - **${f}**: \`../templates/ko/${f.toLowerCase().replace('.md', '_template.md')}\` 참고`).join('\n')}

**중요 원칙:**
- ❌ **절대 추론 금지**: 비즈니스 로직 수치, API URL, 보안 설정
- ✅ **반드시 질문**: 알 수 없는 정보는 사용자에게 확인
- ✅ **실제 코드 읽기**: 추측하지 말고 실제 파일 내용 확인
`).join('\n---\n')}
`}

---

## 🚀 작업 순서

${isHardUpdate ? `
### 하드 업데이트 작업 흐름:

각 레포지토리마다:

**1단계: 기존 파일 스캔**
\`\`\`
"${foundRepos[0]?.name} 레포지토리의 .claude/ 폴더 스캔해줘"
\`\`\`

**2단계: 변경사항 분석**
- ARCHITECTURE.md의 폴더 구조와 실제 폴더 구조 비교
- 새 파일/폴더 추가 여부 확인
- 파일 통계 재계산

**3단계: 사용자에게 변경사항 제시**
\`\`\`
발견된 변경사항:
- 새 파일 10개 추가됨
- src/new-feature/ 폴더 추가됨
- 총 파일 수: 150 → 160

이 내용을 ARCHITECTURE.md에 반영할까요?
\`\`\`

**4단계: 승인 후 업데이트**
사용자 확인 받은 후 파일 업데이트

**5단계: 누락된 파일 생성** (있는 경우)
` : `
### 일반 업데이트 작업 흐름:

각 레포지토리마다:

**1단계: 레포지토리 분석**
\`\`\`
"${reposNeedingSetup[0]?.repo || foundRepos[0]?.name} 레포지토리 분석해줘"
\`\`\`

**2단계: 사용자 확인**
분석 결과를 제시하고 사용자 확인:
- 프로젝트 타입이 맞나요?
- 기술 스택이 정확한가요?
- 주요 기능이 빠진 게 없나요?

**3단계: 누락된 파일 생성**
확인 후 누락된 파일들 생성:
- CLAUDE.md - 코딩 규칙
- ARCHITECTURE.md - 프로젝트 구조
- COMMENT_GUIDE.md - 주석 가이드
- DECISIONS.md - 의논 기록

**4단계: 검증**
\`\`\`bash
ls ${reposNeedingSetup[0]?.repo || foundRepos[0]?.name}/.claude/
\`\`\`

모든 파일이 생성되었는지 확인
`}

---

## 💡 템플릿 위치

필요한 템플릿 파일들:
- \`src/templates/ko/claude.md\`
- \`src/templates/ko/architecture.md\`
- \`src/templates/ko/comment_guide.md\`
- \`src/templates/ko/decisions.md\`

**주의**: 템플릿의 플레이스홀더 ([PROJECT_NAME], [TECH_STACK] 등)를 실제 값으로 교체하세요!

---

## ✅ 완료 조건

모든 레포지토리에서:
- \`.claude/\` 폴더 존재
- 4개 필수 파일 모두 생성
- 각 파일에 실제 프로젝트 정보 반영
- 플레이스홀더 없음

---

## 🗑️ 작업 완료 후

모든 누락된 파일을 생성했다면:

\`\`\`
"UPDATE_GUIDE.md 삭제해줘"
\`\`\`

또는 직접 삭제:
\`\`\`bash
rm .codesyncer/UPDATE_GUIDE.md
\`\`\`

---

**이 파일은 \`codesyncer update\`에 의해 자동 생성되었습니다.**
**작업 완료 후 이 파일은 삭제됩니다.**
`;
        } else {
          updateGuide = `# UPDATE_GUIDE.md - CodeSyncer Update Tasks

> **For AI Assistant**: Follow the instructions in this document to ${isHardUpdate ? 'scan and update all files' : 'generate missing files'}.
>
> **Project**: ${projectName}
> **Update Date**: ${today}
> **Update Mode**: ${isHardUpdate ? '🔍 Hard Update' : '📝 Normal Update'}

---

${isHardUpdate ? `
## 🔍 Hard Update Mode

**Scan and update all existing files in every repository:**

### Task List

1. **Scan each repository's .claude/ folder**
2. **Analyze and update existing files:**
   - \`ARCHITECTURE.md\` - Reflect latest folder structure (check for new files/folders)
   - \`CLAUDE.md\` - Add new patterns/rules when discovered
   - \`COMMENT_GUIDE.md\` - Compare with latest template version
   - \`DECISIONS.md\` - Validate format (check for missing entries)
3. **Generate missing files** (see list below)

---
` : ''}

## 📋 Repository List and Tasks

${isHardUpdate ? `
**All Repositories (${foundRepos.length}):**

${foundRepos.map(repo => {
  const needsSetup = reposNeedingSetup.find(r => r.repo === repo.name);
  const missingFiles = needsSetup ? needsSetup.missingFiles : [];

  return `
### 📁 ${repo.name}/

${missingFiles.length > 0 ? `
**⚠️ Missing Files:**
${missingFiles.map(f => `- \`.claude/${f}\``).join('\n')}
` : '**✓ All Required Files Exist**'}

**🔍 Hard Update Tasks:**
1. Navigate to \`${repo.name}/.claude/\`
2. **Scan and update existing files:**
   - \`ARCHITECTURE.md\`: Reflect latest folder structure
     - Check if new files/folders added
     - Update file statistics (total files, lines of code, etc.)
   - \`CLAUDE.md\`: Add new patterns/rules
     - Add repeated code patterns as templates
     - Add newly discovered coding rules
   - \`COMMENT_GUIDE.md\`: Check latest template version
   - \`DECISIONS.md\`: Validate format
${missingFiles.length > 0 ? `3. **Generate missing files:**
${missingFiles.map(f => `   - \`.claude/${f}\``).join('\n')}
` : ''}
**Important Principles:**
- ❌ **Never Infer**: Business logic numbers, API URLs, security settings
- ✅ **Always Ask**: Confirm unknown information with user
- ✅ **Read Actual Code**: Don't guess, read actual file contents
- ✅ **User Confirmation**: Show changes and get approval before updating
`;
}).join('\n---\n')}
` : `
**Repositories with Missing Files:**

${reposNeedingSetup.map(({ repo, missingFiles }) => `
### 📁 ${repo}/

**Missing files:**
${missingFiles.map(f => `- \`.claude/${f}\``).join('\n')}

**Tasks:**
1. Navigate to \`${repo}/.claude/\`
2. Analyze repository:
   - Scan actual file structure
   - Read package.json or dependency files
   - Check code patterns
   - Identify project type (frontend/backend/mobile/fullstack)
3. Generate each missing file:
${missingFiles.map(f => `   - **${f}**: Reference \`../templates/en/${f.toLowerCase().replace('.md', '_template.md')}\``).join('\n')}

**Important Principles:**
- ❌ **Never Infer**: Business logic numbers, API URLs, security settings
- ✅ **Always Ask**: Confirm unknown information with user
- ✅ **Read Actual Code**: Don't guess, read actual file contents
`).join('\n---\n')}
`}

---

## 🚀 Workflow

${isHardUpdate ? `
### Hard Update Workflow:

For each repository:

**Step 1: Scan Existing Files**
\`\`\`
"Scan ${foundRepos[0]?.name} repository's .claude/ folder"
\`\`\`

**Step 2: Analyze Changes**
- Compare ARCHITECTURE.md folder structure with actual folder structure
- Check for new files/folders added
- Recalculate file statistics

**Step 3: Present Changes to User**
\`\`\`
Changes detected:
- 10 new files added
- src/new-feature/ folder added
- Total files: 150 → 160

Update ARCHITECTURE.md with these changes?
\`\`\`

**Step 4: Update After Approval**
Update files after user confirmation

**Step 5: Generate Missing Files** (if any)
` : `
### Normal Update Workflow:

For each repository:

**Step 1: Analyze Repository**
\`\`\`
"Analyze ${reposNeedingSetup[0]?.repo || foundRepos[0]?.name} repository"
\`\`\`

**Step 2: User Confirmation**
Present analysis results and confirm with user:
- Is the project type correct?
- Is the tech stack accurate?
- Are there any missing main features?

**Step 3: Generate Missing Files**
After confirmation, create missing files:
- CLAUDE.md - Coding rules
- ARCHITECTURE.md - Project structure
- COMMENT_GUIDE.md - Comment guide
- DECISIONS.md - Decision log

**Step 4: Verification**
\`\`\`bash
ls ${reposNeedingSetup[0]?.repo || foundRepos[0]?.name}/.claude/
\`\`\`

Verify all files are created
`}

---

## 💡 Template Locations

Required template files:
- \`src/templates/en/claude.md\`
- \`src/templates/en/architecture.md\`
- \`src/templates/en/comment_guide.md\`
- \`src/templates/en/decisions.md\`

**Note**: Replace template placeholders ([PROJECT_NAME], [TECH_STACK], etc.) with actual values!

---

## ✅ Completion Criteria

For all repositories:
- \`.claude/\` folder exists
- All 4 required files created
- Each file reflects actual project information
- No placeholders remaining

---

## 🗑️ After Completion

Once all missing files are generated:

\`\`\`
"Delete UPDATE_GUIDE.md"
\`\`\`

Or delete manually:
\`\`\`bash
rm .codesyncer/UPDATE_GUIDE.md
\`\`\`

---

**This file was automatically generated by \`codesyncer update\`.**
**This file will be deleted after tasks are completed.**
`;
        }

        // Delete existing UPDATE_GUIDE.md if exists (always create fresh)
        if (await fs.pathExists(updateGuidePath)) {
          await fs.remove(updateGuidePath);
        }

        await fs.writeFile(updateGuidePath, updateGuide, 'utf-8');

        spinner.succeed('UPDATE_GUIDE.md created!');
        console.log(chalk.green(`  ✓ ${updateGuidePath}\n`));
        console.log(chalk.gray('  💡 Delete after tasks complete\n'));

        // Show instructions
        console.log(chalk.bold('\n🤖 Next Steps:'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log();
        console.log(chalk.yellow('  "Read .codesyncer/UPDATE_GUIDE.md and follow instructions"'));
        console.log();
        console.log(chalk.gray('  ✓ After: "Delete UPDATE_GUIDE.md"'));
        console.log();
        console.log(chalk.gray('─'.repeat(50)));
        console.log();
        } catch (error) {
          spinner.fail('Failed to create UPDATE_GUIDE.md');
          console.error(chalk.red(`Error: ${error}\n`));
        }
      }
    }
  }

  // Template Upgrade Check
  await checkAndOfferTemplateUpgrade(currentDir, foundRepos, lang, isDryRun);

  if (isDryRun) {
    console.log(chalk.bold.yellow('\n✅ Dry run complete! No files were modified.\n'));
    console.log(chalk.gray('Run without --dry-run to apply changes.\n'));
  } else {
    console.log(chalk.bold.green('\n✅ Update complete!\n'));
  }
}

/**
 * Check for outdated templates and offer upgrade option
 *
 * @codesyncer-context Template upgrade feature - checks version metadata in files
 * @codesyncer-decision [2026-01-17] Backup files before upgrade for user safety
 */
async function checkAndOfferTemplateUpgrade(
  currentDir: string,
  repos: RepositoryInfo[],
  lang: Language,
  isDryRun: boolean
): Promise<void> {
  const currentVersion = getCurrentVersion();

  // Collect all outdated templates across all repos
  const allOutdated: { repo: string; claudeDir: string; templates: TemplateStatus[] }[] = [];

  for (const repo of repos) {
    const claudeDir = path.join(repo.path, '.claude');
    if (await fs.pathExists(claudeDir)) {
      const outdated = await getOutdatedTemplates(claudeDir);
      if (outdated.length > 0) {
        allOutdated.push({
          repo: repo.name,
          claudeDir,
          templates: outdated,
        });
      }
    }
  }

  // Also check root .claude if it exists (for single repo setup)
  const rootClaudeDir = path.join(currentDir, '.claude');
  if (await fs.pathExists(rootClaudeDir)) {
    const rootOutdated = await getOutdatedTemplates(rootClaudeDir);
    if (rootOutdated.length > 0) {
      // Avoid duplicates
      const alreadyIncluded = allOutdated.some((o) => o.claudeDir === rootClaudeDir);
      if (!alreadyIncluded) {
        allOutdated.push({
          repo: path.basename(currentDir),
          claudeDir: rootClaudeDir,
          templates: rootOutdated,
        });
      }
    }
  }

  if (allOutdated.length === 0) {
    return; // No outdated templates found
  }

  // Count total outdated files
  const totalOutdated = allOutdated.reduce((sum, o) => sum + o.templates.length, 0);

  // Display upgrade notification
  console.log(chalk.bold.blue('\n📦 ' + (lang === 'ko' ? '새 버전 감지' : 'New Version Detected') + `: v${currentVersion}\n`));

  // Show outdated files grouped by repo
  allOutdated.forEach(({ repo, templates }) => {
    console.log(chalk.yellow(`  📁 ${repo}/`));
    templates.forEach((t) => {
      const fileName = path.basename(t.file);
      const versionInfo = t.currentVersion
        ? `v${t.currentVersion} → v${t.latestVersion}`
        : `(${lang === 'ko' ? '버전 없음' : 'no version'}) → v${t.latestVersion}`;
      console.log(chalk.gray(`     • ${fileName} (${versionInfo})`));
    });
  });
  console.log();

  // Prompt for upgrade
  const { upgradeChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'upgradeChoice',
      message: lang === 'ko'
        ? `${totalOutdated}개 템플릿을 업그레이드할까요?`
        : `Upgrade ${totalOutdated} template(s)?`,
      choices: [
        {
          name: lang === 'ko'
            ? '예 - 업그레이드 (기존 파일 .backup으로 백업)'
            : 'Yes - Upgrade (backup existing files to .backup)',
          value: 'yes',
        },
        {
          name: lang === 'ko' ? '아니오 - 건너뛰기' : 'No - Skip',
          value: 'no',
        },
        {
          name: lang === 'ko' ? '미리보기 - 변경 파일만 확인' : 'Preview - Show files only',
          value: 'preview',
        },
      ],
      default: 'yes',
    },
  ]);

  if (upgradeChoice === 'preview') {
    console.log(chalk.bold('\n' + (lang === 'ko' ? '📋 업그레이드 대상 파일:' : '📋 Files to upgrade:')));
    allOutdated.forEach(({ repo, templates }) => {
      templates.forEach((t) => {
        console.log(chalk.gray(`  • ${repo}/.claude/${path.basename(t.file)}`));
      });
    });
    console.log();
    return;
  }

  if (upgradeChoice === 'no') {
    console.log(chalk.gray(lang === 'ko' ? '  템플릿 업그레이드 건너뜀\n' : '  Template upgrade skipped\n'));
    return;
  }

  // Perform upgrade
  if (isDryRun) {
    console.log(chalk.yellow(lang === 'ko'
      ? '\n  [DRY RUN] 업그레이드 수행됨 (실제 파일 변경 없음)\n'
      : '\n  [DRY RUN] Upgrade would be performed (no actual changes)\n'));
    allOutdated.forEach(({ repo, templates }) => {
      templates.forEach((t) => {
        console.log(chalk.gray(`  • ${repo}/.claude/${path.basename(t.file)}`));
      });
    });
    return;
  }

  const spinner = ora(lang === 'ko' ? '템플릿 업그레이드 중...' : 'Upgrading templates...').start();

  const allResults: UpgradeResult[] = [];

  for (const { claudeDir, templates } of allOutdated) {
    const vars = await getTemplateVarsFromContext(claudeDir, lang);
    // Use smart merge to preserve user content outside marked sections
    const results = await upgradeTemplatesWithSmartMerge(templates, { lang, vars, dryRun: isDryRun });
    allResults.push(...results);
  }

  spinner.succeed(lang === 'ko' ? '템플릿 업그레이드 완료!' : 'Templates upgraded!');

  // Show summary
  console.log();
  console.log(formatUpgradeSummary(allResults, lang));
  console.log();

  // Show backup notice
  const successfulWithBackup = allResults.filter((r) => r.success && r.backupPath);
  if (successfulWithBackup.length > 0) {
    console.log(chalk.cyan(lang === 'ko'
      ? '💡 백업 파일에서 커스터마이징 내용을 복사할 수 있습니다.'
      : '💡 You can copy customizations from backup files.'));
    console.log();
  }
}
