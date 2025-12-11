import * as fs from 'fs-extra';
import * as path from 'path';
import { RepositoryInfo, MonorepoInfo, MonorepoTool } from '../types';
import * as yaml from 'js-yaml';

/**
 * Detect if the directory is a monorepo and return monorepo info
 */
export async function detectMonorepo(rootPath: string): Promise<MonorepoInfo | null> {
  try {
    // 1. Check for pnpm-workspace.yaml (pnpm)
    const pnpmWorkspacePath = path.join(rootPath, 'pnpm-workspace.yaml');
    if (await fs.pathExists(pnpmWorkspacePath)) {
      const content = await fs.readFile(pnpmWorkspacePath, 'utf-8');
      const parsed = yaml.load(content) as { packages?: string[] };
      return {
        tool: 'pnpm',
        patterns: parsed.packages || ['packages/*'],
        configFile: 'pnpm-workspace.yaml',
      };
    }

    // 2. Check for turbo.json (Turborepo)
    const turboJsonPath = path.join(rootPath, 'turbo.json');
    if (await fs.pathExists(turboJsonPath)) {
      // Turbo uses package.json workspaces, check there
      const packageJsonPath = path.join(rootPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        const patterns = extractWorkspacePatterns(pkg);
        if (patterns.length > 0) {
          return {
            tool: 'turbo',
            patterns,
            configFile: 'turbo.json',
          };
        }
      }
    }

    // 3. Check for nx.json (Nx)
    const nxJsonPath = path.join(rootPath, 'nx.json');
    if (await fs.pathExists(nxJsonPath)) {
      // Nx default patterns
      return {
        tool: 'nx',
        patterns: ['packages/*', 'apps/*', 'libs/*'],
        configFile: 'nx.json',
      };
    }

    // 4. Check for lerna.json (Lerna)
    const lernaJsonPath = path.join(rootPath, 'lerna.json');
    if (await fs.pathExists(lernaJsonPath)) {
      const lerna = JSON.parse(await fs.readFile(lernaJsonPath, 'utf-8'));
      return {
        tool: 'lerna',
        patterns: lerna.packages || ['packages/*'],
        configFile: 'lerna.json',
      };
    }

    // 5. Check for rush.json (Rush)
    const rushJsonPath = path.join(rootPath, 'rush.json');
    if (await fs.pathExists(rushJsonPath)) {
      return {
        tool: 'rush',
        patterns: ['apps/*', 'libraries/*', 'tools/*'],
        configFile: 'rush.json',
      };
    }

    // 6. Check for package.json with workspaces (npm/yarn workspaces)
    const packageJsonPath = path.join(rootPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const patterns = extractWorkspacePatterns(pkg);
      if (patterns.length > 0) {
        // Determine if it's yarn or npm based on lock file
        const hasYarnLock = await fs.pathExists(path.join(rootPath, 'yarn.lock'));
        return {
          tool: hasYarnLock ? 'yarn-workspaces' : 'npm-workspaces',
          patterns,
          configFile: 'package.json',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract workspace patterns from package.json
 */
function extractWorkspacePatterns(pkg: Record<string, unknown>): string[] {
  // npm/yarn style: { "workspaces": ["packages/*"] }
  if (Array.isArray(pkg.workspaces)) {
    return pkg.workspaces as string[];
  }
  // yarn style: { "workspaces": { "packages": ["packages/*"] } }
  if (pkg.workspaces && typeof pkg.workspaces === 'object') {
    const ws = pkg.workspaces as { packages?: string[] };
    if (Array.isArray(ws.packages)) {
      return ws.packages;
    }
  }
  return [];
}

/**
 * Expand glob patterns to actual directory paths
 */
async function expandGlobPatterns(rootPath: string, patterns: string[]): Promise<string[]> {
  const directories: string[] = [];

  for (const pattern of patterns) {
    // Handle patterns like "packages/*", "apps/*", "libs/*"
    if (pattern.endsWith('/*') || pattern.endsWith('/**')) {
      const baseDir = pattern.replace(/\/\*\*?$/, '');
      const basePath = path.join(rootPath, baseDir);

      if (await fs.pathExists(basePath)) {
        const entries = await fs.readdir(basePath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            directories.push(path.join(basePath, entry.name));
          }
        }
      }
    } else if (!pattern.includes('*')) {
      // Direct path like "packages/shared"
      const directPath = path.join(rootPath, pattern);
      if (await fs.pathExists(directPath)) {
        directories.push(directPath);
      }
    }
  }

  return directories;
}

/**
 * Scan monorepo for packages
 */
export async function scanMonorepoPackages(
  rootPath: string,
  monorepoInfo: MonorepoInfo
): Promise<RepositoryInfo[]> {
  const packages: RepositoryInfo[] = [];
  const packageDirs = await expandGlobPatterns(rootPath, monorepoInfo.patterns);

  for (const packageDir of packageDirs) {
    // Check if it's a valid package (has package.json or other project files)
    if (await isValidRepository(packageDir)) {
      const hasCodeSyncer = await hasCodeSyncerSetup(packageDir);
      const relativePath = path.relative(rootPath, packageDir);

      packages.push({
        name: path.basename(packageDir),
        path: packageDir,
        type: undefined,
        description: undefined,
        techStack: undefined,
        hasCodeSyncer,
        isMonorepoPackage: true,
        relativePath,
      });
    }
  }

  return packages;
}

/**
 * Check if current directory itself is a repository (for single-repo mode)
 * Now also checks if it's a monorepo
 */
export async function isCurrentDirRepository(dirPath: string): Promise<boolean> {
  // First check if it's a monorepo - if so, don't treat as single repo
  const monorepoInfo = await detectMonorepo(dirPath);
  if (monorepoInfo) {
    return false;  // It's a monorepo, not a single repo
  }

  return isValidRepository(dirPath);
}

/**
 * Check if a folder is a valid repository
 */
async function isValidRepository(folderPath: string): Promise<boolean> {
  try {
    // Check for package.json (Node.js projects)
    const hasPackageJson = await fs.pathExists(path.join(folderPath, 'package.json'));
    if (hasPackageJson) return true;

    // Check for .git folder
    const hasGit = await fs.pathExists(path.join(folderPath, '.git'));
    if (hasGit) return true;

    // Check for common project files
    const commonFiles = [
      'pom.xml',        // Java
      'requirements.txt', // Python
      'Cargo.toml',     // Rust
      'go.mod',         // Go
      'build.gradle',   // Android/Java
      'pubspec.yaml',   // Flutter/Dart
    ];

    for (const file of commonFiles) {
      if (await fs.pathExists(path.join(folderPath, file))) {
        return true;
      }
    }

    // Check for src folder (common in many projects)
    const hasSrc = await fs.pathExists(path.join(folderPath, 'src'));
    if (hasSrc) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Scan current directory for potential repository folders
 * Looks for folders that contain package.json, git repos, or common project structures
 */
export async function scanForRepositories(rootPath: string): Promise<RepositoryInfo[]> {
  const repos: RepositoryInfo[] = [];

  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Skip node_modules, .git, dist, build folders
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
        continue;
      }

      const folderPath = path.join(rootPath, entry.name);
      const isRepo = await isValidRepository(folderPath);

      if (isRepo) {
        const hasCodeSyncer = await hasCodeSyncerSetup(folderPath);

        repos.push({
          name: entry.name,
          path: folderPath,
          type: undefined, // AI will analyze
          description: undefined, // AI will analyze
          techStack: undefined, // AI will analyze
          hasCodeSyncer,
        });
      }
    }
  } catch (error) {
    console.error('Error scanning directories:', error);
  }

  return repos;
}

// All project analysis removed - AI will analyze during setup phase
// - Project type (frontend/backend/mobile/fullstack)
// - Tech stack
// - Description

/**
 * Check if CodeSyncer is already set up in the repository
 */
async function hasCodeSyncerSetup(folderPath: string): Promise<boolean> {
  const claudePath = path.join(folderPath, '.claude');
  const vibeSyncPath = path.join(folderPath, '.codesyncer');

  return (await fs.pathExists(claudePath)) || (await fs.pathExists(vibeSyncPath));
}

/**
 * Check if master CodeSyncer setup exists in root (multi-repo mode)
 */
export async function hasMasterSetup(rootPath: string): Promise<boolean> {
  const masterPath = path.join(rootPath, '.codesyncer');
  const legacyMasterPath = path.join(rootPath, '.master');

  return (await fs.pathExists(masterPath)) || (await fs.pathExists(legacyMasterPath));
}

/**
 * Check if single-repo CodeSyncer setup exists (single-repo mode)
 */
export async function hasSingleRepoSetup(rootPath: string): Promise<boolean> {
  const claudePath = path.join(rootPath, '.claude');
  return fs.pathExists(claudePath);
}
