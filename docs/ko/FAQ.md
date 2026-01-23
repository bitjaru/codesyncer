# FAQ

> 자주 묻는 질문

한국어 | [English](../FAQ.md)

---

## 일반

### Claude Code에서만 작동하나요?

현재는 그렇습니다. Cursor, GitHub Copilot 등 지원 예정. [기여 환영!](https://github.com/bitjaru/codesyncer/issues)

### 단일 레포에서도 사용할 수 있나요?

네! CodeSyncer가 자동 감지하고 `.claude/SETUP_GUIDE.md`를 생성합니다.

### 모노레포에서 작동하나요?

네! Turborepo, pnpm, Nx, Lerna, npm/yarn workspaces, Rush 지원.

### AI 응답 속도가 느려지나요?

아니요. CodeSyncer는 AI가 세션당 한 번만 읽는 문서 파일만 추가합니다. 오히려 사전에 컨텍스트를 제공해서 더 효율적입니다.

### 제 코드/데이터가 어디론가 전송되나요?

아니요. CodeSyncer는 순수 로컬 CLI 도구입니다. 외부 서버로 아무것도 전송되지 않습니다.

---

## 설정

### 설정 파일은 어디에 저장되나요?

- `~/.claude/settings.json` - 전역 (모든 프로젝트)
- `.claude/settings.json` - 프로젝트 (git 커밋)
- `.claude/settings.local.json` - 프로젝트 (gitignore)

### 키워드 감지를 커스터마이징할 수 있나요?

네, 전문가 모드 사용:
```bash
codesyncer init --mode expert
```

### 템플릿을 어떻게 업데이트하나요?

```bash
codesyncer update
```

구버전 템플릿을 감지하고 업그레이드를 제안합니다.

---

## 태그

### 어떤 태그를 사용해야 하나요?

| 상황 | 태그 |
|------|-----|
| AI가 추론함 | `@codesyncer-inference` |
| 의논 후 결정 | `@codesyncer-decision` |
| 비표준 구현 | `@codesyncer-rule` |
| 사용자 확인 필요 | `@codesyncer-todo` |
| 비즈니스 맥락 | `@codesyncer-context` |

### 기존 @claude-* 태그도 지원하나요?

네, 완벽 호환:
```
@claude-inference = @codesyncer-inference
@claude-decision = @codesyncer-decision
```

---

## Hooks

### CodeSyncer는 어떤 hooks를 사용하나요?

- **SessionStart** - 세션 시작 시 규칙 주입
- **PreCompact** - 컨텍스트 압축 전 규칙 보존

### 왜 Stop hook을 안 쓰나요?

Stop은 매 AI 응답마다 실행됨 - 너무 자주. SessionStart + PreCompact가 더 효율적.

### Hooks를 어떻게 디버그하나요?

```bash
claude --debug
```

---

## 문제 해결

### AI가 규칙을 안 따라요

1. AI가 `CLAUDE.md`를 읽었는지 확인
2. hooks 설정 확인: `.claude/settings.json`
3. `codesyncer validate` 실행

### Watch 모드가 변경을 감지 안 해요

1. 올바른 디렉토리인지 확인
2. 파일이 저장되고 있는지 확인
3. 파일 확장자가 지원되는지 확인

### 템플릿이 구버전이에요

```bash
codesyncer update
```

---

## 기여

### 어떻게 기여할 수 있나요?

- 더 많은 AI 도구 지원 추가
- 추가 언어 번역
- 더 많은 기술 스택 템플릿
- 문서 개선
- 버그 수정

[CONTRIBUTING.md](../../CONTRIBUTING.md) 참조

---

[← README로 돌아가기](../../README.ko.md)
