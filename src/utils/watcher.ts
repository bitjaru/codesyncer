import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Language } from '../types';
import { WatchLogger } from './watch-logger';
import {
  parseTagsFromFile,
  appendTagToDecisions,
  shouldParseFile,
  ParsedTag,
} from './tag-parser';

export interface WatcherOptions {
  rootPath: string;
  lang: Language;
  logToFile: boolean;
}

/**
 * Default patterns to watch
 */
const DEFAULT_WATCH_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.py',
  '**/*.java',
  '**/*.go',
  '**/*.rs',
  '**/*.rb',
  '**/*.php',
  '**/*.swift',
  '**/*.kt',
  '**/*.vue',
  '**/*.svelte',
];

/**
 * Patterns to always exclude
 */
const EXCLUDED_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '__pycache__',
  '.cache',
  'vendor',
  'target',  // Rust
  '.claude',  // Our output directory
  '.codesyncer',  // Our output directory
];

/**
 * CodeSyncer File Watcher
 */
export class CodeSyncerWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private logger: WatchLogger;
  private options: WatcherOptions;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private processedFiles: Set<string> = new Set();
  private isReady = false;

  constructor(options: WatcherOptions) {
    this.options = options;
    this.logger = new WatchLogger({
      lang: options.lang,
      logToFile: options.logToFile,
      rootPath: options.rootPath,
    });
  }

  /**
   * Start watching
   */
  async start(): Promise<void> {
    const { rootPath, lang } = this.options;
    const isKo = lang === 'ko';

    // Check if CodeSyncer is set up
    const hasSetup = await this.checkSetup();
    if (!hasSetup) {
      console.log();
      console.log(isKo
        ? '❌ CodeSyncer 설정이 없습니다. 먼저 `codesyncer init`을 실행하세요.'
        : '❌ No CodeSyncer setup found. Run `codesyncer init` first.');
      console.log();
      process.exit(1);
    }

    // Display startup
    this.logger.displayStartup(
      this.getDisplayPatterns(),
      EXCLUDED_PATTERNS.slice(0, 6)  // Show first 6 excluded patterns
    );

    // Create watcher
    this.watcher = chokidar.watch(DEFAULT_WATCH_PATTERNS, {
      cwd: rootPath,
      ignored: [
        ...EXCLUDED_PATTERNS.map(p => `**/${p}/**`),
        ...EXCLUDED_PATTERNS.map(p => `${p}/**`),
        /^\./,  // Hidden files
      ],
      persistent: true,
      ignoreInitial: true,  // Don't emit events for existing files
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    // Set up event handlers
    this.setupEventHandlers();

    // Wait for ready
    return new Promise((resolve) => {
      this.watcher!.on('ready', () => {
        this.isReady = true;
        const watched = this.getWatchedCount();
        this.logger.setFilesWatched(watched);
        this.logger.displayWaiting();
        resolve();
      });
    });
  }

  /**
   * Stop watching
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      // Clear all debounce timers
      for (const timer of this.debounceTimers.values()) {
        clearTimeout(timer);
      }
      this.debounceTimers.clear();

      await this.watcher.close();
      this.watcher = null;
    }

    this.logger.displayShutdown();
  }

  /**
   * Check if CodeSyncer is set up
   */
  private async checkSetup(): Promise<boolean> {
    const { rootPath } = this.options;

    // Check for .codesyncer or .claude directory
    const codesyncerPath = path.join(rootPath, '.codesyncer');
    const claudePath = path.join(rootPath, '.claude');

    return (await fs.pathExists(codesyncerPath)) || (await fs.pathExists(claudePath));
  }

  /**
   * Set up event handlers for file changes
   */
  private setupEventHandlers(): void {
    if (!this.watcher) return;

    // File added
    this.watcher.on('add', (filePath) => {
      this.handleFileChange(filePath, 'add');
    });

    // File changed
    this.watcher.on('change', (filePath) => {
      this.handleFileChange(filePath, 'change');
    });

    // File deleted
    this.watcher.on('unlink', (filePath) => {
      this.handleFileDelete(filePath);
    });

    // Directory added
    this.watcher.on('addDir', (dirPath) => {
      if (this.isReady && dirPath !== '.') {
        this.handleNewDirectory(dirPath);
      }
    });

    // Error handling
    this.watcher.on('error', (error) => {
      this.logger.logError('Watcher error', error);
    });
  }

  /**
   * Handle file change with debouncing
   */
  private handleFileChange(filePath: string, eventType: 'add' | 'change'): void {
    // Debounce rapid changes to the same file
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      this.debounceTimers.delete(filePath);
      await this.processFileChange(filePath, eventType);
    }, 500);  // 500ms debounce

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Process file change
   */
  private async processFileChange(relativePath: string, eventType: 'add' | 'change'): Promise<void> {
    const { rootPath } = this.options;
    const fullPath = path.join(rootPath, relativePath);

    // Log the change
    this.logger.logChange(fullPath, eventType);

    // Check if file should be parsed for tags
    if (!shouldParseFile(fullPath)) {
      this.logger.logNoTags();
      return;
    }

    // Parse tags from file
    try {
      const tags = await parseTagsFromFile(fullPath);

      if (tags.length === 0) {
        // Show warning for changed files, neutral for new files
        if (eventType === 'change') {
          this.logger.logNoTagsWarning(fullPath);
        } else {
          this.logger.logNoTags();
        }
        return;
      }

      // Process each found tag
      for (const tag of tags) {
        this.logger.logTagFound(tag);

        // Try to sync to DECISIONS.md (pass full path for monorepo support)
        const decisionsPath = await this.findDecisionsPath(fullPath);
        if (decisionsPath) {
          const added = await appendTagToDecisions(decisionsPath, tag, rootPath);
          if (added) {
            this.logger.logTagSynced(tag);
          } else {
            this.logger.logTagExists();
          }
        }
      }
    } catch (error) {
      // Silently ignore parse errors
    }
  }

  /**
   * Handle file deletion
   */
  private handleFileDelete(relativePath: string): void {
    const { rootPath } = this.options;
    const fullPath = path.join(rootPath, relativePath);

    this.logger.logChange(fullPath, 'unlink');
  }

  /**
   * Handle new directory
   */
  private handleNewDirectory(relativePath: string): void {
    // Skip hidden directories and excluded patterns
    const dirName = path.basename(relativePath);
    if (dirName.startsWith('.') || EXCLUDED_PATTERNS.includes(dirName)) {
      return;
    }

    const { rootPath } = this.options;
    const fullPath = path.join(rootPath, relativePath);

    this.logger.logNewDirectory(fullPath);
  }

  /**
   * Find DECISIONS.md path for a given file
   * For monorepos, finds the closest .claude/DECISIONS.md relative to the changed file
   */
  private async findDecisionsPath(changedFilePath?: string): Promise<string | null> {
    const { rootPath } = this.options;

    // If a changed file is provided, try to find DECISIONS.md closest to it
    if (changedFilePath) {
      const decisionsPath = await this.findClosestDecisions(changedFilePath);
      if (decisionsPath) {
        return decisionsPath;
      }
    }

    // Fallback to root paths
    // Check .claude/DECISIONS.md first
    const claudeDecisions = path.join(rootPath, '.claude', 'DECISIONS.md');
    if (await fs.pathExists(claudeDecisions)) {
      return claudeDecisions;
    }

    // Check root DECISIONS.md
    const rootDecisions = path.join(rootPath, 'DECISIONS.md');
    if (await fs.pathExists(rootDecisions)) {
      return rootDecisions;
    }

    // Create in .claude if it exists
    const claudeDir = path.join(rootPath, '.claude');
    if (await fs.pathExists(claudeDir)) {
      return claudeDecisions;
    }

    // Create in root
    return rootDecisions;
  }

  /**
   * Find the closest DECISIONS.md by walking up from the changed file
   * This supports monorepo structures where each package may have its own .claude folder
   */
  private async findClosestDecisions(filePath: string): Promise<string | null> {
    const { rootPath } = this.options;
    let currentDir = path.dirname(filePath);

    // Walk up the directory tree until we hit rootPath
    while (currentDir.startsWith(rootPath) && currentDir !== path.dirname(rootPath)) {
      // Check for .claude/DECISIONS.md in current directory
      const claudeDecisions = path.join(currentDir, '.claude', 'DECISIONS.md');
      if (await fs.pathExists(claudeDecisions)) {
        return claudeDecisions;
      }

      // Check for DECISIONS.md in current directory
      const localDecisions = path.join(currentDir, 'DECISIONS.md');
      if (await fs.pathExists(localDecisions)) {
        return localDecisions;
      }

      // Move up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached filesystem root
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * Get count of watched files
   */
  private getWatchedCount(): number {
    if (!this.watcher) return 0;

    const watched = this.watcher.getWatched();
    let count = 0;

    for (const dir in watched) {
      count += watched[dir].length;
    }

    return count;
  }

  /**
   * Get display-friendly patterns
   */
  private getDisplayPatterns(): string[] {
    return [
      'src/**/*.{ts,tsx,js,jsx}',
      '**/*.{py,java,go,rs}',
      '**/*.{vue,svelte}',
    ];
  }
}

/**
 * Create and start a watcher
 */
export async function createWatcher(options: WatcherOptions): Promise<CodeSyncerWatcher> {
  const watcher = new CodeSyncerWatcher(options);
  await watcher.start();
  return watcher;
}
