# Setup Guide

> Detailed installation and configuration

[한국어](./ko/SETUP.md) | English

---

## Installation

```bash
npm install -g codesyncer
```

---

## Quick Start

### Step 1: Navigate to your project

```bash
cd /path/to/your/project
```

### Step 2: Initialize

```bash
codesyncer init
```

You'll be asked:
- Language preference (Korean/English)
- Project name
- GitHub username
- Hooks setup (recommended)

### Step 3: Let AI complete setup

**For Single Repository:**
```
"Read .claude/SETUP_GUIDE.md and follow the instructions"
```

**For Multi-Repository:**
```
"Read .codesyncer/SETUP_GUIDE.md and follow the instructions"
```

### Step 4: Start coding

```
"Read CLAUDE.md"
```

---

## Project Detection

CodeSyncer automatically detects your project type:

| Type | Detection | Output |
|------|-----------|--------|
| **Single Repo** | `package.json`, `.git` in current folder | `.claude/SETUP_GUIDE.md` |
| **Monorepo** | `turbo.json`, `pnpm-workspace.yaml`, `nx.json`, `lerna.json` | `.codesyncer/SETUP_GUIDE.md` |
| **Multi-Repo** | Subfolders with separate repos | `.codesyncer/SETUP_GUIDE.md` |

---

## What Gets Created

### Single Repository

```
my-project/
├── CLAUDE.md                 # Claude reads this first
└── .claude/
    ├── CLAUDE.md             # Coding guidelines
    ├── COMMENT_GUIDE.md      # Tag usage guide
    ├── ARCHITECTURE.md       # Project structure
    ├── DECISIONS.md          # Decision log
    └── settings.json         # Hooks (optional)
```

### Multi-Repository / Monorepo

```
workspace/
├── CLAUDE.md                 # Claude reads this first
├── .codesyncer/
│   └── MASTER_CODESYNCER.md  # Multi-repo navigation
├── backend/
│   └── .claude/
│       └── (same files)
└── frontend/
    └── .claude/
        └── (same files)
```

---

## Updating CodeSyncer

### Check versions

```bash
codesyncer --version        # Current version
npm view codesyncer version # Latest version
```

### Update

```bash
npm install -g codesyncer@latest
```

### After updating

```bash
codesyncer validate  # Check setup
codesyncer update    # Sync with latest templates
```

---

## Template Upgrade

When you update CodeSyncer, your templates may be outdated:

```
📦 New Version Detected: v3.2.0

  📁 my-project/
     • CLAUDE.md (v3.1.0 → v3.2.0)
     • COMMENT_GUIDE.md (no version → v3.2.0)

? Upgrade 2 template(s)?
  > Yes - Upgrade (backup existing files)
    No - Skip
    Preview - Show files only
```

**Features:**
- Auto-detects outdated templates
- Creates `.backup` files before upgrade
- Preserves project variables

---

## Validation

```bash
codesyncer validate           # Basic check
codesyncer validate --verbose # Show file paths
```

**What it checks:**
- Master setup exists
- Root `CLAUDE.md` for auto-loading
- All repos have required files
- No unfilled placeholders

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `codesyncer init` | Initialize project |
| `codesyncer update` | Update/sync templates |
| `codesyncer validate` | Check setup |
| `codesyncer watch` | Real-time monitoring |
| `codesyncer add-repo` | Add new repo to workspace |

---

## Supported Monorepo Tools

- ✅ Turborepo (`turbo.json`)
- ✅ pnpm (`pnpm-workspace.yaml`)
- ✅ Nx (`nx.json`)
- ✅ Lerna (`lerna.json`)
- ✅ npm/Yarn workspaces
- ✅ Rush (`rush.json`)

---

[← Back to README](../README.md)
