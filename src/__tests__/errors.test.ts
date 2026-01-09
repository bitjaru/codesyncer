import {
  CodeSyncerError,
  ErrorCode,
  getErrorMessage,
  formatError,
  safeReadFile,
  safeWriteFile,
} from '../utils/errors';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('error utilities', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codesyncer-error-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('CodeSyncerError', () => {
    it('should create error with code and context', () => {
      const error = new CodeSyncerError(
        'Test error',
        ErrorCode.FILE_NOT_FOUND,
        { path: '/test/path' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.FILE_NOT_FOUND);
      expect(error.context).toEqual({ path: '/test/path' });
      expect(error.name).toBe('CodeSyncerError');
    });
  });

  describe('getErrorMessage', () => {
    it('should return English messages by default', () => {
      expect(getErrorMessage(ErrorCode.FILE_NOT_FOUND)).toBe('File not found');
      expect(getErrorMessage(ErrorCode.PERMISSION_DENIED)).toBe('Permission denied');
    });

    it('should return Korean messages when requested', () => {
      expect(getErrorMessage(ErrorCode.FILE_NOT_FOUND, 'ko')).toBe('파일을 찾을 수 없습니다');
      expect(getErrorMessage(ErrorCode.PERMISSION_DENIED, 'ko')).toBe('권한이 없습니다');
    });

    it('should return unknown error message for undefined codes', () => {
      // @ts-expect-error testing invalid code
      expect(getErrorMessage('INVALID_CODE')).toBe('An unexpected error occurred');
    });
  });

  describe('formatError', () => {
    it('should format CodeSyncerError correctly', () => {
      const error = new CodeSyncerError(
        'Original message',
        ErrorCode.FILE_NOT_FOUND,
        { path: '/test/file.ts' }
      );

      const formatted = formatError(error);
      expect(formatted).toContain('File not found');
      expect(formatted).toContain('/test/file.ts');
    });

    it('should handle Node.js file errors', () => {
      const error = new Error('ENOENT: no such file') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      expect(formatError(error)).toBe('File not found');
    });

    it('should handle permission errors', () => {
      const error = new Error('EACCES: permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';

      expect(formatError(error)).toBe('Permission denied');
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      expect(formatError(error)).toBe('Something went wrong');
    });

    it('should handle non-error values', () => {
      expect(formatError('string error')).toBe('string error');
      expect(formatError(42)).toBe('42');
    });
  });

  describe('safeReadFile', () => {
    it('should read existing file successfully', async () => {
      const filePath = path.join(tempDir, 'test.txt');
      await fs.writeFile(filePath, 'Hello, World!');

      const result = await safeReadFile(filePath);
      expect(result.content).toBe('Hello, World!');
      expect(result.error).toBeUndefined();
    });

    it('should return error for non-existent file', async () => {
      const filePath = path.join(tempDir, 'nonexistent.txt');

      const result = await safeReadFile(filePath);
      expect(result.content).toBeUndefined();
      expect(result.error).toBeInstanceOf(CodeSyncerError);
      expect(result.error?.code).toBe(ErrorCode.FILE_NOT_FOUND);
    });
  });

  describe('safeWriteFile', () => {
    it('should write file successfully', async () => {
      const filePath = path.join(tempDir, 'output.txt');

      const result = await safeWriteFile(filePath, 'Test content');
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Test content');
    });

    it('should create parent directories if needed', async () => {
      const filePath = path.join(tempDir, 'nested', 'dir', 'file.txt');

      const result = await safeWriteFile(filePath, 'Nested content');
      expect(result.success).toBe(true);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Nested content');
    });
  });
});
