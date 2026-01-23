# 태그 시스템 가이드

> 코드 안에 영구적인 맥락 저장

한국어 | [English](../TAGS.md)

---

## 핵심 아이디어

**AI는 코드를 읽습니다. 그러니 맥락을 코드 안에 넣으세요.**

```typescript
// @codesyncer-decision: [2024-01-15] JWT 선택 (세션 관리가 더 간단함)
// @codesyncer-inference: 페이지 크기 20 (일반적인 UX 패턴)
const authConfig = { /* ... */ };
```

다음 세션? Claude가 코드를 읽으면 **자동으로 모든 맥락이 복구됩니다**.

---

## 사용 가능한 태그

| 태그 | 용도 | 사용 시점 |
|-----|------|----------|
| `@codesyncer-inference` | AI가 추론한 내용 | AI가 가정을 할 때 |
| `@codesyncer-decision` | 의논 후 결정 | 사용자 확인 후 |
| `@codesyncer-rule` | 특별한 구현 규칙 | 비표준 패턴 |
| `@codesyncer-todo` | 사용자 확인 필요 | 불확실한 값 |
| `@codesyncer-context` | 비즈니스 맥락 | 도메인 지식 |

---

## 태그 예시

### @codesyncer-inference
```typescript
// @codesyncer-inference: 페이지 크기 20 (표준 UX 패턴)
const PAGE_SIZE = 20;

// @codesyncer-inference: 토큰에 localStorage 사용 (일반적 패턴)
const storage = localStorage;
```

### @codesyncer-decision
```typescript
// @codesyncer-decision: [2024-10-15] Stripe 사용 (해외 결제 지원)
const paymentProvider = 'stripe';

// @codesyncer-decision: [2024-10-17] Soft delete (30일 복구 가능)
async function deleteUser(id: string) {
  return db.update(id, { deleted_at: new Date() });
}
```

### @codesyncer-rule
```typescript
// @codesyncer-rule: any 타입 허용 (외부 라이브러리 타입 없음)
const externalData: any = getFromLegacyAPI();

// @codesyncer-rule: 토큰은 httpOnly 쿠키에 저장 (XSS 방지)
res.cookie('token', jwt, { httpOnly: true });
```

### @codesyncer-todo
```typescript
// @codesyncer-todo: API 엔드포인트 URL 백엔드팀 확인 필요
const API_URL = '/api/temp';

// @codesyncer-todo: 배송비 비즈니스팀 확인 필요
const SHIPPING_FEE = 3000;
```

### @codesyncer-context
```typescript
// @codesyncer-context: GDPR 준수 (30일 데이터 보관)
const RETENTION_DAYS = 30;

// @codesyncer-context: 한국 공휴일 캘린더가 배송일에 영향
const holidays = getKoreanHolidays();
```

---

## 주석 레벨

### 파일 레벨 (JSDoc)
```typescript
/**
 * 사용자 인증 서비스
 *
 * @codesyncer-context JWT 기반 인증 시스템
 * @codesyncer-rule 토큰은 httpOnly 쿠키에 저장 (XSS 방지)
 */
export class AuthService { }
```

### 함수 레벨
```typescript
/**
 * 주문 생성 폼 컴포넌트
 *
 * @codesyncer-inference 6단계 폼 흐름 (표준 체크아웃 패턴)
 * @codesyncer-decision [2024-10-15] 상태관리에 Zustand (복잡한 폼)
 */
export function OrderForm() { }
```

### 인라인 레벨
```typescript
const config = {
  timeout: 5000,  // @codesyncer-inference: 5초 타임아웃 (API 응답 시간)
  retries: 3,     // @codesyncer-rule: 최대 3회 재시도 (rate limit 보호)
};
```

---

## 레거시 호환성

기존 `@claude-*` 태그도 완벽 호환:

```typescript
@claude-rule        = @codesyncer-rule
@claude-inference   = @codesyncer-inference
@claude-decision    = @codesyncer-decision
@claude-todo        = @codesyncer-todo
@claude-context     = @codesyncer-context
```

---

## 태그 검색

```bash
# 모든 추론
grep -r "@codesyncer-inference" ./src

# 모든 TODO
grep -r "@codesyncer-todo" ./src

# 모든 결정
grep -r "@codesyncer-decision" ./src

# 모든 규칙
grep -r "@codesyncer-rule" ./src

# 모든 맥락
grep -r "@codesyncer-context" ./src
```

---

## 좋은 태그 vs 나쁜 태그

### ✅ 좋은 태그
```typescript
// @codesyncer-inference: 토큰에 localStorage (JWT 저장, 일반적 패턴)
// @codesyncer-context: GDPR 준수 (30일 후 자동 삭제)
// @codesyncer-decision: [2024-10-15] Stripe 결제 (해외 지원)
```

### ❌ 나쁜 태그
```typescript
// @codesyncer-inference: 이렇게 함
// @codesyncer-todo: 나중에
// @codesyncer-decision: 변경함
```

**항상 구체적인 이유와 맥락을 포함하세요!**

---

## Watch 모드 연동

`codesyncer watch`를 실행하면 태그된 변경을 자동 감지:

```
[14:32:10] 📝 변경됨: src/utils/api.ts
           └── 🎯 발견: @codesyncer-decision
               "SWR 대신 React Query 사용"
           └── ✅ DECISIONS.md에 추가됨
```

---

[← README로 돌아가기](../../README.ko.md)
