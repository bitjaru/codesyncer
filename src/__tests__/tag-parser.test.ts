import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import {
  parseTagsFromFile,
  isTagInDecisions,
  appendTagToDecisions,
  shouldParseFile,
  formatTagForDecisions,
  ParsedTag,
} from '../utils/tag-parser';

describe('tag-parser', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codesyncer-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('parseTagsFromFile', () => {
    it('should parse @codesyncer-decision tags', async () => {
      const filePath = path.join(tempDir, 'test.ts');
      await fs.writeFile(filePath, `
        // @codesyncer-decision "Use React for frontend"
        const app = 'test';
      `);

      const tags = await parseTagsFromFile(filePath);
      expect(tags).toHaveLength(1);
      expect(tags[0].type).toBe('decision');
      expect(tags[0].content).toBe('Use React for frontend');
      expect(tags[0].prefix).toBe('codesyncer');
    });

    it('should parse @claude-* legacy tags', async () => {
      const filePath = path.join(tempDir, 'test.ts');
      await fs.writeFile(filePath, `
        // @claude-rule "Always use TypeScript"
        const x = 1;
      `);

      const tags = await parseTagsFromFile(filePath);
      expect(tags).toHaveLength(1);
      expect(tags[0].type).toBe('rule');
      expect(tags[0].prefix).toBe('claude');
    });

    it('should parse multiple tags in one file', async () => {
      const filePath = path.join(tempDir, 'test.ts');
      await fs.writeFile(filePath, `
        // @codesyncer-decision "Decision 1"
        // @codesyncer-rule "Rule 1"
        // @codesyncer-todo "Todo 1"
        const x = 1;
      `);

      const tags = await parseTagsFromFile(filePath);
      expect(tags).toHaveLength(3);
      expect(tags.map(t => t.type)).toContain('decision');
      expect(tags.map(t => t.type)).toContain('rule');
      expect(tags.map(t => t.type)).toContain('todo');
    });

    it('should handle colon syntax', async () => {
      const filePath = path.join(tempDir, 'test.ts');
      await fs.writeFile(filePath, `
        // @codesyncer-decision: Use bcrypt for hashing
      `);

      const tags = await parseTagsFromFile(filePath);
      expect(tags).toHaveLength(1);
      expect(tags[0].content).toBe('Use bcrypt for hashing');
    });

    it('should return empty array for non-existent file', async () => {
      const tags = await parseTagsFromFile('/nonexistent/file.ts');
      expect(tags).toEqual([]);
    });

    it('should return empty array for file with no tags', async () => {
      const filePath = path.join(tempDir, 'test.ts');
      await fs.writeFile(filePath, `const x = 1;`);

      const tags = await parseTagsFromFile(filePath);
      expect(tags).toEqual([]);
    });
  });

  describe('isTagInDecisions', () => {
    it('should detect exact content match', async () => {
      const decisionsPath = path.join(tempDir, 'DECISIONS.md');
      await fs.writeFile(decisionsPath, `
# Decisions

### Use MySQL for database

- **Type**: decision
      `);

      const tag: ParsedTag = {
        type: 'decision',
        content: 'Use MySQL for database',
        file: '/test.ts',
        line: 1,
        prefix: 'codesyncer',
        id: 'test:1:decision:abc123',
      };

      const exists = await isTagInDecisions(decisionsPath, tag);
      expect(exists).toBe(true);
    });

    it('should NOT match partial content (mysql vs mysql5)', async () => {
      const decisionsPath = path.join(tempDir, 'DECISIONS.md');
      await fs.writeFile(decisionsPath, `
# Decisions

### Use MySQL5 for legacy support

- **Type**: decision
      `);

      const tag: ParsedTag = {
        type: 'decision',
        content: 'mysql',  // This should NOT match "mysql5"
        file: '/test.ts',
        line: 1,
        prefix: 'codesyncer',
        id: 'test:1:decision:abc123',
      };

      const exists = await isTagInDecisions(decisionsPath, tag);
      expect(exists).toBe(false);
    });

    it('should match by source location', async () => {
      const decisionsPath = path.join(tempDir, 'DECISIONS.md');
      await fs.writeFile(decisionsPath, `
# Decisions

### Something different

- **Source**: \`test.ts:5\`
      `);

      const tag: ParsedTag = {
        type: 'decision',
        content: 'Original content',
        file: '/path/to/test.ts',
        line: 5,
        prefix: 'codesyncer',
        id: 'test:5:decision:abc123',
      };

      const exists = await isTagInDecisions(decisionsPath, tag);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const tag: ParsedTag = {
        type: 'decision',
        content: 'Test',
        file: '/test.ts',
        line: 1,
        prefix: 'codesyncer',
        id: 'test:1:decision:abc123',
      };

      const exists = await isTagInDecisions('/nonexistent/DECISIONS.md', tag);
      expect(exists).toBe(false);
    });
  });

  describe('appendTagToDecisions', () => {
    it('should create DECISIONS.md if not exists', async () => {
      const decisionsPath = path.join(tempDir, 'DECISIONS.md');
      const tag: ParsedTag = {
        type: 'decision',
        content: 'Test decision',
        file: path.join(tempDir, 'test.ts'),
        line: 1,
        prefix: 'codesyncer',
        id: 'test:1:decision:abc123',
      };

      const added = await appendTagToDecisions(decisionsPath, tag, tempDir);
      expect(added).toBe(true);
      expect(await fs.pathExists(decisionsPath)).toBe(true);

      const content = await fs.readFile(decisionsPath, 'utf-8');
      expect(content).toContain('Test decision');
      expect(content).toContain('decision');
    });

    it('should append to existing DECISIONS.md', async () => {
      const decisionsPath = path.join(tempDir, 'DECISIONS.md');
      await fs.writeFile(decisionsPath, '# Existing\n\nContent here\n');

      const tag: ParsedTag = {
        type: 'rule',
        content: 'New rule',
        file: path.join(tempDir, 'test.ts'),
        line: 10,
        prefix: 'codesyncer',
        id: 'test:10:rule:abc123',
      };

      const added = await appendTagToDecisions(decisionsPath, tag, tempDir);
      expect(added).toBe(true);

      const content = await fs.readFile(decisionsPath, 'utf-8');
      expect(content).toContain('Existing');
      expect(content).toContain('New rule');
    });

    it('should not duplicate existing tags', async () => {
      const decisionsPath = path.join(tempDir, 'DECISIONS.md');
      await fs.writeFile(decisionsPath, `
# Decisions

### Already exists

- **Source**: \`test.ts:1\`
      `);

      const tag: ParsedTag = {
        type: 'decision',
        content: 'Already exists',
        file: path.join(tempDir, 'test.ts'),
        line: 1,
        prefix: 'codesyncer',
        id: 'test:1:decision:abc123',
      };

      const added = await appendTagToDecisions(decisionsPath, tag, tempDir);
      expect(added).toBe(false);
    });
  });

  describe('shouldParseFile', () => {
    it('should return true for TypeScript files', () => {
      expect(shouldParseFile('/path/to/file.ts')).toBe(true);
      expect(shouldParseFile('/path/to/file.tsx')).toBe(true);
    });

    it('should return true for JavaScript files', () => {
      expect(shouldParseFile('/path/to/file.js')).toBe(true);
      expect(shouldParseFile('/path/to/file.jsx')).toBe(true);
    });

    it('should return true for Python files', () => {
      expect(shouldParseFile('/path/to/file.py')).toBe(true);
    });

    it('should return true for other supported languages', () => {
      expect(shouldParseFile('/path/to/file.go')).toBe(true);
      expect(shouldParseFile('/path/to/file.rs')).toBe(true);
      expect(shouldParseFile('/path/to/file.java')).toBe(true);
      expect(shouldParseFile('/path/to/file.rb')).toBe(true);
    });

    it('should return false for unsupported files', () => {
      expect(shouldParseFile('/path/to/file.txt')).toBe(false);
      expect(shouldParseFile('/path/to/file.json')).toBe(false);
      expect(shouldParseFile('/path/to/file.yaml')).toBe(false);
    });
  });

  describe('formatTagForDecisions', () => {
    it('should format tag correctly', () => {
      const tag: ParsedTag = {
        type: 'decision',
        content: 'Use PostgreSQL',
        file: '/project/src/db.ts',
        line: 42,
        prefix: 'codesyncer',
        id: 'db:42:decision:abc123',
      };

      const formatted = formatTagForDecisions(tag, 'src/db.ts');
      expect(formatted).toContain('### Use PostgreSQL');
      expect(formatted).toContain('**Type**: decision');
      expect(formatted).toContain('`src/db.ts:42`');
      expect(formatted).toContain('@codesyncer-decision');
    });
  });
});
