# Tag System Guide

> Permanent context in your code

[한국어](./ko/TAGS.md) | English

---

## The Core Idea

**AI reads code. So put your context IN the code.**

```typescript
// @codesyncer-decision: [2024-01-15] Using JWT (session management is simpler)
// @codesyncer-inference: Page size 20 (standard UX pattern)
const authConfig = { /* ... */ };
```

Next session? Claude reads your code and **automatically recovers all context**.

---

## Available Tags

| Tag | Purpose | When to Use |
|-----|---------|-------------|
| `@codesyncer-inference` | AI inferred something | When AI makes assumptions |
| `@codesyncer-decision` | Post-discussion decision | After confirming with user |
| `@codesyncer-rule` | Special implementation rule | Non-standard patterns |
| `@codesyncer-todo` | Needs user confirmation | Uncertain values |
| `@codesyncer-context` | Business context | Domain knowledge |

---

## Tag Examples

### @codesyncer-inference
```typescript
// @codesyncer-inference: Page size 20 (standard UX pattern)
const PAGE_SIZE = 20;

// @codesyncer-inference: Using localStorage for token (common pattern)
const storage = localStorage;
```

### @codesyncer-decision
```typescript
// @codesyncer-decision: [2024-10-15] Using Stripe (international payment support)
const paymentProvider = 'stripe';

// @codesyncer-decision: [2024-10-17] Soft delete (30-day recovery)
async function deleteUser(id: string) {
  return db.update(id, { deleted_at: new Date() });
}
```

### @codesyncer-rule
```typescript
// @codesyncer-rule: Use 'any' type here (external lib has no types)
const externalData: any = getFromLegacyAPI();

// @codesyncer-rule: Store token in httpOnly cookie (XSS prevention)
res.cookie('token', jwt, { httpOnly: true });
```

### @codesyncer-todo
```typescript
// @codesyncer-todo: Confirm API endpoint URL with backend team
const API_URL = '/api/temp';

// @codesyncer-todo: Verify shipping fee with business team
const SHIPPING_FEE = 3000;
```

### @codesyncer-context
```typescript
// @codesyncer-context: GDPR compliance (30-day data retention)
const RETENTION_DAYS = 30;

// @codesyncer-context: Korean holiday calendar affects shipping dates
const holidays = getKoreanHolidays();
```

---

## Comment Levels

### File Level (JSDoc)
```typescript
/**
 * User authentication service
 *
 * @codesyncer-context JWT-based auth system
 * @codesyncer-rule Store tokens in httpOnly cookies (XSS prevention)
 */
export class AuthService { }
```

### Function Level
```typescript
/**
 * Create order form component
 *
 * @codesyncer-inference 6-step form flow (standard checkout pattern)
 * @codesyncer-decision [2024-10-15] Zustand for state (complex form)
 */
export function OrderForm() { }
```

### Inline Level
```typescript
const config = {
  timeout: 5000,  // @codesyncer-inference: 5s timeout (API response time)
  retries: 3,     // @codesyncer-rule: Max 3 retries (rate limit protection)
};
```

---

## Legacy Compatibility

Existing `@claude-*` tags are fully compatible:

```typescript
@claude-rule        = @codesyncer-rule
@claude-inference   = @codesyncer-inference
@claude-decision    = @codesyncer-decision
@claude-todo        = @codesyncer-todo
@claude-context     = @codesyncer-context
```

---

## Searching Tags

```bash
# All inferences
grep -r "@codesyncer-inference" ./src

# All TODOs
grep -r "@codesyncer-todo" ./src

# All decisions
grep -r "@codesyncer-decision" ./src

# All rules
grep -r "@codesyncer-rule" ./src

# All context
grep -r "@codesyncer-context" ./src
```

---

## Good vs Bad Tags

### ✅ Good Tags
```typescript
// @codesyncer-inference: localStorage for token (JWT storage, common pattern)
// @codesyncer-context: GDPR compliance (auto-delete after 30 days)
// @codesyncer-decision: [2024-10-15] Stripe for payments (intl support)
```

### ❌ Bad Tags
```typescript
// @codesyncer-inference: did this
// @codesyncer-todo: later
// @codesyncer-decision: changed
```

**Always include specific reasons and context!**

---

## Watch Mode Integration

Run `codesyncer watch` to automatically detect tagged changes:

```
[14:32:10] 📝 Changed: src/utils/api.ts
           └── 🎯 Found: @codesyncer-decision
               "Use React Query instead of SWR"
           └── ✅ Added to DECISIONS.md
```

---

[← Back to README](../README.md)
