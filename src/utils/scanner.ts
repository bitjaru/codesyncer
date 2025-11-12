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
        const type = await detectProjectType(folderPath, entry.name);
        const hasCodeSyncer = await hasCodeSyncerSetup(folderPath);

        repos.push({
          name: entry.name,
          path: folderPath,
          type,
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

/**
 * Detect project type based on folder structure, files, and repository name
 */
async function detectProjectType(folderPath: string, repoName: string): Promise<'frontend' | 'backend' | 'mobile' | 'fullstack'> {
  try {
    // Analyze repository name for hints
    const nameLower = repoName.toLowerCase();
    const nameHints = {
      backend: ['server', 'api', 'backend', 'service', 'socket', 'gateway', 'middleware'],
      frontend: ['client', 'frontend', 'web', 'app', 'ui', 'admin', 'dashboard'],
      mobile: ['mobile', 'ios', 'android', 'app'],
    };

    // Check for Java projects (Spring Boot)
    const hasPomXml = await fs.pathExists(path.join(folderPath, 'pom.xml'));
    const hasGradle = await fs.pathExists(path.join(folderPath, 'build.gradle'));
    if (hasPomXml || hasGradle) {
      // Check if it's Android (mobile) or Spring (backend)
      const hasAndroid = await fs.pathExists(path.join(folderPath, 'app', 'src', 'main', 'AndroidManifest.xml'));
      if (hasAndroid) {
        return 'mobile';
      }
      return 'backend'; // Java Spring Boot
    }

    // Check for Python projects (Django, FastAPI)
    const hasRequirements = await fs.pathExists(path.join(folderPath, 'requirements.txt'));
    const hasPipfile = await fs.pathExists(path.join(folderPath, 'Pipfile'));
    if (hasRequirements || hasPipfile) {
      try {
        let content = '';
        if (hasRequirements) {
          content = await fs.readFile(path.join(folderPath, 'requirements.txt'), 'utf-8');
        }
        // Check for web frameworks
        if (content.includes('django') || content.includes('fastapi') || content.includes('flask')) {
          return 'backend';
        }
      } catch {
        // If can't read file, default to backend
      }
      return 'backend'; // Python backend
    }

    // Check for Node.js projects
    const packageJsonPath = path.join(folderPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Check for mobile
      if (deps['react-native'] || deps['expo'] || deps['@react-native']) {
        return 'mobile';
      }

      // Strong hint from repo name (socket server, api server, etc.)
      if (nameHints.backend.some(keyword => nameLower.includes(keyword))) {
        // If it has socket.io or backend keywords in name, prioritize backend
        if (deps['socket.io'] || deps['express'] || deps['fastify'] || deps['@nestjs/core']) {
          return 'backend';
        }
      }

      // Check for frontend (React, Vue, etc.)
      if (deps['react'] || deps['vue'] || deps['angular'] || deps['svelte']) {
        // Check repo name hints
        if (nameHints.frontend.some(keyword => nameLower.includes(keyword))) {
          return 'frontend';
        }

        // Check if it's Next.js (could be fullstack)
        if (deps['next']) {
          // If has database or backend hints in name, it's fullstack
          if (deps['prisma'] || deps['mongoose'] || deps['@prisma/client'] ||
              nameLower.includes('fullstack') || nameLower.includes('full-stack')) {
            return 'fullstack';
          }
          // If name suggests frontend only, return frontend
          if (nameHints.frontend.some(keyword => nameLower.includes(keyword))) {
            return 'frontend';
          }
          // Next.js with no DB is usually frontend
          return 'frontend';
        }
        return 'frontend';
      }

      // Check for backend (Express, Fastify, NestJS, Socket.IO)
      if (deps['express'] || deps['fastify'] || deps['koa'] || deps['@nestjs/core'] ||
          deps['socket.io'] || deps['ws']) {
        return 'backend';
      }
    }

    // Check for mobile-specific files
    const hasPodfile = await fs.pathExists(path.join(folderPath, 'ios', 'Podfile'));
    const hasAndroidGradle = await fs.pathExists(path.join(folderPath, 'android', 'build.gradle'));
    if (hasPodfile || hasAndroidGradle) {
      return 'mobile';
    }

    // Use repo name as fallback
    if (nameHints.backend.some(keyword => nameLower.includes(keyword))) {
      return 'backend';
    }
    if (nameHints.frontend.some(keyword => nameLower.includes(keyword))) {
      return 'frontend';
    }
    if (nameHints.mobile.some(keyword => nameLower.includes(keyword))) {
      return 'mobile';
    }

    // Default to fullstack if can't determine
    return 'fullstack';
  } catch {
    return 'fullstack';
  }
}

// Tech stack and description detection removed
// AI will analyze these accurately during setup phase

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
