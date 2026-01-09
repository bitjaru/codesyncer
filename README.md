# CodeSyncer CLI

> AI-powered multi-repository collaboration system that works seamlessly with Claude Code, Cursor, GitHub Copilot, and more!

[![npm version](https://img.shields.io/npm/v/codesyncer.svg)](https://www.npmjs.com/package/codesyncer)
[![License](https://img.shields.io/badge/License-Commons%20Clause-red.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/issues)

[한국어 문서](./README.ko.md) | English

---

## 🤔 The Problem

Working with AI on real projects? You face these issues:

**1. Context is lost every session** 😫
- New AI session = Start from scratch
- Explain the same architecture again and again
- "What's the API endpoint?" "How does auth work?" - Every. Single. Time.

**2. Multi-repo chaos** 🤯
```
my-saas-project/
├── api-server/      (backend)
├── web-client/      (frontend)
└── mobile-app/      (mobile)
```
- AI only sees one repo at a time
- Missing context from other repos → Fragmented code
- "Add login" needs backend API + frontend UI, but AI doesn't know both

**3. AI makes dangerous assumptions** ⚠️
- "I'll set the timeout to 30 seconds" - Wait, should be 5!
- "Using /api/v1/..." - Wrong endpoint!
- Guesses business logic, security settings, pricing rules

**Result**: You spend more time explaining and fixing than actual coding.

---

## ✨ The Solution

CodeSyncer gives AI the **full picture** through:

1. **📝 Comments in code** - All decisions and context live where they belong
2. **🗂️ Master document** - Cross-repo navigation and rules
3. **📋 Per-repo docs** - Each repo's specific guidelines
4. **🎯 Keyword system** - Auto-pause for critical decisions (payment, auth, etc.)

**Result**: AI codes with **high accuracy** even in complex multi-repo projects. 🎯

---

## 🎯 What is CodeSyncer?

CodeSyncer provides the **framework and rules** for AI coding assistants (like Claude Code) to set up an intelligent collaboration system across your multi-repository workspace.

**How it works:**
1. **You install** CodeSyncer CLI
2. **You launch** your AI assistant (Claude Code, Cursor, etc.)
3. **You run** `codesyncer init`
4. **AI analyzes** your projects and generates documentation following CodeSyncer's structure

CodeSyncer defines **WHERE** and **HOW** documentation should be created. Your AI assistant fills in the **WHAT** by analyzing your actual code.

### Key Features

- 🤖 **AI-Agnostic**: Works with Claude Code, Cursor, GitHub Copilot, and more
- 📁 **Single & Multi-Repository Support**: Works with individual repos or entire workspaces
- 📦 **Monorepo Support**: Auto-detects Turborepo, pnpm, Nx, Lerna, Yarn/npm workspaces
- 🔄 **Watch Mode**: Real-time file monitoring with auto tag sync
- ✅ **Validate Command**: Check your setup and get fix suggestions (NEW in v2.7.0)
- 🏷️ **Comment Tag System**: `@codesyncer-*` tags to record decisions and inferences
- 🤝 **Discussion Auto-Pause**: Automatically stops for critical decisions (payment, security, etc.)
- 🌐 **Multi-Language**: Full Korean and English support
- ⚡ **Quick Setup**: One-command installation for your entire workspace
- 🔒 **Security**: Path traversal protection and input validation (v2.7.0)

---

## ⚠️ Prerequisites

**CodeSyncer requires an AI coding assistant to be active.**

Currently supported:
- ✅ **Claude Code** (Recommended)
- 🚧 Cursor (Coming soon)
- 🚧 GitHub Copilot (Coming soon)
- 🚧 Continue.dev (Coming soon)

**Important**: Make sure your AI coding assistant is **running and active** before using CodeSyncer. The AI will analyze your projects and help generate accurate documentation.

---

## 📦 Installation

```bash
npm install -g codesyncer
```

---

## 🔄 Updating CodeSyncer

### Check your current version
```bash
codesyncer --version
```

### Check latest version
```bash
npm view codesyncer version
```

### Update to latest
```bash
npm install -g codesyncer@latest
```

### After updating, validate and sync your project

When you update CodeSyncer to a new version, first validate your setup, then sync:

```bash
cd /path/to/your/multi-repo-workspace

# Step 1: Check your setup (NEW in v3.0.0)
codesyncer validate

# Step 2: Fix any issues
codesyncer update
```

#### New in v3.0.0: `codesyncer validate`

The `validate` command checks your CodeSyncer setup and reports issues:

```bash
codesyncer validate           # Basic validation
codesyncer validate --verbose # Show file paths
```

**What it checks:**
- ✅ Master setup exists (`.codesyncer/MASTER_CODESYNCER.md`)
- ✅ Root `CLAUDE.md` for AI auto-loading
- ✅ All repositories have required `.claude/` files
- ✅ No unfilled placeholders in generated files
- ✅ Language configuration

**Example output:**
```
🔍 CodeSyncer - Validate

📊 Info
────────────────────────────────────────
  Repository Count: 3
  Configured Repos: 2/3
  Language: en (config.json)

⚠️  Warnings
────────────────────────────────────────
  • mobile-app: Missing ARCHITECTURE.md
  • No root CLAUDE.md (AI auto-load disabled)

────────────────────────────────────────
⚠️  Validation passed with 2 warning(s)

💡 To fix issues:
   codesyncer update
```

#### `codesyncer update`

Sync your project with the latest templates and features:

**What happens:**
1. ✅ Scans for new repositories added to your workspace
2. ✅ Detects missing files from new versions (e.g., root CLAUDE.md in v2.1.2+)
3. ✅ Auto-detects your language settings (English/Korean)
4. ✅ Prompts before creating any new files
5. ✅ Preserves your existing customizations

**Example output:**
```
🔄 CodeSyncer - Update System

✓ Scan complete

⚠️  Missing root CLAUDE.md (new in v2.1.2)
This file allows Claude to automatically load context at session start.

? Create root CLAUDE.md? (Y/n) Y

✓ Root CLAUDE.md created!
💡 Claude will now automatically load context at session start!

🤖 Next Steps (Tell your AI):
────────────────────────────────────────────────────────────
Option 1) Start a new session
  Claude will automatically find and read root CLAUDE.md

Option 2) Apply immediately in current session
  "Read CLAUDE.md"
────────────────────────────────────────────────────────────

✅ Update complete!
```

**After running `codesyncer update`:**

Choose one of these options to apply changes:

**Option 1: Start a new AI session** (Recommended)
- Close your current AI assistant
- Open a new session
- Claude automatically finds and reads root CLAUDE.md

**Option 2: Apply in current session**
- Tell your AI: **"Read CLAUDE.md"**
- AI loads the updated context immediately

---

## 🚀 Quick Start

### Step 1: Install CodeSyncer

```bash
npm install -g codesyncer
```

### Step 2: Launch your AI assistant

Open your AI coding assistant:
- **Claude Code** (Recommended)
- Cursor
- GitHub Copilot
- Or any other AI coding tool

Make sure it's **active and running**.

### Step 3: Navigate to your project

```bash
cd /path/to/your/project
```

CodeSyncer works with **single repositories**, **multi-repo workspaces**, and **monorepos**:

**Single Repository** (auto-detected):
```
my-project/
├── package.json
├── src/
└── ...
```

**Multi-Repository Workspace**:
```
workspace/
├── backend/
├── frontend/
└── mobile/
```

**Monorepo** (auto-detected via Turborepo, pnpm, Nx, Lerna, npm/yarn workspaces):
```
monorepo/
├── package.json        # workspaces: ["packages/*", "apps/*"]
├── turbo.json          # or pnpm-workspace.yaml, nx.json, lerna.json
├── packages/
│   ├── shared/
│   └── ui/
└── apps/
    ├── web/
    └── api/
```

### Step 4: Initialize CodeSyncer

```bash
codesyncer init
```

You'll be asked:
- Language preference (Korean/English)
- Project name
- GitHub username

**What happens:**

| Mode | Detection | Output |
|------|-----------|--------|
| **Single Repo** | Current folder has `package.json`, `.git`, etc. | Creates `.claude/SETUP_GUIDE.md` |
| **Monorepo** | Has `turbo.json`, `pnpm-workspace.yaml`, `nx.json`, `lerna.json`, or `workspaces` in package.json | Creates `.codesyncer/SETUP_GUIDE.md` with package-aware setup |
| **Multi-Repo** | Subfolders contain separate repositories | Creates `.codesyncer/SETUP_GUIDE.md` |

**That's all CodeSyncer does!** It provides the framework and rules. Now your AI takes over.

---

## ⚠️ IMPORTANT: Step 5 - Let AI Set Everything Up

> **🎯 Don't skip this step!** This is where the magic happens.

**Launch Claude Code** (or your preferred AI assistant) and say:

**For Single Repository:**
```
"Read .claude/SETUP_GUIDE.md and follow the instructions to set up"
```

**For Multi-Repository Workspace:**
```
"Read .codesyncer/SETUP_GUIDE.md and follow the instructions to set up"
```

### What happens next (automatically):

**1️⃣ AI Analyzes Your Code**
- Reads actual files in each repository
- Detects tech stack, patterns, and structure
- Understands your project architecture

**2️⃣ AI Asks Critical Questions** (Never assumes!)
- ❓ "What are your API endpoints?"
- ❓ "What's your pricing and business logic?"
- ❓ "Which authentication method do you use?"
- ❓ "What's your database schema?"
- ❓ "Which external services do you integrate?"

**3️⃣ AI Generates Complete Documentation**
- `.codesyncer/MASTER_CODESYNCER.md` → Multi-repo navigation
- `<repo>/.claude/CLAUDE.md` → Coding rules
- `<repo>/.claude/ARCHITECTURE.md` → Project structure
- `<repo>/.claude/DECISIONS.md` → Decision log
- `<repo>/.claude/COMMENT_GUIDE.md` → Comment tag guide

> **💡 Why this works**: AI analyzes YOUR actual code and asks YOU questions. The generated docs are tailored to your specific project, not generic templates.

---

### Step 6: Start Coding!

Once setup is complete, just tell your AI:
```
"Read CLAUDE.md"
```

Your AI assistant will then:
- Follow your project's coding rules
- Use the correct tech stack patterns
- Ask before making critical decisions
- Record all decisions with `@codesyncer-*` tags

---

## 📚 Usage

### Initialize collaboration system
```bash
codesyncer init
```

### Update project structure
```bash
codesyncer update
```

### Watch Mode (NEW in v2.6.0)
```bash
codesyncer watch         # Start real-time monitoring
codesyncer watch --log   # With file logging
```

**What it does:**
- Monitors file changes in real-time
- Auto-syncs `@codesyncer-*` tags to `DECISIONS.md`
- Beautiful console output with session statistics

**Example output:**
```
[14:32:10] ✨ Changed: src/utils/api.ts
           └── 🎯 Found: @codesyncer-decision
               "Use React Query instead of SWR"
           └── ✅ Added to DECISIONS.md
```

### Add new repository to workspace
```bash
codesyncer add-repo
```

---

## 🏷️ Comment Tag System

CodeSyncer uses a structured comment tag system to permanently record all AI inferences and decisions in your code.

### Available Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@codesyncer-rule` | Special rules for non-standard implementations | `// @codesyncer-rule: Use any type here (external lib has no types)` |
| `@codesyncer-inference` | AI inferred something with rationale | `// @codesyncer-inference: Page size 20 (standard UX)` |
| `@codesyncer-decision` | Post-discussion decision | `// @codesyncer-decision: [2024-10-15] Using Stripe (intl payment)` |
| `@codesyncer-todo` | Needs user confirmation | `// @codesyncer-todo: Confirm API endpoint URL` |
| `@codesyncer-context` | Business context explanation | `// @codesyncer-context: GDPR compliance (30-day retention)` |

### Legacy Compatibility

Existing `@claude-*` tags are fully compatible:
```typescript
@claude-rule        = @codesyncer-rule
@claude-inference   = @codesyncer-inference
@claude-decision    = @codesyncer-decision
@claude-todo        = @codesyncer-todo
@claude-context     = @codesyncer-context
```

---

## 🤝 Auto-Discussion System

CodeSyncer automatically pauses AI work when critical keywords are detected, preventing costly mistakes.

### Critical Keywords (Auto-Enabled)

- **💰 Payment & Billing**: payment, billing, subscription, charge, refund
- **🔐 Auth & Security**: authentication, login, permission, encrypt, token, jwt
- **🗑️ Data Operations**: delete, remove, drop, migrate, schema change
- **📜 Privacy & Compliance**: personal data, GDPR, privacy, PII

### How It Works

1. AI detects keyword (e.g., "payment")
2. **Automatically pauses work**
3. Presents recommendation + alternatives
4. Waits for your decision
5. Records decision in `DECISIONS.md` + code comments
6. Resumes work

---

## 🌍 Multi-Language Support

CodeSyncer fully supports both Korean and English:
- Installation prompts
- Generated documentation
- Comment guidelines
- All UI messages

Switch language anytime during setup or use language-specific commands.

---

## 🔧 Tech Stack Auto-Detection

CodeSyncer automatically detects your project type and tech stack:

**Supported:**
- ☕ Java (Spring Boot)
- 🐍 Python (Django, FastAPI)
- 📘 TypeScript / JavaScript
- ⚛️ React / Next.js
- 🟢 Node.js / Express
- 📱 React Native

Detection happens automatically by scanning:
- `package.json`, `pom.xml`, `build.gradle`, `requirements.txt`
- Folder structure and dependency lists

---

## 📖 Example Workflow

### Scenario: Adding Payment Feature

```bash
User: "Add Stripe payment integration"

AI: ⚠️ 'payment' keyword detected. Discussion needed.

    💡 Recommendation: Use Stripe

    🔄 Alternatives:
    A. Iamport (Korea only)
    B. Toss Payments
    C. Custom implementation

    How would you like to proceed?

User: "Proceed"

AI: ✅ Recording decision...

    Creating:
    - backend/src/services/PaymentService.ts
      /**
       * @codesyncer-decision: [2024-11-12] Using Stripe (international support)
       * @codesyncer-context: Support USD, EUR, KRW
       */

    - frontend/src/components/PaymentForm.tsx
    - DECISIONS.md updated

    ✅ Payment integration complete!
```

---

## 🎯 Why CodeSyncer?

### Before CodeSyncer ❌
- AI makes assumptions about critical business logic
- No record of why decisions were made
- Lost context switching between repos
- Inconsistent coding patterns across team

### After CodeSyncer ✅
- AI pauses for important decisions
- All decisions permanently recorded
- Seamless multi-repo workflows
- Consistent collaboration system
- Onboarding new team members takes minutes

---

## 🤖 Supported AI Tools

### ✅ Currently Supported
- **Claude Code** (Full support)

### 🚧 Coming Soon (Community Contributions Welcome!)
- Cursor
- GitHub Copilot
- Continue.dev
- Codeium

Want to add support for your favorite AI tool? [Contribute here!](https://github.com/bitjaru/codesyncer/issues)

---

## 📁 Project Structure

After running `codesyncer init`, your project will look like:

### Single Repository Mode

```
my-project/
├── CLAUDE.md                      # Claude reads this first
└── .claude/
    ├── CLAUDE.md                  # Coding guidelines
    ├── COMMENT_GUIDE.md           # Tag usage guide
    ├── ARCHITECTURE.md            # Project structure
    └── DECISIONS.md               # Decision log
```

### Multi-Repository Mode

```
workspace/
├── CLAUDE.md                        # Claude reads this first
├── .codesyncer/
│   └── MASTER_CODESYNCER.md         # Multi-repo auto-switching guide
├── backend/
│   └── .claude/
│       ├── CLAUDE.md              # Coding guidelines
│       ├── COMMENT_GUIDE.md       # Tag usage guide
│       ├── ARCHITECTURE.md        # Project structure
│       └── DECISIONS.md           # Decision log
├── frontend/
│   └── .claude/
│       └── (same files)
└── mobile/
    └── .claude/
        └── (same files)
```

### Monorepo Mode (NEW in v2.4.0)

```
monorepo/
├── CLAUDE.md                        # Claude reads this first
├── .codesyncer/
│   └── MASTER_CODESYNCER.md         # Package navigation guide
├── packages/
│   ├── shared/
│   │   └── .claude/
│   │       └── (same files)
│   └── ui/
│       └── .claude/
│           └── (same files)
└── apps/
    ├── web/
    │   └── .claude/
    │       └── (same files)
    └── api/
        └── .claude/
            └── (same files)
```

**Supported Monorepo Tools:**
- ✅ Turborepo (`turbo.json`)
- ✅ pnpm (`pnpm-workspace.yaml`)
- ✅ Nx (`nx.json`)
- ✅ Lerna (`lerna.json`)
- ✅ npm/Yarn workspaces (`package.json` with `workspaces` field)
- ✅ Rush (`rush.json`)

---

## 🛠️ Advanced Usage

### Custom Keywords

In Expert setup mode, you can add custom keywords:

```bash
codesyncer init --mode expert
```

Then select "Add custom keywords" and specify:
- Keywords to detect
- Severity level (CRITICAL/IMPORTANT/MINOR)
- Description

### Updating Existing Projects

Run `codesyncer update` to:
- Refresh project structure in `ARCHITECTURE.md`
- Update comment tag statistics
- Rescan file structure

---

## 🔍 Searching Tags

Find all tagged comments in your codebase:

```bash
# All inferences
grep -r "@codesyncer-inference" ./src

# All TODOs
grep -r "@codesyncer-todo" ./src

# All decisions
grep -r "@codesyncer-decision" ./src
```

---

## 🤝 Contributing

We welcome contributions! CodeSyncer is open source and community-driven.

### 🚀 Quick Start for Contributors

1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/codesyncer.git`
3. **Create a branch**: `git checkout -b feature/amazing-feature`
4. **Make changes** and commit: `git commit -m "feat: Add amazing feature"`
5. **Push** to your fork: `git push origin feature/amazing-feature`
6. **Open a Pull Request** on GitHub

### 🎯 Priority Areas for Contribution

- 🤖 **Add support for more AI tools** (Cursor, Copilot, Continue.dev)
- 🌐 **Additional language translations** (Japanese, Chinese, Spanish)
- 📦 **More tech stack templates** (Go, Rust, Ruby, PHP)
- 📝 **Documentation improvements**
- 🐛 **Bug fixes**

### 📖 Guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

### 💬 Questions?

- 📝 Open an [Issue](https://github.com/bitjaru/codesyncer/issues)
- 💡 Start a [Discussion](https://github.com/bitjaru/codesyncer/discussions)

---

## 📝 License

**Commons Clause License + MIT**

- ✅ **Free to use** for personal and non-commercial projects
- ✅ **Free to fork and modify** the code
- ✅ **Free to contribute** back to the project
- ❌ **Cannot sell** this software or provide it as a paid service

See [LICENSE](./LICENSE) file for full details.

**Why Commons Clause?**
We want CodeSyncer to remain free and accessible to all developers while preventing commercial exploitation. If you need a commercial license, please contact us.

---

## 🙋 FAQ

**Q: Does this only work with Claude Code?**
A: Currently, yes. But we're building support for Cursor, GitHub Copilot, and other tools. Contributions welcome!

**Q: Can I use this on a single repository?**
A: Yes! CodeSyncer automatically detects if you're in a single repo (has `package.json`, `.git`, etc.) and creates `.claude/SETUP_GUIDE.md` instead of the multi-repo structure.

**Q: Does this work with monorepos (Turborepo, pnpm, Nx, Lerna)?**
A: Yes! As of v2.4.0, CodeSyncer automatically detects monorepo configurations (`turbo.json`, `pnpm-workspace.yaml`, `nx.json`, `lerna.json`, or `package.json` with workspaces) and scans all packages in your workspace patterns.

**Q: Will this slow down AI responses?**
A: No. CodeSyncer only adds documentation files that AI reads once per session. It actually makes AI more efficient by providing context upfront.

**Q: Can I customize the keyword detection?**
A: Yes, use Expert setup mode to fully customize which keywords trigger discussions.

**Q: Is my code/data sent anywhere?**
A: No. CodeSyncer is a purely local CLI tool that generates documentation files in your repos. Nothing is sent to external servers.

---

## 🌟 Show Your Support

If CodeSyncer helps your team, please:
- ⭐ Star this repo
- 🐦 Share on Twitter
- 📝 Write about your experience
- 🤝 Contribute improvements

### 💰 Support Development

If you'd like to support the development of CodeSyncer, you can donate via cryptocurrency:

**Ethereum (ETH) / ERC-20 Tokens:**
```
0x0a12177c448778a37Fa4EeA57d33D06713F200De
```

Your support helps maintain and improve CodeSyncer! 🙏

---

## 📮 Contact

- **Issues**: [GitHub Issues](https://github.com/bitjaru/codesyncer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bitjaru/codesyncer/discussions)

---

**Built with ❤️ by the CodeSyncer community**

*Making AI collaboration seamless, one repo at a time.*
