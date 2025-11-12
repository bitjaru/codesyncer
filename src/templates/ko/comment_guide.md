# 주석 작성 가이드

> **CodeSyncer 주석 시스템** - 모든 추론과 결정을 영구 기록

---

## 📋 주석 태그 레퍼런스

### 5가지 필수 태그

| 태그 | 용도 | 사용 시점 | 중요도 |
|------|------|-----------|--------|
| `@codesyncer-rule` | 특별 규칙 | 일반적이지 않은 구현 방식 | ⭐⭐⭐ |
| `@codesyncer-inference` | 추론 내용 | AI가 추론한 내용과 근거 | ⭐⭐⭐⭐⭐ |
| `@codesyncer-decision` | 결정 사항 | 의논 후 결정된 내용 | ⭐⭐⭐⭐⭐ |
| `@codesyncer-todo` | TODO | 사용자 확인 필요 | ⭐⭐⭐⭐ |
| `@codesyncer-context` | 비즈니스 맥락 | 도메인 지식, 배경 설명 | ⭐⭐⭐ |

### 레거시 호환

기존 `@claude-*` 태그도 완전히 호환됩니다:
```typescript
@claude-rule        = @codesyncer-rule
@claude-inference   = @codesyncer-inference
@claude-decision    = @codesyncer-decision
@claude-todo        = @codesyncer-todo
@claude-context     = @codesyncer-context
```

---

## 📝 주석 레벨

### 1. 📄 파일 레벨 (JSDoc)

**언제**: 파일 최상단, 모듈 전체 설명

```typescript
/**
 * User authentication service
 *
 * @codesyncer-context JWT 기반 인증 시스템
 * @codesyncer-rule 토큰은 httpOnly 쿠키에 저장 (XSS 방지)
 * @author CodeSyncer
 * @date 2024-10-17
 */
```

### 2. 🔧 함수/클래스/컴포넌트 레벨

**언제**: 각 함수, 클래스, 컴포넌트 정의 위

```tsx
/**
 * 주문 생성 폼
 *
 * @codesyncer-context 6단계 주문 프로세스
 * @codesyncer-inference 각 단계마다 자동 저장 (일반적인 UX 패턴)
 * @codesyncer-decision [2024-10-15] Zustand로 상태 관리 (복잡한 폼 상태)
 */
export default function OrderForm() {
  // ...
}
```

### 3. 📝 인라인 레벨

**언제**: 코드 라인 위 또는 옆

```typescript
// @codesyncer-inference: 페이지 크기 20 (일반적인 테이블 UX)
const PAGE_SIZE = 20;

// @codesyncer-todo: mainApi 엔드포인트 URL 확인 필요
const API_URL = '/api/temp';

// @codesyncer-decision: [2024-10-17] Soft Delete (30일 복구 가능)
async function deleteUser(id: string) {
  // @codesyncer-inference: deleted_at 플래그 사용 (복구 기능용)
  return db.update(id, { deleted_at: new Date() });
}

const maxRetry = 3; // @codesyncer-inference: 3회 재시도 (안정성)
```

---

## ✅ 좋은 주석 예시

### 예시 1: 비즈니스 로직

```tsx
/**
 * 배송비 계산 함수
 *
 * @codesyncer-context 배송비 정책
 * - 3만원 이상: 무료 배송
 * - 3만원 미만: 3,000원
 * - 제주/도서산간: +3,000원
 *
 * @codesyncer-decision [2024-10-10] 정책 확정 (마케팅팀 협의)
 * @codesyncer-rule 정책 변경 시 반드시 마케팅팀 승인 필요
 */
function calculateShippingFee(orderAmount: number, region: string): number {
  // @codesyncer-inference: 3만원 기준 (업계 표준)
  const FREE_SHIPPING_THRESHOLD = 30000;

  // @codesyncer-decision: [2024-10-10] 기본 배송비 3,000원
  const BASIC_FEE = 3000;

  // @codesyncer-todo: 제주/도서산간 지역 목록 확인 필요
  const EXTRA_FEE_REGIONS = ['제주', '울릉도'];

  if (orderAmount >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  const baseFee = BASIC_FEE;
  const extraFee = EXTRA_FEE_REGIONS.includes(region) ? 3000 : 0;

  return baseFee + extraFee;
}
```

### 예시 2: 데이터 구조

```tsx
/**
 * 사용자 인터페이스
 *
 * @codesyncer-context GDPR 준수 필요
 * @codesyncer-rule 개인정보는 암호화 저장
 */
interface User {
  id: string;

  // @codesyncer-inference: email을 username으로 사용 (일반적 패턴)
  email: string;

  // @codesyncer-decision: [2024-10-12] bcrypt 해싱 (보안팀 권고)
  passwordHash: string;

  // @codesyncer-context: Soft Delete용
  // @codesyncer-decision: [2024-10-15] 30일 후 완전 삭제 (GDPR)
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

### 예시 3: 컴포넌트

```tsx
/**
 * 주문 목록 테이블 컴포넌트
 *
 * @codesyncer-context 고객용 주문 내역 조회
 * @codesyncer-inference 페이지네이션 필요 (대량 데이터)
 * @codesyncer-decision [2024-10-16] TanStack Table 사용 (성능)
 */
export function OrderListTable({ orders }: OrderListTableProps) {
  // @codesyncer-inference: 페이지당 20개 (UX 표준)
  const [pageSize, setPageSize] = useState(20);

  // @codesyncer-todo: 정렬 옵션 추가 (날짜, 금액, 상태)

  return (
    <Table>
      {/* @codesyncer-rule: 모바일에서는 카드 레이아웃으로 변경 */}
      {/* ... */}
    </Table>
  );
}
```

---

## ❌ 나쁜 주석 예시

### 피해야 할 주석들

```tsx
// ❌ 너무 모호함
// @codesyncer-inference: 이렇게 했음
const value = 10;

// ❌ 근거 없음
// @codesyncer-decision: 변경함
const API_URL = '/api/new';

// ❌ 의미 없음
// @codesyncer-todo: 나중에
function doSomething() {}

// ❌ 맥락 부족
// @codesyncer-context: 중요함
const IMPORTANT_VALUE = 42;
```

### 개선된 버전

```tsx
// ✅ 구체적인 근거
// @codesyncer-inference: 기본값 10 (일반적인 재시도 대기 시간)
const RETRY_DELAY = 10;

// ✅ 명확한 이유와 날짜
// @codesyncer-decision: [2024-10-17] /api/v2로 변경 (API 버전업)
const API_URL = '/api/v2';

// ✅ 구체적인 TODO
// @codesyncer-todo: 에러 케이스 핸들링 추가 (네트워크 오류, 타임아웃)
function fetchData() {}

// ✅ 비즈니스 맥락 설명
// @codesyncer-context: VAT 세율 (2024년 기준 10%)
const TAX_RATE = 0.1;
```

---

## 🔍 주석 검색

### Bash 명령어

```bash
# 모든 추론 내용 찾기
grep -r "@codesyncer-inference" ./src

# TODO 목록 확인
grep -r "@codesyncer-todo" ./src

# 의논 결정 사항
grep -r "@codesyncer-decision" ./src

# 특별 규칙
grep -r "@codesyncer-rule" ./src

# 비즈니스 맥락
grep -r "@codesyncer-context" ./src
```

### VS Code 검색

1. `Cmd/Ctrl + Shift + F` (전체 검색)
2. 검색어 입력: `@codesyncer-todo`
3. 파일 필터: `src/**/*.{ts,tsx,js,jsx}`

---

## 📊 주석 통계

ARCHITECTURE.md에서 자동으로 통계를 제공합니다:

```markdown
## 주석 태그 통계
- @codesyncer-inference: 45개
- @codesyncer-decision: 12개
- @codesyncer-todo: 8개
- @codesyncer-rule: 5개
- @codesyncer-context: 15개
```

"통계 업데이트" 명령으로 수동 갱신 가능

---

## 💡 주석 작성 팁

### 1. 추론은 항상 근거와 함께

```tsx
// ❌ @codesyncer-inference: useState 사용
// ✅ @codesyncer-inference: useState 사용 (간단한 로컬 상태, Zustand 불필요)
```

### 2. 결정은 날짜와 이유

```tsx
// ❌ @codesyncer-decision: Stripe 사용
// ✅ @codesyncer-decision: [2024-10-15] Stripe 사용 (해외 결제 지원 필요)
```

### 3. TODO는 구체적으로

```tsx
// ❌ @codesyncer-todo: 수정 필요
// ✅ @codesyncer-todo: 에러 바운더리 추가 (API 실패 시 폴백 UI)
```

### 4. 맥락은 "왜"에 집중

```tsx
// ❌ @codesyncer-context: 인증
// ✅ @codesyncer-context: OAuth 2.0 인증 (Google, Kakao 로그인 지원)
```

### 5. 규칙은 예외적인 경우만

```tsx
// ❌ @codesyncer-rule: TypeScript 사용 (이건 당연함)
// ✅ @codesyncer-rule: 이 파일만 any 타입 허용 (외부 라이브러리 타입 없음)
```

---

## 🎯 체크리스트

코드 작성 후 확인:

- [ ] 추론한 내용에 `@codesyncer-inference` 추가했나?
- [ ] 의논 결정은 `@codesyncer-decision`으로 기록했나?
- [ ] 확인 필요한 부분은 `@codesyncer-todo`로 표시했나?
- [ ] 비즈니스 로직에 `@codesyncer-context` 설명했나?
- [ ] 특별한 규칙은 `@codesyncer-rule`로 명시했나?
- [ ] 모든 주석에 구체적인 근거를 포함했나?

---

**버전**: 1.0.0
**마지막 업데이트**: [TODAY]

*이 주석 시스템으로 모든 의사결정이 코드에 영구 기록됩니다.*
