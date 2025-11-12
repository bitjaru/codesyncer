import * as fs from 'fs-extra';
import * as path from 'path';
import { RepositoryInfo } from '../types';

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
 * Check if master CodeSyncer setup exists in root
 */
export async function hasMasterSetup(rootPath: string): Promise<boolean> {
  const masterPath = path.join(rootPath, '.codesyncer');
  const legacyMasterPath = path.join(rootPath, '.master');

  return (await fs.pathExists(masterPath)) || (await fs.pathExists(legacyMasterPath));
}
