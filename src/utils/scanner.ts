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
        const type = await detectProjectType(folderPath);
        const techStack = await detectTechStack(folderPath, type);
        const hasCodeSyncer = await hasCodeSyncerSetup(folderPath);

        repos.push({
          name: entry.name,
          path: folderPath,
          type,
          description: '', // Will be filled by user input
          techStack, // Auto-detected tech stack
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
 * Detect project type based on folder structure and files
 */
async function detectProjectType(folderPath: string): Promise<'frontend' | 'backend' | 'mobile' | 'fullstack'> {
  try {
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

      // Check for frontend (React, Vue, etc.)
      if (deps['react'] || deps['vue'] || deps['angular'] || deps['svelte']) {
        // Check if it's Next.js (could be fullstack)
        if (deps['next'] && (deps['prisma'] || deps['mongoose'] || deps['@prisma/client'])) {
          return 'fullstack';
        }
        return 'frontend';
      }

      // Check for backend (Express, Fastify, NestJS)
      if (deps['express'] || deps['fastify'] || deps['koa'] || deps['@nestjs/core']) {
        return 'backend';
      }
    }

    // Check for mobile-specific files
    const hasPodfile = await fs.pathExists(path.join(folderPath, 'ios', 'Podfile'));
    const hasAndroidGradle = await fs.pathExists(path.join(folderPath, 'android', 'build.gradle'));
    if (hasPodfile || hasAndroidGradle) {
      return 'mobile';
    }

    // Default to fullstack if can't determine
    return 'fullstack';
  } catch {
    return 'fullstack';
  }
}

/**
 * Detect tech stack based on project files and dependencies
 */
async function detectTechStack(folderPath: string, type: 'frontend' | 'backend' | 'mobile' | 'fullstack'): Promise<string[]> {
  const techStack: string[] = [];

  try {
    // Check for Java projects
    const hasPomXml = await fs.pathExists(path.join(folderPath, 'pom.xml'));
    if (hasPomXml) {
      techStack.push('Java');
      try {
        const pomContent = await fs.readFile(path.join(folderPath, 'pom.xml'), 'utf-8');
        if (pomContent.includes('spring-boot')) {
          techStack.push('Spring Boot');
        }
      } catch {}
      return techStack;
    }

    const hasGradle = await fs.pathExists(path.join(folderPath, 'build.gradle'));
    if (hasGradle) {
      techStack.push('Java');
      try {
        const gradleContent = await fs.readFile(path.join(folderPath, 'build.gradle'), 'utf-8');
        if (gradleContent.includes('spring-boot')) {
          techStack.push('Spring Boot');
        }
      } catch {}
      return techStack;
    }

    // Check for Python projects
    const hasRequirements = await fs.pathExists(path.join(folderPath, 'requirements.txt'));
    if (hasRequirements) {
      techStack.push('Python');
      try {
        const reqContent = await fs.readFile(path.join(folderPath, 'requirements.txt'), 'utf-8');
        if (reqContent.includes('django')) techStack.push('Django');
        if (reqContent.includes('fastapi')) techStack.push('FastAPI');
        if (reqContent.includes('flask')) techStack.push('Flask');
      } catch {}
      return techStack;
    }

    // Check for Node.js projects
    const packageJsonPath = path.join(folderPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Check for TypeScript
      if (deps['typescript']) {
        techStack.push('TypeScript');
      } else {
        techStack.push('JavaScript');
      }

      // Frontend frameworks
      if (deps['react']) techStack.push('React');
      if (deps['vue']) techStack.push('Vue');
      if (deps['angular']) techStack.push('Angular');
      if (deps['svelte']) techStack.push('Svelte');
      if (deps['next']) techStack.push('Next.js');

      // Backend frameworks
      if (deps['express']) techStack.push('Express');
      if (deps['fastify']) techStack.push('Fastify');
      if (deps['@nestjs/core']) techStack.push('NestJS');
      if (deps['koa']) techStack.push('Koa');

      // Mobile
      if (deps['react-native']) techStack.push('React Native');
      if (deps['expo']) techStack.push('Expo');

      // Build tools
      if (deps['vite']) techStack.push('Vite');
      if (deps['webpack']) techStack.push('Webpack');

      return techStack;
    }

    // Default fallback based on type
    const fallbackStack: Record<string, string[]> = {
      frontend: ['React', 'TypeScript'],
      backend: ['Node.js', 'TypeScript'],
      mobile: ['React Native', 'TypeScript'],
      fullstack: ['Next.js', 'TypeScript'],
    };

    return fallbackStack[type] || ['TypeScript'];
  } catch (error) {
    // Fallback to defaults
    return ['TypeScript'];
  }
}

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
