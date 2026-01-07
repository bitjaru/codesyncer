import * as fs from 'fs-extra';
import * as path from 'path';
import { TagType, AVAILABLE_TAGS, TAG_PREFIXES } from '../types';

export interface ParsedTag {
  type: TagType;
  content: string;
  file: string;
  line: number;
  prefix: 'codesyncer' | 'claude';  // which prefix was used
  id: string;  // unique identifier for deduplication
}

/**
 * Parse @codesyncer-* and @claude-* tags from a file
 */
export async function parseTagsFromFile(filePath: string): Promise<ParsedTag[]> {
  const tags: ParsedTag[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Match both @codesyncer-* and @claude-* tags
      for (const tagType of AVAILABLE_TAGS) {
        // Primary: @codesyncer-decision, @codesyncer-rule, etc.
        const primaryPattern = new RegExp(`@${TAG_PREFIXES.primary}-${tagType}\\s*[:\\s]?\\s*["']?([^"'\\n]+)["']?`, 'gi');
        // Legacy: @claude-decision, @claude-rule, etc.
        const legacyPattern = new RegExp(`@${TAG_PREFIXES.legacy}-${tagType}\\s*[:\\s]?\\s*["']?([^"'\\n]+)["']?`, 'gi');

        let match;

        // Check primary pattern
        while ((match = primaryPattern.exec(line)) !== null) {
          const tagContent = match[1].trim();
          if (tagContent) {
            tags.push({
              type: tagType,
              content: tagContent,
              file: filePath,
              line: lineNumber,
              prefix: 'codesyncer',
              id: generateTagId(filePath, lineNumber, tagType, tagContent),
            });
          }
        }

        // Check legacy pattern
        while ((match = legacyPattern.exec(line)) !== null) {
          const tagContent = match[1].trim();
          if (tagContent) {
            tags.push({
              type: tagType,
              content: tagContent,
              file: filePath,
              line: lineNumber,
              prefix: 'claude',
              id: generateTagId(filePath, lineNumber, tagType, tagContent),
            });
          }
        }
      }
    }
  } catch (error) {
    // File read error - ignore silently
  }

  return tags;
}

/**
 * Generate unique ID for a tag (for deduplication)
 */
function generateTagId(file: string, line: number, type: TagType, content: string): string {
  // Use file path + line as primary identifier
  // Content hash as secondary (in case line numbers change but content is same)
  const contentHash = simpleHash(content);
  return `${path.basename(file)}:${line}:${type}:${contentHash}`;
}

/**
 * Simple hash function for content deduplication
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Format a parsed tag for display
 */
export function formatTagForDisplay(tag: ParsedTag): string {
  const typeLabels: Record<TagType, string> = {
    decision: '🎯 Decision',
    rule: '📏 Rule',
    inference: '💡 Inference',
    todo: '📝 Todo',
    context: '📚 Context',
  };

  return `${typeLabels[tag.type]}: "${tag.content}"`;
}

/**
 * Format a tag for DECISIONS.md entry
 */
export function formatTagForDecisions(tag: ParsedTag, relativeFile: string): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].substring(0, 5);

  return `
### ${tag.content}

- **Type**: ${tag.type}
- **Source**: \`${relativeFile}:${tag.line}\`
- **Added**: ${date} ${time} (via Watch Mode)
- **Tag**: \`@${tag.prefix}-${tag.type}\`
`;
}

/**
 * Check if a tag already exists in DECISIONS.md
 */
export async function isTagInDecisions(decisionsPath: string, tag: ParsedTag): Promise<boolean> {
  try {
    if (!(await fs.pathExists(decisionsPath))) {
      return false;
    }

    const content = await fs.readFile(decisionsPath, 'utf-8');

    // Check by content similarity (not exact match, to handle formatting differences)
    const normalizedContent = tag.content.toLowerCase().trim();
    const normalizedFile = content.toLowerCase();

    // Check if the exact content exists
    if (normalizedFile.includes(normalizedContent)) {
      return true;
    }

    // Check if source location exists
    const sourcePattern = `${path.basename(tag.file)}:${tag.line}`;
    if (content.includes(sourcePattern)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Append a tag to DECISIONS.md
 */
export async function appendTagToDecisions(
  decisionsPath: string,
  tag: ParsedTag,
  rootPath: string
): Promise<boolean> {
  try {
    const relativeFile = path.relative(rootPath, tag.file);

    // Check if already exists
    if (await isTagInDecisions(decisionsPath, tag)) {
      return false;  // Already exists, no need to add
    }

    // Ensure file exists with header
    if (!(await fs.pathExists(decisionsPath))) {
      const header = `# DECISIONS.md

> Auto-synced by CodeSyncer Watch Mode

---

## Decisions Log

`;
      await fs.writeFile(decisionsPath, header, 'utf-8');
    }

    // Append the new tag
    const entry = formatTagForDecisions(tag, relativeFile);
    await fs.appendFile(decisionsPath, entry, 'utf-8');

    return true;  // Successfully added
  } catch (error) {
    return false;
  }
}

/**
 * Get supported file extensions for tag parsing
 */
export function getSupportedExtensions(): string[] {
  return [
    '.ts', '.tsx', '.js', '.jsx',  // JavaScript/TypeScript
    '.py',                          // Python
    '.java', '.kt',                 // Java/Kotlin
    '.go',                          // Go
    '.rs',                          // Rust
    '.rb',                          // Ruby
    '.php',                         // PHP
    '.swift',                       // Swift
    '.c', '.cpp', '.h', '.hpp',    // C/C++
    '.cs',                          // C#
    '.vue', '.svelte',             // Vue/Svelte
    '.md',                          // Markdown (for documentation tags)
  ];
}

/**
 * Check if file should be parsed for tags
 */
export function shouldParseFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return getSupportedExtensions().includes(ext);
}
