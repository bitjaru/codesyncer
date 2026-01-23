# FAQ

> Frequently Asked Questions

[한국어](./ko/FAQ.md) | English

---

## General

### Does this only work with Claude Code?

Currently, yes. Support for Cursor, GitHub Copilot, and other tools is planned. [Contributions welcome!](https://github.com/bitjaru/codesyncer/issues)

### Can I use this on a single repository?

Yes! CodeSyncer auto-detects single repos and creates `.claude/SETUP_GUIDE.md`.

### Does this work with monorepos?

Yes! Supports Turborepo, pnpm, Nx, Lerna, npm/yarn workspaces, and Rush.

### Will this slow down AI responses?

No. CodeSyncer only adds documentation files that AI reads once per session. It actually makes AI more efficient by providing context upfront.

### Is my code/data sent anywhere?

No. CodeSyncer is a purely local CLI tool. Nothing is sent to external servers.

---

## Setup

### Where are the settings stored?

- `~/.claude/settings.json` - Global (all projects)
- `.claude/settings.json` - Project (commit to git)
- `.claude/settings.local.json` - Project (gitignore)

### Can I customize keyword detection?

Yes, use expert mode:
```bash
codesyncer init --mode expert
```

### How do I update my templates?

```bash
codesyncer update
```

This detects outdated templates and offers to upgrade them.

---

## Tags

### What tags should I use?

| Situation | Tag |
|-----------|-----|
| AI made an assumption | `@codesyncer-inference` |
| Decision after discussion | `@codesyncer-decision` |
| Non-standard implementation | `@codesyncer-rule` |
| Needs user confirmation | `@codesyncer-todo` |
| Business context | `@codesyncer-context` |

### Are old @claude-* tags still supported?

Yes, they're fully compatible:
```
@claude-inference = @codesyncer-inference
@claude-decision = @codesyncer-decision
```

---

## Hooks

### What hooks does CodeSyncer use?

- **SessionStart** - Inject rules at session start
- **PreCompact** - Preserve rules before context compression

### Why not use the Stop hook?

Stop runs after every AI response - too frequent. SessionStart + PreCompact is more efficient.

### How do I debug hooks?

```bash
claude --debug
```

---

## Troubleshooting

### AI isn't following the rules

1. Make sure AI has read `CLAUDE.md`
2. Check if hooks are set up: `.claude/settings.json`
3. Run `codesyncer validate`

### Watch mode isn't detecting changes

1. Check you're in the right directory
2. Make sure files are being saved
3. Check file extensions are supported

### Templates are outdated

```bash
codesyncer update
```

---

## Contributing

### How can I contribute?

- Add support for more AI tools
- Additional language translations
- More tech stack templates
- Documentation improvements
- Bug fixes

See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

[← Back to README](../README.md)
