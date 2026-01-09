/**
 * CodeSyncer Error Handling Utilities
 *
 * Provides consistent error handling and user-friendly error messages.
 */

import chalk from 'chalk';

/**
 * Custom error class for CodeSyncer-specific errors
 */
export class CodeSyncerError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CodeSyncerError';
  }
}

/**
 * Error codes for categorizing errors
 */
export enum ErrorCode {
  // File system errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Configuration errors
  INVALID_CONFIG = 'INVALID_CONFIG',
  MISSING_SETUP = 'MISSING_SETUP',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',

  // Security errors
  PATH_TRAVERSAL = 'PATH_TRAVERSAL',
  INVALID_PATH = 'INVALID_PATH',

  // Runtime errors
  SCAN_ERROR = 'SCAN_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ErrorCode, { en: string; ko: string }> = {
  [ErrorCode.FILE_NOT_FOUND]: {
    en: 'File not found',
    ko: '파일을 찾을 수 없습니다',
  },
  [ErrorCode.FILE_READ_ERROR]: {
    en: 'Failed to read file',
    ko: '파일 읽기 실패',
  },
  [ErrorCode.FILE_WRITE_ERROR]: {
    en: 'Failed to write file',
    ko: '파일 쓰기 실패',
  },
  [ErrorCode.PERMISSION_DENIED]: {
    en: 'Permission denied',
    ko: '권한이 없습니다',
  },
  [ErrorCode.INVALID_CONFIG]: {
    en: 'Invalid configuration',
    ko: '잘못된 설정',
  },
  [ErrorCode.MISSING_SETUP]: {
    en: 'CodeSyncer setup not found. Run `codesyncer init` first.',
    ko: 'CodeSyncer 설정이 없습니다. 먼저 `codesyncer init`을 실행하세요.',
  },
  [ErrorCode.TEMPLATE_NOT_FOUND]: {
    en: 'Template file not found',
    ko: '템플릿 파일을 찾을 수 없습니다',
  },
  [ErrorCode.PATH_TRAVERSAL]: {
    en: 'Invalid path: path traversal detected',
    ko: '잘못된 경로: 경로 탐색 공격이 감지되었습니다',
  },
  [ErrorCode.INVALID_PATH]: {
    en: 'Invalid path',
    ko: '잘못된 경로',
  },
  [ErrorCode.SCAN_ERROR]: {
    en: 'Failed to scan project',
    ko: '프로젝트 스캔 실패',
  },
  [ErrorCode.PARSE_ERROR]: {
    en: 'Failed to parse file',
    ko: '파일 파싱 실패',
  },
  [ErrorCode.NETWORK_ERROR]: {
    en: 'Network error',
    ko: '네트워크 오류',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    en: 'An unexpected error occurred',
    ko: '예상치 못한 오류가 발생했습니다',
  },
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: ErrorCode, lang: 'en' | 'ko' = 'en'): string {
  return ERROR_MESSAGES[code]?.[lang] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR][lang];
}

/**
 * Format error for display
 */
export function formatError(error: unknown, lang: 'en' | 'ko' = 'en'): string {
  if (error instanceof CodeSyncerError) {
    const baseMessage = getErrorMessage(error.code, lang);
    const details = error.context?.path ? `: ${error.context.path}` : '';
    return `${baseMessage}${details}`;
  }

  if (error instanceof Error) {
    // Handle Node.js file system errors
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === 'ENOENT') {
      return getErrorMessage(ErrorCode.FILE_NOT_FOUND, lang);
    }
    if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
      return getErrorMessage(ErrorCode.PERMISSION_DENIED, lang);
    }
    if (nodeError.code === 'EISDIR') {
      return lang === 'ko' ? '디렉토리입니다 (파일이 아님)' : 'Is a directory (not a file)';
    }

    return error.message;
  }

  return String(error);
}

/**
 * Log error with context (for debugging)
 */
export function logError(
  error: unknown,
  context?: string,
  options: { verbose?: boolean; lang?: 'en' | 'ko' } = {}
): void {
  const { verbose = false, lang = 'en' } = options;

  const formattedError = formatError(error, lang);

  if (context) {
    console.error(chalk.red(`✗ ${context}: ${formattedError}`));
  } else {
    console.error(chalk.red(`✗ ${formattedError}`));
  }

  // Show stack trace in verbose mode
  if (verbose && error instanceof Error && error.stack) {
    console.error(chalk.gray(error.stack));
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: { context?: string; fallback?: R; lang?: 'en' | 'ko' } = {}
): (...args: T) => Promise<R | undefined> {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, options.context, { lang: options.lang });
      return options.fallback;
    }
  };
}

/**
 * Safe file read with error handling
 */
export async function safeReadFile(
  filePath: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<{ content: string; error?: never } | { content?: never; error: CodeSyncerError }> {
  try {
    const fs = await import('fs-extra');
    const content = await fs.readFile(filePath, encoding);
    return { content };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    let code = ErrorCode.FILE_READ_ERROR;

    if (nodeError.code === 'ENOENT') {
      code = ErrorCode.FILE_NOT_FOUND;
    } else if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
      code = ErrorCode.PERMISSION_DENIED;
    }

    return {
      error: new CodeSyncerError(
        nodeError.message || 'Failed to read file',
        code,
        { path: filePath }
      ),
    };
  }
}

/**
 * Safe file write with error handling
 */
export async function safeWriteFile(
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<{ success: true; error?: never } | { success: false; error: CodeSyncerError }> {
  try {
    const fs = await import('fs-extra');
    await fs.ensureDir(await import('path').then(p => p.dirname(filePath)));
    await fs.writeFile(filePath, content, encoding);
    return { success: true };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    let code = ErrorCode.FILE_WRITE_ERROR;

    if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
      code = ErrorCode.PERMISSION_DENIED;
    }

    return {
      success: false,
      error: new CodeSyncerError(
        nodeError.message || 'Failed to write file',
        code,
        { path: filePath }
      ),
    };
  }
}
