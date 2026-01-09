/**
 * CodeSyncer Validate Command
 *
 * Validates CodeSyncer setup and reports any issues.
 */

import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Language } from '../types';
import { detectLanguage } from '../utils/language';
import { hasMasterSetup, hasSingleRepoSetup, detectMonorepo, scanMonorepoPackages, scanForRepositories } from '../utils/scanner';

export interface ValidateOptions {
  verbose?: boolean;
  fix?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
}

interface ValidationError {
  code: string;
  message: string;
  path?: string;
  fix?: string;
}

interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  suggestion?: string;
}

interface ValidationInfo {
  label: string;
  value: string;
}

/**
 * Required files in each .claude directory
 */
const REQUIRED_FILES = [
  'CLAUDE.md',
  'ARCHITECTURE.md',
  'COMMENT_GUIDE.md',
  'DECISIONS.md',
];

/**
 * Main validate command
 */
export async function validateCommand(options: ValidateOptions = {}): Promise<void> {
  const currentDir = process.cwd();

  console.log(chalk.bold.cyan('\n🔍 CodeSyncer - Validate\n'));

  // Detect language
  const langConfig = await detectLanguage(currentDir);
  const lang = langConfig.lang;
  const isKo = lang === 'ko';

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  // Check if CodeSyncer is set up
  const spinner = ora(isKo ? '설정 검증 중...' : 'Validating setup...').start();

  // 1. Detect setup mode (single-repo vs multi-repo)
  const hasMaster = await hasMasterSetup(currentDir);
  const hasSingleRepo = await hasSingleRepoSetup(currentDir);
  const isSingleRepoMode = !hasMaster && hasSingleRepo;

  if (!hasMaster && !hasSingleRepo) {
    result.valid = false;
    result.errors.push({
      code: 'NO_SETUP',
      message: isKo ? 'CodeSyncer 설정이 없습니다' : 'No CodeSyncer setup found',
      fix: 'codesyncer init',
    });
    spinner.fail(isKo ? '설정을 찾을 수 없습니다' : 'No setup found');
    displayResults(result, options.verbose, isKo);
    return;
  }

  // Add mode info
  result.info.push({
    label: isKo ? '모드' : 'Mode',
    value: isSingleRepoMode
      ? (isKo ? '단일 레포지토리' : 'Single Repository')
      : (isKo ? '멀티 레포지토리' : 'Multi Repository'),
  });

  // 2. Mode-specific validation
  if (isSingleRepoMode) {
    // === SINGLE-REPO MODE VALIDATION ===
    const claudeDir = path.join(currentDir, '.claude');

    // Check .claude directory exists
    if (await fs.pathExists(claudeDir)) {
      result.info.push({
        label: '.claude/',
        value: '✓',
      });

      // Check required files in .claude
      for (const file of REQUIRED_FILES) {
        const filePath = path.join(claudeDir, file);
        if (await fs.pathExists(filePath)) {
          // Check for unfilled placeholders
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const placeholders = content.match(/\[([A-Z_]+)\]/g);
            if (placeholders && placeholders.length > 0) {
              result.warnings.push({
                code: 'UNFILLED_PLACEHOLDER',
                message: isKo
                  ? `.claude/${file}: 미완성 플레이스홀더 (${placeholders.slice(0, 3).join(', ')})`
                  : `.claude/${file}: Unfilled placeholders (${placeholders.slice(0, 3).join(', ')})`,
                path: filePath,
              });
            }
          } catch {
            // Ignore read errors
          }
        } else {
          result.warnings.push({
            code: 'MISSING_FILE',
            message: isKo ? `.claude/${file} 누락` : `Missing .claude/${file}`,
            path: filePath,
            suggestion: 'codesyncer update',
          });
        }
      }
    }

    // Check root CLAUDE.md for single-repo
    const rootClaudePath = path.join(currentDir, 'CLAUDE.md');
    if (await fs.pathExists(rootClaudePath)) {
      result.info.push({
        label: 'Root CLAUDE.md',
        value: '✓',
      });
    } else {
      result.warnings.push({
        code: 'NO_ROOT_CLAUDE',
        message: isKo ? '루트 CLAUDE.md가 없습니다 (AI 자동 로드 불가)' : 'No root CLAUDE.md (AI auto-load disabled)',
        suggestion: 'codesyncer update',
      });
    }

  } else {
    // === MULTI-REPO MODE VALIDATION ===

    // 2. Check .codesyncer directory
    const codesyncerDir = path.join(currentDir, '.codesyncer');
    if (!(await fs.pathExists(codesyncerDir))) {
      result.warnings.push({
        code: 'NO_CODESYNCER_DIR',
        message: isKo ? '.codesyncer 폴더가 없습니다' : 'No .codesyncer directory',
        suggestion: isKo ? '.codesyncer 폴더를 생성하세요' : 'Create .codesyncer directory',
      });
    }

    // 3. Check MASTER_CODESYNCER.md
    const masterPath = path.join(codesyncerDir, 'MASTER_CODESYNCER.md');
    if (await fs.pathExists(masterPath)) {
      result.info.push({
        label: 'MASTER_CODESYNCER.md',
        value: '✓',
      });

      // Validate master file content
      try {
        const masterContent = await fs.readFile(masterPath, 'utf-8');
        if (masterContent.includes('[PROJECT_NAME]') || masterContent.includes('[GITHUB_USERNAME]')) {
          result.warnings.push({
            code: 'UNFILLED_PLACEHOLDER',
            message: isKo ? 'MASTER_CODESYNCER.md에 미완성 플레이스홀더가 있습니다' : 'MASTER_CODESYNCER.md has unfilled placeholders',
            path: masterPath,
          });
        }
      } catch {
        result.warnings.push({
          code: 'READ_ERROR',
          message: isKo ? 'MASTER_CODESYNCER.md를 읽을 수 없습니다' : 'Cannot read MASTER_CODESYNCER.md',
          path: masterPath,
        });
      }
    } else {
      result.errors.push({
        code: 'NO_MASTER',
        message: isKo ? 'MASTER_CODESYNCER.md 파일이 없습니다' : 'No MASTER_CODESYNCER.md file',
        path: masterPath,
      });
      result.valid = false;
    }

    // 4. Check root CLAUDE.md
    const rootClaudePath = path.join(currentDir, 'CLAUDE.md');
    if (await fs.pathExists(rootClaudePath)) {
      result.info.push({
        label: 'Root CLAUDE.md',
        value: '✓',
      });
    } else {
      result.warnings.push({
        code: 'NO_ROOT_CLAUDE',
        message: isKo ? '루트 CLAUDE.md가 없습니다 (AI 자동 로드 불가)' : 'No root CLAUDE.md (AI auto-load disabled)',
        suggestion: 'codesyncer update',
      });
    }
  }

  // 5. Scan repositories
  const monorepoInfo = await detectMonorepo(currentDir);
  let repositories;

  if (monorepoInfo) {
    repositories = await scanMonorepoPackages(currentDir, monorepoInfo);
    result.info.push({
      label: isKo ? '모노레포 도구' : 'Monorepo Tool',
      value: monorepoInfo.tool,
    });
  } else {
    repositories = await scanForRepositories(currentDir);
  }

  result.info.push({
    label: isKo ? '레포지토리 수' : 'Repository Count',
    value: String(repositories.length),
  });

  // 6. Check each repository
  let reposWithIssues = 0;
  let totalMissingFiles = 0;

  for (const repo of repositories) {
    const claudeDir = path.join(repo.path, '.claude');
    const missingFiles: string[] = [];

    if (!(await fs.pathExists(claudeDir))) {
      missingFiles.push(...REQUIRED_FILES);
    } else {
      for (const file of REQUIRED_FILES) {
        const filePath = path.join(claudeDir, file);
        if (!(await fs.pathExists(filePath))) {
          missingFiles.push(file);
        }
      }
    }

    if (missingFiles.length > 0) {
      reposWithIssues++;
      totalMissingFiles += missingFiles.length;

      if (missingFiles.length === REQUIRED_FILES.length) {
        result.errors.push({
          code: 'NO_CLAUDE_DIR',
          message: isKo
            ? `${repo.name}: .claude 폴더가 없습니다`
            : `${repo.name}: No .claude directory`,
          path: claudeDir,
          fix: `cd ${repo.name} && codesyncer init`,
        });
        result.valid = false;
      } else {
        for (const file of missingFiles) {
          result.warnings.push({
            code: 'MISSING_FILE',
            message: isKo
              ? `${repo.name}: ${file} 누락`
              : `${repo.name}: Missing ${file}`,
            path: path.join(claudeDir, file),
          });
        }
      }
    }

    // Check for unfilled placeholders in existing files
    if (await fs.pathExists(claudeDir)) {
      for (const file of REQUIRED_FILES) {
        const filePath = path.join(claudeDir, file);
        if (await fs.pathExists(filePath)) {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const placeholders = content.match(/\[([A-Z_]+)\]/g);
            if (placeholders && placeholders.length > 0) {
              result.warnings.push({
                code: 'UNFILLED_PLACEHOLDER',
                message: isKo
                  ? `${repo.name}/${file}: 미완성 플레이스홀더 (${placeholders.slice(0, 3).join(', ')})`
                  : `${repo.name}/${file}: Unfilled placeholders (${placeholders.slice(0, 3).join(', ')})`,
                path: filePath,
              });
            }
          } catch {
            // Ignore read errors for individual files
          }
        }
      }
    }
  }

  // 7. Summary
  const configuredRepos = repositories.length - reposWithIssues;
  result.info.push({
    label: isKo ? '설정 완료된 레포' : 'Configured Repos',
    value: `${configuredRepos}/${repositories.length}`,
  });

  if (totalMissingFiles > 0) {
    result.info.push({
      label: isKo ? '누락된 파일' : 'Missing Files',
      value: String(totalMissingFiles),
    });
  }

  // 8. Check language config
  result.info.push({
    label: isKo ? '언어' : 'Language',
    value: `${lang} (${langConfig.source})`,
  });

  spinner.succeed(isKo ? '검증 완료' : 'Validation complete');

  // Display results
  displayResults(result, options.verbose, isKo);
}

/**
 * Display validation results
 */
function displayResults(result: ValidationResult, verbose: boolean = false, isKo: boolean = false) {
  console.log();

  // Info section
  if (result.info.length > 0) {
    console.log(chalk.bold(isKo ? '📊 정보' : '📊 Info'));
    console.log(chalk.gray('─'.repeat(40)));
    for (const info of result.info) {
      console.log(chalk.gray(`  ${info.label}: ${chalk.white(info.value)}`));
    }
    console.log();
  }

  // Errors section
  if (result.errors.length > 0) {
    console.log(chalk.bold.red(isKo ? '❌ 오류' : '❌ Errors'));
    console.log(chalk.gray('─'.repeat(40)));
    for (const error of result.errors) {
      console.log(chalk.red(`  • ${error.message}`));
      if (verbose && error.path) {
        console.log(chalk.gray(`    Path: ${error.path}`));
      }
      if (error.fix) {
        console.log(chalk.yellow(`    Fix: ${error.fix}`));
      }
    }
    console.log();
  }

  // Warnings section
  if (result.warnings.length > 0) {
    console.log(chalk.bold.yellow(isKo ? '⚠️  경고' : '⚠️  Warnings'));
    console.log(chalk.gray('─'.repeat(40)));

    // Group warnings by code
    const grouped = new Map<string, ValidationWarning[]>();
    for (const warning of result.warnings) {
      const existing = grouped.get(warning.code) || [];
      existing.push(warning);
      grouped.set(warning.code, existing);
    }

    for (const [code, warnings] of grouped) {
      if (warnings.length > 3 && !verbose) {
        // Summarize if many similar warnings
        console.log(chalk.yellow(`  • ${warnings[0].message.split(':')[0]}: ${warnings.length} issues`));
      } else {
        for (const warning of warnings) {
          console.log(chalk.yellow(`  • ${warning.message}`));
          if (warning.suggestion) {
            console.log(chalk.gray(`    Suggestion: ${warning.suggestion}`));
          }
        }
      }
    }
    console.log();
  }

  // Summary
  console.log(chalk.gray('─'.repeat(40)));
  if (result.valid && result.warnings.length === 0) {
    console.log(chalk.bold.green(isKo ? '✅ 모든 검증 통과!' : '✅ All validations passed!'));
  } else if (result.valid) {
    console.log(chalk.bold.yellow(
      isKo
        ? `⚠️  검증 완료 (경고 ${result.warnings.length}개)`
        : `⚠️  Validation passed with ${result.warnings.length} warning(s)`
    ));
  } else {
    console.log(chalk.bold.red(
      isKo
        ? `❌ 검증 실패 (오류 ${result.errors.length}개)`
        : `❌ Validation failed with ${result.errors.length} error(s)`
    ));
  }
  console.log();

  // Suggest fix command
  if (!result.valid || result.warnings.length > 0) {
    console.log(chalk.gray(isKo ? '💡 수정하려면:' : '💡 To fix issues:'));
    console.log(chalk.cyan('   codesyncer update'));
    console.log();
  }
}
