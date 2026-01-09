# 주석 작성 가이드

> **주석으로 모든 컨텍스트 관리** - 코드가 곧 문서

---

## 🎯 핵심 원칙

**모든 결정과 맥락은 코드에 직접 기록합니다.**

- ❌ 별도 문서에 품질 기준 작성 → AI가 읽지 못함
- ✅ 코드 주석으로 품질 기준 설명 → 영구 보존

---

## 📋 주석 태그 시스템 (10가지)

### 기본 태그 (5가지)

| 태그 | 용도 | 필수 정보 |
|------|------|----------|
| `@codesyncer-inference` | 추론 + 근거 | "무엇" + "왜" |
| `@codesyncer-decision` | 결정 사항 | [날짜] + 이유 |
| `@codesyncer-todo` | 확인 필요 | 구체적인 작업 |
| `@codesyncer-context` | 비즈니스 맥락 | 도메인 지식 |
| `@codesyncer-rule` | 특별 규칙 | 예외 사항 |

### 확장 태그 (5가지) - 컨텍스트 완전 보존

| 태그 | 용도 | 언제 사용 |
|------|------|----------|
| `@codesyncer-why` | 이유 상세 설명 | 코드만으로 이해 어려울 때 |
| `@codesyncer-tradeoff` | 장단점 | 선택의 trade-off 있을 때 |
| `@codesyncer-alternative` | 대안들 | 다른 방법 고려했을 때 |
| `@codesyncer-pattern` | 패턴명 | 재사용 가능한 패턴 |
| `@codesyncer-reference` | 참조 링크 | 외부 문서/이슈 참조 |

### 레거시 호환

```typescript
@claude-* = @codesyncer-*  // 기존 태그도 완전 호환
```

---

## 💡 실전 예시: 모든 컨텍스트를 주석으로

### 1️⃣ 품질 기준을 주석으로 관리

```typescript
/**
 * 결제 처리 서비스
 *
 * @codesyncer-context 실시간 카드 결제 처리 (PG사: Stripe)
 * @codesyncer-rule 모든 금액은 정수로 처리 (소수점 오류 방지)
 * @codesyncer-pattern Transaction Script (단순 결제는 도메인 모델 불필요)
 *
 * 품질 기준:
 * - 타임아웃: 30초 (PG사 권장)
 * - 재시도: 3회 (멱등성 보장 필수)
 * - 로깅: 모든 결제 시도 기록
 * - 에러 처리: 사용자 친화적 메시지
 */
export class PaymentService {
  /**
   * 결제 실행
   *
   * @codesyncer-why 동기 처리로 구현 (결제 완료 즉시 확인 필요)
   * @codesyncer-tradeoff 동기: 빠른 피드백 | 비동기: 높은 처리량
   * @codesyncer-decision [2024-11-12] 동기 방식 선택 (UX 우선)
   */
  async processPayment(
    amount: number,
    cardToken: string
  ): Promise<PaymentResult> {
    // @codesyncer-inference: 최소 금액 100원 (PG사 정책)
    if (amount < 100) {
      throw new ValidationError('최소 결제 금액은 100원입니다');
    }

    // @codesyncer-why: 멱등성 키 생성 (중복 결제 방지)
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
    // ... 구현
  }
}
```

### 2️⃣ 복잡한 비즈니스 로직 설명

```typescript
/**
 * 할인 계산기
 *
 * @codesyncer-context 복합 할인 정책 (중복 적용 가능)
 * - 회원 등급 할인: 5-15%
 * - 쿠폰 할인: 고정 금액 또는 비율
 * - 프로모션 할인: 특정 조건 충족 시
 *
 * @codesyncer-decision [2024-11-10] 할인 순서 고정 (마케팅팀 합의)
 * 1. 회원 등급 할인
 * 2. 쿠폰 할인
 * 3. 프로모션 할인
 *
 * @codesyncer-why 순서가 중요함 (최종 금액이 달라짐)
 * @codesyncer-alternative 할인율 합산 후 적용 → 거부됨 (복잡한 케이스 처리 어려움)
 */
function calculateFinalPrice(
  basePrice: number,
  user: User,
  coupon?: Coupon,
  promotion?: Promotion
): number {
  // @codesyncer-context: 모든 중간 계산 저장 (환불 시 추적용)
  const breakdown: PriceBreakdown = {
    basePrice,
    discounts: []
  };

  let currentPrice = basePrice;

  // Step 1: 회원 등급 할인
  // @codesyncer-inference: GOLD 15%, SILVER 10%, BRONZE 5% (일반적 패턴)
  const memberDiscount = this.calculateMemberDiscount(user.tier);
  if (memberDiscount > 0) {
    currentPrice -= memberDiscount;
    breakdown.discounts.push({
      type: 'MEMBER',
      amount: memberDiscount
    });
  }

  // Step 2: 쿠폰 할인
  // @codesyncer-rule: 쿠폰은 할인된 금액에 적용 (중요!)
  if (coupon) {
    const couponDiscount = this.applyCoupon(currentPrice, coupon);
    currentPrice -= couponDiscount;
    breakdown.discounts.push({
      type: 'COUPON',
      amount: couponDiscount,
      couponId: coupon.id
    });
  }

  // Step 3: 프로모션 할인
  // @codesyncer-todo: 프로모션 중복 적용 정책 확인 필요
  if (promotion) {
    const promoDiscount = this.applyPromotion(currentPrice, promotion);
    currentPrice -= promoDiscount;
    breakdown.discounts.push({
      type: 'PROMOTION',
      amount: promoDiscount,
      promotionId: promotion.id
    });
  }

  // @codesyncer-rule: 최종 금액은 0 이상이어야 함
  return Math.max(0, currentPrice);
}
```

### 3️⃣ 성능 최적화 기록

```typescript
/**
 * 주문 목록 조회 API
 *
 * @codesyncer-context 주문이 많은 사용자는 10만 건 이상 (성능 이슈)
 * @codesyncer-decision [2024-11-12] 페이지네이션 + 인덱스 + 캐싱
 *
 * 성능 목표:
 * - 응답 시간: < 500ms (P95)
 * - 동시 접속: 1000 TPS
 * - 캐시 히트율: > 80%
 */
export class OrderController {
  /**
   * @codesyncer-pattern Cursor-based Pagination
   * @codesyncer-why Offset 페이징은 뒤로 갈수록 느려짐 (OFFSET 10000)
   * @codesyncer-tradeoff Cursor: 빠름 | Offset: 페이지 번호 표시 가능
   * @codesyncer-alternative Offset 페이징 → 테스트 결과 P95 3초 (거부)
   * @codesyncer-reference https://use-the-index-luke.com/no-offset
   */
  async getOrders(userId: string, cursor?: string, limit = 20) {
    // @codesyncer-inference: Redis 캐싱 5분 (실시간성 vs 성능)
    const cacheKey = `orders:${userId}:${cursor}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // @codesyncer-pattern: Index Hint
    // @codesyncer-why userId + createdAt 복합 인덱스 사용 강제
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

    // @codesyncer-inference: 5분 TTL (주문은 자주 변경되지 않음)
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }
}
```

### 4️⃣ 보안 요구사항 명시

```typescript
/**
 * 사용자 인증 미들웨어
 *
 * @codesyncer-context 금융 서비스 (보안 최우선)
 * @codesyncer-rule OWASP Top 10 준수 필수
 *
 * 보안 체크리스트:
 * ✅ SQL Injection 방지 (Prepared Statement)
 * ✅ XSS 방지 (CSP 헤더)
 * ✅ CSRF 방지 (토큰 검증)
 * ✅ Rate Limiting (분당 100 요청)
 * ✅ 민감 정보 로깅 금지
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // @codesyncer-rule: 토큰은 httpOnly 쿠키에서만 (XSS 방지)
    const token = req.cookies.access_token;

    if (!token) {
      // @codesyncer-why: 401 vs 403 구분 (보안 best practice)
      // 401: 인증 안됨 | 403: 권한 없음
      return res.status(401).json({ error: 'Authentication required' });
    }

    // @codesyncer-decision [2024-11-12] JWT 대신 세션 사용 (더 안전)
    // @codesyncer-tradeoff JWT: Stateless | Session: Revoke 가능
    const session = await sessionStore.get(token);

    if (!session) {
      // @codesyncer-why: 에러 메시지 최소화 (공격자에게 정보 제공 최소화)
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
    // @codesyncer-rule: 민감 정보 로깅 금지
    logger.error('Authentication error', {
      // ❌ token, password, email 등 민감 정보 절대 금지
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 5️⃣ 에러 핸들링 전략

```typescript
/**
 * 외부 API 호출 래퍼
 *
 * @codesyncer-context 외부 서비스 불안정 (SLA 95%)
 * @codesyncer-pattern Circuit Breaker + Retry + Timeout
 * @codesyncer-reference Netflix Hystrix pattern
 *
 * 에러 처리 전략:
 * - Timeout: 30초
 * - Retry: 3회 (Exponential Backoff)
 * - Circuit Breaker: 5번 실패 시 open
 * - Fallback: 캐시된 데이터 반환
 */
export class ExternalApiClient {
  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000
  });

  /**
   * @codesyncer-why 모든 에러를 한 곳에서 처리 (일관성)
   * @codesyncer-alternative 각 호출마다 try-catch → 코드 중복 심함
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
      // @codesyncer-inference: 30초 타임아웃 (외부 API 권장값)
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

      // @codesyncer-why: 예상치 못한 에러는 전파 (상위에서 처리)
      throw error;
    }
  }

  /**
   * @codesyncer-pattern: Fallback with Stale Cache
   * @codesyncer-why 오래된 데이터라도 없는 것보다 낫다
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

### 6️⃣ 테스트 전략 문서화

```typescript
/**
 * 결제 서비스 테스트
 *
 * @codesyncer-context 결제는 critical path (버그 허용 불가)
 *
 * 테스트 전략:
 * - Unit: 모든 public 메서드
 * - Integration: PG사 API 호출 (Mock)
 * - E2E: 실제 결제 플로우 (Staging)
 * - 커버리지 목표: 95% 이상
 *
 * @codesyncer-rule 결제 로직 수정 시 QA 필수 승인
 */
describe('PaymentService', () => {
  describe('processPayment', () => {
    /**
     * @codesyncer-pattern: AAA (Arrange-Act-Assert)
     * @codesyncer-why 테스트 가독성과 유지보수성
     */
    it('should process payment successfully', async () => {
      // Arrange: 테스트 데이터 준비
      const service = new PaymentService();
      const amount = 10000;
      const cardToken = 'tok_test_1234';

      // @codesyncer-inference: PG사 API는 Mock (실제 과금 방지)
      const mockStripe = jest.spyOn(stripe, 'charge')
        .mockResolvedValue({ id: 'ch_1234', status: 'succeeded' });

      // Act: 실제 실행
      const result = await service.processPayment(amount, cardToken);

      // Assert: 결과 검증
      expect(result.isSuccess).toBe(true);
      expect(result.data.status).toBe('succeeded');

      // @codesyncer-why: 호출 파라미터 검증 (올바른 값 전달 확인)
      expect(mockStripe).toHaveBeenCalledWith({
        amount,
        source: cardToken,
        idempotencyKey: expect.any(String)
      });
    });

    /**
     * @codesyncer-pattern: Edge Case Testing
     * @codesyncer-why 경계 조건에서 버그 많이 발생
     */
    it('should reject payment below minimum amount', async () => {
      const service = new PaymentService();

      // @codesyncer-context: 최소 금액 100원 (PG사 정책)
      await expect(
        service.processPayment(99, 'tok_test')
      ).rejects.toThrow('최소 결제 금액은 100원입니다');
    });
  });
});
```

---

## 🎯 주석 작성 원칙

### ✅ DO (해야 할 것)

```typescript
// ✅ 구체적인 이유와 근거
// @codesyncer-inference: 페이지 크기 20 (사용자 연구 결과, 스크롤 3번 이내)
const PAGE_SIZE = 20;

// ✅ 날짜와 맥락
// @codesyncer-decision: [2024-11-12] PostgreSQL 선택 (복잡한 쿼리 + ACID 필요)

// ✅ Trade-off 명시
// @codesyncer-tradeoff: 캐싱으로 성능 50% 개선, 메모리 사용 20% 증가

// ✅ 대안 기록
// @codesyncer-alternative: MongoDB 검토 → JSON 스키마 변경 빈번해 거부

// ✅ 패턴 명시 (재사용)
// @codesyncer-pattern: Repository Pattern (데이터 접근 추상화)
```

### ❌ DON'T (하지 말 것)

```typescript
// ❌ 너무 모호
// @codesyncer-inference: 이렇게 함
const value = 10;

// ❌ 코드 그대로 반복
// @codesyncer-context: 사용자 생성 // 코드 보면 알 수 있음
function createUser() {}

// ❌ 근거 없음
// @codesyncer-decision: 변경함
const API_URL = '/new';
```

---

## 🔍 주석 검색

### 프로젝트 전체 검색

```bash
# 모든 추론 찾기
grep -r "@codesyncer-inference" ./src

# 확인 필요한 TODO
grep -r "@codesyncer-todo" ./src

# 의논 후 결정 사항
grep -r "@codesyncer-decision" ./src

# 패턴 찾기 (재사용)
grep -r "@codesyncer-pattern" ./src

# 특정 패턴 찾기
grep -r "@codesyncer-pattern.*Retry" ./src
```

### VS Code 검색

```
Cmd/Ctrl + Shift + F
→ @codesyncer-todo
→ src/**/*.{ts,tsx,js,jsx}
```

---

## 📊 주석 통계

ARCHITECTURE.md에 자동 집계:

```markdown
## 주석 태그 통계
- @codesyncer-inference: 45개
- @codesyncer-decision: 12개
- @codesyncer-pattern: 8개
- @codesyncer-todo: 3개
```

명령어: `"통계 업데이트"`

---

## 💡 주석이 문서를 대체하는 이유

### 기존 방식의 문제
```
❌ 별도 문서 작성
   → AI가 읽지 못함
   → 코드와 문서 불일치
   → 문서 업데이트 안됨

❌ 긴 가이드 문서
   → AI context 초과
   → 실제로 적용 안됨
   → 까먹음
```

### 주석 기반의 장점
```
✅ 코드에 직접 기록
   → 영구 보존
   → Git으로 버전 관리
   → 코드와 항상 일치

✅ 필요한 곳에만
   → Context 효율적
   → 검색 가능
   → AI가 실제 참고
```

---

## 🎯 체크리스트

코드 작성 후:

- [ ] 모든 추론에 `@codesyncer-inference` + 근거
- [ ] 결정 사항에 `@codesyncer-decision` + [날짜] + 이유
- [ ] Trade-off 있으면 `@codesyncer-tradeoff` 명시
- [ ] 재사용 패턴에 `@codesyncer-pattern` 표시
- [ ] 확인 필요한 부분 `@codesyncer-todo`
- [ ] 복잡한 로직에 `@codesyncer-why` 설명

---

**버전**: 2.0.0
**마지막 업데이트**: 2026-01-09

*주석이 곧 문서입니다. 모든 컨텍스트를 코드에 기록하세요.*
