# Comment Writing Guide

> **CodeSyncer Comment System** - Permanently record all inferences and decisions

---

## 📋 Comment Tag Reference

### 5 Essential Tags

| Tag | Purpose | When to Use | Importance |
|-----|---------|-------------|------------|
| `@codesyncer-rule` | Special rules | Non-standard implementations | ⭐⭐⭐ |
| `@codesyncer-inference` | Inference content | AI inferred content and rationale | ⭐⭐⭐⭐⭐ |
| `@codesyncer-decision` | Decision made | Post-discussion decisions | ⭐⭐⭐⭐⭐ |
| `@codesyncer-todo` | TODO | Needs user confirmation | ⭐⭐⭐⭐ |
| `@codesyncer-context` | Business context | Domain knowledge, background | ⭐⭐⭐ |

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

## 📝 Comment Levels

### 1. 📄 File Level (JSDoc)

**When**: Top of file, module-wide description

```typescript
/**
 * User authentication service
 *
 * @codesyncer-context JWT-based authentication system
 * @codesyncer-rule Store tokens in httpOnly cookies (XSS prevention)
 * @author CodeSyncer
 * @date 2024-10-17
 */
```

### 2. 🔧 Function/Class/Component Level

**When**: Above each function, class, component definition

```tsx
/**
 * Order creation form
 *
 * @codesyncer-context 6-step order process
 * @codesyncer-inference Auto-save at each step (common UX pattern)
 * @codesyncer-decision [2024-10-15] Zustand for state management (complex form state)
 */
export default function OrderForm() {
  // ...
}
```

### 3. 📝 Inline Level

**When**: Above or beside code lines

```typescript
// @codesyncer-inference: Page size 20 (standard table UX)
const PAGE_SIZE = 20;

// @codesyncer-todo: Need to confirm mainApi endpoint URL
const API_URL = '/api/temp';

// @codesyncer-decision: [2024-10-17] Soft Delete (30-day recovery)
async function deleteUser(id: string) {
  // @codesyncer-inference: Using deleted_at flag (for recovery feature)
  return db.update(id, { deleted_at: new Date() });
}

const maxRetry = 3; // @codesyncer-inference: 3 retries (stability)
```

---

## ✅ Good Comment Examples

### Example 1: Business Logic

```tsx
/**
 * Calculate shipping fee
 *
 * @codesyncer-context Shipping fee policy
 * - Over $300: Free shipping
 * - Under $300: $30
 * - Remote areas: +$30
 *
 * @codesyncer-decision [2024-10-10] Policy finalized (Marketing team agreement)
 * @codesyncer-rule Policy changes require Marketing team approval
 */
function calculateShippingFee(orderAmount: number, region: string): number {
  // @codesyncer-inference: $300 threshold (industry standard)
  const FREE_SHIPPING_THRESHOLD = 30000;

  // @codesyncer-decision: [2024-10-10] Base fee $30
  const BASIC_FEE = 3000;

  // @codesyncer-todo: Confirm remote area list
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
 * @codesyncer-context GDPR compliance required
 * @codesyncer-rule Personal data must be encrypted
 */
interface User {
  id: string;

  // @codesyncer-inference: Using email as username (common pattern)
  email: string;

  // @codesyncer-decision: [2024-10-12] bcrypt hashing (security team recommendation)
  passwordHash: string;

  // @codesyncer-context: For Soft Delete
  // @codesyncer-decision: [2024-10-15] Permanent delete after 30 days (GDPR)
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
 * @codesyncer-context Customer order history view
 * @codesyncer-inference Pagination needed (large dataset)
 * @codesyncer-decision [2024-10-16] Using TanStack Table (performance)
 */
export function OrderListTable({ orders }: OrderListTableProps) {
  // @codesyncer-inference: 20 items per page (UX standard)
  const [pageSize, setPageSize] = useState(20);

  // @codesyncer-todo: Add sorting options (date, amount, status)

  return (
    <Table>
      {/* @codesyncer-rule: Switch to card layout on mobile */}
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
// @codesyncer-inference: Did this
const value = 10;

// ❌ No rationale
// @codesyncer-decision: Changed
const API_URL = '/api/new';

// ❌ Meaningless
// @codesyncer-todo: Later
function doSomething() {}

// ❌ Lacks context
// @codesyncer-context: Important
const IMPORTANT_VALUE = 42;
```

### Improved Versions

```tsx
// ✅ Specific rationale
// @codesyncer-inference: Default 10 (typical retry wait time)
const RETRY_DELAY = 10;

// ✅ Clear reason and date
// @codesyncer-decision: [2024-10-17] Changed to /api/v2 (API version upgrade)
const API_URL = '/api/v2';

// ✅ Specific TODO
// @codesyncer-todo: Add error handling (network errors, timeouts)
function fetchData() {}

// ✅ Business context explanation
// @codesyncer-context: VAT rate (10% as of 2024)
const TAX_RATE = 0.1;
```

---

## 🔍 Comment Search

### Bash Commands

```bash
# Find all inferences
grep -r "@codesyncer-inference" ./src

# Check TODO list
grep -r "@codesyncer-todo" ./src

# Discussion decisions
grep -r "@codesyncer-decision" ./src

# Special rules
grep -r "@codesyncer-rule" ./src

# Business context
grep -r "@codesyncer-context" ./src
```

### VS Code Search

1. `Cmd/Ctrl + Shift + F` (Global search)
2. Enter search term: `@codesyncer-todo`
3. File filter: `src/**/*.{ts,tsx,js,jsx}`

---

## 📊 Comment Statistics

ARCHITECTURE.md automatically provides statistics:

```markdown
## Comment Tag Statistics
- @codesyncer-inference: 45
- @codesyncer-decision: 12
- @codesyncer-todo: 8
- @codesyncer-rule: 5
- @codesyncer-context: 15
```

Manual refresh with "update stats" command

---

## 💡 Comment Writing Tips

### 1. Always provide rationale for inferences

```tsx
// ❌ @codesyncer-inference: Using useState
// ✅ @codesyncer-inference: Using useState (simple local state, Zustand unnecessary)
```

### 2. Include date and reason for decisions

```tsx
// ❌ @codesyncer-decision: Using Stripe
// ✅ @codesyncer-decision: [2024-10-15] Using Stripe (international payment support needed)
```

### 3. Be specific with TODOs

```tsx
// ❌ @codesyncer-todo: Needs fix
// ✅ @codesyncer-todo: Add error boundary (fallback UI for API failures)
```

### 4. Focus on "why" for context

```tsx
// ❌ @codesyncer-context: Authentication
// ✅ @codesyncer-context: OAuth 2.0 authentication (Google, Kakao login support)
```

### 5. Rules only for exceptional cases

```tsx
// ❌ @codesyncer-rule: Using TypeScript (this is obvious)
// ✅ @codesyncer-rule: This file only allows any type (external library has no types)
```

---

## 🎯 Checklist

After writing code, verify:

- [ ] Added `@codesyncer-inference` for inferences?
- [ ] Recorded discussion decisions with `@codesyncer-decision`?
- [ ] Marked items needing confirmation with `@codesyncer-todo`?
- [ ] Explained business logic with `@codesyncer-context`?
- [ ] Specified special rules with `@codesyncer-rule`?
- [ ] Included specific rationale in all comments?

---

**Version**: 1.0.0
**Last Updated**: [TODAY]

*This comment system permanently records all decisions in code.*
