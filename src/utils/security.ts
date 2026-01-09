/**
 * CodeSyncer Security Utilities
 *
 * Provides path validation and security checks to prevent
 * path traversal attacks and other security issues.
 */

import * as path from 'path';
import { CodeSyncerError, ErrorCode } from './errors';

/**
 * Validate that a path is safe (no traversal attacks)
 * Ensures the resolved path stays within the allowed base directory
 */
export function validatePath(inputPath: string, basePath: string): string {
  // Normalize both paths
  const normalizedBase = path.resolve(basePath);
  const resolvedPath = path.resolve(basePath, inputPath);

  // Check if the resolved path starts with the base path
  // This prevents paths like "../../../etc/passwd"
  if (!resolvedPath.startsWith(normalizedBase + path.sep) && resolvedPath !== normalizedBase) {
    throw new CodeSyncerError(
      `Path traversal attempt detected: ${inputPath}`,
      ErrorCode.PATH_TRAVERSAL,
      { inputPath, basePath, resolvedPath }
    );
  }

  return resolvedPath;
}

/**
 * Sanitize a repository/folder name
 * Removes dangerous characters and validates the name
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new CodeSyncerError('Invalid name: empty or not a string', ErrorCode.INVALID_PATH);
  }

  // Remove null bytes and other dangerous characters
  let sanitized = name.replace(/\0/g, '');

  // Remove path separators
  sanitized = sanitized.replace(/[/\\]/g, '');

  // Remove leading dots (prevents hidden files and parent directory references)
  sanitized = sanitized.replace(/^\.+/, '');

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');

  // Validate the result
  if (!sanitized) {
    throw new CodeSyncerError('Invalid name: empty after sanitization', ErrorCode.INVALID_PATH);
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i, // Windows reserved names
    /^\.\.?$/,  // . and ..
    /[<>:"|?*]/,  // Windows invalid characters
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      throw new CodeSyncerError(
        `Invalid name: contains dangerous pattern: ${sanitized}`,
        ErrorCode.INVALID_PATH
      );
    }
  }

  return sanitized;
}

/**
 * Validate a repository path before creating directories
 */
export function validateRepoPath(repoName: string, basePath: string): string {
  // First sanitize the name
  const sanitizedName = sanitizeName(repoName);

  // Then validate the full path
  const fullPath = validatePath(sanitizedName, basePath);

  return fullPath;
}

/**
 * Check if a path is within allowed directories
 */
export function isPathAllowed(targetPath: string, allowedPaths: string[]): boolean {
  const normalizedTarget = path.resolve(targetPath);

  return allowedPaths.some(allowed => {
    const normalizedAllowed = path.resolve(allowed);
    return normalizedTarget.startsWith(normalizedAllowed + path.sep) ||
           normalizedTarget === normalizedAllowed;
  });
}

/**
 * Validate file extension
 */
export function validateFileExtension(
  filePath: string,
  allowedExtensions: string[]
): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Check if path contains potentially dangerous content
 */
export function containsDangerousContent(content: string): boolean {
  const dangerousPatterns = [
    /\$\{.*?\}/,  // Template literals that could be exploited
    /eval\s*\(/,  // eval calls
    /Function\s*\(/,  // Function constructor
    /<script[^>]*>/i,  // Script tags
    /javascript:/i,  // JavaScript protocol
  ];

  return dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * Escape special characters in strings for safe file writing
 */
export function escapeForMarkdown(str: string): string {
  // Escape markdown special characters when inserting user content
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}

/**
 * Safe string for use in file paths
 */
export function safePathComponent(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}
