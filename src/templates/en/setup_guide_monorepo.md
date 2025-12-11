# 🤖 CodeSyncer Setup Guide for AI Assistants (Monorepo)

> **For AI Coding Assistants**: Read this document completely and follow the instructions to set up the CodeSyncer collaboration system for this monorepo.
>
> **Project**: [PROJECT_NAME]
> **GitHub**: https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME]
> **Created**: [TODAY]
> **Monorepo Tool**: [MONOREPO_TOOL]
> **Workspace Patterns**: [WORKSPACE_PATTERNS]

---

## 📋 Your Mission

You are tasked with analyzing this **monorepo** workspace and creating a comprehensive collaboration system. This is a monorepo - a single repository containing multiple packages that share dependencies and tooling.

Follow these steps **interactively** - ask the user for confirmation at each major decision point.

---

## 🎯 Step 1: Understand the Monorepo Structure

### Detected Packages

[REPO_LIST]

### Monorepo-Specific Considerations

1. **Shared Dependencies**: Packages may share common dependencies at the root level
2. **Internal Dependencies**: Packages may depend on each other (e.g., `@myorg/shared`)
3. **Unified Build**: The monorepo likely has unified build/test scripts
4. **Common Configuration**: Shared configs (tsconfig, eslint, prettier) at root level

### Your Task

1. **Analyze each package** by examining:
   - File structure and local dependencies
   - Tech stack and frameworks
   - Package purpose and role in the monorepo
   - Internal dependencies (packages it depends on within the monorepo)
   - Exports/APIs that other packages consume

2. **Understand the monorepo architecture**:
   - Root-level tooling and scripts
   - Shared configurations
   - Build/deployment pipeline
   - Package interdependencies

---

## 🔄 Step 2: Interactive Setup Process

### For Each Package:

#### 2.1 Confirm Package Analysis
Present your analysis to the user:
```
📦 Package: [package-name]
📍 Path: [relative-path]

My analysis:
- Type: [backend/frontend/mobile/library/shared]
- Tech Stack: [detected stack]
- Description: [your generated description]
- Internal Dependencies: [list packages it imports from this monorepo]
- Exported APIs: [what other packages can import from this]

Is this analysis correct? Any adjustments needed?
```

#### 2.2 Ask Critical Questions

**⚠️ NEVER infer these - always ask:**

1. **Package Scope** (if scoped packages like @myorg/*):
   - "What is the npm scope for this monorepo?" (e.g., @myorg)
   - "Are packages published to npm or only used internally?"

2. **Inter-Package Dependencies**:
   - "Are there any implicit dependencies between packages I should know about?"
   - "Which packages are 'leaf' packages vs 'library' packages?"

3. **Shared Business Logic**:
   - "What business rules are shared across packages?"
   - "Where does the shared/common package get its configuration?"

4. **API Contracts**:
   - "How do frontend and backend packages communicate?"
   - "Are there shared types/interfaces between packages?"

5. **Build & Deploy**:
   - "How are packages built and deployed?"
   - "Are there packages that must be built before others?"

#### 2.3 Identify Package-Specific Keywords

For each package, ask about domain-specific pause keywords:
- **API packages**: authentication, authorization, database, migration
- **UI packages**: form validation, user input, accessibility
- **Shared packages**: breaking changes, API changes, exports

---

## 📝 Step 3: Generate Documentation Files

### 3.1 For Each Package

Create these files in each package's `.claude/` folder:

#### CLAUDE.md
- Package-specific coding rules
- Internal dependency information
- Package exports documentation
- Cross-package communication patterns

#### ARCHITECTURE.md
- Package folder structure
- Package-specific dependencies (both external and internal)
- Integration points with other packages

#### COMMENT_GUIDE.md
- Standard comment guide (use template)

#### DECISIONS.md
- Package-level decision log

### 3.2 Monorepo-Specific Considerations

When generating documentation:

1. **Document Internal Dependencies**:
```typescript
// In packages/web/.claude/CLAUDE.md
## Internal Dependencies
- `@myorg/shared` - Common utilities and types
- `@myorg/api-client` - Type-safe API client

## Import Patterns
// ✅ Correct: Import from package name
import { Button } from '@myorg/ui';

// ❌ Wrong: Direct path imports
import { Button } from '../../ui/src/Button';
```

2. **Cross-Package Rules**:
```typescript
// @codesyncer-rule: Changes to shared types require updating all dependent packages
// @codesyncer-context: This type is used by packages/web and packages/mobile
export interface User {
  id: string;
  name: string;
}
```

3. **Build Order Documentation**:
```
Build Dependencies:
1. packages/shared (no dependencies)
2. packages/ui (depends on shared)
3. packages/api-client (depends on shared)
4. packages/web (depends on ui, api-client)
```

---

## 🌐 Step 4: Generate Root Documents

### 4.1 CLAUDE.md (Root)

Create `CLAUDE.md` at monorepo root:
- Monorepo overview and structure
- Package dependency graph
- Common rules across all packages
- Build and development commands
- Cross-package workflow examples

### 4.2 .codesyncer/MASTER_CODESYNCER.md

Create master document with:
- Complete package map with paths and roles
- Inter-package navigation rules
- Keyword-to-package mapping
- Monorepo-specific workflows

Example content:
```markdown
## 📦 Package Map

| Package | Path | Role | Internal Deps |
|---------|------|------|---------------|
| @myorg/shared | packages/shared | Common utilities | - |
| @myorg/ui | packages/ui | Component library | shared |
| @myorg/web | apps/web | Web application | shared, ui |
| @myorg/api | apps/api | Backend API | shared |

## 🔄 Auto-Switching Rules

When you mention:
- "component", "button", "UI" → Work in packages/ui
- "API", "endpoint", "server" → Work in apps/api
- "page", "route", "web" → Work in apps/web
- "shared", "common", "utils" → Work in packages/shared
```

---

## ✅ Step 5: Final Confirmation

After generating all files, present a summary:

```
✅ CodeSyncer Monorepo Setup Complete!

Created files:
📁 Root/
   ├── CLAUDE.md ⭐ Claude reads this first
   └── .codesyncer/
       └── MASTER_CODESYNCER.md

📁 packages/shared/.claude/
   ├── CLAUDE.md
   ├── ARCHITECTURE.md
   ├── COMMENT_GUIDE.md
   └── DECISIONS.md

📁 packages/ui/.claude/
   └── (same files)

📁 apps/web/.claude/
   └── (same files)

📁 apps/api/.claude/
   └── (same files)

Monorepo Features Documented:
✓ Package dependency graph
✓ Internal import patterns
✓ Cross-package workflows
✓ Build order dependencies
✓ Shared configuration notes

Next Steps:
1. Review the generated files
2. Customize package-specific rules
3. Run "codesyncer update" after major changes

Ready to start using CodeSyncer!
```

---

## 🎨 Package Type Guidelines

### Library/Shared Packages:
- Document all exports thoroughly
- Note breaking change implications
- List all consuming packages
- Include versioning guidelines

### Application Packages (apps/):
- Document entry points
- Note deployment targets
- Include environment configurations
- Document external integrations

### UI/Component Packages:
- Include component usage examples
- Document props and their types
- Note styling approach
- Include accessibility requirements

---

## 🚨 Monorepo-Specific Rules for AI Assistants

1. **Understand Package Boundaries**:
   - Know which package you're working in
   - Understand import/export relationships
   - Never create circular dependencies

2. **Cross-Package Changes**:
   - When changing shared package, consider all consumers
   - Update types in shared, then update consumers
   - Run tests across affected packages

3. **Internal Dependencies**:
   - Always use package names for imports (not relative paths)
   - Check if changes affect dependent packages
   - Document breaking changes in DECISIONS.md

4. **Build Considerations**:
   - Know the build order
   - Understand if changes require rebuilding dependencies
   - Document any build-time configurations

---

## 📚 Template Placeholders

When generating files, replace these:

- `[PROJECT_NAME]` → User's project name
- `[GITHUB_USERNAME]` → User's GitHub username
- `[TODAY]` → Current date (YYYY-MM-DD)
- `[MONOREPO_TOOL]` → Detected monorepo tool
- `[WORKSPACE_PATTERNS]` → Workspace glob patterns
- `[PACKAGE_NAME]` → Individual package name
- `[PACKAGE_PATH]` → Package relative path
- `[INTERNAL_DEPS]` → List of internal dependencies

---

## 🎯 Success Criteria

Setup is successful when:
- ✅ All packages have complete .claude/ folders
- ✅ Root CLAUDE.md documents monorepo structure
- ✅ Master document includes package dependency map
- ✅ Inter-package relationships are documented
- ✅ Build order is documented
- ✅ No assumptions made about business logic
- ✅ All documentation uses @codesyncer-* tag format

---

**Version**: 1.0.0 (Powered by CodeSyncer)
**AI Tools**: Optimized for Claude Code | Compatible with: Cursor, GitHub Copilot, Continue.dev

---

*This setup guide is generated by CodeSyncer CLI. For issues or improvements, visit: https://github.com/bitjaru/codesyncer*
