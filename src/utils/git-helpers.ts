import * as fs from 'fs-extra';
import * as path from 'path';

export interface GitInfo {
  username?: string;
  repoName?: string;
  remoteUrl?: string;
}

/**
 * Extract GitHub info from .git/config
 */
export async function getGitHubInfo(dir: string): Promise<GitInfo> {
  const gitConfigPath = path.join(dir, '.git', 'config');

  try {
    if (!(await fs.pathExists(gitConfigPath))) {
      return {};
    }

    const content = await fs.readFile(gitConfigPath, 'utf-8');

    // Parse remote URL patterns:
    // git@github.com:username/repo.git
    // https://github.com/username/repo.git
    // https://github.com/username/repo
    const patterns = [
      /github\.com[:/]([^/]+)\/([^/\s.]+)(?:\.git)?/,
      /gitlab\.com[:/]([^/]+)\/([^/\s.]+)(?:\.git)?/,
      /bitbucket\.org[:/]([^/]+)\/([^/\s.]+)(?:\.git)?/,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return {
          username: match[1],
          repoName: match[2],
          remoteUrl: match[0],
        };
      }
    }

    return {};
  } catch {
    return {};
  }
}

/**
 * Check if directory is a git repository
 */
export async function isGitRepository(dir: string): Promise<boolean> {
  const gitDir = path.join(dir, '.git');
  return fs.pathExists(gitDir);
}
