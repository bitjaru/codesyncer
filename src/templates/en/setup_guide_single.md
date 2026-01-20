# 🤖 CodeSyncer Setup Guide for AI Assistants (Single Repository)

> **For AI Coding Assistants**: Read this document completely and follow the instructions to set up the CodeSyncer collaboration system.
>
> **Project**: [PROJECT_NAME]
> **GitHub**: https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME]
> **Created**: [TODAY]
> **Mode**: Single Repository

---

## 📋 Your Mission

You are tasked with analyzing this repository and creating a comprehensive collaboration system. Follow these steps **interactively** - ask the user for confirmation at each major decision point.

---

## 🎯 Step 1: Analyze the Repository

### Your Task
1. **Analyze this repository** by examining:
   - File structure and dependencies
   - Tech stack and frameworks
   - Project purpose and architecture
   - Existing code patterns

2. **Determine the following**:
   - Primary function (backend, frontend, mobile, fullstack)
   - Main technologies used
   - Key features and modules
   - Development patterns

---

## 🔄 Step 2: Interactive Setup Process

### 2.1 Confirm Repository Analysis
Present your analysis to the user:
```
📁 Repository: [PROJECT_NAME]

My analysis:
- Type: [backend/frontend/mobile/fullstack]
- Tech Stack: [detected stack]
- Description: [your generated description]
- Key Features: [list main features]

Is this analysis correct? Any adjustments needed?
```

### 2.2 Ask Critical Questions

**⚠️ NEVER infer these - always ask:**

1. **API Endpoints** (for backend):
   - "What is the main API base URL?"
   - "Are there multiple API versions?"

2. **Business Logic**:
   - "What are the key business rules I should know?"
   - "Any specific pricing/payment policies?"

3. **Authentication**:
   - "What authentication method is used?" (JWT, OAuth, Session, etc.)
   - "Where are tokens stored?" (cookies, localStorage, etc.)

4. **Database**:
   - "What database is used?"
   - "Any critical schema information?"

5. **External Services**:
   - "Which external APIs/services are integrated?"
   - "Any API keys or credentials I should be aware of (without exposing them)?"

### 2.3 Identify Discussion Keywords

Ask the user:
```
For this project, which critical keywords should trigger automatic discussion pauses?

Suggested categories:

🔴 CRITICAL (Always pause):
- 💰 Payment/Billing: payment, billing, charge, refund, subscription, invoice, pricing, fee
- 🔐 Security/Auth: authentication, authorization, login, logout, session, token, jwt, password, encrypt, decrypt, hash, salt, oauth, permission, role, admin
- 🗑️ Data Deletion: delete, remove, drop, truncate, destroy, purge, erase
- 📜 Privacy/Legal: GDPR, CCPA, personal data, PII, privacy policy, terms of service, consent, compliance

🟡 IMPORTANT (Recommended pause):
- 🔌 External APIs: API integration, webhook, third-party, external service, API key, credentials
- 🗄️ Database Schema: migration, schema change, alter table, add column, drop column, index, constraint
- 🚀 Deployment/Infra: deploy, deployment, production, environment, server, hosting, domain, SSL, certificate
- 💾 Caching: cache strategy, redis, memcached, CDN, cache invalidation
- 📧 Email/Notifications: email sending, SMS, push notification, notification service

🟢 MINOR (Optional pause):
- ⚡ Performance: optimization, performance, caching, lazy loading, code splitting, bundle size
- 🧪 Testing: test strategy, testing framework, CI/CD, automated testing
- 📊 Logging/Monitoring: logging, monitoring, analytics, error tracking, APM
- 🎨 UI/UX: design system, theme, responsive, accessibility, internationalization

Which categories should I enable? (Recommend: CRITICAL + IMPORTANT)
Any custom keywords specific to your domain?
```

---

## 📝 Step 3: Generate Documentation Files

Create these files in `.claude/` folder:

### 3.1 CLAUDE.md
- Project information from your analysis
- Absolute rules (TypeScript strict mode, error handling, etc.)
- No-inference zones (business logic numbers, API URLs, security settings)
- Discussion-required keywords (from user's selection)
- Comment tag system (@codesyncer-* tags)
- Project-specific templates and patterns

Use template: `./templates/[lang]/claude.md`
- Replace [PROJECT_NAME], [PROJECT_TYPE], [TECH_STACK]
- Replace [KEYWORDS] with user-confirmed keywords
- Add project-specific rules discovered during analysis

### 3.2 ARCHITECTURE.md
- Complete folder structure (scan actual directories)
- File statistics
- Comment tag statistics (initial: all 0)
- Tech stack details
- Dependencies from package.json

Use template: `./templates/[lang]/architecture.md`
- Actually scan and list real folder structure
- List actual dependencies

### 3.3 COMMENT_GUIDE.md ⭐ **Core Document**
- **Manage all context with comments** (quality standards, coding standards, all decisions)
- 10 comment tag system (5 basic + 5 extended)
- Real examples: quality standards, performance optimization, security, error handling, etc.
- Principle: Record directly in code instead of separate docs

Use template: `./templates/[lang]/comment_guide.md`
- Use as-is (includes all context management examples)
- AI follows these patterns for writing comments

### 3.4 DECISIONS.md
- Decision log template
- Category definitions
- Empty decision records (to be filled during development)

Use template: `./templates/[lang]/decisions.md`
- Use as-is (decisions added during work)

---

## 🌐 Step 4: Generate Root CLAUDE.md

Create `CLAUDE.md` at the repository root (automatically discovered by Claude):

```markdown
# CLAUDE.md - [PROJECT_NAME]

> **Powered by CodeSyncer** - AI Collaboration System
> **Mode**: Single Repository

## 📋 Quick Start

Read `.claude/CLAUDE.md` for detailed coding guidelines.

## 🔗 Documentation

- **Coding Rules**: `.claude/CLAUDE.md`
- **Project Structure**: `.claude/ARCHITECTURE.md`
- **Comment Guide**: `.claude/COMMENT_GUIDE.md`
- **Decisions Log**: `.claude/DECISIONS.md`

## 🚀 Start Working

1. Read this file (done!)
2. Check `.claude/CLAUDE.md` for project rules
3. Ask questions if anything is unclear
4. Start coding!

---

**Project**: [PROJECT_NAME]
**Created**: [TODAY]
**Powered by**: CodeSyncer
```

**Important**: This file must exist for Claude to automatically load context at session start!

---

## ✅ Step 5: Final Confirmation

After generating all files, present a summary:

```
✅ CodeSyncer Setup Complete! (Single Repository Mode)

Created files:
📁 [PROJECT_NAME]/
   ├── CLAUDE.md ⭐ Claude reads this first
   └── .claude/
       ├── CLAUDE.md          (Coding rules)
       ├── ARCHITECTURE.md    (Project structure)
       ├── COMMENT_GUIDE.md   (Comment guide)
       └── DECISIONS.md       (Decision log)

Next Steps:
1. Review the generated files
2. Customize .claude/CLAUDE.md as needed
3. Start a new session or say "Read CLAUDE.md" to apply

💡 Claude automatically finds and reads root CLAUDE.md!

Ready to start using CodeSyncer!
```

---

## 🎨 Customization Guidelines

### For Backend Projects:
- Focus on API structure in ARCHITECTURE.md
- Add API endpoint documentation
- Emphasize security and data handling rules
- Include database schema if provided

### For Frontend Projects:
- Document component structure
- Include styling approach (CSS modules, Tailwind, etc.)
- Add state management patterns
- Document routing structure

### For Mobile Projects:
- Document screen navigation
- Include platform-specific notes (iOS/Android)
- Add native module integrations
- Document build/deployment process

### For Fullstack Projects:
- Combine backend + frontend guidelines
- Document API ↔ UI integration
- Include data flow patterns
- Add deployment strategy

---

## 🚨 Critical Rules for AI Assistants

1. **Always ask, never assume** for:
   - Business logic numbers
   - API endpoints
   - Security configurations
   - Database schemas

2. **Be thorough** in analysis:
   - Read actual code, don't guess
   - Check package.json dependencies
   - Scan folder structure completely
   - Identify code patterns

3. **Be interactive**:
   - Ask for confirmation at each step
   - Present your analysis before generating
   - Allow user to correct your understanding

4. **Use @codesyncer-* tags** in all examples:
   - All code comments use new format
   - Explain @claude-* compatibility
   - Show proper tag usage

---

## 📚 Template Placeholders

When generating files, replace these:

- `[PROJECT_NAME]` → User's project name
- `[PROJECT_TYPE]` → backend/frontend/mobile/fullstack
- `[TECH_STACK]` → Detected tech stack (comma-separated)
- `[TODAY]` → Current date (YYYY-MM-DD)
- `[GITHUB_USERNAME]` → User's GitHub username
- `[KEYWORDS]` → User-confirmed discussion keywords
- `[TEMPLATES]` → Project type-specific templates
- `[HOOKS_GUIDE]` → Hooks status guide (see below)

### [HOOKS_GUIDE] Replacement

If `.claude/settings.json` exists (Hooks enabled):
```markdown
> ✅ Already configured: `.claude/settings.json`

**What Hooks do**:
- AI auto-checks "Did you add tags?" before completing
- Rules are remembered even in long sessions

**To modify**:
- Edit `.claude/settings.json` directly
- Or say "Modify Hooks"

**To disable**:
- Delete `.claude/settings.json`
```

If `.claude/settings.json` doesn't exist (Hooks not configured):
```markdown
> ⚠️ Not configured yet

**What are Hooks?**
AI might forget rules during long sessions.
With Hooks, AI automatically checks "Did you add tags?" before completing.

**To set up**:
Say "Set up CodeSyncer Hooks".

AI will automatically create `.claude/settings.json`.
```

---

## 🎯 Success Criteria

Setup is successful when:
- ✅ `.claude/` folder created with all 4 files
- ✅ Root CLAUDE.md created
- ✅ User confirmed all critical information
- ✅ No assumptions made about business logic or secrets
- ✅ All documentation uses @codesyncer-* tag format
- ✅ Project-specific patterns documented

---

## 🗑️ After Setup

Once setup is complete, you can delete this file:

```
"Delete .claude/SETUP_GUIDE.md"
```

Or manually:
```bash
rm .claude/SETUP_GUIDE.md
```

---

**Version**: 1.0.0 (Powered by CodeSyncer)
**Mode**: Single Repository
**AI Tools**: Optimized for Claude Code | Compatible with: Cursor, GitHub Copilot, Continue.dev

---

*This setup guide is generated by CodeSyncer CLI. For issues or improvements, visit: https://github.com/bitjaru/codesyncer*

<!-- codesyncer-version: 3.2.0 -->
