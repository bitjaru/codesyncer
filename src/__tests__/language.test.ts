import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import {
  detectLanguageFromContent,
  detectLanguage,
  getLanguageDisplayName,
} from '../utils/language';

describe('language utilities', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codesyncer-lang-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('detectLanguageFromContent', () => {
    it('should detect Korean from explicit markers', () => {
      const result = detectLanguageFromContent('# 프로젝트\n언어: ko\n한국어 문서입니다.');
      expect(result.lang).toBe('ko');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect English from explicit markers', () => {
      const result = detectLanguageFromContent('# Project\nLanguage: en\nEnglish documentation.');
      expect(result.lang).toBe('en');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect Korean from Hangul characters', () => {
      const result = detectLanguageFromContent('이 프로젝트는 레포지토리 구조를 설명합니다. 폴더 구조와 파일 설명이 포함되어 있습니다.');
      expect(result.lang).toBe('ko');
    });

    it('should detect English from common keywords', () => {
      const result = detectLanguageFromContent('# Repository\n\n## Getting Started\n\nInstallation guide for the project.');
      expect(result.lang).toBe('en');
    });

    it('should default to English for ambiguous content', () => {
      const result = detectLanguageFromContent('const x = 1;');
      expect(result.lang).toBe('en');
    });

    it('should handle mixed content', () => {
      const result = detectLanguageFromContent('# 프로젝트\nThis is a project.');
      // Should favor Korean due to the keyword
      expect(result.lang).toBe('ko');
    });
  });

  describe('detectLanguage', () => {
    it('should detect from config.json with high confidence', async () => {
      await fs.ensureDir(path.join(tempDir, '.codesyncer'));
      await fs.writeJson(path.join(tempDir, '.codesyncer', 'config.json'), {
        lang: 'ko',
      });

      const result = await detectLanguage(tempDir);
      expect(result.lang).toBe('ko');
      expect(result.source).toBe('config.json');
    });

    it('should detect from SETUP_GUIDE.md', async () => {
      await fs.ensureDir(path.join(tempDir, '.codesyncer'));
      await fs.writeFile(
        path.join(tempDir, '.codesyncer', 'SETUP_GUIDE.md'),
        '# 설정 가이드\n\n레포지토리 구조 설명'
      );

      const result = await detectLanguage(tempDir);
      expect(result.lang).toBe('ko');
    });

    it('should fallback to system locale', async () => {
      // No config files - should use system locale
      const result = await detectLanguage(tempDir);
      expect(['en', 'ko']).toContain(result.lang);
      expect(result.source).toBe('system_locale');
    });
  });

  describe('getLanguageDisplayName', () => {
    it('should return correct display names', () => {
      expect(getLanguageDisplayName('en')).toBe('English');
      expect(getLanguageDisplayName('ko')).toBe('한국어 (Korean)');
    });
  });
});
