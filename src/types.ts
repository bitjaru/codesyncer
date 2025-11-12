export type Language = 'en' | 'ko';

export type AITool = 'claude';  // Currently only Claude Code supported

export type ProjectType = 'frontend' | 'backend' | 'mobile' | 'fullstack';

export type SetupMode = 'quick' | 'expert';

export type KeywordSeverity = 'CRITICAL' | 'IMPORTANT' | 'MINOR';

export interface InitOptions {
  lang: Language;
  ai: AITool;
  mode?: SetupMode;  // quick or expert setup
}

export interface UpdateOptions {
  ai: AITool;
}

export interface AddRepoOptions {
  lang: Language;
  ai: AITool;
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
  type: ProjectType;
  description: string;
  techStack?: string[];
  hasCodeSyncer: boolean;
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
