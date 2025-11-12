# 🤖 [PROJECT_NAME] Multi-Repository Auto-Switching System

> Just request a feature, and your AI coding assistant will automatically find and work in the right repository.
>
> **Powered by CodeSyncer** - AI-agnostic multi-repository collaboration system

---

## 🎯 Core Operating Principle

### Automatic Repository Detection & Switching
When you request a feature, the AI assistant automatically:
1. Analyzes request → Identifies required repositories
2. Switches to the relevant repository
3. Applies each repository's CLAUDE.md rules
4. Performs the task

## 📁 Project Repository Structure

| Repository | Folder | Role | Rules File Location |
|------------|--------|------|---------------------|
[REPO_TABLE]

## 🧠 Automatic Repository Selection Rules

### Keyword-Based Auto Detection
| Keywords | Target Repository | Auto Command |
|----------|------------------|--------------|
[KEYWORD_MAPPING]

### Task Type-Based Auto Detection
```javascript
function auto_select_repository(user_request) {
  // API modification needed?
  if (request.match(/API|data|server|auth|DB/)) {
    work_repos.push("backend repo");
  }

  // UI modification needed?
  if (request.match(/page|screen|button|form|UI/)) {
    work_repos.push("frontend repo");
  }

  // Multiple repos needed?
  if (request.includes("feature") && !specific_repo_mentioned) {
    // Backend → Frontend → Mobile order
    return ["backend", "frontend", "mobile"];
  }

  return work_repos;
}
```

## 🔄 Auto-Switching Protocol

### Single Repository Task

```bash
User: "Create login API"

AI Auto Action:
1. Detect "API" keyword
2. cd [backend folder]
3. cat CLAUDE.md  # Load backend rules
4. [Create API following backend rules]
5. "✅ Login API created in [backend repo]"
```

### Multi-Repository Task

```bash
User: "Add payment feature"

AI Auto Action:
1. "feature" keyword → Multiple repos needed
2. Determine work order:
   - Step 1: [backend] - API
   - Step 2: [frontend] - UI
   - Step 3: [mobile] - App screen

3. Sequential work:
   cd [backend folder] && cat CLAUDE.md
   → Create payment API

   cd ../[frontend folder] && cat CLAUDE.md
   → Create payment page

   cd ../[mobile folder] && cat CLAUDE.md
   → Create payment screen

4. "✅ Payment feature fully implemented"
```

## ⚠️ Important Rules

### When Switching Repositories, Always

1. Check current location: `pwd`
2. Move to target repo: `cd ../[repo name]`
3. Load rules file: `cat CLAUDE.md || cat .claude/CLAUDE.md`
4. Notify rules applied: "📁 [repo name] rules applied"
5. Work following those rules

### Priority Order

1. User-specified repo > Auto detection
2. Each repo's CLAUDE.md > This master document
3. Backend work > Frontend/Mobile work (order)

## 🚀 Usage

### Session Start

```
"[PROJECT_NAME] multi-repo mode start"
→ Load this document
→ Activate auto-switching system
```

### Task Requests (User doesn't need to know repos)

```
"Add user management" → Auto work in all needed repos
"Fix bug" → Auto explore related repos
"Login page only" → Work only in frontend repo
```

## 📊 Work Log Format

```yaml
Request: "[User request content]"
Analysis:
  required_repos: [[repo1], [repo2]]
  work_order: [backend → frontend]
Execution:
  [repo1]:
    navigate: cd [folder]
    rules: Apply CLAUDE.md
    work: [performed task]
    result: ✅
  [repo2]:
    navigate: cd [folder]
    rules: Apply CLAUDE.md
    work: [performed task]
    result: ✅
Complete: "[summary]"
```

---

## 🏷️ Comment Tag System

CodeSyncer supports both tag formats:

- **`@codesyncer-*`** (Recommended): New standard, compatible with all AI tools
- **`@claude-*`** (Legacy): Compatible with existing Claude Code projects

### Available Tags

```typescript
@codesyncer-rule        // Special rules (@claude-rule compatible)
@codesyncer-inference   // Inference and rationale (@claude-inference compatible)
@codesyncer-decision    // Discussion decisions (@claude-decision compatible)
@codesyncer-todo        // Needs confirmation (@claude-todo compatible)
@codesyncer-context     // Business context (@claude-context compatible)
```

Both formats work identically, so use whichever you prefer!

---

**GitHub**: https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME]
**Version**: 1.0.0 (Powered by CodeSyncer)
**Created**: [TODAY]

---

*CodeSyncer - AI-powered multi-repository collaboration system*
*Currently Supported: Claude Code | Coming Soon: Cursor, GitHub Copilot, Continue.dev*
