# CodeSyncer CLI

> AI-powered multi-repository collaboration system that works seamlessly with Claude Code, Cursor, GitHub Copilot, and more!

[![npm version](https://img.shields.io/npm/v/codesyncer.svg)](https://www.npmjs.com/package/codesyncer)
[![License](https://img.shields.io/badge/License-Commons%20Clause-red.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/issues)

[한국어 문서](./README.ko.md) | English

---

## 🎯 What is CodeSyncer?

CodeSyncer is a CLI tool that sets up an intelligent collaboration system between you and AI coding assistants across multiple repositories. It helps AI understand your project structure, coding standards, and business decisions through a structured documentation system.

### Key Features

- 🤖 **AI-Agnostic**: Works with Claude Code, Cursor, GitHub Copilot, and more
- 📁 **Multi-Repository Support**: Seamlessly work across backend, frontend, mobile repos
- 🏷️ **Comment Tag System**: `@codesyncer-*` tags to record decisions and inferences
- 🤝 **Discussion Auto-Pause**: Automatically stops for critical decisions (payment, security, etc.)
- 🌐 **Multi-Language**: Full Korean and English support
- ⚡ **Quick Setup**: One-command installation for your entire workspace

---

## 📦 Installation

```bash
npm install -g codesyncer
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
codesyncer init
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

CodeSyncer will:
- Scan and detect your repositories (Java, Python, Node.js, React, etc.)
- Create master document at workspace root (`.codesyncer/MASTER_CODESYNCER.md`)
- Generate collaboration files in each repo (`.claude/` folder)
  - `CLAUDE.md` - Coding guidelines
  - `COMMENT_GUIDE.md` - Comment tag usage guide
  - `ARCHITECTURE.md` - Project structure (auto-updated)
  - `DECISIONS.md` - Decision log

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

After running `codesyncer init`, your workspace will look like:

```
workspace/
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
A: Yes! Just run `codesyncer init` in any repository. The multi-repo features are optional.

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
