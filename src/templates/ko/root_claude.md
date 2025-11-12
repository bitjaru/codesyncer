# CLAUDE.md - [PROJECT_NAME] 멀티레포 프로젝트

> **🎯 이것은 멀티레포 워크스페이스입니다**
>
> 각 레포지토리는 독립적인 프로젝트이며, 함께 협업합니다.

---

## 📋 첫 번째 할 일

**이 파일을 읽었다면, 다음 파일을 즉시 읽어주세요:**

```
.codesyncer/MASTER_CODESYNCER.md
```

→ 이 파일에 **모든 레포지토리 정보**, **자동 전환 규칙**, **키워드 매핑**이 있습니다.

---

## 🏗️ 프로젝트 개요

- **프로젝트명**: [PROJECT_NAME]
- **GitHub**: https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME]
- **생성일**: [TODAY]
- **레포지토리 수**: [REPO_COUNT]개

---

## 🗂️ 레포지토리 구조

```
[PROJECT_NAME]/
├── CLAUDE.md (지금 읽는 파일)
├── .codesyncer/
│   └── MASTER_CODESYNCER.md ⭐ 멀티레포 네비게이션
│
├── [repo1]/
│   └── .claude/
│       └── CLAUDE.md (개별 레포 규칙)
│
├── [repo2]/
│   └── .claude/
│       └── CLAUDE.md (개별 레포 규칙)
│
└── ...
```

---

## 🚨 중요 규칙

### 1. 작업 전 레포지토리 확인
항상 현재 어느 레포에서 작업하는지 확인하세요:
```bash
pwd  # 현재 디렉토리 확인
```

### 2. 레포 전환 시 CLAUDE.md 읽기
새로운 레포에서 작업할 때마다:
```
"[repo-name]/.claude/CLAUDE.md 읽어줘"
```

### 3. 루트에서는 작업 금지
루트 디렉토리에서 코드 작업 금지. 항상 특정 레포로 이동 후 작업.

---

## 🔄 멀티레포 작업 흐름

### 시나리오 1: 사용자가 특정 레포 명시
```
사용자: "백엔드에 로그인 API 추가해줘"
       ↓
1. MASTER_CODESYNCER.md에서 "백엔드" 키워드 → api-server 레포 확인
2. api-server/.claude/CLAUDE.md 읽기
3. api-server에서 작업
```

### 시나리오 2: 여러 레포 수정 필요
```
사용자: "주문 기능 추가해줘"
       ↓
1. "주문 기능은 백엔드(API)와 프론트엔드(UI) 둘 다 필요합니다. 진행할까요?"
2. 사용자 확인 후
3. api-server에서 API 작업 → 완료 보고
4. web-client에서 UI 작업 → 완료 보고
```

### 시나리오 3: 어느 레포인지 모를 때
```
1. MASTER_CODESYNCER.md의 키워드 매핑 확인
2. 불명확하면 사용자에게 질문
   "어느 레포에서 작업할까요?"
   - A) api-server (백엔드)
   - B) web-client (프론트엔드)
   - C) mobile-app (모바일)
```

---

## 📝 전체 프로젝트 공통 규칙

다음 규칙은 **모든 레포지토리에 공통 적용**:

### 코딩 표준
- ✅ TypeScript strict mode 사용
- ✅ 명시적 타입 정의 필수
- ✅ 함수형 프로그래밍 우선
- ✅ 모든 함수/컴포넌트에 주석 작성
- ✅ 에러 핸들링 필수

### 주석 태그 시스템
모든 레포에서 동일한 태그 사용:
```typescript
@codesyncer-rule        // 특별 규칙
@codesyncer-inference   // 추론 내용과 근거
@codesyncer-decision    // 의논 후 결정 사항
@codesyncer-todo        // 사용자 확인 필요
@codesyncer-context     // 비즈니스 맥락 설명
```

자세한 내용: 각 레포의 `.claude/COMMENT_GUIDE.md`

### 추론 금지 영역
**절대 추론하지 말고 사용자에게 물어보세요:**
- 💰 비즈니스 로직 수치 (가격, 수수료, 한도, 할인율)
- 🔌 API 엔드포인트 URL
- 🔐 보안 설정 (토큰 만료 시간, 암호화 방식)
- 🗄️ 데이터베이스 스키마
- 🌐 외부 서비스 연동 정보

### 의논 필수 키워드
다음 키워드 감지 시 **자동으로 작업 중단** 후 사용자와 의논:
- 🔴 **CRITICAL**: 결제, 과금, 인증, 권한, 삭제, 개인정보, GDPR
- 🟡 **IMPORTANT**: API 연동, DB 스키마, 배포, 캐싱, 이메일
- 🟢 **MINOR**: 최적화, 테스트, 로깅, UI/UX

자세한 키워드 목록: `.codesyncer/MASTER_CODESYNCER.md`

---

## 🎯 세션 시작 체크리스트

AI가 이 파일을 읽으면:

1. ✅ `.codesyncer/MASTER_CODESYNCER.md` 즉시 읽기
2. ✅ 전체 레포지토리 구조 파악
3. ✅ 키워드 매핑 확인
4. ✅ 준비 완료 메시지 출력:

```
✅ [PROJECT_NAME] 멀티레포 프로젝트 준비 완료!

📁 레포지토리: [REPO_COUNT]개
📋 MASTER_CODESYNCER.md 읽음
🎯 작업 가능 상태

어느 레포에서 작업할까요?
```

---

## 💡 유용한 명령어

### 네비게이션
```
"레포 목록 보여줘"          → MASTER_CODESYNCER.md 기반 레포 나열
"백엔드로 이동"             → api-server/.claude/CLAUDE.md 읽기
"프론트엔드로 전환"         → web-client/.claude/CLAUDE.md 읽기
```

### 문서 업데이트
```
"전체 구조 업데이트"        → 모든 레포 ARCHITECTURE.md 갱신
"의논 기록 확인"            → 각 레포의 DECISIONS.md 확인
```

### 멀티레포 작업
```
"모든 레포에 ESLint 설정"   → 순차적으로 각 레포 작업
"공통 타입 정의 필요"       → 어느 레포에 둘지 의논
```

---

## 📚 관련 문서

### 루트 문서
- **멀티레포 네비게이션**: `.codesyncer/MASTER_CODESYNCER.md` ⭐ **필수**
- **설정 가이드**: `.codesyncer/SETUP_GUIDE.md` (AI 설정 완료 후 참고용)

### 개별 레포 문서
각 레포의 `.claude/` 폴더:
- **CLAUDE.md** - 레포별 코딩 규칙
- **ARCHITECTURE.md** - 프로젝트 구조
- **COMMENT_GUIDE.md** - 주석 작성 가이드
- **DECISIONS.md** - 의논 결정 기록

---

## 🔍 주석 검색 (전체 프로젝트)

```bash
# 모든 레포에서 TODO 찾기
grep -r "@codesyncer-todo" ./*/.claude/

# 모든 의논 결정 찾기
grep -r "@codesyncer-decision" ./*/

# 특정 키워드 찾기
grep -r "결제" ./*/
```

---

## ⚠️ 주의사항

1. **레포 전환 시 컨텍스트 전환**
   - 각 레포는 독립적인 규칙을 가질 수 있음
   - 반드시 해당 레포의 CLAUDE.md 확인

2. **크로스 레포 의존성**
   - 여러 레포에 영향 주는 변경은 사용자와 의논
   - 순서가 중요한 경우 명확히 설명

3. **공통 코드 관리**
   - 타입 정의, 유틸 함수 등 공통 코드 위치 의논
   - 중복 방지 전략 수립

---

**버전**: 1.0.0 (Powered by CodeSyncer)
**AI 도구**: Claude Code 최적화 | 호환: Cursor, GitHub Copilot, Continue.dev

---

*CodeSyncer는 오픈소스입니다: https://github.com/bitjaru/codesyncer*
