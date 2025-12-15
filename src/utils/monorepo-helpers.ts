import { MonorepoTool } from '../types';

/**
 * Get human-readable name for monorepo tool
 */
export function getMonorepoToolName(tool: MonorepoTool | string): string {
  const names: Record<string, string> = {
    'npm-workspaces': 'npm Workspaces',
    'yarn-workspaces': 'Yarn Workspaces',
    'pnpm': 'pnpm',
    'lerna': 'Lerna',
    'nx': 'Nx',
    'turbo': 'Turborepo',
    'rush': 'Rush',
    'unknown': 'Unknown',
  };
  return names[tool] || tool;
}
