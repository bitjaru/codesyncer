import { Language, MonorepoInfo, RepositoryInfo } from '../types';

/**
 * Workspace mode types
 */
export type WorkspaceMode = 'single' | 'monorepo' | 'multi-repo';

/**
 * Init context - shared state across init steps
 */
export interface InitContext {
  currentDir: string;
  lang: Language;
  projectName: string;
  githubUsername: string;
  workspaceMode: WorkspaceMode;
  monorepoInfo?: MonorepoInfo;
  repositories: RepositoryInfo[];
  selectedRepos: string[];
}

/**
 * Init result
 */
export interface InitResult {
  success: boolean;
  message?: string;
  createdFiles: string[];
}
