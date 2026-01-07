import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Language } from '../types';
import { ParsedTag } from './tag-parser';

export interface WatchStats {
  startTime: Date;
  filesWatched: number;
  changesDetected: number;
  tagsSynced: number;
  errors: number;
}

export interface WatchLoggerOptions {
  lang: Language;
  logToFile: boolean;
  logPath?: string;
  rootPath: string;
}

/**
 * Watch Mode Logger - Handles all console output and file logging
 */
export class WatchLogger {
  private options: WatchLoggerOptions;
  private stats: WatchStats;
  private logStream: fs.WriteStream | null = null;

  constructor(options: WatchLoggerOptions) {
    this.options = options;
    this.stats = {
      startTime: new Date(),
      filesWatched: 0,
      changesDetected: 0,
      tagsSynced: 0,
      errors: 0,
    };

    if (options.logToFile) {
      this.initLogFile();
    }
  }

  /**
   * Initialize log file
   */
  private async initLogFile(): Promise<void> {
    const logDir = path.join(this.options.rootPath, '.codesyncer');
    await fs.ensureDir(logDir);

    const date = new Date().toISOString().split('T')[0];
    const logPath = this.options.logPath || path.join(logDir, `watch-${date}.log`);

    this.logStream = fs.createWriteStream(logPath, { flags: 'a' });
    this.writeToLog(`\n${'='.repeat(60)}`);
    this.writeToLog(`Watch session started: ${new Date().toISOString()}`);
    this.writeToLog(`${'='.repeat(60)}\n`);
  }

  /**
   * Write to log file
   */
  private writeToLog(message: string): void {
    if (this.logStream) {
      this.logStream.write(message + '\n');
    }
  }

  /**
   * Get current timestamp for display
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0];  // HH:MM:SS
  }

  /**
   * Display startup banner
   */
  displayStartup(watchedPaths: string[], excludedPatterns: string[]): void {
    const { lang } = this.options;
    const isKo = lang === 'ko';

    console.log();
    console.log(chalk.cyan('╭' + '─'.repeat(58) + '╮'));
    console.log(chalk.cyan('│') + chalk.bold.white('  🔄 CodeSyncer Watch Mode                                ') + chalk.cyan('│'));
    console.log(chalk.cyan('│') + chalk.gray(`     ${isKo ? 'Ctrl+C로 종료' : 'Press Ctrl+C to stop'}                                  `) + chalk.cyan('│'));
    console.log(chalk.cyan('╰' + '─'.repeat(58) + '╯'));
    console.log();

    // Show what's being watched
    console.log(chalk.bold(isKo ? '📁 감시 대상:' : '📁 Watching:'));
    console.log(chalk.gray(`   ${this.options.rootPath}`));
    console.log();

    // Show patterns
    console.log(chalk.bold(isKo ? '🎯 패턴:' : '🎯 Patterns:'));
    watchedPaths.forEach(p => {
      console.log(chalk.green(`   ✓ ${p}`));
    });
    console.log();

    // Show excluded
    console.log(chalk.bold(isKo ? '🚫 제외:' : '🚫 Excluded:'));
    console.log(chalk.gray(`   ${excludedPatterns.join(', ')}`));
    console.log();

    // Helpful tips for new users
    console.log(chalk.cyan('─'.repeat(60)));
    console.log();
    console.log(chalk.bold(isKo ? '💡 사용 팁:' : '💡 Quick Tips:'));
    console.log(chalk.gray(isKo
      ? '   • 코드에 @codesyncer-decision "결정 내용" 추가'
      : '   • Add @codesyncer-decision "your decision" in code'));
    console.log(chalk.gray(isKo
      ? '   • 자동으로 DECISIONS.md에 기록됩니다'
      : '   • Auto-synced to DECISIONS.md'));
    console.log(chalk.gray(isKo
      ? '   • @codesyncer-rule, @codesyncer-todo 도 지원'
      : '   • Also supports @codesyncer-rule, @codesyncer-todo'));
    console.log();
    console.log(chalk.cyan('─'.repeat(60)));
    console.log();

    // Log file info
    if (this.options.logToFile) {
      const date = new Date().toISOString().split('T')[0];
      console.log(chalk.gray(isKo
        ? `📝 로그 파일: .codesyncer/watch-${date}.log`
        : `📝 Log file: .codesyncer/watch-${date}.log`));
      console.log();
    }

    this.writeToLog(`Watching: ${this.options.rootPath}`);
    this.writeToLog(`Patterns: ${watchedPaths.join(', ')}`);
    this.writeToLog(`Excluded: ${excludedPatterns.join(', ')}`);
  }

  /**
   * Display "waiting for changes" message
   */
  displayWaiting(): void {
    const { lang } = this.options;
    const isKo = lang === 'ko';
    const timestamp = chalk.gray(`[${this.getTimestamp()}]`);

    console.log(`${timestamp} ${chalk.cyan('👀')} ${isKo ? '변경 사항 대기 중...' : 'Watching for changes...'}`);
  }

  /**
   * Log a file change
   */
  logChange(filePath: string, eventType: 'add' | 'change' | 'unlink'): void {
    this.stats.changesDetected++;
    const { lang } = this.options;
    const isKo = lang === 'ko';
    const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
    const relativePath = path.relative(this.options.rootPath, filePath);

    const icons: Record<string, string> = {
      add: '✨',
      change: '📝',
      unlink: '🗑️',
    };

    const labels: Record<string, Record<string, string>> = {
      add: { en: 'New', ko: '새 파일' },
      change: { en: 'Changed', ko: '변경됨' },
      unlink: { en: 'Deleted', ko: '삭제됨' },
    };

    const icon = icons[eventType];
    const label = labels[eventType][lang];
    const color = eventType === 'add' ? chalk.green : eventType === 'unlink' ? chalk.red : chalk.yellow;

    console.log(`${timestamp} ${icon} ${color(label)}: ${chalk.white(relativePath)}`);

    this.writeToLog(`[${this.getTimestamp()}] ${eventType.toUpperCase()} ${relativePath}`);
  }

  /**
   * Log a found tag
   */
  logTagFound(tag: ParsedTag): void {
    const { lang } = this.options;
    const isKo = lang === 'ko';
    const relativePath = path.relative(this.options.rootPath, tag.file);

    const typeIcons: Record<string, string> = {
      decision: '🎯',
      rule: '📏',
      inference: '💡',
      todo: '📝',
      context: '📚',
    };

    const icon = typeIcons[tag.type] || '🏷️';

    console.log(chalk.gray(`           └── ${icon} ${isKo ? '발견' : 'Found'}: @${tag.prefix}-${tag.type}`));
    console.log(chalk.gray(`               "${chalk.white(tag.content)}"`));

    this.writeToLog(`[${this.getTimestamp()}] TAG_FOUND ${relativePath}:${tag.line} @${tag.prefix}-${tag.type} "${tag.content}"`);
  }

  /**
   * Log a successful sync to DECISIONS.md
   */
  logTagSynced(tag: ParsedTag): void {
    this.stats.tagsSynced++;
    const { lang } = this.options;
    const isKo = lang === 'ko';

    console.log(chalk.green(`           └── ✅ ${isKo ? 'DECISIONS.md에 추가됨' : 'Added to DECISIONS.md'}`));

    this.writeToLog(`[${this.getTimestamp()}] SYNCED DECISIONS.md +1 (${tag.type})`);
  }

  /**
   * Log that tag already exists
   */
  logTagExists(): void {
    const { lang } = this.options;
    const isKo = lang === 'ko';

    console.log(chalk.gray(`           └── ${isKo ? '(이미 존재)' : '(already exists)'}`));
  }

  /**
   * Log no tags found
   */
  logNoTags(): void {
    const { lang } = this.options;
    const isKo = lang === 'ko';

    console.log(chalk.gray(`           └── ${isKo ? '태그 없음' : 'No tags found'}`));
  }

  /**
   * Log a new directory
   */
  logNewDirectory(dirPath: string): void {
    const { lang } = this.options;
    const isKo = lang === 'ko';
    const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
    const relativePath = path.relative(this.options.rootPath, dirPath);

    console.log(`${timestamp} 📁 ${chalk.blue(isKo ? '새 폴더' : 'New folder')}: ${chalk.white(relativePath)}/`);
    console.log(chalk.gray(`           └── 💡 ${isKo ? 'ARCHITECTURE.md 업데이트 고려' : 'Consider updating ARCHITECTURE.md'}`));

    this.writeToLog(`[${this.getTimestamp()}] NEW_DIR ${relativePath}/`);
  }

  /**
   * Log an error
   */
  logError(message: string, error?: Error): void {
    this.stats.errors++;
    const timestamp = chalk.gray(`[${this.getTimestamp()}]`);

    console.log(`${timestamp} ${chalk.red('❌')} ${chalk.red(message)}`);
    if (error) {
      console.log(chalk.gray(`           └── ${error.message}`));
    }

    this.writeToLog(`[${this.getTimestamp()}] ERROR ${message} ${error?.message || ''}`);
  }

  /**
   * Set the number of files being watched
   */
  setFilesWatched(count: number): void {
    this.stats.filesWatched = count;
  }

  /**
   * Display shutdown summary
   */
  displayShutdown(): void {
    const { lang } = this.options;
    const isKo = lang === 'ko';

    const duration = this.formatDuration(Date.now() - this.stats.startTime.getTime());

    console.log();
    console.log(chalk.cyan('─'.repeat(60)));
    console.log(chalk.bold(isKo ? '📊 세션 요약' : '📊 Session Summary'));
    console.log(chalk.cyan('─'.repeat(60)));
    console.log();
    console.log(`   ${chalk.gray(isKo ? '⏱  소요 시간:' : '⏱  Duration:')} ${chalk.white(duration)}`);
    console.log(`   ${chalk.gray(isKo ? '👁  감시 파일:' : '👁  Files watched:')} ${chalk.white(String(this.stats.filesWatched))}`);
    console.log(`   ${chalk.gray(isKo ? '✏️  변경 감지:' : '✏️  Changes detected:')} ${chalk.white(String(this.stats.changesDetected))}`);
    console.log(`   ${chalk.gray(isKo ? '📝  태그 동기화:' : '📝  Tags synced:')} ${chalk.green(String(this.stats.tagsSynced))}`);
    if (this.stats.errors > 0) {
      console.log(`   ${chalk.gray(isKo ? '❌  오류:' : '❌  Errors:')} ${chalk.red(String(this.stats.errors))}`);
    }
    console.log();
    console.log(chalk.cyan('─'.repeat(60)));
    console.log();

    if (this.stats.tagsSynced > 0) {
      console.log(chalk.green(isKo
        ? `✅ ${this.stats.tagsSynced}개의 태그가 DECISIONS.md에 추가되었습니다.`
        : `✅ ${this.stats.tagsSynced} tag(s) were added to DECISIONS.md.`));
      console.log();
    }

    // Log to file
    this.writeToLog(`\n${'='.repeat(60)}`);
    this.writeToLog(`Session ended: ${new Date().toISOString()}`);
    this.writeToLog(`Duration: ${duration}`);
    this.writeToLog(`Files watched: ${this.stats.filesWatched}`);
    this.writeToLog(`Changes detected: ${this.stats.changesDetected}`);
    this.writeToLog(`Tags synced: ${this.stats.tagsSynced}`);
    this.writeToLog(`Errors: ${this.stats.errors}`);
    this.writeToLog(`${'='.repeat(60)}\n`);

    // Close log stream
    if (this.logStream) {
      this.logStream.end();
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get current stats
   */
  getStats(): WatchStats {
    return { ...this.stats };
  }
}
