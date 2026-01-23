# Hooks Guide

> Auto-reminder system for Claude Code

[한국어](./ko/HOOKS.md) | English

---

## What are Hooks?

**Hooks are shell commands that Claude Code automatically runs at specific moments.**

Think of them as "triggers" - when certain events happen (session starts, context compacts, etc.), your hook commands execute automatically.

```
┌─────────────────────────────────────┐
│  Claude Code Event                  │
│  (e.g., Session Start)              │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│  Hook Executes                      │
│  echo "[CodeSyncer] Remember..."    │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│  AI sees message → Follows rules    │
└─────────────────────────────────────┘
```

---

## Why CodeSyncer Uses SessionStart + PreCompact

**CodeSyncer uses the most efficient hook timing.**

| Hook | Frequency | Suitability |
|------|-----------|-------------|
| **SessionStart** | Once per session | ✅ Optimal |
| **PreCompact** | Once per compaction | ✅ Optimal |
| Stop | Every response | ❌ Too frequent |
| PreToolUse | Every tool call | ❌ Too frequent |

- **SessionStart**: Injects rules when session begins
- **PreCompact**: Rules survive context compression

---

## CodeSyncer's Hook Configuration

When you run `codesyncer init` and choose "Yes" for hooks:

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "echo '[CodeSyncer] Rules: 1) @codesyncer-inference for inferences 2) @codesyncer-decision for decisions 3) Always ask user about payment/security/API'"
      }]
    }],
    "PreCompact": [{
      "hooks": [{
        "type": "command",
        "command": "echo '[CodeSyncer] Remember after compaction: @codesyncer-* tags required, ask user for payment/security/API matters'"
      }]
    }]
  }
}
```

**File location**: `.claude/settings.json`

---

## All Available Hook Events

Claude Code supports many hook events:

| Event | When It Triggers | Example Use |
|-------|------------------|-------------|
| **SessionStart** | New session begins | Inject project rules |
| **PreCompact** | Before context compression | Preserve important rules |
| **PreToolUse** | Before any tool runs | Block certain file edits |
| **PostToolUse** | After a tool completes | Auto-format files |
| **Stop** | AI finishes responding | Final checklist |
| **UserPromptSubmit** | User submits prompt | Validate input |
| **PermissionRequest** | Permission dialog appears | Auto-approve/deny |

---

## Hook Configuration Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",  // Only for PreToolUse, PostToolUse
        "hooks": [
          {
            "type": "command",     // or "prompt"
            "command": "your-command-here",
            "timeout": 60          // seconds (default: 60)
          }
        ]
      }
    ]
  }
}
```

### Hook Types

**1. Command** - Runs a shell command
```json
{"type": "command", "command": "echo 'hello'"}
```

**2. Prompt** - LLM evaluates (Stop, SubagentStop only)
```json
{"type": "prompt", "prompt": "Check if all tasks are complete"}
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success (continue) |
| 2 | **Block** (stop tool execution) |
| Other | Warning (continue with message) |

---

## Custom Hook Examples

### Block .env file edits

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | grep -q '\\.env' && echo 'Cannot edit .env files' && exit 2 || exit 0"
      }]
    }]
  }
}
```

### Auto-format TypeScript files

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "file=$(jq -r '.tool_input.file_path'); [[ $file == *.ts ]] && npx prettier --write \"$file\""
      }]
    }]
  }
}
```

### Log all bash commands

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.command' >> ~/.claude/bash-log.txt"
      }]
    }]
  }
}
```

---

## Managing Hooks

```bash
# Enable (during init)
codesyncer init  # Select "Yes" for hooks

# Disable
rm .claude/settings.json

# Customize
# Edit .claude/settings.json directly

# Debug
claude --debug  # See hook execution logs

# Interactive setup
claude
/hooks
```

---

## Settings File Locations

| Location | Scope |
|----------|-------|
| `~/.claude/settings.json` | All projects (user-level) |
| `.claude/settings.json` | This project (commit to git) |
| `.claude/settings.local.json` | This project (gitignore) |

---

## Troubleshooting

**Hook not running?**
1. Check file location is correct
2. Run `claude --debug` to see logs
3. Verify JSON syntax is valid

**Hook blocking unexpectedly?**
1. Check exit codes (2 = block)
2. Review matcher patterns
3. Test command manually in terminal

---

[← Back to README](../README.md)
