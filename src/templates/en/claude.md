# CLAUDE.md - [PROJECT_NAME] Coding Guide v3.0

> **Powered by CodeSyncer** - AI Collaboration System

## 🚀 Quick Start

### Have the AI read this document
```
"Read CLAUDE.md"
```
→ AI will automatically apply this project's rules.

### Request in natural language
```
✅ "Create order list page"
✅ "Add login API"
✅ "Need a payment button component"
✅ "Fix this bug"
```

**AI will automatically:**
- Understand project structure
- Create files in appropriate locations
- Follow coding rules
- Request discussion when needed

---

## 🏗️ Project Information
- **Project Name**: [PROJECT_NAME]
- **Project Type**: [PROJECT_TYPE]
- **Tech Stack**: [TECH_STACK]
- **Created**: [TODAY]
- **Version**: 1.0.0

## 📁 Project Structure
See `.claude/ARCHITECTURE.md` for detailed structure

## 🚨 Absolute Rules
1. **TypeScript strict mode** usage
2. **Functional programming** preferred
3. **Explicit type definitions** required
4. **Comments on all functions/components** required
5. **Error handling** required

## 🔴 No-Inference Zone (Must Confirm with User)

**Never infer** the following - always ask the user:

- 💰 Business logic numbers (prices, fees, limits, discount rates)
- 🔌 API endpoint URLs
- 🔐 Security settings (token expiration, encryption methods)
- 🗄️ Database schema
- 🌐 External service integration details

**Example:**
```
❌ Bad: "Set shipping fee to $30"
✅ Good: "What should the shipping fee be?"
```

## 🤝 Discussion-Required Keywords

**Automatically pause work** when these keywords are detected and discuss with user:

[KEYWORDS]

### Discussion Process
1. **Keyword detected** → "⚠️ '[keyword]' detected. Discussion needed."
2. **Present options** → Recommended approach + alternatives
3. **Wait for user response** → "Proceed" / "Alternative A" / "Hold"
4. **Record decision** → DECISIONS.md + code comment
5. **Resume work**

---

## 📝 Comment Writing Rules

### Comment Tags (Both formats supported)

**✨ Recommended format** (Compatible with all AI tools):
```typescript
@codesyncer-rule        // Special rules (non-standard implementations)
@codesyncer-inference   // Inference and rationale
@codesyncer-decision    // Post-discussion decisions
@codesyncer-todo        // Needs user confirmation
@codesyncer-context     // Business context explanation
```

**🔄 Legacy format** (Compatible with existing projects):
```typescript
@claude-rule          // Same as @codesyncer-rule
@claude-inference     // Same as @codesyncer-inference
@claude-decision      // Same as @codesyncer-decision
@claude-todo          // Same as @codesyncer-todo
@claude-context       // Same as @codesyncer-context
```

### Comment Examples by Level

#### 📄 File Level (JSDoc)
```tsx
/**
 * User authentication service
 *
 * @codesyncer-context JWT-based authentication system
 * @codesyncer-rule Store tokens in httpOnly cookies (XSS prevention)
 * @author CodeSyncer
 * @date [TODAY]
 */
```

#### 🔧 Function/Component Level
```tsx
/**
 * Order creation form component
 *
 * @codesyncer-inference 6-step form structure (common order flow)
 * @codesyncer-decision [2024-10-15] Using Zustand for state management (complex form)
 */
export default function OrderForm() {
  // ...
}
```

#### 📝 Inline Level
```tsx
// @codesyncer-inference: Page size 20 (standard UX pattern)
const PAGE_SIZE = 20;

// @codesyncer-todo: Need to confirm mainApi endpoint
const API_URL = '/api/temp';

// @codesyncer-decision: [2024-10-17] Soft Delete method (30-day recovery)
async function deleteUser(id: string) {
  return db.update(id, { deleted_at: new Date() });
}
```

### Good vs Bad Comments

**✅ Good Comments**
```tsx
// @codesyncer-inference: Using localStorage (JWT token storage, common pattern)
// @codesyncer-context: GDPR compliance needed (auto-delete after 30 days)
// @codesyncer-decision: [2024-10-15] Using Stripe (Korean payment support)
```

**❌ Bad Comments**
```tsx
// @codesyncer-inference: Did this
// @codesyncer-todo: Later
// @codesyncer-decision: Changed
```

→ Always include **specific reasons and rationale**!

---

## 🔄 Auto-Update System

### Auto-Detection Triggers

| Situation | Update Target | User Confirmation |
|-----------|--------------|-------------------|
| New folder/file created | ARCHITECTURE.md | "Update structure?" |
| Post-discussion decision | DECISIONS.md | Auto-add |
| Same pattern 3 times | Add template to CLAUDE.md | "Add template?" |
| TODO added/completed | ARCHITECTURE.md stats | "Update stats?" |

### Manual Update Commands

```
"Update structure"     → Rescan ARCHITECTURE.md
"Add rule"            → Add new rule to CLAUDE.md
"Add template"        → Convert repeated pattern to template
"Update stats"        → Refresh comment tag statistics
```

---

## 📋 Project Type Guidelines

[TEMPLATES]

---

## 🔄 Work Process

### Typical Work Flow
```
1. Receive user request
   ↓
2. Check CLAUDE.md rules
   ↓
3. Check no-inference zones → Ask if needed
   ↓
4. Check discussion keywords → Discuss if detected
   ↓
5. Generate code (auto-include comments)
   ↓
6. If inference made → @codesyncer-inference tag
   ↓
7. If decision made → Record in DECISIONS.md
   ↓
8. Report completion
```

### What AI Does Automatically
- ✅ Analyze project structure
- ✅ Create files in appropriate locations
- ✅ Auto-add type definitions
- ✅ Auto-generate comments
- ✅ Add error handling
- ✅ Record inferences with tags

---

## 💡 Session Start Checklist

When AI reads this file, it automatically:

1. ✅ **Show help** - Display available commands
2. ✅ **Understand project structure** - Check ARCHITECTURE.md
3. ✅ **Check recent discussions** - Review DECISIONS.md
4. ✅ **Ready message** - "Ready to work!"

---

## 📚 Related Documents

- **Comment Guide**: `.claude/COMMENT_GUIDE.md` - Detailed comment writing guide
- **Project Structure**: `.claude/ARCHITECTURE.md` - Folder structure, statistics
- **Discussion Records**: `.claude/DECISIONS.md` - All discussion decisions
- **Master Document**: `../.codesyncer/MASTER_CODESYNCER.md` - Multi-repo switching

---

## 🔍 Comment Search

All comment tags are searchable:

```bash
# Find all inferences
grep -r "@codesyncer-inference" ./

# TODO list
grep -r "@codesyncer-todo" ./

# Discussion decisions
grep -r "@codesyncer-decision" ./

# Special rules
grep -r "@codesyncer-rule" ./
```

---

**Version**: 1.0.0 (Powered by CodeSyncer)
**Created**: [TODAY]
**AI Tools**: Currently Claude Code support | Coming: Cursor, GitHub Copilot, Continue.dev

**Tag Compatibility**: Both `@codesyncer-*` (recommended) + `@claude-*` (legacy) supported

---

*This collaboration system is open source. Suggest improvements at [CodeSyncer GitHub](https://github.com/bitjaru/codesyncer-cli)!*
