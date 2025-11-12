# CodeSyncer CLI

> Claude Code, Cursor, GitHub Copilot 등 모든 AI 코딩 어시스턴트와 함께 사용하는 멀티 레포지토리 협업 시스템!

[![npm version](https://img.shields.io/npm/v/codesyncer.svg)](https://www.npmjs.com/package/codesyncer)
[![License](https://img.shields.io/badge/License-Commons%20Clause-red.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/issues)

한국어 | [English](./README.md)

---

## 🎯 CodeSyncer란?

CodeSyncer는 여러 레포지토리에서 AI 코딩 어시스턴트와 효율적으로 협업할 수 있도록 도와주는 CLI 도구입니다. 프로젝트 구조, 코딩 규칙, 비즈니스 결정 사항을 체계적으로 문서화하여 AI가 이해할 수 있게 만듭니다.

### 주요 기능

- 🤖 **AI 도구 독립적**: Claude Code, Cursor, GitHub Copilot 등 모두 지원
- 📁 **멀티 레포 지원**: 백엔드, 프론트엔드, 모바일 레포를 자유롭게 넘나들며 작업
- 🏷️ **주석 태그 시스템**: `@codesyncer-*` 태그로 결정과 추론을 영구 기록
- 🤝 **자동 의논 시스템**: 중요한 결정(결제, 보안 등)에서 자동으로 일시 정지
- 🌐 **다국어 지원**: 한글/영문 완벽 지원
- ⚡ **빠른 설치**: 한 번의 명령으로 전체 워크스페이스 설정

---

## 📦 설치

```bash
npm install -g codesyncer
```

---

## 🚀 빠른 시작

### 1. 워크스페이스 루트로 이동

```bash
cd /path/to/your/workspace
```

워크스페이스는 여러 레포 폴더를 포함해야 합니다:
```
workspace/
├── backend/
├── frontend/
└── mobile/
```

### 2. 초기화 실행

```bash
codesyncer init
```

### 3. 설치 모드 선택

**⚡ 퀵 설치** (권장)
- 모든 레포 자동 감지
- 한 번에 협업 시스템 생성
- 모든 의논 키워드 자동 활성화

**🔧 전문가 설치**
- 모든 옵션 세부 설정
- 특정 키워드 카테고리 선택
- 커스텀 키워드 추가

### 4. 언어 선택

한글 또는 English 선택

### 5. 완료!

CodeSyncer가 자동으로:
- 레포 스캔 및 감지 (Java, Python, Node.js, React 등)
- 워크스페이스 루트에 마스터 문서 생성 (`.codesyncer/MASTER_CODESYNCER.md`)
- 각 레포에 협업 파일 생성 (`.claude/` 폴더)
  - `CLAUDE.md` - 코딩 가이드라인
  - `COMMENT_GUIDE.md` - 주석 태그 사용 가이드
  - `ARCHITECTURE.md` - 프로젝트 구조 (자동 업데이트)
  - `DECISIONS.md` - 의사결정 기록

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

`codesyncer init` 실행 후 워크스페이스 구조:

```
workspace/
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
A: 네! 아무 레포에서나 `codesyncer init`을 실행하면 됩니다. 멀티 레포 기능은 선택사항입니다.

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
