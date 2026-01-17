# Comment Writing Guide

> **Manage All Context with Comments** - Code is the documentation

---

## 🎯 Core Principle

**Record all decisions and context directly in code.**

- ❌ Write quality standards in separate docs → AI can't read
- ✅ Explain quality standards in code comments → Permanent record

---

## 📋 Comment Tag System (10 Tags)

### Basic Tags (5)

| Tag | Purpose | Required Info |
|-----|---------|--------------|
| `@codesyncer-inference` | Inference + rationale | "What" + "Why" |
| `@codesyncer-decision` | Decision made | [Date] + reason |
| `@codesyncer-todo` | Needs confirmation | Specific task |
| `@codesyncer-context` | Business context | Domain knowledge |
| `@codesyncer-rule` | Special rule | Exception case |

### Extended Tags (5) - Complete Context Preservation

| Tag | Purpose | When to Use |
|-----|---------|-------------|
| `@codesyncer-why` | Detailed explanation | When code alone isn't clear |
| `@codesyncer-tradeoff` | Pros and cons | When there are trade-offs |
| `@codesyncer-alternative` | Other options | When alternatives considered |
| `@codesyncer-pattern` | Pattern name | Reusable pattern |
| `@codesyncer-reference` | Reference link | External docs/issues |

### Legacy Compatibility

```typescript
@claude-* = @codesyncer-*  // Legacy tags fully compatible
```

---

## 💡 Real Examples: All Context in Comments

### 1️⃣ Quality Standards in Comments

```typescript
/**
 * Payment processing service
 *
 * @codesyncer-context Real-time card payment (PG: Stripe)
 * @codesyncer-rule All amounts as integers (avoid decimal errors)
 * @codesyncer-pattern Transaction Script (simple payments don't need domain model)
 *
 * Quality standards:
 * - Timeout: 30s (PG recommendation)
 * - Retry: 3 times (idempotency required)
 * - Logging: Record all payment attempts
 * - Error handling: User-friendly messages
 */
export class PaymentService {
  /**
   * Process payment
   *
   * @codesyncer-why Synchronous implementation (need immediate confirmation)
   * @codesyncer-tradeoff Sync: Fast feedback | Async: Higher throughput
   * @codesyncer-decision [2024-11-12] Chose sync (UX priority)
   */
  async processPayment(
    amount: number,
    cardToken: string
  ): Promise<PaymentResult> {
    // @codesyncer-inference: Minimum 100 (PG policy)
    if (amount < 100) {
      throw new ValidationError('Minimum payment is 100');
    }

    // @codesyncer-why: Generate idempotency key (prevent duplicate charges)
    const idempotencyKey = this.generateIdempotencyKey(amount, cardToken);

    // @codesyncer-pattern: Retry with Exponential Backoff
    return await this.retryWithBackoff(async () => {
      return await stripe.charge({
        amount,
        source: cardToken,
        idempotencyKey
      });
    }, {
      maxRetries: 3,
      initialDelay: 1000
    });
  }

  /**
   * @codesyncer-pattern Exponential Backoff
   * @codesyncer-reference https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    // ... implementation
  }
}
```

### 2️⃣ Complex Business Logic Explanation

```typescript
/**
 * Discount calculator
 *
 * @codesyncer-context Compound discount policy (stackable)
 * - Member tier discount: 5-15%
 * - Coupon discount: Fixed amount or percentage
 * - Promotion discount: Conditional
 *
 * @codesyncer-decision [2024-11-10] Fixed discount order (marketing agreement)
 * 1. Member tier discount
 * 2. Coupon discount
 * 3. Promotion discount
 *
 * @codesyncer-why Order matters (final amount differs)
 * @codesyncer-alternative Sum discounts then apply → Rejected (complex cases)
 */
function calculateFinalPrice(
  basePrice: number,
  user: User,
  coupon?: Coupon,
  promotion?: Promotion
): number {
  // @codesyncer-context: Save all intermediate calculations (refund tracking)
  const breakdown: PriceBreakdown = {
    basePrice,
    discounts: []
  };

  let currentPrice = basePrice;

  // Step 1: Member tier discount
  // @codesyncer-inference: GOLD 15%, SILVER 10%, BRONZE 5% (common pattern)
  const memberDiscount = this.calculateMemberDiscount(user.tier);
  if (memberDiscount > 0) {
    currentPrice -= memberDiscount;
    breakdown.discounts.push({
      type: 'MEMBER',
      amount: memberDiscount
    });
  }

  // Step 2: Coupon discount
  // @codesyncer-rule: Apply coupon to discounted price (important!)
  if (coupon) {
    const couponDiscount = this.applyCoupon(currentPrice, coupon);
    currentPrice -= couponDiscount;
    breakdown.discounts.push({
      type: 'COUPON',
      amount: couponDiscount,
      couponId: coupon.id
    });
  }

  // Step 3: Promotion discount
  // @codesyncer-todo: Confirm promotion stacking policy
  if (promotion) {
    const promoDiscount = this.applyPromotion(currentPrice, promotion);
    currentPrice -= promoDiscount;
    breakdown.discounts.push({
      type: 'PROMOTION',
      amount: promoDiscount,
      promotionId: promotion.id
    });
  }

  // @codesyncer-rule: Final amount must be non-negative
  return Math.max(0, currentPrice);
}
```

### 3️⃣ Performance Optimization Record

```typescript
/**
 * Order list API
 *
 * @codesyncer-context Heavy users have 100k+ orders (performance issue)
 * @codesyncer-decision [2024-11-12] Pagination + Index + Caching
 *
 * Performance goals:
 * - Response time: < 500ms (P95)
 * - Concurrent users: 1000 TPS
 * - Cache hit rate: > 80%
 */
export class OrderController {
  /**
   * @codesyncer-pattern Cursor-based Pagination
   * @codesyncer-why Offset pagination gets slower with depth (OFFSET 10000)
   * @codesyncer-tradeoff Cursor: Fast | Offset: Page numbers
   * @codesyncer-alternative Offset pagination → Test showed P95 3s (rejected)
   * @codesyncer-reference https://use-the-index-luke.com/no-offset
   */
  async getOrders(userId: string, cursor?: string, limit = 20) {
    // @codesyncer-inference: Redis cache 5min (real-time vs performance)
    const cacheKey = `orders:${userId}:${cursor}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // @codesyncer-pattern: Index Hint
    // @codesyncer-why Force use of userId + createdAt compound index
    const orders = await db.query(`
      SELECT /*+ INDEX(orders idx_user_created) */
        id, total, status, created_at
      FROM orders
      WHERE user_id = ?
        ${cursor ? 'AND created_at < ?' : ''}
      ORDER BY created_at DESC
      LIMIT ?
    `, cursor ? [userId, cursor, limit] : [userId, limit]);

    const result = {
      data: orders,
      nextCursor: orders.length === limit
        ? orders[orders.length - 1].created_at
        : null
    };

    // @codesyncer-inference: 5min TTL (orders rarely change)
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }
}
```

### 4️⃣ Security Requirements

```typescript
/**
 * Authentication middleware
 *
 * @codesyncer-context Financial service (security first)
 * @codesyncer-rule OWASP Top 10 compliance required
 *
 * Security checklist:
 * ✅ SQL Injection prevention (Prepared statements)
 * ✅ XSS prevention (CSP headers)
 * ✅ CSRF prevention (Token validation)
 * ✅ Rate limiting (100 req/min)
 * ✅ No sensitive info in logs
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // @codesyncer-rule: Token from httpOnly cookie only (XSS prevention)
    const token = req.cookies.access_token;

    if (!token) {
      // @codesyncer-why: 401 vs 403 distinction (security best practice)
      // 401: Not authenticated | 403: Not authorized
      return res.status(401).json({ error: 'Authentication required' });
    }

    // @codesyncer-decision [2024-11-12] Session over JWT (more secure)
    // @codesyncer-tradeoff JWT: Stateless | Session: Revocable
    const session = await sessionStore.get(token);

    if (!session) {
      // @codesyncer-why: Minimal error messages (reduce info leakage)
      return res.status(401).json({ error: 'Invalid token' });
    }

    // @codesyncer-pattern: Session Rotation
    // @codesyncer-reference: OWASP Session Management Cheat Sheet
    if (session.shouldRotate()) {
      const newToken = await sessionStore.rotate(session.id);
      res.cookie('access_token', newToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });
    }

    req.user = session.user;
    next();

  } catch (error) {
    // @codesyncer-rule: Never log sensitive information
    logger.error('Authentication error', {
      // ❌ Never: token, password, email
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 5️⃣ Error Handling Strategy

```typescript
/**
 * External API wrapper
 *
 * @codesyncer-context External service unstable (95% SLA)
 * @codesyncer-pattern Circuit Breaker + Retry + Timeout
 * @codesyncer-reference Netflix Hystrix pattern
 *
 * Error handling strategy:
 * - Timeout: 30s
 * - Retry: 3 times (Exponential Backoff)
 * - Circuit Breaker: Open after 5 failures
 * - Fallback: Return cached data
 */
export class ExternalApiClient {
  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000
  });

  /**
   * @codesyncer-why Handle all errors in one place (consistency)
   * @codesyncer-alternative Try-catch per call → Too much duplication
   */
  async call<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<Result<T>> {
    // @codesyncer-pattern: Circuit Breaker
    if (this.circuitBreaker.isOpen()) {
      logger.warn('Circuit breaker is open', { endpoint });
      return this.getFallback<T>(endpoint);
    }

    try {
      // @codesyncer-inference: 30s timeout (external API recommendation)
      const response = await this.retryWithTimeout(
        () => fetch(endpoint, options),
        { timeout: 30000, maxRetries: 3 }
      );

      this.circuitBreaker.recordSuccess();
      return Result.ok(response.data);

    } catch (error) {
      this.circuitBreaker.recordFailure();

      // @codesyncer-pattern: Error Classification
      if (error instanceof TimeoutError) {
        logger.warn('API timeout', { endpoint, duration: error.duration });
        return this.getFallback<T>(endpoint);
      }

      if (error instanceof NetworkError) {
        logger.error('Network error', { endpoint, error });
        return this.getFallback<T>(endpoint);
      }

      // @codesyncer-why: Propagate unexpected errors (handle upstream)
      throw error;
    }
  }

  /**
   * @codesyncer-pattern: Fallback with Stale Cache
   * @codesyncer-why Stale data better than no data
   */
  private async getFallback<T>(endpoint: string): Promise<Result<T>> {
    const staleData = await cache.getStale<T>(endpoint);
    if (staleData) {
      logger.info('Returning stale cache', { endpoint });
      return Result.ok(staleData, { isStale: true });
    }

    return Result.error('Service unavailable');
  }
}
```

### 6️⃣ Test Strategy Documentation

```typescript
/**
 * Payment service tests
 *
 * @codesyncer-context Payment is critical path (zero bugs tolerated)
 *
 * Test strategy:
 * - Unit: All public methods
 * - Integration: PG API calls (Mocked)
 * - E2E: Full payment flow (Staging)
 * - Coverage goal: 95%+
 *
 * @codesyncer-rule Payment changes require QA approval
 */
describe('PaymentService', () => {
  describe('processPayment', () => {
    /**
     * @codesyncer-pattern: AAA (Arrange-Act-Assert)
     * @codesyncer-why Test readability and maintainability
     */
    it('should process payment successfully', async () => {
      // Arrange: Setup test data
      const service = new PaymentService();
      const amount = 10000;
      const cardToken = 'tok_test_1234';

      // @codesyncer-inference: Mock PG API (prevent actual charges)
      const mockStripe = jest.spyOn(stripe, 'charge')
        .mockResolvedValue({ id: 'ch_1234', status: 'succeeded' });

      // Act: Execute
      const result = await service.processPayment(amount, cardToken);

      // Assert: Verify
      expect(result.isSuccess).toBe(true);
      expect(result.data.status).toBe('succeeded');

      // @codesyncer-why: Verify call parameters (ensure correct values)
      expect(mockStripe).toHaveBeenCalledWith({
        amount,
        source: cardToken,
        idempotencyKey: expect.any(String)
      });
    });

    /**
     * @codesyncer-pattern: Edge Case Testing
     * @codesyncer-why Bugs often occur at boundaries
     */
    it('should reject payment below minimum amount', async () => {
      const service = new PaymentService();

      // @codesyncer-context: Minimum 100 (PG policy)
      await expect(
        service.processPayment(99, 'tok_test')
      ).rejects.toThrow('Minimum payment is 100');
    });
  });
});
```

---

## 🎯 Comment Writing Principles

### ✅ DO (Best Practices)

```typescript
// ✅ Specific reason and rationale
// @codesyncer-inference: Page size 20 (user research, <3 scrolls)
const PAGE_SIZE = 20;

// ✅ Date and context
// @codesyncer-decision: [2024-11-12] PostgreSQL (complex queries + ACID)

// ✅ Trade-offs explicit
// @codesyncer-tradeoff: Caching +50% perf, +20% memory

// ✅ Record alternatives
// @codesyncer-alternative: MongoDB → Rejected (schema changes frequent)

// ✅ Pattern name (reusable)
// @codesyncer-pattern: Repository Pattern (data access abstraction)
```

### ❌ DON'T (Anti-patterns)

```typescript
// ❌ Too vague
// @codesyncer-inference: Did this
const value = 10;

// ❌ Repeats code
// @codesyncer-context: Create user // Code already says this
function createUser() {}

// ❌ No rationale
// @codesyncer-decision: Changed
const API_URL = '/new';
```

---

## 🔍 Comment Search

### Project-wide Search

```bash
# Find all inferences
grep -r "@codesyncer-inference" ./src

# Find TODOs
grep -r "@codesyncer-todo" ./src

# Find decisions
grep -r "@codesyncer-decision" ./src

# Find patterns (reuse)
grep -r "@codesyncer-pattern" ./src

# Find specific pattern
grep -r "@codesyncer-pattern.*Retry" ./src
```

### VS Code Search

```
Cmd/Ctrl + Shift + F
→ @codesyncer-todo
→ src/**/*.{ts,tsx,js,jsx}
```

---

## 📊 Comment Statistics

Auto-aggregated in ARCHITECTURE.md:

```markdown
## Comment Tag Statistics
- @codesyncer-inference: 45
- @codesyncer-decision: 12
- @codesyncer-pattern: 8
- @codesyncer-todo: 3
```

Command: `"update stats"`

---

## 💡 Why Comments Replace Documentation

### Problems with Separate Docs
```
❌ Separate documentation
   → AI can't read
   → Code and docs diverge
   → Docs never updated

❌ Long guide documents
   → Exceeds AI context
   → Not actually applied
   → Forgotten
```

### Benefits of Comment-based Approach
```
✅ Record directly in code
   → Permanent preservation
   → Git version control
   → Always in sync with code

✅ Only where needed
   → Context efficient
   → Searchable
   → AI actually references
```

---

## 🎯 Checklist

After writing code:

- [ ] All inferences have `@codesyncer-inference` + rationale
- [ ] Decisions have `@codesyncer-decision` + [date] + reason
- [ ] Trade-offs marked with `@codesyncer-tradeoff`
- [ ] Reusable patterns tagged `@codesyncer-pattern`
- [ ] Items needing confirmation have `@codesyncer-todo`
- [ ] Complex logic explained with `@codesyncer-why`

---

**Version**: 2.0.0
**Last Updated**: [TODAY]

*Comments are the documentation. Record all context in code.*

<!-- codesyncer-version: 3.1.1 -->
