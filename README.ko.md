# CodeSyncer

> **Claude는 세션이 끝나면 모든 것을 잊습니다. CodeSyncer가 기억하게 해줍니다.**

[![npm version](https://img.shields.io/npm/v/codesyncer.svg)](https://www.npmjs.com/package/codesyncer)
[![License](https://img.shields.io/badge/License-Commons%20Clause-red.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bitjaru/codesyncer.svg)](https://github.com/bitjaru/codesyncer/stargazers)

한국어 | [English](./README.md)

---

## 문제 → 해결

| 문제 | CodeSyncer 없이 | CodeSyncer 사용 시 |
|------|----------------|-------------------|
| **맥락 손실** | 매 세션 = 처음부터 다시 | `@codesyncer-*` 태그 = 영구 기억 |
| **태그 누락** | 변경사항 추적 안 됨 | `codesyncer watch`가 모두 포착 |
| **규칙 망각** | 긴 세션에서 AI가 규칙 잊음 | Hooks가 최적 타이밍에 자동 리마인드 |
| **위험한 추론** | AI가 가격, 보안, API 추측 | 중요 키워드 자동 일시정지 |

---

## 데모

![CodeSyncer Demo](https://raw.githubusercontent.com/bitjaru/codesyncer/main/demo-ko.gif)

---

## 빠른 시작

```bash
# 1. 설치
npm install -g codesyncer

# 2. 초기화
cd /path/to/your/project
codesyncer init

# 3. AI가 설정 완료 (Claude에게 말하기)
".claude/SETUP_GUIDE.md 읽고 지시사항대로 설정해줘"

# 4. 코딩 시작 (매 세션마다)
"CLAUDE.md 읽어줘"
```

---

## 핵심 기능

### 🏷️ 태그 시스템

맥락을 코드 안에 넣으세요. AI가 코드를 읽으면 자동으로 맥락 복구.

```typescript
// @codesyncer-decision: [2024-01-15] JWT 선택 (세션 관리가 더 간단함)
// @codesyncer-inference: 페이지 크기 20 (일반적인 UX 패턴)
const authConfig = { /* ... */ };
```

**[→ 태그 시스템 가이드](./docs/ko/TAGS.md)**

---

### 🔄 Watch 모드

태그 없는 변경을 실시간 감지:

```bash
codesyncer watch
```

```
[14:32:10] 📝 변경됨: src/auth/login.ts
           └── 🎯 발견: @codesyncer-decision
           └── ✅ DECISIONS.md에 추가됨
```

**[→ 고급 사용법](./docs/ko/ADVANCED.md)**

---

### 🪝 Hooks

최적의 순간에 AI에게 자동 리마인드 (매 응답이 아닌):

| Hook | 시점 | 이유 |
|------|------|------|
| **SessionStart** | 세션 시작 | 규칙 한 번 주입 |
| **PreCompact** | 압축 전 | 규칙이 압축 후에도 유지 |

**CodeSyncer는 가장 효율적인 Hook 타이밍을 사용합니다.**

**[→ Hooks 가이드](./docs/ko/HOOKS.md)**

---

## 지원 AI 도구

| 도구 | 상태 |
|------|------|
| **Claude Code** | ✅ 완벽 지원 |
| Cursor | 🚧 곧 지원 예정 |
| GitHub Copilot | 🚧 곧 지원 예정 |

---

## 문서

| 가이드 | 설명 |
|--------|------|
| **[설정 가이드](./docs/ko/SETUP.md)** | 설치, 설정, 업데이트 |
| **[태그 시스템](./docs/ko/TAGS.md)** | 모든 태그와 예시 |
| **[Hooks 가이드](./docs/ko/HOOKS.md)** | Hook 이벤트와 커스터마이징 |
| **[고급 사용법](./docs/ko/ADVANCED.md)** | Watch 모드, 자동 의논, 모노레포 |
| **[FAQ](./docs/ko/FAQ.md)** | 자주 묻는 질문 |

---

## 명령어

```bash
codesyncer init       # 프로젝트 초기화
codesyncer update     # 템플릿 업데이트
codesyncer validate   # 설정 검증
codesyncer watch      # 실시간 모니터링
codesyncer add-repo   # 워크스페이스에 레포 추가
```

---

## 기여하기

기여를 환영합니다! [CONTRIBUTING.md](./CONTRIBUTING.md) 참조

**우선순위:**
- 🤖 더 많은 AI 도구 지원
- 🌐 추가 언어 번역
- 📦 더 많은 기술 스택 템플릿

---

## 후원

CodeSyncer가 도움이 되셨다면:
- ⭐ Star
- 🐦 트위터 공유

**이더리움 (ETH):**
```
0x0a12177c448778a37Fa4EeA57d33D06713F200De
```

---

## 라이선스

**Commons Clause + MIT** - 개인/비상업적 무료 사용. [LICENSE](./LICENSE) 참조

---

## 연락처

- [GitHub Issues](https://github.com/bitjaru/codesyncer/issues)
- [GitHub Discussions](https://github.com/bitjaru/codesyncer/discussions)

---

**CodeSyncer 커뮤니티가 ❤️로 만들었습니다**
