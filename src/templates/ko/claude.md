# CLAUDE.md - [PROJECT_NAME] 코딩 가이드 v3.0

> **Powered by CodeSyncer** - AI 협업 시스템

## 🚀 빠른 시작

### 이 문서를 AI에게 읽게 하세요
```
"CLAUDE.md 읽어줘"
```
→ AI가 자동으로 이 프로젝트의 규칙을 적용합니다.

### 자연어로 편하게 요청하세요
```
✅ "주문 목록 페이지 만들어줘"
✅ "로그인 API 추가해줘"
✅ "결제 버튼 컴포넌트 필요해"
✅ "이 버그 고쳐줘"
```

**AI가 알아서:**
- 프로젝트 구조 파악
- 적절한 위치에 파일 생성
- 코딩 규칙 준수
- 필요시 의논 요청

---

## 🏗️ 프로젝트 정보
- **프로젝트명**: [PROJECT_NAME]
- **프로젝트 타입**: [PROJECT_TYPE]
- **기술 스택**: [TECH_STACK]
- **생성일**: [TODAY]
- **버전**: 1.0.0

## 📁 프로젝트 구조
자세한 구조는 `.claude/ARCHITECTURE.md` 참조

## 🚨 절대 규칙
1. **TypeScript strict mode** 사용
2. **함수형 프로그래밍** 우선
3. **명시적 타입 정의** 필수
4. **모든 함수/컴포넌트에 주석** 작성
5. **에러 핸들링** 필수

## 🔴 추론 금지 영역 (반드시 사용자에게 확인)

다음은 **절대 추론하지 말고** 사용자에게 물어보세요:

- 💰 비즈니스 로직 수치 (가격, 수수료, 한도, 할인율)
- 🔌 API 엔드포인트 URL
- 🔐 보안 설정 (토큰 만료 시간, 암호화 방식)
- 🗄️ 데이터베이스 스키마
- 🌐 외부 서비스 연동 정보

**예시:**
```
❌ 나쁜 예: "배송비를 3000원으로 설정했습니다"
✅ 좋은 예: "배송비를 얼마로 설정할까요?"
```

## 🤝 의논 필수 키워드

다음 키워드 감지 시 **자동으로 작업 중단** 후 사용자와 의논:

[KEYWORDS]

### 의논 프로세스
1. **키워드 감지** → "⚠️ '[키워드]' 감지. 의논이 필요합니다."
2. **옵션 제시** → 추천안 + 대안들
3. **사용자 응답 대기** → "진행" / "대안 A" / "보류"
4. **결정 기록** → DECISIONS.md + 코드 주석
5. **작업 재개**

---

## 📝 주석 작성 규칙

### 주석 태그 (두 형식 모두 지원)

**✨ 권장 형식** (모든 AI 도구 호환):
```typescript
@codesyncer-rule        // 특별 규칙 (일반적이지 않은 구현 방식)
@codesyncer-inference   // 추론 내용과 근거
@codesyncer-decision    // 의논 후 결정 사항
@codesyncer-todo        // 사용자 확인 필요
@codesyncer-context     // 비즈니스 맥락 설명
```

**🔄 레거시 형식** (기존 프로젝트 호환):
```typescript
@claude-rule          // @codesyncer-rule과 동일
@claude-inference     // @codesyncer-inference와 동일
@claude-decision      // @codesyncer-decision과 동일
@claude-todo          // @codesyncer-todo와 동일
@claude-context       // @codesyncer-context와 동일
```

### 주석 레벨별 예시

#### 📄 파일 레벨 (JSDoc)
```tsx
/**
 * User authentication service
 *
 * @codesyncer-context JWT 기반 인증 시스템
 * @codesyncer-rule 토큰은 httpOnly 쿠키에 저장 (XSS 방지)
 * @author CodeSyncer
 * @date [TODAY]
 */
```

#### 🔧 함수/컴포넌트 레벨
```tsx
/**
 * 주문 생성 폼 컴포넌트
 *
 * @codesyncer-inference 6단계 폼 구조 (일반적인 주문 플로우)
 * @codesyncer-decision [2024-10-15] Zustand로 상태 관리 (복잡한 폼이라)
 */
export default function OrderForm() {
  // ...
}
```

#### 📝 인라인 레벨
```tsx
// @codesyncer-inference: 페이지 크기 20 (일반적인 UX 패턴)
const PAGE_SIZE = 20;

// @codesyncer-todo: mainApi 엔드포인트 확인 필요
const API_URL = '/api/temp';

// @codesyncer-decision: [2024-10-17] Soft Delete 방식 (30일 복구 가능)
async function deleteUser(id: string) {
  return db.update(id, { deleted_at: new Date() });
}
```

### 좋은 주석 vs 나쁜 주석

**✅ 좋은 주석**
```tsx
// @codesyncer-inference: localStorage 사용 (JWT 토큰 저장용, 일반적 패턴)
// @codesyncer-context: GDPR 준수 필요 (30일 후 자동 삭제)
// @codesyncer-decision: [2024-10-15] Stripe 사용 (한국 결제 지원)
```

**❌ 나쁜 주석**
```tsx
// @codesyncer-inference: 이렇게 했음
// @codesyncer-todo: 나중에
// @codesyncer-decision: 변경함
```

→ **구체적인 이유와 근거**를 항상 포함하세요!

---

## 🔄 자동 업데이트 시스템

### 자동 감지 트리거

| 상황 | 업데이트 대상 | 사용자 확인 |
|------|--------------|------------|
| 새 폴더/파일 생성 | ARCHITECTURE.md | "구조 업데이트?" |
| 의논 후 결정 | DECISIONS.md | 자동 추가 |
| 같은 패턴 3회 반복 | CLAUDE.md에 템플릿 추가 | "템플릿 추가?" |
| TODO 추가/완료 | ARCHITECTURE.md 통계 | "통계 업데이트?" |

### 수동 업데이트 명령어

```
"구조 업데이트"     → ARCHITECTURE.md 재스캔
"규칙 추가"         → CLAUDE.md에 새 규칙
"템플릿 추가"       → 반복 패턴을 템플릿으로
"통계 업데이트"     → 주석 태그 통계 갱신
```

---

## 📋 프로젝트 타입별 가이드

[TEMPLATES]

---

## 🔄 작업 프로세스

### 일반적인 작업 흐름
```
1. 사용자 요청 받음
   ↓
2. CLAUDE.md 규칙 확인
   ↓
3. 추론 금지 영역 체크 → 필요시 질문
   ↓
4. 의논 키워드 체크 → 감지 시 의논
   ↓
5. 코드 생성 (주석 자동 포함)
   ↓
6. 추론 발생 시 → @codesyncer-inference 태그
   ↓
7. 의논 결정 시 → DECISIONS.md 기록
   ↓
8. 완료 보고
```

### AI가 자동으로 수행하는 것들
- ✅ 프로젝트 구조 분석
- ✅ 적절한 위치에 파일 생성
- ✅ 타입 정의 자동 추가
- ✅ 주석 자동 생성
- ✅ 에러 핸들링 추가
- ✅ 추론 내용 태그로 기록

---

## 💡 세션 시작 시 체크리스트

AI가 이 파일을 읽으면 자동으로:

1. ✅ **도움말 표시** - 사용 가능한 명령어 안내
2. ✅ **프로젝트 구조 파악** - ARCHITECTURE.md 확인
3. ✅ **최근 의논 확인** - DECISIONS.md 확인
4. ✅ **준비 완료 메시지** - "준비되었습니다!"

---

## 📚 관련 문서

- **주석 가이드**: `.claude/COMMENT_GUIDE.md` - 주석 작성 상세 가이드
- **프로젝트 구조**: `.claude/ARCHITECTURE.md` - 폴더 구조, 통계
- **의논 기록**: `.claude/DECISIONS.md` - 모든 의논 결정 사항
- **마스터 문서**: `../.codesyncer/MASTER_CODESYNCER.md` - 멀티 레포 전환

---

## 🔍 주석 검색

모든 주석 태그는 검색 가능합니다:

```bash
# 모든 추론 찾기
grep -r "@codesyncer-inference" ./

# TODO 목록
grep -r "@codesyncer-todo" ./

# 의논 결정 사항
grep -r "@codesyncer-decision" ./

# 특별 규칙
grep -r "@codesyncer-rule" ./
```

---

**버전**: 1.0.0 (Powered by CodeSyncer)
**생성일**: [TODAY]
**AI 도구**: 현재 Claude Code 지원 | 향후 확장: Cursor, GitHub Copilot, Continue.dev

**태그 호환성**: `@codesyncer-*` (권장) + `@claude-*` (레거시) 모두 지원

---

*이 협업 시스템은 오픈소스입니다. 개선 아이디어는 [CodeSyncer GitHub](https://github.com/bitjaru/codesyncer-cli)에서 제안해주세요!*
