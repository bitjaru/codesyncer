# CodeSyncer

> **Claude forgets everything when the session ends. CodeSyncer makes it remember.**

[![npm version](https://img.shields.io/npm/v/codesyncer.svg)](https://www.npmjs.com/package/codesyncer)
[![License](https://img.shields.io/badge/License-Commons%20Clause-red.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/stargazers)

[한국어](./README.ko.md) | English

---

## The Problem → The Solution

| Problem | Without CodeSyncer | With CodeSyncer |
|---------|-------------------|-----------------|
| **Context loss** | Every session = start from scratch | Tags in code = permanent memory |
| **Decision amnesia** | "Why did we use JWT?" → 🤷 | `@codesyncer-decision` → instant recall |
| **Dangerous inference** | AI guesses prices, endpoints, auth | Auto-pause on critical keywords |

---

## Demo

![CodeSyncer Demo](https://raw.githubusercontent.com/bitjaru/codesyncer/main/demo.gif)

---

## Quick Start

```bash
# 1. Install
npm install -g codesyncer

# 2. Initialize
cd /path/to/your/project
codesyncer init

# 3. Let AI set up (say this to Claude)
"Read .claude/SETUP_GUIDE.md and follow the instructions"

# 4. Start coding (say this each session)
"Read CLAUDE.md"
```

---

## Core Features

### 🏷️ Tag System

Put context IN your code. AI reads code, so it recovers context automatically.

```typescript
// @codesyncer-decision: [2024-01-15] Using JWT (session management is simpler)
// @codesyncer-inference: Page size 20 (standard UX pattern)
const authConfig = { /* ... */ };
```

**[→ Tag System Guide](./docs/TAGS.md)**

---

### 🔄 Watch Mode

Catch untagged changes in real-time:

```bash
codesyncer watch
```

```
[14:32:10] 📝 Changed: src/auth/login.ts
           └── 🎯 Found: @codesyncer-decision
           └── ✅ Added to DECISIONS.md
```

**[→ Advanced Usage](./docs/ADVANCED.md)**

---

### 🪝 Hooks

Auto-remind AI at optimal moments (not every response):

| Hook | When | Why |
|------|------|-----|
| **SessionStart** | Session begins | Inject rules once |
| **PreCompact** | Before compression | Rules survive compaction |

**CodeSyncer uses the most efficient hook timing.**

**[→ Hooks Guide](./docs/HOOKS.md)**

---

## Supported AI Tools

| Tool | Status |
|------|--------|
| **Claude Code** | ✅ Full support |
| Cursor | 🚧 Coming soon |
| GitHub Copilot | 🚧 Coming soon |

---

## Documentation

| Guide | Description |
|-------|-------------|
| **[Setup Guide](./docs/SETUP.md)** | Installation, configuration, updating |
| **[Tag System](./docs/TAGS.md)** | All tags and examples |
| **[Hooks Guide](./docs/HOOKS.md)** | Hook events and customization |
| **[Advanced Usage](./docs/ADVANCED.md)** | Watch mode, auto-discussion, monorepo |
| **[FAQ](./docs/FAQ.md)** | Common questions |

---

## Commands

```bash
codesyncer init       # Initialize project
codesyncer update     # Update templates
codesyncer validate   # Check setup
codesyncer watch      # Real-time monitoring
codesyncer add-repo   # Add repo to workspace
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md)

**Priority areas:**
- 🤖 Support for more AI tools
- 🌐 Additional language translations
- 📦 More tech stack templates

---

## Support

If CodeSyncer helps you:
- ⭐ Star this repo
- 🐦 Share on Twitter

**Ethereum (ETH):**
```
0x0a12177c448778a37Fa4EeA57d33D06713F200De
```

---

## License

**Commons Clause + MIT** - Free for personal/non-commercial use. See [LICENSE](./LICENSE)

---

## Contact

- [GitHub Issues](https://github.com/bitjaru/codesyncer/issues)
- [GitHub Discussions](https://github.com/bitjaru/codesyncer/discussions)

---

**Built with ❤️ by the CodeSyncer community**
