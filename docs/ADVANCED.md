# Advanced Usage

> Power user features and customization

[한국어](./ko/ADVANCED.md) | English

---

## Watch Mode

Real-time monitoring for tagged changes:

```bash
codesyncer watch         # Start monitoring
codesyncer watch --log   # With file logging
```

**Output:**
```
[14:32:10] 📝 Changed: src/utils/api.ts
           └── 🎯 Found: @codesyncer-decision
               "Use React Query instead of SWR"
           └── ✅ Added to DECISIONS.md
```

---

## Auto-Discussion System

CodeSyncer automatically pauses AI when critical keywords are detected:

### Critical Keywords

| Category | Keywords |
|----------|----------|
| **💰 Payment** | payment, billing, subscription, charge, refund |
| **🔐 Security** | authentication, login, permission, encrypt, token, jwt |
| **🗑️ Data** | delete, remove, drop, migrate, schema change |
| **📜 Privacy** | personal data, GDPR, privacy, PII |

### How It Works

1. AI detects keyword (e.g., "payment")
2. **Automatically pauses**
3. Presents recommendation + alternatives
4. Waits for your decision
5. Records in `DECISIONS.md` + code comments
6. Resumes work

### Custom Keywords

```bash
codesyncer init --mode expert
```

Then add custom keywords with severity levels.

---

## Context Optimization

### Subfolder CLAUDE.md

For large projects, add CLAUDE.md to specific folders:

```
project/
├── CLAUDE.md                    # Global rules
├── src/
│   ├── payment/
│   │   └── CLAUDE.md            # Payment-specific rules
│   └── auth/
│       └── CLAUDE.md            # Auth-specific rules
```

**Template**: `src/templates/subfolder-claude.md`

### Do Not Touch Zones

```markdown
## 🚫 Do Not Touch
- `src/generated/` - Auto-generated files
- `src/legacy/` - Do not modify until migration
- `.env*` - Environment variables
```

---

## Multi-Repo Work Tracking

### Git Branch = Work ID

```
feature/AUTH-001-login
fix/PAY-002-webhook
```

### Cross-Repo Tags

```typescript
// frontend repo
// @codesyncer-work:AUTH-001 Login form

// backend repo
// @codesyncer-work:AUTH-001 Login API
```

Search across repos:
```bash
grep -r "@codesyncer-work:AUTH-001" ../
```

---

## Tech Stack Auto-Detection

CodeSyncer detects:

| Stack | Detection |
|-------|-----------|
| Java (Spring Boot) | `pom.xml`, `build.gradle` |
| Python (Django, FastAPI) | `requirements.txt`, `pyproject.toml` |
| TypeScript/JavaScript | `package.json` |
| React/Next.js | dependencies in `package.json` |
| Node.js/Express | dependencies in `package.json` |
| React Native | dependencies in `package.json` |

---

## Environment Variables

No environment variables required. CodeSyncer is a purely local tool.

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. SETUP (once)                                            │
│     $ codesyncer init                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. TEACH AI (once per session)                             │
│     "Read CLAUDE.md"                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. CODE (with watch mode)                                  │
│     $ codesyncer watch                                      │
│     → Tags added automatically                              │
│     → Watch alerts if missing                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. NEXT SESSION                                            │
│     Claude reads code → sees tags                           │
│     → Context recovered!                                    │
└─────────────────────────────────────────────────────────────┘
```

---

[← Back to README](../README.md)
