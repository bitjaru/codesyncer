import * as fs from 'fs-extra';
import * as path from 'path';
import { Language } from '../types';
import { loadTemplate, replaceTemplateVars } from './template-loader';
import { TemplateStatus, TEMPLATE_FILE_MAP } from './template-version';

/**
 * Template upgrade utilities
 *
 * @codesyncer-context Handles backing up existing templates and applying new versions
 * @codesyncer-decision [2026-01-17] Always backup before upgrading (user data safety)
 * @codesyncer-decision [2026-01-17] Smart merge - only update section-marked content
 */

/**
 * Parsed section from template content
 */
export interface ParsedSection {
  name: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Result of parsing template into sections and user content
 */
export interface ParsedTemplate {
  sections: ParsedSection[];
  userContent: Array<{ content: string; afterSection: string | null }>;
  rawContent: string;
}

/**
 * Result of a template upgrade operation
 */
export interface UpgradeResult {
  success: boolean;
  file: string;
  backupPath?: string;
  error?: string;
}

/**
 * Options for template upgrade
 */
export interface UpgradeOptions {
  lang: Language;
  vars: Record<string, string>;
  dryRun?: boolean;
}

/**
 * Create a backup of a file before upgrading
 *
 * @param filePath - Path to the file to backup
 * @returns Path to the backup file
 */
export async function backupFile(filePath: string): Promise<string> {
  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const today = new Date().toISOString().split('T')[0];
  const backupFileName = `${fileName}.backup.${today}`;
  const backupPath = path.join(dir, backupFileName);

  // If backup already exists today, add a numeric suffix
  let finalBackupPath = backupPath;
  let counter = 1;
  while (await fs.pathExists(finalBackupPath)) {
    finalBackupPath = path.join(dir, `${fileName}.backup.${today}.${counter}`);
    counter++;
  }

  await fs.copy(filePath, finalBackupPath);
  return finalBackupPath;
}

/**
 * Upgrade a single template file
 *
 * @param templateStatus - Template status from version check
 * @param options - Upgrade options
 * @returns Promise resolving to UpgradeResult
 */
export async function upgradeTemplate(
  templateStatus: TemplateStatus,
  options: UpgradeOptions
): Promise<UpgradeResult> {
  const { file, templateName } = templateStatus;
  const { lang, vars, dryRun } = options;

  try {
    // Skip if dry run
    if (dryRun) {
      return {
        success: true,
        file,
        backupPath: `${file}.backup.${new Date().toISOString().split('T')[0]} (dry run)`,
      };
    }

    // Backup existing file
    let backupPath: string | undefined;
    if (await fs.pathExists(file)) {
      backupPath = await backupFile(file);
    }

    // Load and render new template
    const template = await loadTemplate(templateName, lang);
    const content = replaceTemplateVars(template, vars);

    // Write the upgraded template
    await fs.writeFile(file, content, 'utf-8');

    return {
      success: true,
      file,
      backupPath,
    };
  } catch (error) {
    return {
      success: false,
      file,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Upgrade multiple templates
 *
 * @param templates - Array of template statuses to upgrade
 * @param options - Upgrade options
 * @returns Promise resolving to array of UpgradeResults
 */
export async function upgradeTemplates(
  templates: TemplateStatus[],
  options: UpgradeOptions
): Promise<UpgradeResult[]> {
  const results: UpgradeResult[] = [];

  for (const template of templates) {
    const result = await upgradeTemplate(template, options);
    results.push(result);
  }

  return results;
}

/**
 * Extract variables from existing file for re-use during upgrade
 *
 * @param filePath - Path to existing file
 * @returns Record of extracted variables
 */
export async function extractVarsFromFile(filePath: string): Promise<Record<string, string>> {
  const vars: Record<string, string> = {};

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract project name
    const projectNameMatch = content.match(/\*\*(?:프로젝트명|Project Name)\*\*:\s*([^\n]+)/);
    if (projectNameMatch) {
      vars['PROJECT_NAME'] = projectNameMatch[1].trim();
      vars['프로젝트명'] = projectNameMatch[1].trim();
    }

    // Extract tech stack
    const techStackMatch = content.match(/\*\*(?:기술 스택|Tech Stack)\*\*:\s*([^\n]+)/);
    if (techStackMatch) {
      vars['TECH_STACK'] = techStackMatch[1].trim();
      vars['기술 스택'] = techStackMatch[1].trim();
    }

    // Extract project type
    const projectTypeMatch = content.match(/\*\*(?:프로젝트 타입|Project Type)\*\*:\s*([^\n]+)/);
    if (projectTypeMatch) {
      vars['PROJECT_TYPE'] = projectTypeMatch[1].trim();
      vars['프로젝트 타입'] = projectTypeMatch[1].trim();
    }

    // Extract GitHub username
    const githubMatch = content.match(/github\.com\/([^/\s]+)/i);
    if (githubMatch) {
      vars['GITHUB_USERNAME'] = githubMatch[1];
    }
  } catch (error) {
    // Ignore extraction errors
  }

  return vars;
}

/**
 * Get template variables from .claude directory context
 *
 * @param claudeDir - Path to .claude directory
 * @param lang - Language to use
 * @returns Record of template variables
 */
export async function getTemplateVarsFromContext(
  claudeDir: string,
  lang: Language
): Promise<Record<string, string>> {
  const vars: Record<string, string> = {};

  // Try to extract from CLAUDE.md first
  const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');
  if (await fs.pathExists(claudeMdPath)) {
    const extracted = await extractVarsFromFile(claudeMdPath);
    Object.assign(vars, extracted);
  }

  // Default values if not found
  const projectDir = path.dirname(claudeDir);
  if (!vars['PROJECT_NAME']) {
    vars['PROJECT_NAME'] = path.basename(projectDir);
    vars['프로젝트명'] = path.basename(projectDir);
  }

  if (!vars['TECH_STACK']) {
    vars['TECH_STACK'] = 'TypeScript';
    vars['기술 스택'] = 'TypeScript';
  }

  if (!vars['GITHUB_USERNAME']) {
    vars['GITHUB_USERNAME'] = 'your-username';
  }

  // Add date
  const today = new Date().toISOString().split('T')[0];
  vars['TODAY'] = today;
  vars['오늘 날짜'] = today;

  return vars;
}

/**
 * Format upgrade summary for display
 *
 * @param results - Array of upgrade results
 * @param lang - Language for messages
 * @returns Formatted summary string
 */
export function formatUpgradeSummary(results: UpgradeResult[], lang: Language): string {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  const lines: string[] = [];

  if (lang === 'ko') {
    if (successful.length > 0) {
      lines.push(`✅ ${successful.length}개 파일 업그레이드 완료:`);
      successful.forEach((r) => {
        const fileName = path.basename(r.file);
        lines.push(`   • ${fileName}`);
        if (r.backupPath) {
          lines.push(`     백업: ${path.basename(r.backupPath)}`);
        }
      });
    }

    if (failed.length > 0) {
      lines.push(`❌ ${failed.length}개 파일 업그레이드 실패:`);
      failed.forEach((r) => {
        const fileName = path.basename(r.file);
        lines.push(`   • ${fileName}: ${r.error}`);
      });
    }
  } else {
    if (successful.length > 0) {
      lines.push(`✅ ${successful.length} file(s) upgraded:`);
      successful.forEach((r) => {
        const fileName = path.basename(r.file);
        lines.push(`   • ${fileName}`);
        if (r.backupPath) {
          lines.push(`     Backup: ${path.basename(r.backupPath)}`);
        }
      });
    }

    if (failed.length > 0) {
      lines.push(`❌ ${failed.length} file(s) failed:`);
      failed.forEach((r) => {
        const fileName = path.basename(r.file);
        lines.push(`   • ${fileName}: ${r.error}`);
      });
    }
  }

  return lines.join('\n');
}

/**
 * Extract marked sections from template content
 *
 * @codesyncer-context Sections are marked with <!-- codesyncer-section-start:name --> and <!-- codesyncer-section-end:name -->
 * @param content - Template content to parse
 * @returns Array of parsed sections
 */
export function extractSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const sectionRegex = /<!--\s*codesyncer-section-start:(\w+)\s*-->([\s\S]*?)<!--\s*codesyncer-section-end:\1\s*-->/g;

  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    sections.push({
      name: match[1],
      content: match[0], // Full content including markers
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return sections;
}

/**
 * Check if a template supports smart merge (has section markers)
 *
 * @param content - Template content to check
 * @returns True if template has at least one section marker
 */
export function supportsSmartMerge(content: string): boolean {
  return /<!--\s*codesyncer-section-start:\w+\s*-->/.test(content);
}

/**
 * Smart merge: Update only CodeSyncer-managed sections while preserving user content
 *
 * @codesyncer-decision [2026-01-17] Preserve all user content outside marked sections
 * @param existingContent - Current file content (may have user modifications)
 * @param newTemplateContent - New template content with updated sections
 * @returns Merged content with updated sections and preserved user content
 */
export function smartMergeContent(existingContent: string, newTemplateContent: string): string {
  // Extract sections from both contents
  const existingSections = extractSections(existingContent);
  const newSections = extractSections(newTemplateContent);

  // If either doesn't have sections, can't do smart merge
  if (existingSections.length === 0 || newSections.length === 0) {
    return newTemplateContent;
  }

  // Create a map of new sections by name
  const newSectionMap = new Map<string, ParsedSection>();
  for (const section of newSections) {
    newSectionMap.set(section.name, section);
  }

  // Replace each existing section with the new version
  let result = existingContent;
  let offset = 0;

  for (const existingSection of existingSections) {
    const newSection = newSectionMap.get(existingSection.name);

    if (newSection) {
      // Calculate adjusted positions based on accumulated offset
      const adjustedStart = existingSection.startIndex + offset;
      const adjustedEnd = existingSection.endIndex + offset;

      // Replace the section
      result =
        result.substring(0, adjustedStart) +
        newSection.content +
        result.substring(adjustedEnd);

      // Update offset for next replacement
      offset += newSection.content.length - (existingSection.endIndex - existingSection.startIndex);
    }
  }

  // Update the version comment at the end
  const versionRegex = /<!--\s*codesyncer-version:\s*[\d.]+\s*-->/g;
  const newVersionMatch = newTemplateContent.match(versionRegex);
  if (newVersionMatch) {
    result = result.replace(versionRegex, newVersionMatch[newVersionMatch.length - 1]);
  }

  return result;
}

/**
 * Upgrade a template using smart merge to preserve user content
 *
 * @param templateStatus - Template status from version check
 * @param options - Upgrade options
 * @returns Promise resolving to UpgradeResult
 */
export async function upgradeTemplateWithSmartMerge(
  templateStatus: TemplateStatus,
  options: UpgradeOptions
): Promise<UpgradeResult> {
  const { file, templateName } = templateStatus;
  const { lang, vars, dryRun } = options;

  try {
    // Skip if dry run
    if (dryRun) {
      return {
        success: true,
        file,
        backupPath: `${file}.backup.${new Date().toISOString().split('T')[0]} (dry run)`,
      };
    }

    // Check if file exists
    if (!(await fs.pathExists(file))) {
      // No existing file, just use regular upgrade
      return upgradeTemplate(templateStatus, options);
    }

    // Read existing content
    const existingContent = await fs.readFile(file, 'utf-8');

    // Check if existing content supports smart merge
    if (!supportsSmartMerge(existingContent)) {
      // Fall back to regular upgrade (full replacement with backup)
      return upgradeTemplate(templateStatus, options);
    }

    // Create backup
    const backupPath = await backupFile(file);

    // Load and render new template
    const template = await loadTemplate(templateName, lang);
    const newContent = replaceTemplateVars(template, vars);

    // Perform smart merge
    const mergedContent = smartMergeContent(existingContent, newContent);

    // Write the merged content
    await fs.writeFile(file, mergedContent, 'utf-8');

    return {
      success: true,
      file,
      backupPath,
    };
  } catch (error) {
    return {
      success: false,
      file,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Upgrade multiple templates using smart merge
 *
 * @param templates - Array of template statuses to upgrade
 * @param options - Upgrade options
 * @returns Promise resolving to array of UpgradeResults
 */
export async function upgradeTemplatesWithSmartMerge(
  templates: TemplateStatus[],
  options: UpgradeOptions
): Promise<UpgradeResult[]> {
  const results: UpgradeResult[] = [];

  for (const template of templates) {
    const result = await upgradeTemplateWithSmartMerge(template, options);
    results.push(result);
  }

  return results;
}
