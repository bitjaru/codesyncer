import * as path from 'path';
import {
  validatePath,
  sanitizeName,
  validateRepoPath,
  isPathAllowed,
  validateFileExtension,
  containsDangerousContent,
  escapeForMarkdown,
  safePathComponent,
} from '../utils/security';
import { CodeSyncerError, ErrorCode } from '../utils/errors';

describe('security utilities', () => {
  describe('validatePath', () => {
    const basePath = '/home/user/project';

    it('should allow valid paths within base directory', () => {
      expect(validatePath('src/index.ts', basePath)).toBe('/home/user/project/src/index.ts');
      expect(validatePath('packages/core', basePath)).toBe('/home/user/project/packages/core');
    });

    it('should reject path traversal attempts', () => {
      expect(() => validatePath('../../../etc/passwd', basePath)).toThrow(CodeSyncerError);
      expect(() => validatePath('src/../../secret', basePath)).toThrow();
    });

    it('should reject absolute paths outside base', () => {
      expect(() => validatePath('/etc/passwd', basePath)).toThrow(CodeSyncerError);
    });

    it('should allow the base path itself', () => {
      expect(validatePath('.', basePath)).toBe(basePath);
    });
  });

  describe('sanitizeName', () => {
    it('should remove path separators', () => {
      expect(sanitizeName('foo/bar')).toBe('foobar');
      expect(sanitizeName('foo\\bar')).toBe('foobar');
    });

    it('should remove leading dots', () => {
      expect(sanitizeName('..hidden')).toBe('hidden');
      expect(sanitizeName('...test')).toBe('test');
    });

    it('should reject empty names', () => {
      expect(() => sanitizeName('')).toThrow(CodeSyncerError);
      expect(() => sanitizeName('...')).toThrow();
    });

    it('should reject Windows reserved names', () => {
      expect(() => sanitizeName('CON')).toThrow(CodeSyncerError);
      expect(() => sanitizeName('nul')).toThrow();
      expect(() => sanitizeName('COM1')).toThrow();
    });

    it('should allow valid names', () => {
      expect(sanitizeName('my-project')).toBe('my-project');
      expect(sanitizeName('package_name')).toBe('package_name');
      expect(sanitizeName('v1.0.0')).toBe('v1.0.0');
    });

    it('should remove null bytes', () => {
      expect(sanitizeName('foo\0bar')).toBe('foobar');
    });
  });

  describe('validateRepoPath', () => {
    const basePath = '/home/user/projects';

    it('should return sanitized and validated path', () => {
      expect(validateRepoPath('my-repo', basePath)).toBe('/home/user/projects/my-repo');
    });

    it('should reject dangerous repo names', () => {
      // Empty string should throw
      expect(() => validateRepoPath('', basePath)).toThrow();
      // Note: '../secret' gets sanitized to 'secret' by sanitizeName, so it passes
      // Only truly dangerous patterns like '...' or reserved names throw
      expect(() => validateRepoPath('...', basePath)).toThrow();
      expect(() => validateRepoPath('CON', basePath)).toThrow();
    });
  });

  describe('isPathAllowed', () => {
    it('should return true for paths within allowed directories', () => {
      const allowed = ['/home/user/project', '/home/user/other'];
      expect(isPathAllowed('/home/user/project/src/index.ts', allowed)).toBe(true);
      expect(isPathAllowed('/home/user/other/file.js', allowed)).toBe(true);
    });

    it('should return false for paths outside allowed directories', () => {
      const allowed = ['/home/user/project'];
      expect(isPathAllowed('/etc/passwd', allowed)).toBe(false);
      expect(isPathAllowed('/home/user/other', allowed)).toBe(false);
    });

    it('should return true for exact matches', () => {
      const allowed = ['/home/user/project'];
      expect(isPathAllowed('/home/user/project', allowed)).toBe(true);
    });
  });

  describe('validateFileExtension', () => {
    const allowed = ['.ts', '.js', '.md'];

    it('should return true for allowed extensions', () => {
      expect(validateFileExtension('/path/to/file.ts', allowed)).toBe(true);
      expect(validateFileExtension('/path/to/file.js', allowed)).toBe(true);
    });

    it('should return false for disallowed extensions', () => {
      expect(validateFileExtension('/path/to/file.exe', allowed)).toBe(false);
      expect(validateFileExtension('/path/to/file.sh', allowed)).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(validateFileExtension('/path/to/file.TS', allowed)).toBe(true);
      expect(validateFileExtension('/path/to/file.JS', allowed)).toBe(true);
    });
  });

  describe('containsDangerousContent', () => {
    it('should detect template literals', () => {
      expect(containsDangerousContent('Hello ${user}')).toBe(true);
    });

    it('should detect eval calls', () => {
      expect(containsDangerousContent('eval("code")')).toBe(true);
      expect(containsDangerousContent('eval (x)')).toBe(true);
    });

    it('should detect script tags', () => {
      expect(containsDangerousContent('<script>alert(1)</script>')).toBe(true);
      expect(containsDangerousContent('<SCRIPT src="x">')).toBe(true);
    });

    it('should detect javascript protocol', () => {
      expect(containsDangerousContent('javascript:alert(1)')).toBe(true);
    });

    it('should return false for safe content', () => {
      expect(containsDangerousContent('Hello world')).toBe(false);
      expect(containsDangerousContent('const x = 1')).toBe(false);
    });
  });

  describe('escapeForMarkdown', () => {
    it('should escape markdown special characters', () => {
      expect(escapeForMarkdown('*bold*')).toBe('\\*bold\\*');
      expect(escapeForMarkdown('_italic_')).toBe('\\_italic\\_');
      expect(escapeForMarkdown('`code`')).toBe('\\`code\\`');
    });

    it('should escape brackets', () => {
      expect(escapeForMarkdown('[link](url)')).toBe('\\[link\\]\\(url\\)');
    });
  });

  describe('safePathComponent', () => {
    it('should remove special characters', () => {
      expect(safePathComponent('my file.txt')).toBe('my_file.txt');
      expect(safePathComponent('test@user')).toBe('test_user');
    });

    it('should collapse multiple underscores', () => {
      expect(safePathComponent('foo   bar')).toBe('foo_bar');
    });

    it('should trim leading/trailing underscores', () => {
      expect(safePathComponent('  test  ')).toBe('test');
    });

    it('should allow safe characters', () => {
      expect(safePathComponent('my-file_v1.0')).toBe('my-file_v1.0');
    });
  });
});
