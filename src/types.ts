export type Language = 'en' | 'ko';

export type AITool = 'claude';  // Currently only Claude Code supported

export type ProjectType = 'frontend' | 'backend' | 'mobile' | 'fullstack';

export type SetupMode = 'quick' | 'expert';

// Workspace mode: single repo, multi-repo (separate git repos), or monorepo (one git, multiple packages)
export type WorkspaceMode = 'single' | 'multi-repo' | 'monorepo';

// Monorepo tool types
export type MonorepoTool = 'npm-workspaces' | 'yarn-workspaces' | 'pnpm' | 'lerna' | 'nx' | 'turbo' | 'rush' | 'unknown';

// Monorepo detection result
export interface MonorepoInfo {
  tool: MonorepoTool;
  patterns: string[];  // e.g., ["packages/*", "apps/*"]
  configFile?: string;  // e.g., "pnpm-workspace.yaml"
}

export type KeywordSeverity = 'CRITICAL' | 'IMPORTANT' | 'MINOR';

export interface InitOptions {
  lang: Language;
  ai: AITool;
  mode?: SetupMode;  // quick or expert setup
}

export interface UpdateOptions {
  ai: AITool;
  hard?: boolean;  // Deep scan and update all existing files
  dryRun?: boolean;  // Show what would be done without making changes
}

export interface AddRepoOptions {
  lang: Language;
  ai: AITool;
}

export interface WatchOptions {
  log?: boolean;  // Enable file logging
}

export interface ProjectConfig {
  projectName: string;
  githubUsername: string;
  language: Language;
  aiTool: AITool;
  setupMode: SetupMode;
  repositories: RepositoryInfo[];
  keywordConfig?: KeywordConfig;
}

export interface RepositoryInfo {
  name: string;
  path: string;
  type?: ProjectType;    // AI will analyze during setup
  description?: string;  // AI will analyze during setup
  techStack?: string[];   // AI will analyze during setup
  hasCodeSyncer: boolean;
  isMonorepoPackage?: boolean;  // true if this is a package within a monorepo
  relativePath?: string;  // path relative to workspace root (e.g., "packages/api")
}

export interface KeywordCategory {
  name: string;
  nameKo: string;
  severity: KeywordSeverity;
  keywords: string[];
  description: string;
  descriptionKo: string;
  applicableTo: ProjectType[];
  enabled: boolean;  // User can enable/disable categories
}

export interface KeywordConfig {
  categories: KeywordCategory[];
  customKeywords?: {
    keywords: string[];
    severity: KeywordSeverity;
    description: string;
  }[];
}

export interface MasterDocConfig {
  projectName: string;
  githubUsername: string;
  language: Language;
  repositories: {
    name: string;
    folder: string;
    role: string;
    vibeSyncPath: string;
    type: ProjectType;
  }[];
}

export interface RepoSetupConfig {
  projectName: string;
  type: ProjectType;
  techStack: string[];
  language: Language;
  keywordCategories: KeywordCategory[];  // For template generation
}

// Tag compatibility: @codesyncer-* is primary, @claude-* for backward compatibility
export const TAG_PREFIXES = {
  primary: 'codesyncer',
  legacy: 'claude',  // For backward compatibility with existing codebases
} as const;

export const AVAILABLE_TAGS = [
  'rule',
  'inference',
  'decision',
  'todo',
  'context',
] as const;

export type TagType = typeof AVAILABLE_TAGS[number];
