import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs-extra';
import { WatchOptions, Language } from '../types';
import { createWatcher, CodeSyncerWatcher } from '../utils/watcher';

let activeWatcher: CodeSyncerWatcher | null = null;

/**
 * Watch command - Real-time file monitoring and tag synchronization
 */
export async function watchCommand(options: WatchOptions): Promise<void> {
  const currentDir = process.cwd();

  // Detect language from existing setup
  const lang = await detectLanguage(currentDir);

  // Show first-time user welcome if needed
  await showWelcomeIfFirstTime(currentDir, lang);

  // Create and start watcher
  try {
    activeWatcher = await createWatcher({
      rootPath: currentDir,
      lang,
      logToFile: options.log || false,
    });

    // Handle graceful shutdown
    setupGracefulShutdown();

    // Keep process running
    await keepAlive();
  } catch (error) {
    console.error(chalk.red('Failed to start watch mode:'), error);
    process.exit(1);
  }
}

/**
 * Detect language from existing CodeSyncer setup
 */
async function detectLanguage(rootPath: string): Promise<Language> {
  try {
    // Check SETUP_GUIDE.md for language hints
    const setupGuidePath = path.join(rootPath, '.codesyncer', 'SETUP_GUIDE.md');
    if (await fs.pathExists(setupGuidePath)) {
      const content = await fs.readFile(setupGuidePath, 'utf-8');
      if (content.includes('한국어') || content.includes('레포지토리')) {
        return 'ko';
      }
    }

    // Check CLAUDE.md
    const claudeMdPath = path.join(rootPath, '.claude', 'CLAUDE.md');
    if (await fs.pathExists(claudeMdPath)) {
      const content = await fs.readFile(claudeMdPath, 'utf-8');
      if (content.includes('한국어') || content.includes('프로젝트')) {
        return 'ko';
      }
    }
  } catch {
    // Ignore errors
  }

  return 'en';
}

/**
 * Show welcome message for first-time users
 */
async function showWelcomeIfFirstTime(rootPath: string, lang: Language): Promise<void> {
  const isKo = lang === 'ko';
  const watchStatePath = path.join(rootPath, '.codesyncer', '.watch-used');

  // Check if user has used watch before
  if (await fs.pathExists(watchStatePath)) {
    return;
  }

  // First time! Show welcome
  console.log();
  console.log(chalk.cyan('━'.repeat(60)));
  console.log();
  console.log(chalk.bold.yellow(isKo ? '🎉 Watch Mode에 오신 것을 환영합니다!' : '🎉 Welcome to Watch Mode!'));
  console.log();
  console.log(isKo
    ? '이 기능은 코드 변경을 실시간으로 감지하고,'
    : 'This feature monitors your code changes in real-time and');
  console.log(isKo
    ? '@codesyncer-* 태그를 자동으로 문서화합니다.'
    : 'automatically documents @codesyncer-* tags.');
  console.log();
  console.log(chalk.bold(isKo ? '사용 방법:' : 'How to use:'));
  console.log();
  console.log(isKo
    ? '  1. 코드에 태그 추가:'
    : '  1. Add tags in your code:');
  console.log(chalk.gray('     // @codesyncer-decision "Use React Query for caching"'));
  console.log(chalk.gray('     // @codesyncer-rule "Always use TypeScript strict mode"'));
  console.log();
  console.log(isKo
    ? '  2. 파일 저장 시 자동으로 DECISIONS.md에 기록됩니다'
    : '  2. Tags are auto-synced to DECISIONS.md on save');
  console.log();
  console.log(chalk.cyan('━'.repeat(60)));
  console.log();

  // Mark as used
  try {
    await fs.ensureDir(path.dirname(watchStatePath));
    await fs.writeFile(watchStatePath, new Date().toISOString(), 'utf-8');
  } catch {
    // Ignore
  }
}

/**
 * Set up graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
  const shutdown = async () => {
    console.log();  // New line after ^C
    if (activeWatcher) {
      await activeWatcher.stop();
      activeWatcher = null;
    }
    process.exit(0);
  };

  // Handle Ctrl+C
  process.on('SIGINT', shutdown);

  // Handle terminal close
  process.on('SIGTERM', shutdown);

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error(chalk.red('Unexpected error:'), error);
    await shutdown();
  });
}

/**
 * Keep the process alive
 */
function keepAlive(): Promise<void> {
  return new Promise(() => {
    // This promise never resolves - keeps the process running
    // until SIGINT or SIGTERM is received
  });
}
