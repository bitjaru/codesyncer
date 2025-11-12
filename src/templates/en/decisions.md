# DECISIONS.md - Discussion Decision Log

> **Decision Log** - Permanent record of all important decisions
>
> Created: [TODAY]

---

## 📋 Record Format

All discussion decisions are automatically recorded in this format:

```markdown
---
### [Date] - [Topic]
**Category**: [CRITICAL/IMPORTANT/MINOR]
**Decision**: [Decision made]
**Reason**: [Rationale for decision]
**Alternatives**: [Other options considered]
**Decided By**: [User name or team name]
**Code Location**: [file path:line]
**Related Issue**: [Issue number or link]
---
```

---

## 📝 Decision Records

<!-- Auto-added here during discussions -->

### Example Record

---
### 2024-10-17 - Data Deletion Method Selection
**Category**: CRITICAL
**Decision**: Using Soft Delete method
**Reason**:
- Need 30-day recovery period (customer request response)
- Maintain statistical data
- GDPR compliance (permanent delete after 30 days)
**Alternatives**:
- Hard Delete: Immediate deletion (no recovery)
- Archive: Move to separate table (increased complexity)
**Decided By**: Dev team + Planning team collaboration
**Code Location**: `src/services/UserService.ts:45`
**Related Issue**: #123
---

---

## 📊 Category Statistics

- **CRITICAL**: 0 (Payment, Security, Data deletion, etc.)
- **IMPORTANT**: 0 (Business logic, Pricing, External integration, etc.)
- **MINOR**: 0 (UI/UX, Performance optimization, etc.)

**Total Decisions**: 0

---

## 🔍 Category Descriptions

### CRITICAL (Required Discussion)
- 💰 Payment/Billing related
- 🔐 Authentication/Authorization/Security
- 🗑️ Data deletion/Migration
- 📜 Personal data/Legal regulations

### IMPORTANT (Recommended Discussion)
- 💵 Pricing/Business logic
- 🔌 External API integration
- 🚀 Deployment/Infrastructure changes

### MINOR (Optional Discussion)
- 🎨 UI/UX improvements
- ⚡ Performance optimization
- 📦 Library changes

---

## 🔗 Related Documents

Decisions are also recorded as comments in code:

```tsx
/**
 * @codesyncer-decision: [2024-10-17] Soft Delete method
 * Reason: 30-day recovery, GDPR compliance
 */
async function deleteUser(id: string) {
  return db.update(id, { deleted_at: new Date() });
}
```

**Search**: `grep -r "@codesyncer-decision" ./src`

---

## 📅 Monthly Statistics

### October 2024
- Total Decisions: 0
- CRITICAL: 0
- IMPORTANT: 0
- MINOR: 0

---

## 💡 Discussion Process

### 1. Auto Keyword Detection
AI automatically pauses when detecting:
- Payment, authentication, deletion, pricing, etc.

### 2. Present Options
```
⚠️ 'payment' keyword detected. Discussion needed.

💡 Recommendation:
Use Stripe

🔄 Alternatives:
A. Iamport
B. Toss Payments
C. Custom implementation

How would you like to proceed?
```

### 3. User Response
- "Proceed" → Adopt recommendation
- "Alternative A" → Choose alternative
- "Hold" → Decide later

### 4. Auto Record
- Add to DECISIONS.md
- Add `@codesyncer-decision` comment to code
- Update ARCHITECTURE.md statistics

---

## 🎯 Best Practices

### ✅ Good Decision Record

```markdown
### 2024-10-15 - Payment System Selection
**Category**: CRITICAL
**Decision**: Using Stripe
**Reason**:
- International payment support needed
- Built-in subscription payment feature
- Stable service
**Alternatives**:
- Iamport: Korea only (no international)
- Toss: Subscription feature still lacking
**Decided By**: CTO + Dev team
**Code Location**: `src/services/PaymentService.ts`
```

### ❌ Bad Decision Record

```markdown
### Yesterday - Something decided
**Category**: Important
**Decision**: This one
**Reason**: Just because
```

---

## 🔄 Auto-Updates

This document auto-updates in these situations:

1. **Discussion-required keyword** detected and decision made
2. User explicitly requests discussion
3. When `@codesyncer-decision` tag added

**Manual Addition**: Can write directly in above format

---

## 📚 Search

### Find Recent Decisions
```bash
# Last 10 decisions
tail -n 50 .claude/DECISIONS.md

# Specific category
grep "CRITICAL" .claude/DECISIONS.md

# Specific date
grep "2024-10-" .claude/DECISIONS.md
```

### Find Decisions in Code
```bash
# All decision comments
grep -r "@codesyncer-decision" ./src

# Decisions in specific file
grep "@codesyncer-decision" src/services/PaymentService.ts
```

---

## 🤝 Team Collaboration

### New Team Member Onboarding
1. Read this file from start
2. Understand key decisions
3. Learn "why it was implemented this way"

### Decision Review
- Monthly team meeting review
- Mark decisions needing reconsideration
- Add changed decisions as new entries

---

**Version**: 1.0.0
**Last Updated**: [TODAY]

*All important decisions are permanently recorded. This is your team's knowledge asset.*
