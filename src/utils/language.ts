/**
 * CodeSyncer Language Detection Utilities
 *
 * Provides improved language detection with multiple fallback methods.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Language } from '../types';

/**
 * Configuration for language detection
 */
interface LanguageConfig {
  lang: Language;
  confidence: number;
  source: string;
}

/**
 * Korean indicators in text
 */
const KOREAN_INDICATORS = [
  // High confidence (explicit markers)
  '한국어',
  '언어: ko',
  'Language: ko',
  'lang: ko',

  // Medium confidence (common Korean words in docs)
  '레포지토리',
  '프로젝트',
  '구조',
  '설정',
  '업데이트',
  '파일',
  '폴더',
  '가이드',
  '규칙',
  '설명',
  '기능',
  '작업',
  '생성',
  '삭제',
  '수정',

  // Lower confidence (could be in mixed docs)
  '안내',
  '참고',
  '주의',
  '중요',
];

/**
 * English indicators in text
 */
const ENGLISH_INDICATORS = [
  // Explicit markers
  'Language: en',
  'lang: en',

  // Common English section headers
  'Repository',
  'Project Structure',
  'Getting Started',
  'Installation',
  'Configuration',
  'Architecture',
  'Overview',
  'Features',
  'Usage',
  'API Reference',
];

/**
 * Detect language from file content
 */
export function detectLanguageFromContent(content: string): LanguageConfig {
  const lowerContent = content.toLowerCase();

  // Count Korean indicators
  let koreanScore = 0;
  for (const indicator of KOREAN_INDICATORS) {
    if (content.includes(indicator) || lowerContent.includes(indicator.toLowerCase())) {
      // Higher weight for explicit markers
      if (['한국어', '언어: ko', 'language: ko', 'lang: ko'].includes(indicator.toLowerCase())) {
        koreanScore += 10;
      } else {
        koreanScore += 1;
      }
    }
  }

  // Count English indicators
  let englishScore = 0;
  for (const indicator of ENGLISH_INDICATORS) {
    if (content.includes(indicator) || lowerContent.includes(indicator.toLowerCase())) {
      if (['language: en', 'lang: en'].includes(indicator.toLowerCase())) {
        englishScore += 10;
      } else {
        englishScore += 1;
      }
    }
  }

  // Check for Korean Unicode characters (Hangul)
  const koreanCharCount = (content.match(/[\uAC00-\uD7A3]/g) || []).length;
  const englishCharCount = (content.match(/[a-zA-Z]/g) || []).length;

  // Add character-based scores
  if (koreanCharCount > 50) koreanScore += 5;
  if (koreanCharCount > 200) koreanScore += 5;

  // Calculate confidence
  const totalScore = koreanScore + englishScore;
  const koreanConfidence = totalScore > 0 ? koreanScore / totalScore : 0.5;

  if (koreanScore > englishScore) {
    return {
      lang: 'ko',
      confidence: koreanConfidence,
      source: 'content_analysis',
    };
  }

  return {
    lang: 'en',
    confidence: 1 - koreanConfidence,
    source: 'content_analysis',
  };
}

/**
 * Detect language from CodeSyncer configuration
 */
export async function detectLanguageFromConfig(rootPath: string): Promise<LanguageConfig | null> {
  // Check .codesyncer/config.json
  const configPath = path.join(rootPath, '.codesyncer', 'config.json');

  try {
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      if (config.lang === 'ko' || config.lang === 'en') {
        return {
          lang: config.lang,
          confidence: 1.0,
          source: 'config.json',
        };
      }
    }
  } catch {
    // Config doesn't exist or is invalid
  }

  return null;
}

/**
 * Detect language from SETUP_GUIDE.md
 */
export async function detectLanguageFromSetupGuide(rootPath: string): Promise<LanguageConfig | null> {
  const setupGuidePath = path.join(rootPath, '.codesyncer', 'SETUP_GUIDE.md');

  try {
    if (await fs.pathExists(setupGuidePath)) {
      const content = await fs.readFile(setupGuidePath, 'utf-8');
      return detectLanguageFromContent(content);
    }
  } catch {
    // File doesn't exist or can't be read
  }

  return null;
}

/**
 * Detect language from system locale
 */
export function detectLanguageFromLocale(): LanguageConfig {
  const locale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '';

  if (locale.toLowerCase().startsWith('ko')) {
    return {
      lang: 'ko',
      confidence: 0.7,
      source: 'system_locale',
    };
  }

  return {
    lang: 'en',
    confidence: 0.7,
    source: 'system_locale',
  };
}

/**
 * Detect language with multiple fallback methods
 * Returns the most confident result
 */
export async function detectLanguage(rootPath: string): Promise<LanguageConfig> {
  // Priority 1: Explicit config
  const fromConfig = await detectLanguageFromConfig(rootPath);
  if (fromConfig && fromConfig.confidence >= 0.9) {
    return fromConfig;
  }

  // Priority 2: SETUP_GUIDE.md content
  const fromSetupGuide = await detectLanguageFromSetupGuide(rootPath);
  if (fromSetupGuide && fromSetupGuide.confidence >= 0.6) {
    return fromSetupGuide;
  }

  // Priority 3: Config with lower confidence
  if (fromConfig) {
    return fromConfig;
  }

  // Priority 4: System locale
  return detectLanguageFromLocale();
}

/**
 * Save language preference to config
 */
export async function saveLanguagePreference(rootPath: string, lang: Language): Promise<void> {
  const configDir = path.join(rootPath, '.codesyncer');
  const configPath = path.join(configDir, 'config.json');

  await fs.ensureDir(configDir);

  let config: Record<string, unknown> = {};

  try {
    if (await fs.pathExists(configPath)) {
      config = await fs.readJson(configPath);
    }
  } catch {
    // Start with empty config
  }

  config.lang = lang;
  config.updatedAt = new Date().toISOString();

  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(lang: Language): string {
  return lang === 'ko' ? '한국어 (Korean)' : 'English';
}
