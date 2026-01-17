import * as fs from 'fs-extra';
import * as path from 'path';
import { VERSION } from './version';
import { Language } from '../types';

/**
 * Template version extraction and comparison utilities
 *
 * @codesyncer-context Supports template upgrade feature in update command
 * @codesyncer-decision [2026-01-17] Using HTML comment format for version metadata
 */

/**
 * Version metadata regex pattern
 * Matches: <!-- codesyncer-version: X.Y.Z -->
 */
const VERSION_PATTERN = /<!--\s*codesyncer-version:\s*([\d.]+)\s*-->/;

/**
 * Mapping of .claude file names to template names
 */
export const TEMPLATE_FILE_MAP: Record<string, string> = {
  'CLAUDE.md': 'claude',
  'ARCHITECTURE.md': 'architecture',
  'COMMENT_GUIDE.md': 'comment_guide',
  'DECISIONS.md': 'decisions',
};

/**
 * Template status information for upgrade checks
 */
export interface TemplateStatus {
  file: string;
  templateName: string;
  currentVersion: string | null;
  latestVersion: string;
  isOutdated: boolean;
}

/**
 * Extract template version from file content
 *
 * @param content - File content to extract version from
 * @returns Version string or null if not found
 */
export function extractTemplateVersion(content: string): string | null {
  const match = content.match(VERSION_PATTERN);
  return match ? match[1] : null;
}

/**
 * Compare two semantic versions
 *
 * @param v1 - First version string (e.g., "3.0.0")
 * @param v2 - Second version string (e.g., "3.0.1")
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

/**
 * Check if a file's template version is outdated compared to current package version
 *
 * @param filePath - Path to the file to check
 * @returns Promise resolving to TemplateStatus
 */
export async function checkTemplateVersion(filePath: string): Promise<TemplateStatus> {
  const fileName = path.basename(filePath);
  const templateName = TEMPLATE_FILE_MAP[fileName] || fileName.toLowerCase().replace('.md', '');

  let currentVersion: string | null = null;
  let isOutdated = false;

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    currentVersion = extractTemplateVersion(content);

    if (currentVersion) {
      isOutdated = compareVersions(currentVersion, VERSION) < 0;
    } else {
      // No version found means it's from before versioning was added
      // Consider it outdated
      isOutdated = true;
    }
  } catch (error) {
    // File doesn't exist or can't be read
    isOutdated = false;
  }

  return {
    file: filePath,
    templateName,
    currentVersion,
    latestVersion: VERSION,
    isOutdated,
  };
}

/**
 * Scan a .claude directory for template files and check their versions
 *
 * @param claudeDir - Path to the .claude directory
 * @returns Promise resolving to array of TemplateStatus objects
 */
export async function scanTemplateVersions(claudeDir: string): Promise<TemplateStatus[]> {
  const results: TemplateStatus[] = [];

  for (const fileName of Object.keys(TEMPLATE_FILE_MAP)) {
    const filePath = path.join(claudeDir, fileName);

    if (await fs.pathExists(filePath)) {
      const status = await checkTemplateVersion(filePath);
      results.push(status);
    }
  }

  return results;
}

/**
 * Get all outdated templates from a .claude directory
 *
 * @param claudeDir - Path to the .claude directory
 * @returns Promise resolving to array of outdated TemplateStatus objects
 */
export async function getOutdatedTemplates(claudeDir: string): Promise<TemplateStatus[]> {
  const allTemplates = await scanTemplateVersions(claudeDir);
  return allTemplates.filter((t) => t.isOutdated);
}

/**
 * Check if any templates in a .claude directory need upgrading
 *
 * @param claudeDir - Path to the .claude directory
 * @returns Promise resolving to boolean
 */
export async function hasOutdatedTemplates(claudeDir: string): Promise<boolean> {
  const outdated = await getOutdatedTemplates(claudeDir);
  return outdated.length > 0;
}

/**
 * Get the current package version (for display purposes)
 *
 * @returns Current package version string
 */
export function getCurrentVersion(): string {
  return VERSION;
}
