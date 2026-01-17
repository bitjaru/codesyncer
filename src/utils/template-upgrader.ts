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
 */

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
