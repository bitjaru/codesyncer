# CodeSyncer CLI

> **Claude는 세션이 끝나면 모든 것을 잊습니다. CodeSyncer가 기억하게 해줍니다.**

[![npm version](https://img.shields.io/npm/v/codesyncer.svg)](https://www.npmjs.com/package/codesyncer)
[![License](https://img.shields.io/badge/License-Commons%20Clause-red.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/issues)

한국어 | [English](./README.md)

---

## ⚡ 문제 → 해결

| 문제 | CodeSyncer 없이 | CodeSyncer 사용 시 |
|------|----------------|-------------------|
| **맥락 손실** | 매 세션 = 처음부터 다시 | 코드 태그 = 영구 기억 |
| **결정 망각** | "왜 JWT 썼더라?" → 🤷 | `@codesyncer-decision` → 즉시 확인 |
| **위험한 추론** | AI가 가격, 엔드포인트, 인증 추측 | 중요 키워드 자동 일시정지 |
| **기록 없음** | AI의 추론 이유 없음 | `codesyncer watch`가 모든 것 포착 |

**결과**: 현재 프롬프트만 아는 AI가 아닌, 프로젝트를 진짜로 학습하는 AI

---

## 🎬 데모

![CodeSyncer Demo](https://raw.githubusercontent.com/bitjaru/codesyncer/main/demo-ko.gif)

---

## 🧠 작동 원리

**핵심 인사이트**: AI는 코드를 읽습니다. 그러니 맥락을 코드 안에 넣으세요.

```mermaid
flowchart LR
    A[🧑‍💻 Claude와 코딩] --> B{결정 내림?}
    B -->|예| C[@codesyncer-decision 태그 추가]
    B -->|아니오| D{추론 했음?}
    D -->|예| E[@codesyncer-inference 태그 추가]
    D -->|아니오| F[계속 코딩]
    C --> G[📝 코드에 영구 저장]
    E --> G
    G --> H[🔄 다음 세션]
    H --> I[Claude가 코드 읽음]
    I --> J[✅ 맥락 복구 완료!]
```

```typescript
// @codesyncer-decision: [2024-01-15] JWT 선택 (세션 관리가 더 간단함)
// @codesyncer-inference: 페이지 크기 20 (일반적인 UX 패턴)
// @codesyncer-rule: httpOnly 쿠키 사용 (XSS 방지)
const authConfig = { /* ... */ };
```

다음 세션? Claude가 코드를 읽으면 **자동으로 모든 맥락이 복구됩니다**.

---

## 🔥 Watch 모드: 맥락을 절대 놓치지 마세요

**문제**: Claude가 코딩하면서 태그 추가를 잊을 수 있습니다.

**해결**: `codesyncer watch`로 태그 없는 변경을 잡아내세요.

```bash
codesyncer watch
```

```
[14:32:10] 📝 변경됨: src/utils/api.ts
           └── ⚠️  태그 없음!
               💡 힌트: 추론하면 @codesyncer-inference 추가

[14:33:22] 📝 변경됨: src/auth/login.ts
           └── 🎯 발견: @codesyncer-decision
               "SWR 대신 React Query 사용"
           └── ✅ DECISIONS.md에 추가됨
```

**왜 중요한가**: 모든 코드 변경은 맥락을 기록할 기회입니다. Watch 모드가 놓치는 것 없이 잡아냅니다.

---

## ✨ 전체 기능 목록

| 기능 | 설명 |
|------|------|
| 🏷️ **태그 시스템** | `@codesyncer-decision`, `@codesyncer-inference`, `@codesyncer-rule` - 코드에 영구 맥락 |
| 🔄 **Watch 모드** | 실시간 모니터링, 태그 없는 변경 경고, DECISIONS.md 자동 동기화 |
| ✅ **Validate** | 태그 커버리지 확인, 누락된 문서 찾기, 수정 제안 |
| 🤝 **자동 일시정지** | 결제/보안/인증 키워드 감지 → 코딩 전 확인 |
| 📦 **모노레포** | Turborepo, pnpm, Nx, Lerna, npm/yarn workspaces 자동 감지 |
| 🌐 **다국어** | 한글/영문 완벽 지원 |
| 🔒 **보안** | 경로 탐색 방지 및 입력 검증 |

---

## 🔄 전체 워크플로우

```
┌─────────────────────────────────────────────────────────────┐
│  1. 설정 (최초 1회)                                          │
│     $ npm install -g codesyncer                             │
│     $ codesyncer init                                       │
│     → CLAUDE.md, SETUP_GUIDE.md 생성                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. AI 학습시키기 (세션마다 1회)                              │
│     Claude Code 열고 말하기:                                 │
│     "CLAUDE.md 읽어줘"                                       │
│     → Claude가 태그 시스템 학습                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. 코딩 (watch 모드 실행 상태로)                            │
│     $ codesyncer watch     ← 백그라운드 실행                 │
│     Claude와 평소처럼 코딩                                   │
│     → Claude가 @codesyncer-* 태그 자동 추가                  │
│     → Watch 모드가 태그 누락 시 알림                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. 다음 세션                                                │
│     Claude가 코드 읽음 → 태그 확인                           │
│     → 맥락 자동 복구 완료!                                   │
└─────────────────────────────────────────────────────────────┘
```

**지원 AI 도구:**
- ✅ **Claude Code** (권장)
- 🚧 Cursor, GitHub Copilot, Continue.dev (곧 지원 예정)

---

## 📦 설치

```bash
npm install -g codesyncer
```

---

## 🔄 CodeSyncer 업데이트

### 현재 버전 확인
```bash
codesyncer --version
```

### 최신 버전 확인
```bash
npm view codesyncer version
```

### 최신 버전으로 업데이트
```bash
npm install -g codesyncer@latest
```

### 업데이트 후, 검증 및 프로젝트 동기화

CodeSyncer를 새 버전으로 업데이트한 후, 먼저 설정을 검증하고 동기화하세요:

```bash
cd /path/to/your/multi-repo-workspace

# 1단계: 설정 검증 (v2.7.0 신규)
codesyncer validate

# 2단계: 문제 수정
codesyncer update
```

#### v2.7.0 신규: `codesyncer validate`

`validate` 명령어는 CodeSyncer 설정을 검사하고 문제를 보고합니다:

```bash
codesyncer validate           # 기본 검증
codesyncer validate --verbose # 파일 경로 표시
```

**검사 항목:**
- ✅ 마스터 설정 존재 여부 (`.codesyncer/MASTER_CODESYNCER.md`)
- ✅ AI 자동 로드용 루트 `CLAUDE.md`
- ✅ 모든 레포지토리의 필수 `.claude/` 파일
- ✅ 생성된 파일의 미완성 플레이스홀더
- ✅ 언어 설정

**출력 예시:**
```
🔍 CodeSyncer - Validate

📊 정보
────────────────────────────────────────
  레포지토리 수: 3
  설정 완료된 레포: 2/3
  언어: ko (config.json)

⚠️  경고
────────────────────────────────────────
  • mobile-app: ARCHITECTURE.md 누락
  • 루트 CLAUDE.md 없음 (AI 자동 로드 불가)

────────────────────────────────────────
⚠️  검증 완료 (경고 2개)

💡 수정하려면:
   codesyncer update
```

#### `codesyncer update`

프로젝트를 최신 템플릿 및 기능과 동기화:

**수행 작업:**
1. ✅ 워크스페이스에 추가된 새 레포지토리 스캔
2. ✅ 새 버전에서 누락된 파일 감지 (예: v2.1.2+ 버전의 루트 CLAUDE.md)
3. ✅ 언어 설정 자동 감지 (한국어/영어)
4. ✅ 새 파일 생성 전 사용자 확인 요청
5. ✅ 기존 커스터마이징 내용 보존

**출력 예시:**
```
🔄 CodeSyncer - Update System

✓ Scan complete

⚠️  Missing root CLAUDE.md (new in v2.1.2)
This file allows Claude to automatically load context at session start.

? 루트 CLAUDE.md를 생성할까요? (Y/n) Y

✓ 루트 CLAUDE.md 생성 완료!
💡 이제 Claude가 세션 시작 시 자동으로 컨텍스트를 로드합니다!

🤖 다음 단계 (AI 어시스턴트에게):
────────────────────────────────────────────────────────────
옵션 1) 새 세션 시작
  Claude가 자동으로 루트 CLAUDE.md를 찾아서 읽습니다.

옵션 2) 현재 세션에서 바로 적용
  "CLAUDE.md 읽어줘"
────────────────────────────────────────────────────────────

✅ Update complete!
```

**`codesyncer update` 실행 후:**

다음 중 하나를 선택하여 변경사항을 적용하세요:

**옵션 1: 새 AI 세션 시작** (권장)
- 현재 AI 어시스턴트 종료
- 새 세션 시작
- Claude가 자동으로 루트 CLAUDE.md를 찾아서 읽음

**옵션 2: 현재 세션에서 적용**
- AI에게 말하기: **"CLAUDE.md 읽어줘"**
- AI가 즉시 업데이트된 컨텍스트 로드

---

## 🚀 빠른 시작

### 1단계: CodeSyncer 설치

```bash
npm install -g codesyncer
```

### 2단계: AI 어시스턴트 실행

AI 코딩 어시스턴트를 실행하세요:
- **Claude Code** (권장)
- Cursor
- GitHub Copilot
- 또는 다른 AI 코딩 도구

반드시 **활성화되어 실행 중**이어야 합니다.

### 3단계: 프로젝트로 이동

```bash
cd /path/to/your/project
```

CodeSyncer는 **단일 레포지토리**, **멀티 레포 워크스페이스**, **모노레포** 모두 지원합니다:

**단일 레포지토리** (자동 감지):
```
my-project/
├── package.json
├── src/
└── ...
```

**멀티 레포 워크스페이스**:
```
workspace/
├── backend/
├── frontend/
└── mobile/
```

**모노레포** (Turborepo, pnpm, Nx, Lerna, npm/yarn workspaces 자동 감지):
```
monorepo/
├── package.json        # workspaces: ["packages/*", "apps/*"]
├── turbo.json          # 또는 pnpm-workspace.yaml, nx.json, lerna.json
├── packages/
│   ├── shared/
│   └── ui/
└── apps/
    ├── web/
    └── api/
```

### 4단계: CodeSyncer 초기화

```bash
codesyncer init
```

다음을 입력합니다:
- 언어 선택 (한글/English)
- 프로젝트 이름
- GitHub 사용자명

**실행 과정:**

| 모드 | 감지 조건 | 생성 결과 |
|------|-----------|-----------|
| **단일 레포** | 현재 폴더에 `package.json`, `.git` 등 존재 | `.claude/SETUP_GUIDE.md` 생성 |
| **모노레포** | `turbo.json`, `pnpm-workspace.yaml`, `nx.json`, `lerna.json` 또는 `package.json`의 `workspaces` 존재 | `.codesyncer/SETUP_GUIDE.md` 생성 (패키지별 설정) |
| **멀티 레포** | 하위 폴더에 별도 레포지토리들 존재 | `.codesyncer/SETUP_GUIDE.md` 생성 |

**CodeSyncer는 여기까지만 합니다!** 프레임워크와 규칙만 제공하고, 이제 AI가 직접 설정합니다.

---

## ⚠️ 중요: 5단계 - AI가 모든 설정 완료

> **🎯 이 단계를 건너뛰지 마세요!** 여기서 마법이 일어납니다.

**Claude Code 실행** (또는 선호하는 AI 어시스턴트)하고 다음과 같이 말하세요:

**단일 레포지토리의 경우:**
```
".claude/SETUP_GUIDE.md 파일을 읽고 지시사항대로 설정해줘"
```

**멀티 레포 워크스페이스의 경우:**
```
".codesyncer/SETUP_GUIDE.md 파일을 읽고 지시사항대로 설정해줘"
```

### 이후 자동으로 진행되는 작업:

**1️⃣ AI가 코드 분석**
- 각 레포지토리의 실제 파일 읽기
- 기술 스택, 패턴, 구조 파악
- 프로젝트 아키텍처 이해

**2️⃣ AI가 중요한 질문** (절대 추론하지 않음!)
- ❓ "API 엔드포인트가 뭐예요?"
- ❓ "가격 정책과 비즈니스 로직은 어떻게 되나요?"
- ❓ "어떤 인증 방식을 사용하나요?"
- ❓ "데이터베이스 스키마는 어떻게 구성되어 있나요?"
- ❓ "어떤 외부 서비스와 연동하나요?"

**3️⃣ AI가 완전한 문서 생성**
- `.codesyncer/MASTER_CODESYNCER.md` → 멀티 레포 네비게이션
- `<repo>/.claude/CLAUDE.md` → 코딩 규칙
- `<repo>/.claude/ARCHITECTURE.md` → 프로젝트 구조
- `<repo>/.claude/DECISIONS.md` → 의사결정 기록
- `<repo>/.claude/COMMENT_GUIDE.md` → 주석 태그 가이드

> **💡 왜 이게 효과적인가**: AI가 여러분의 실제 코드를 분석하고 질문합니다. 생성된 문서는 일반적인 템플릿이 아닌, 여러분의 프로젝트에 맞춤화된 내용입니다.

---

### 6단계: 코딩 시작!

설정이 완료되면 AI에게 다음과 같이 말하세요:
```
"CLAUDE.md 읽어줘"
```

AI 어시스턴트가:
- 프로젝트의 코딩 규칙 준수
- 올바른 기술 스택 패턴 사용
- 중요한 결정 전 질문
- 모든 결정을 `@codesyncer-*` 태그로 기록

---

## 📚 사용법

### 협업 시스템 초기화
```bash
codesyncer init
```

### 프로젝트 구조 업데이트
```bash
codesyncer update
```

### Watch 모드 (v2.6.0 신규)
```bash
codesyncer watch         # 실시간 모니터링 시작
codesyncer watch --log   # 파일 로깅 포함
```

**기능:**
- 파일 변경 실시간 감지
- `@codesyncer-*` 태그 자동으로 `DECISIONS.md`에 동기화
- 예쁜 콘솔 출력과 세션 통계

**출력 예시:**
```
[14:32:10] ✨ 변경됨: src/utils/api.ts
           └── 🎯 발견: @codesyncer-decision
               "SWR 대신 React Query 사용"
           └── ✅ DECISIONS.md에 추가됨
```

### 워크스페이스에 새 레포 추가
```bash
codesyncer add-repo
```

---

## 🏷️ 주석 태그 시스템

CodeSyncer는 체계적인 주석 태그 시스템을 사용하여 모든 AI의 추론과 결정을 코드에 영구 기록합니다.

### 사용 가능한 태그

| 태그 | 용도 | 예시 |
|-----|------|------|
| `@codesyncer-rule` | 특별한 규칙 (일반적이지 않은 구현) | `// @codesyncer-rule: any 타입 허용 (외부 라이브러리 타입 없음)` |
| `@codesyncer-inference` | AI가 추론한 내용과 근거 | `// @codesyncer-inference: 페이지 크기 20 (표준 UX)` |
| `@codesyncer-decision` | 의논 후 결정 사항 | `// @codesyncer-decision: [2024-10-15] Stripe 사용 (해외 결제)` |
| `@codesyncer-todo` | 사용자 확인 필요 | `// @codesyncer-todo: API 엔드포인트 URL 확인 필요` |
| `@codesyncer-context` | 비즈니스 맥락 설명 | `// @codesyncer-context: GDPR 준수 (30일 보관)` |

### 레거시 호환성

기존 `@claude-*` 태그도 완벽 호환:
```typescript
@claude-rule        = @codesyncer-rule
@claude-inference   = @codesyncer-inference
@claude-decision    = @codesyncer-decision
@claude-todo        = @codesyncer-todo
@claude-context     = @codesyncer-context
```

---

## 🤝 자동 의논 시스템

CodeSyncer는 중요한 키워드가 감지되면 자동으로 AI 작업을 일시 정지하여 비용이 많이 드는 실수를 방지합니다.

### 필수 의논 키워드 (자동 활성화)

- **💰 결제 및 과금**: 결제, 구매, 입금, 환불, 구독, 과금
- **🔐 인증 및 보안**: 인증, 로그인, 권한, 암호화, 토큰, jwt
- **🗑️ 데이터 작업**: 삭제, 제거, 마이그레이션, 스키마 변경
- **📜 개인정보 및 규정**: 개인정보, GDPR, 약관, 정책

### 작동 방식

1. AI가 키워드 감지 (예: "결제")
2. **자동으로 작업 중단**
3. 추천안 + 대안 제시
4. 사용자 결정 대기
5. 결정 사항을 `DECISIONS.md` + 코드 주석에 기록
6. 작업 재개

---

## 🌍 다국어 지원

CodeSyncer는 한글과 영문을 완벽 지원합니다:
- 설치 안내 메시지
- 생성되는 문서
- 주석 가이드라인
- 모든 UI 메시지

설치 중 언제든 언어를 변경하거나 언어별 명령어를 사용할 수 있습니다.

---

## 🔧 기술 스택 자동 감지

CodeSyncer는 프로젝트 타입과 기술 스택을 자동으로 감지합니다:

**지원 언어/프레임워크:**
- ☕ Java (Spring Boot)
- 🐍 Python (Django, FastAPI)
- 📘 TypeScript / JavaScript
- ⚛️ React / Next.js
- 🟢 Node.js / Express
- 📱 React Native

다음 파일들을 스캔하여 자동 감지:
- `package.json`, `pom.xml`, `build.gradle`, `requirements.txt`
- 폴더 구조 및 의존성 목록

---

## 📖 사용 예시

### 시나리오: 결제 기능 추가

```bash
사용자: "Stripe 결제 연동 추가해줘"

AI: ⚠️ '결제' 키워드 감지. 의논이 필요합니다.

    💡 추천안: Stripe 사용

    🔄 대안:
    A. 아임포트 (한국 전용)
    B. Toss Payments
    C. 직접 구현

    어떻게 진행할까요?

사용자: "진행"

AI: ✅ 결정 사항 기록 중...

    생성:
    - backend/src/services/PaymentService.ts
      /**
       * @codesyncer-decision: [2024-11-12] Stripe 사용 (해외 결제 지원)
       * @codesyncer-context: USD, EUR, KRW 지원
       */

    - frontend/src/components/PaymentForm.tsx
    - DECISIONS.md 업데이트

    ✅ 결제 연동 완료!
```

---

## 🎯 왜 CodeSyncer?

### CodeSyncer 사용 전 ❌
- AI가 중요한 비즈니스 로직을 추측함
- 결정 이유가 기록되지 않음
- 레포 전환 시 컨텍스트 상실
- 팀 전체에 일관성 없는 코딩 패턴

### CodeSyncer 사용 후 ✅
- AI가 중요한 결정에서 일시 정지
- 모든 결정 영구 기록
- 매끄러운 멀티 레포 워크플로우
- 일관된 협업 시스템
- 신입 온보딩 시간 단축

---

## 🤖 지원 AI 도구

### ✅ 현재 지원
- **Claude Code** (완벽 지원)

### 🚧 곧 지원 예정 (커뮤니티 기여 환영!)
- Cursor
- GitHub Copilot
- Continue.dev
- Codeium

선호하는 AI 도구 지원을 추가하고 싶으신가요? [여기서 기여하세요!](https://github.com/bitjaru/codesyncer/issues)

---

## 📁 프로젝트 구조

`codesyncer init` 실행 후 프로젝트 구조:

### 단일 레포지토리 모드

```
my-project/
├── CLAUDE.md                      # Claude가 먼저 읽는 파일
└── .claude/
    ├── CLAUDE.md                  # 코딩 가이드라인
    ├── COMMENT_GUIDE.md           # 태그 사용 가이드
    ├── ARCHITECTURE.md            # 프로젝트 구조
    └── DECISIONS.md               # 의사결정 기록
```

### 멀티 레포지토리 모드

```
workspace/
├── CLAUDE.md                        # Claude가 먼저 읽는 파일
├── .codesyncer/
│   └── MASTER_CODESYNCER.md         # 멀티 레포 자동 전환 가이드
├── backend/
│   └── .claude/
│       ├── CLAUDE.md              # 코딩 가이드라인
│       ├── COMMENT_GUIDE.md       # 태그 사용 가이드
│       ├── ARCHITECTURE.md        # 프로젝트 구조
│       └── DECISIONS.md           # 의사결정 기록
├── frontend/
│   └── .claude/
│       └── (동일한 파일들)
└── mobile/
    └── .claude/
        └── (동일한 파일들)
```

### 모노레포 모드 (v2.4.0 신규)

```
monorepo/
├── CLAUDE.md                        # Claude가 먼저 읽는 파일
├── .codesyncer/
│   └── MASTER_CODESYNCER.md         # 패키지 네비게이션 가이드
├── packages/
│   ├── shared/
│   │   └── .claude/
│   │       └── (동일한 파일들)
│   └── ui/
│       └── .claude/
│           └── (동일한 파일들)
└── apps/
    ├── web/
    │   └── .claude/
    │       └── (동일한 파일들)
    └── api/
        └── .claude/
            └── (동일한 파일들)
```

**지원하는 모노레포 도구:**
- ✅ Turborepo (`turbo.json`)
- ✅ pnpm (`pnpm-workspace.yaml`)
- ✅ Nx (`nx.json`)
- ✅ Lerna (`lerna.json`)
- ✅ npm/Yarn workspaces (`package.json`의 `workspaces` 필드)
- ✅ Rush (`rush.json`)

---

## 🛠️ 고급 사용법

### 커스텀 키워드

전문가 설치 모드에서 커스텀 키워드 추가 가능:

```bash
codesyncer init --mode expert
```

"커스텀 키워드 추가" 선택 후 다음 지정:
- 감지할 키워드
- 중요도 (CRITICAL/IMPORTANT/MINOR)
- 설명

### 기존 프로젝트 업데이트

`codesyncer update` 실행하여:
- `ARCHITECTURE.md`의 프로젝트 구조 갱신
- 주석 태그 통계 업데이트
- 파일 구조 재스캔

---

## 🔍 태그 검색

코드베이스에서 모든 태그 찾기:

```bash
# 모든 추론
grep -r "@codesyncer-inference" ./src

# 모든 TODO
grep -r "@codesyncer-todo" ./src

# 모든 결정 사항
grep -r "@codesyncer-decision" ./src
```

---

## 🤝 기여하기

기여를 환영합니다! CodeSyncer는 오픈소스이며 커뮤니티 중심입니다.

### 🚀 기여자를 위한 빠른 시작

1. **Fork** 이 레포지토리를 Fork 하세요
2. **Clone** Fork한 레포를 클론: `git clone https://github.com/YOUR_USERNAME/codesyncer.git`
3. **브랜치 생성**: `git checkout -b feature/amazing-feature`
4. **변경사항 작성** 후 커밋: `git commit -m "feat: 멋진 기능 추가"`
5. **Push** Fork에 푸시: `git push origin feature/amazing-feature`
6. GitHub에서 **Pull Request 생성**

### 🎯 우선순위 높은 기여 분야

- 🤖 **더 많은 AI 도구 지원 추가** (Cursor, Copilot, Continue.dev)
- 🌐 **추가 언어 번역** (일본어, 중국어, 스페인어)
- 📦 **더 많은 기술 스택 템플릿** (Go, Rust, Ruby, PHP)
- 📝 **문서 개선**
- 🐛 **버그 수정**

### 📖 가이드라인

자세한 기여 가이드는 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요.

### 💬 질문이 있으신가요?

- 📝 [Issue](https://github.com/bitjaru/codesyncer/issues)를 열어주세요
- 💡 [Discussion](https://github.com/bitjaru/codesyncer/discussions)을 시작하세요

---

## 📝 라이선스

**Commons Clause License + MIT**

- ✅ **개인 및 비상업적 용도로 무료 사용** 가능
- ✅ **코드 포크 및 수정** 자유롭게 가능
- ✅ **프로젝트 기여** 환영
- ❌ **판매 및 유료 서비스 제공** 불가

자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

**왜 Commons Clause?**
CodeSyncer가 모든 개발자에게 무료로 제공되면서도 상업적 착취를 방지하기 위함입니다. 상업적 라이선스가 필요한 경우 문의해주세요.

---

## 🙋 자주 묻는 질문

**Q: Claude Code에서만 작동하나요?**
A: 현재는 그렇습니다. 하지만 Cursor, GitHub Copilot 등 다른 도구 지원을 개발 중입니다. 기여 환영!

**Q: 단일 레포에서도 사용할 수 있나요?**
A: 네! CodeSyncer는 자동으로 단일 레포인지 감지합니다 (`package.json`, `.git` 등 존재 여부 확인). 단일 레포에서는 `.claude/SETUP_GUIDE.md`가 생성되고, 멀티 레포 구조 대신 간단한 구조로 설정됩니다.

**Q: 모노레포(Turborepo, pnpm, Nx, Lerna)에서 작동하나요?**
A: 네! v2.4.0부터 CodeSyncer는 모노레포 설정(`turbo.json`, `pnpm-workspace.yaml`, `nx.json`, `lerna.json` 또는 `package.json`의 workspaces)을 자동으로 감지하고 워크스페이스 패턴의 모든 패키지를 스캔합니다.

**Q: AI 응답 속도가 느려지나요?**
A: 아니요. CodeSyncer는 AI가 세션당 한 번만 읽는 문서 파일만 추가합니다. 오히려 사전에 컨텍스트를 제공하여 AI를 더 효율적으로 만듭니다.

**Q: 키워드 감지를 커스터마이징할 수 있나요?**
A: 네, 전문가 설치 모드를 사용하여 어떤 키워드가 의논을 트리거할지 완전히 커스터마이징할 수 있습니다.

**Q: 제 코드/데이터가 어디론가 전송되나요?**
A: 아니요. CodeSyncer는 순전히 로컬 CLI 도구로, 레포에 문서 파일만 생성합니다. 외부 서버로 아무것도 전송되지 않습니다.

---

## 🌟 지원하기

CodeSyncer가 팀에 도움이 되셨다면:
- ⭐ 이 레포에 Star
- 🐦 트위터에 공유
- 📝 사용 경험 공유
- 🤝 개선 사항 기여

### 💰 개발 후원

CodeSyncer 개발을 지원하고 싶으시다면 암호화폐로 후원해주실 수 있습니다:

**이더리움 (ETH) / ERC-20 토큰:**
```
0x0a12177c448778a37Fa4EeA57d33D06713F200De
```

여러분의 후원은 CodeSyncer를 유지하고 개선하는 데 큰 도움이 됩니다! 🙏

---

## 📮 연락처

- **이슈**: [GitHub Issues](https://github.com/bitjaru/codesyncer/issues)
- **토론**: [GitHub Discussions](https://github.com/bitjaru/codesyncer/discussions)

---

**CodeSyncer 커뮤니티가 ❤️로 만들었습니다**

*한 번에 하나씩, AI 협업을 매끄럽게 만들어갑니다.*
