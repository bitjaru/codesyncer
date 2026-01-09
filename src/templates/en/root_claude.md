# CLAUDE.md - [PROJECT_NAME] Multi-Repo Project

[![Powered by CodeSyncer](https://img.shields.io/badge/🔄_Powered_by-CodeSyncer-blue?style=flat-square)](https://github.com/bitjaru/codesyncer)

> **🎯 This is a Multi-Repository Workspace**
>
> Each repository is an independent project, working together collaboratively.

---

## 📋 First Thing to Do

**If you've read this file, immediately read the following file:**

```
.codesyncer/MASTER_CODESYNCER.md
```

→ This file contains **all repository information**, **auto-switching rules**, and **keyword mappings**.

---

## 🏗️ Project Overview

- **Project Name**: [PROJECT_NAME]
- **GitHub**: https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME]
- **Created**: [TODAY]
- **Repositories**: [REPO_COUNT]

---

## 🗂️ Repository Structure

```
[PROJECT_NAME]/
├── CLAUDE.md (current file)
├── .codesyncer/
│   └── MASTER_CODESYNCER.md ⭐ Multi-repo navigation
│
├── [repo1]/
│   └── .claude/
│       └── CLAUDE.md (individual repo rules)
│
├── [repo2]/
│   └── .claude/
│       └── CLAUDE.md (individual repo rules)
│
└── ...
```

---

## 🚨 Important Rules

### 1. Check Repository Before Working
Always verify which repository you're working in:
```bash
pwd  # Check current directory
```

### 2. Read CLAUDE.md When Switching Repos
Every time you work in a new repo:
```
"Read [repo-name]/.claude/CLAUDE.md"
```

### 3. No Work in Root Directory
Never code in root directory. Always navigate to specific repo before working.

---

## 🔄 Multi-Repo Workflow

### Scenario 1: User Specifies Specific Repo
```
User: "Add login API to backend"
       ↓
1. Check MASTER_CODESYNCER.md for "backend" keyword → find api-server repo
2. Read api-server/.claude/CLAUDE.md
3. Work in api-server
```

### Scenario 2: Multiple Repos Need Changes
```
User: "Add order feature"
       ↓
1. "Order feature requires both backend (API) and frontend (UI). Proceed?"
2. After user confirmation
3. Work on API in api-server → report completion
4. Work on UI in web-client → report completion
```

### Scenario 3: Unclear Which Repo
```
1. Check keyword mapping in MASTER_CODESYNCER.md
2. If unclear, ask user
   "Which repo should I work in?"
   - A) api-server (backend)
   - B) web-client (frontend)
   - C) mobile-app (mobile)
```

---

## 📝 Project-Wide Common Rules

The following rules apply to **all repositories**:

### Coding Standards
- ✅ Use TypeScript strict mode
- ✅ Explicit type definitions required
- ✅ Prefer functional programming
- ✅ Document all functions/components
- ✅ Error handling required

### Comment Tag System
Use the same tags across all repos:
```typescript
@codesyncer-rule        // Special rules
@codesyncer-inference   // Inference with reasoning
@codesyncer-decision    // Decisions after discussion
@codesyncer-todo        // User confirmation needed
@codesyncer-context     // Business context explanation
```

Details: `.claude/COMMENT_GUIDE.md` in each repo

### No-Inference Zones
**Never infer, always ask the user:**
- 💰 Business logic numbers (prices, fees, limits, discounts)
- 🔌 API endpoint URLs
- 🔐 Security settings (token expiry, encryption methods)
- 🗄️ Database schema
- 🌐 External service integration details

### Discussion-Required Keywords
When these keywords are detected, **stop work automatically** and discuss with user:
- 🔴 **CRITICAL**: payment, billing, auth, permission, delete, personal data, GDPR
- 🟡 **IMPORTANT**: API integration, DB schema, deployment, caching, email
- 🟢 **MINOR**: optimization, testing, logging, UI/UX

Full keyword list: `.codesyncer/MASTER_CODESYNCER.md`

---

## 🎯 Session Start Checklist

When AI reads this file:

1. ✅ Immediately read `.codesyncer/MASTER_CODESYNCER.md`
2. ✅ Understand overall repository structure
3. ✅ Check keyword mappings
4. ✅ Output ready message:

```
✅ [PROJECT_NAME] multi-repo project ready!

📁 Repositories: [REPO_COUNT]
📋 Read MASTER_CODESYNCER.md
🎯 Ready to work

Which repo should we work in?
```

---

## 💡 Useful Commands

### Navigation
```
"Show repo list"            → List repos from MASTER_CODESYNCER.md
"Go to backend"             → Read api-server/.claude/CLAUDE.md
"Switch to frontend"        → Read web-client/.claude/CLAUDE.md
```

### Document Updates
```
"Update all structures"     → Refresh all ARCHITECTURE.md files
"Check decision log"        → Review DECISIONS.md in each repo
```

### Multi-Repo Tasks
```
"Add ESLint to all repos"   → Work sequentially on each repo
"Need common type defs"     → Discuss where to place them
```

---

## 📚 Related Documents

### Root Documents
- **Multi-repo Navigation**: `.codesyncer/MASTER_CODESYNCER.md` ⭐ **Required**
- **Setup Guide**: `.codesyncer/SETUP_GUIDE.md` (Reference after AI setup)

### Individual Repo Documents
In each repo's `.claude/` folder:
- **CLAUDE.md** - Repo-specific coding rules
- **ARCHITECTURE.md** - Project structure
- **COMMENT_GUIDE.md** - Comment writing guide
- **DECISIONS.md** - Discussion decision log

---

## 🔍 Search Comments (Entire Project)

```bash
# Find all TODOs across repos
grep -r "@codesyncer-todo" ./*/.claude/

# Find all decision records
grep -r "@codesyncer-decision" ./*/

# Search for specific keyword
grep -r "payment" ./*/
```

---

## ⚠️ Important Notes

1. **Context Switch When Changing Repos**
   - Each repo may have independent rules
   - Always check that repo's CLAUDE.md

2. **Cross-Repo Dependencies**
   - Discuss changes affecting multiple repos with user
   - Explain clearly when order matters

3. **Common Code Management**
   - Discuss location for shared types, utilities
   - Establish duplication prevention strategy

---

**Version**: 1.0.0 (Powered by CodeSyncer)
**AI Tools**: Optimized for Claude Code | Compatible: Cursor, GitHub Copilot, Continue.dev

---

*CodeSyncer is open source: https://github.com/bitjaru/codesyncer*
