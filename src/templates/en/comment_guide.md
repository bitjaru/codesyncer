# Comment Writing Guide

> **VibeSync Comment System** - Permanently record all inferences and decisions

---

## 📋 Comment Tag Reference

### 5 Essential Tags

| Tag | Purpose | When to Use | Importance |
|-----|---------|-------------|------------|
| `@vibesync-rule` | Special rules | Non-standard implementations | ⭐⭐⭐ |
| `@vibesync-inference` | Inference content | AI inferred content and rationale | ⭐⭐⭐⭐⭐ |
| `@vibesync-decision` | Decision made | Post-discussion decisions | ⭐⭐⭐⭐⭐ |
| `@vibesync-todo` | TODO | Needs user confirmation | ⭐⭐⭐⭐ |
| `@vibesync-context` | Business context | Domain knowledge, background | ⭐⭐⭐ |

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

## 📝 Comment Levels

### 1. 📄 File Level (JSDoc)

**When**: Top of file, module-wide description

```typescript
/**
 * User authentication service
 *
 * @vibesync-context JWT-based authentication system
 * @vibesync-rule Store tokens in httpOnly cookies (XSS prevention)
 * @author VibeSync
 * @date 2024-10-17
 */
```

### 2. 🔧 Function/Class/Component Level

**When**: Above each function, class, component definition

```tsx
/**
 * Order creation form
 *
 * @vibesync-context 6-step order process
 * @vibesync-inference Auto-save at each step (common UX pattern)
 * @vibesync-decision [2024-10-15] Zustand for state management (complex form state)
 */
export default function OrderForm() {
  // ...
}
```

### 3. 📝 Inline Level

**When**: Above or beside code lines

```typescript
// @vibesync-inference: Page size 20 (standard table UX)
const PAGE_SIZE = 20;

// @vibesync-todo: Need to confirm mainApi endpoint URL
const API_URL = '/api/temp';

// @vibesync-decision: [2024-10-17] Soft Delete (30-day recovery)
async function deleteUser(id: string) {
  // @vibesync-inference: Using deleted_at flag (for recovery feature)
  return db.update(id, { deleted_at: new Date() });
}

const maxRetry = 3; // @vibesync-inference: 3 retries (stability)
```

---

## ✅ Good Comment Examples

### Example 1: Business Logic

```tsx
/**
 * Calculate shipping fee
 *
 * @vibesync-context Shipping fee policy
 * - Over $300: Free shipping
 * - Under $300: $30
 * - Remote areas: +$30
 *
 * @vibesync-decision [2024-10-10] Policy finalized (Marketing team agreement)
 * @vibesync-rule Policy changes require Marketing team approval
 */
function calculateShippingFee(orderAmount: number, region: string): number {
  // @vibesync-inference: $300 threshold (industry standard)
  const FREE_SHIPPING_THRESHOLD = 30000;

  // @vibesync-decision: [2024-10-10] Base fee $30
  const BASIC_FEE = 3000;

  // @vibesync-todo: Confirm remote area list
  const EXTRA_FEE_REGIONS = ['Jeju', 'Ulleungdo'];

  if (orderAmount >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  const baseFee = BASIC_FEE;
  const extraFee = EXTRA_FEE_REGIONS.includes(region) ? 3000 : 0;

  return baseFee + extraFee;
}
```

### Example 2: Data Structure

```tsx
/**
 * User interface
 *
 * @vibesync-context GDPR compliance required
 * @vibesync-rule Personal data must be encrypted
 */
interface User {
  id: string;

  // @vibesync-inference: Using email as username (common pattern)
  email: string;

  // @vibesync-decision: [2024-10-12] bcrypt hashing (security team recommendation)
  passwordHash: string;

  // @vibesync-context: For Soft Delete
  // @vibesync-decision: [2024-10-15] Permanent delete after 30 days (GDPR)
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

### Example 3: Component

```tsx
/**
 * Order list table component
 *
 * @vibesync-context Customer order history view
 * @vibesync-inference Pagination needed (large dataset)
 * @vibesync-decision [2024-10-16] Using TanStack Table (performance)
 */
export function OrderListTable({ orders }: OrderListTableProps) {
  // @vibesync-inference: 20 items per page (UX standard)
  const [pageSize, setPageSize] = useState(20);

  // @vibesync-todo: Add sorting options (date, amount, status)

  return (
    <Table>
      {/* @vibesync-rule: Switch to card layout on mobile */}
      {/* ... */}
    </Table>
  );
}
```

---

## ❌ Bad Comment Examples

### Comments to Avoid

```tsx
// ❌ Too vague
// @vibesync-inference: Did this
const value = 10;

// ❌ No rationale
// @vibesync-decision: Changed
const API_URL = '/api/new';

// ❌ Meaningless
// @vibesync-todo: Later
function doSomething() {}

// ❌ Lacks context
// @vibesync-context: Important
const IMPORTANT_VALUE = 42;
```

### Improved Versions

```tsx
// ✅ Specific rationale
// @vibesync-inference: Default 10 (typical retry wait time)
const RETRY_DELAY = 10;

// ✅ Clear reason and date
// @vibesync-decision: [2024-10-17] Changed to /api/v2 (API version upgrade)
const API_URL = '/api/v2';

// ✅ Specific TODO
// @vibesync-todo: Add error handling (network errors, timeouts)
function fetchData() {}

// ✅ Business context explanation
// @vibesync-context: VAT rate (10% as of 2024)
const TAX_RATE = 0.1;
```

---

## 🔍 Comment Search

### Bash Commands

```bash
# Find all inferences
grep -r "@vibesync-inference" ./src

# Check TODO list
grep -r "@vibesync-todo" ./src

# Discussion decisions
grep -r "@vibesync-decision" ./src

# Special rules
grep -r "@vibesync-rule" ./src

# Business context
grep -r "@vibesync-context" ./src
```

### VS Code Search

1. `Cmd/Ctrl + Shift + F` (Global search)
2. Enter search term: `@vibesync-todo`
3. File filter: `src/**/*.{ts,tsx,js,jsx}`

---

## 📊 Comment Statistics

ARCHITECTURE.md automatically provides statistics:

```markdown
## Comment Tag Statistics
- @vibesync-inference: 45
- @vibesync-decision: 12
- @vibesync-todo: 8
- @vibesync-rule: 5
- @vibesync-context: 15
```

Manual refresh with "update stats" command

---

## 💡 Comment Writing Tips

### 1. Always provide rationale for inferences

```tsx
// ❌ @vibesync-inference: Using useState
// ✅ @vibesync-inference: Using useState (simple local state, Zustand unnecessary)
```

### 2. Include date and reason for decisions

```tsx
// ❌ @vibesync-decision: Using Stripe
// ✅ @vibesync-decision: [2024-10-15] Using Stripe (international payment support needed)
```

### 3. Be specific with TODOs

```tsx
// ❌ @vibesync-todo: Needs fix
// ✅ @vibesync-todo: Add error boundary (fallback UI for API failures)
```

### 4. Focus on "why" for context

```tsx
// ❌ @vibesync-context: Authentication
// ✅ @vibesync-context: OAuth 2.0 authentication (Google, Kakao login support)
```

### 5. Rules only for exceptional cases

```tsx
// ❌ @vibesync-rule: Using TypeScript (this is obvious)
// ✅ @vibesync-rule: This file only allows any type (external library has no types)
```

---

## 🎯 Checklist

After writing code, verify:

- [ ] Added `@vibesync-inference` for inferences?
- [ ] Recorded discussion decisions with `@vibesync-decision`?
- [ ] Marked items needing confirmation with `@vibesync-todo`?
- [ ] Explained business logic with `@vibesync-context`?
- [ ] Specified special rules with `@vibesync-rule`?
- [ ] Included specific rationale in all comments?

---

**Version**: 1.0.0
**Last Updated**: [TODAY]

*This comment system permanently records all decisions in code.*
