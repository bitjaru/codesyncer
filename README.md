# VibeSync CLI

> AI-powered multi-repository collaboration system that works seamlessly with Claude Code, Cursor, GitHub Copilot, and more!

[![npm version](https://img.shields.io/npm/v/vibesync-cli.svg)](https://www.npmjs.com/package/vibesync-cli)
[![License](https://img.shields.io/badge/License-Commons%20Clause-red.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bitjaru/vibesync-cli.svg)](https://github.com/bitjaru/vibesync-cli/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/bitjaru/vibesync-cli.svg)](https://github.com/bitjaru/vibesync-cli/issues)

[한국어 문서](./README.ko.md) | English

---

## 🎯 What is VibeSync?

VibeSync is a CLI tool that sets up an intelligent collaboration system between you and AI coding assistants across multiple repositories. It helps AI understand your project structure, coding standards, and business decisions through a structured documentation system.

### Key Features

- 🤖 **AI-Agnostic**: Works with Claude Code, Cursor, GitHub Copilot, and more
- 📁 **Multi-Repository Support**: Seamlessly work across backend, frontend, mobile repos
- 🏷️ **Comment Tag System**: `@vibesync-*` tags to record decisions and inferences
- 🤝 **Discussion Auto-Pause**: Automatically stops for critical decisions (payment, security, etc.)
- 🌐 **Multi-Language**: Full Korean and English support
- ⚡ **Quick Setup**: One-command installation for your entire workspace

---

## 📦 Installation

```bash
npm install -g vibesync-cli
```

---

## 🚀 Quick Start

### 1. Navigate to your workspace root

```bash
cd /path/to/your/workspace
```

Your workspace should contain multiple repository folders:
```
workspace/
├── backend/
├── frontend/
└── mobile/
```

### 2. Run initialization

```bash
vibesync init
```

### 3. Choose setup mode

**⚡ Quick Setup** (Recommended)
- Auto-detects all repositories
- Creates collaboration system in one step
- Enables all discussion keywords automatically

**🔧 Expert Setup**
- Full customization options
- Select specific keyword categories
- Add custom keywords

### 4. Select language

Choose between Korean (한글) or English

### 5. That's it!

VibeSync will:
- Scan and detect your repositories (Java, Python, Node.js, React, etc.)
- Create master document at workspace root (`.vibesync/MASTER_VIBESYNC.md`)
- Generate collaboration files in each repo (`.claude/` folder)
  - `CLAUDE.md` - Coding guidelines
  - `COMMENT_GUIDE.md` - Comment tag usage guide
  - `ARCHITECTURE.md` - Project structure (auto-updated)
  - `DECISIONS.md` - Decision log

---

## 📚 Usage

### Initialize collaboration system
```bash
vibesync init
```

### Update project structure
```bash
vibesync update
```

### Add new repository to workspace
```bash
vibesync add-repo
```

---

## 🏷️ Comment Tag System

VibeSync uses a structured comment tag system to permanently record all AI inferences and decisions in your code.

### Available Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@vibesync-rule` | Special rules for non-standard implementations | `// @vibesync-rule: Use any type here (external lib has no types)` |
| `@vibesync-inference` | AI inferred something with rationale | `// @vibesync-inference: Page size 20 (standard UX)` |
| `@vibesync-decision` | Post-discussion decision | `// @vibesync-decision: [2024-10-15] Using Stripe (intl payment)` |
| `@vibesync-todo` | Needs user confirmation | `// @vibesync-todo: Confirm API endpoint URL` |
| `@vibesync-context` | Business context explanation | `// @vibesync-context: GDPR compliance (30-day retention)` |

### Legacy Compatibility

Existing `@claude-*` tags are fully compatible:
```typescript
@claude-rule        = @vibesync-rule
@claude-inference   = @vibesync-inference
@claude-decision    = @vibesync-decision
@claude-todo        = @vibesync-todo
@claude-context     = @vibesync-context
```

---

## 🤝 Auto-Discussion System

VibeSync automatically pauses AI work when critical keywords are detected, preventing costly mistakes.

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

VibeSync fully supports both Korean and English:
- Installation prompts
- Generated documentation
- Comment guidelines
- All UI messages

Switch language anytime during setup or use language-specific commands.

---

## 🔧 Tech Stack Auto-Detection

VibeSync automatically detects your project type and tech stack:

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
       * @vibesync-decision: [2024-11-12] Using Stripe (international support)
       * @vibesync-context: Support USD, EUR, KRW
       */

    - frontend/src/components/PaymentForm.tsx
    - DECISIONS.md updated

    ✅ Payment integration complete!
```

---

## 🎯 Why VibeSync?

### Before VibeSync ❌
- AI makes assumptions about critical business logic
- No record of why decisions were made
- Lost context switching between repos
- Inconsistent coding patterns across team

### After VibeSync ✅
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

Want to add support for your favorite AI tool? [Contribute here!](https://github.com/bitjaru/vibesync-cli/issues)

---

## 📁 Project Structure

After running `vibesync init`, your workspace will look like:

```
workspace/
├── .vibesync/
│   └── MASTER_VIBESYNC.md         # Multi-repo auto-switching guide
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

---

## 🛠️ Advanced Usage

### Custom Keywords

In Expert setup mode, you can add custom keywords:

```bash
vibesync init --mode expert
```

Then select "Add custom keywords" and specify:
- Keywords to detect
- Severity level (CRITICAL/IMPORTANT/MINOR)
- Description

### Updating Existing Projects

Run `vibesync update` to:
- Refresh project structure in `ARCHITECTURE.md`
- Update comment tag statistics
- Rescan file structure

---

## 🔍 Searching Tags

Find all tagged comments in your codebase:

```bash
# All inferences
grep -r "@vibesync-inference" ./src

# All TODOs
grep -r "@vibesync-todo" ./src

# All decisions
grep -r "@vibesync-decision" ./src
```

---

## 🤝 Contributing

We welcome contributions! VibeSync is open source and community-driven.

### Areas for Contribution:
- Add support for more AI tools (Cursor, Copilot, etc.)
- Additional language translations
- More tech stack templates
- Documentation improvements

[Contribution Guidelines](./CONTRIBUTING.md)

---

## 📝 License

**Commons Clause License + MIT**

- ✅ **Free to use** for personal and non-commercial projects
- ✅ **Free to fork and modify** the code
- ✅ **Free to contribute** back to the project
- ❌ **Cannot sell** this software or provide it as a paid service

See [LICENSE](./LICENSE) file for full details.

**Why Commons Clause?**
We want VibeSync to remain free and accessible to all developers while preventing commercial exploitation. If you need a commercial license, please contact us.

---

## 🙋 FAQ

**Q: Does this only work with Claude Code?**
A: Currently, yes. But we're building support for Cursor, GitHub Copilot, and other tools. Contributions welcome!

**Q: Can I use this on a single repository?**
A: Yes! Just run `vibesync init` in any repository. The multi-repo features are optional.

**Q: Will this slow down AI responses?**
A: No. VibeSync only adds documentation files that AI reads once per session. It actually makes AI more efficient by providing context upfront.

**Q: Can I customize the keyword detection?**
A: Yes, use Expert setup mode to fully customize which keywords trigger discussions.

**Q: Is my code/data sent anywhere?**
A: No. VibeSync is a purely local CLI tool that generates documentation files in your repos. Nothing is sent to external servers.

---

## 🌟 Show Your Support

If VibeSync helps your team, please:
- ⭐ Star this repo
- 🐦 Share on Twitter
- 📝 Write about your experience
- 🤝 Contribute improvements

---

## 📮 Contact

- **Issues**: [GitHub Issues](https://github.com/bitjaru/vibesync-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bitjaru/vibesync-cli/discussions)

---

**Built with ❤️ by the VibeSync community**

*Making AI collaboration seamless, one repo at a time.*
