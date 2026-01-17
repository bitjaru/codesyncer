import { extractSections, supportsSmartMerge, smartMergeContent } from '../utils/template-upgrader';

describe('template-upgrader', () => {
  describe('extractSections', () => {
    it('should extract marked sections', () => {
      const content = `
Some content before

<!-- codesyncer-section-start:header -->
# Header
Some header content
<!-- codesyncer-section-end:header -->

User added content here

<!-- codesyncer-section-start:footer -->
Footer content
<!-- codesyncer-section-end:footer -->

More user content
`;

      const sections = extractSections(content);
      expect(sections).toHaveLength(2);
      expect(sections[0].name).toBe('header');
      expect(sections[0].content).toContain('# Header');
      expect(sections[1].name).toBe('footer');
      expect(sections[1].content).toContain('Footer content');
    });

    it('should return empty array for content without sections', () => {
      const content = `
# Regular Markdown
No sections here
`;
      const sections = extractSections(content);
      expect(sections).toHaveLength(0);
    });
  });

  describe('supportsSmartMerge', () => {
    it('should return true for content with section markers', () => {
      const content = '<!-- codesyncer-section-start:test -->content<!-- codesyncer-section-end:test -->';
      expect(supportsSmartMerge(content)).toBe(true);
    });

    it('should return false for content without section markers', () => {
      const content = '# Just regular markdown';
      expect(supportsSmartMerge(content)).toBe(false);
    });
  });

  describe('smartMergeContent', () => {
    it('should update marked sections while preserving user content', () => {
      const existingContent = `
<!-- codesyncer-section-start:header -->
# Old Header
Old content
<!-- codesyncer-section-end:header -->

## User Added Section
This is content the user added themselves
- Custom item 1
- Custom item 2

<!-- codesyncer-section-start:footer -->
Old footer
<!-- codesyncer-section-end:footer -->

## Another User Section
More user content here

<!-- codesyncer-version: 3.0.0 -->
`;

      const newTemplateContent = `
<!-- codesyncer-section-start:header -->
# New Header v3.1
Updated header content with new features
<!-- codesyncer-section-end:header -->

Some template content

<!-- codesyncer-section-start:footer -->
New footer with improvements
<!-- codesyncer-section-end:footer -->

<!-- codesyncer-version: 3.1.0 -->
`;

      const result = smartMergeContent(existingContent, newTemplateContent);

      // Should update the header section
      expect(result).toContain('# New Header v3.1');
      expect(result).toContain('Updated header content with new features');
      expect(result).not.toContain('# Old Header');

      // Should preserve user content between sections
      expect(result).toContain('## User Added Section');
      expect(result).toContain('This is content the user added themselves');
      expect(result).toContain('- Custom item 1');
      expect(result).toContain('- Custom item 2');

      // Should update the footer section
      expect(result).toContain('New footer with improvements');
      expect(result).not.toContain('Old footer');

      // Should preserve user content after footer
      expect(result).toContain('## Another User Section');
      expect(result).toContain('More user content here');

      // Should update version
      expect(result).toContain('codesyncer-version: 3.1.0');
      expect(result).not.toContain('codesyncer-version: 3.0.0');
    });

    it('should return new template if existing has no sections', () => {
      const existingContent = '# No sections here';
      const newTemplateContent = `
<!-- codesyncer-section-start:header -->
# Header
<!-- codesyncer-section-end:header -->
`;

      const result = smartMergeContent(existingContent, newTemplateContent);
      expect(result).toBe(newTemplateContent);
    });

    it('should return new template if new template has no sections', () => {
      const existingContent = `
<!-- codesyncer-section-start:header -->
# Header
<!-- codesyncer-section-end:header -->
`;
      const newTemplateContent = '# No sections here';

      const result = smartMergeContent(existingContent, newTemplateContent);
      expect(result).toBe(newTemplateContent);
    });

    it('should handle sections with different sizes', () => {
      const existingContent = `
<!-- codesyncer-section-start:short -->
Short
<!-- codesyncer-section-end:short -->

User content

<!-- codesyncer-section-start:long -->
Long content here
With multiple lines
And more lines
<!-- codesyncer-section-end:long -->
`;

      const newTemplateContent = `
<!-- codesyncer-section-start:short -->
Now this is a much longer section
With many more lines
Line 3
Line 4
Line 5
<!-- codesyncer-section-end:short -->

Template content

<!-- codesyncer-section-start:long -->
Now short
<!-- codesyncer-section-end:long -->
`;

      const result = smartMergeContent(existingContent, newTemplateContent);

      // Short section should now be long
      expect(result).toContain('Now this is a much longer section');
      expect(result).toContain('Line 5');

      // Long section should now be short
      expect(result).toContain('Now short');
      expect(result).not.toContain('With multiple lines');

      // User content should be preserved
      expect(result).toContain('User content');
    });
  });
});
