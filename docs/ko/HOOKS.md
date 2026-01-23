# Hooks 가이드

> Claude Code 자동 리마인드 시스템

한국어 | [English](../HOOKS.md)

---

## Hooks란?

**Hooks는 Claude Code가 특정 순간에 자동으로 실행하는 셸 명령어입니다.**

"트리거"라고 생각하면 됩니다 - 특정 이벤트가 발생하면 (세션 시작, 컨텍스트 압축 등) 설정한 명령어가 자동 실행됩니다.

```
┌─────────────────────────────────────┐
│  Claude Code 이벤트                 │
│  (예: 세션 시작)                    │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│  Hook 실행                          │
│  echo "[CodeSyncer] 규칙 기억..."   │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│  AI가 메시지 확인 → 규칙 준수       │
└─────────────────────────────────────┘
```

---

## 왜 SessionStart + PreCompact인가?

**CodeSyncer는 가장 효율적인 Hook 타이밍을 사용합니다.**

| Hook | 실행 빈도 | 적합성 |
|------|----------|--------|
| **SessionStart** | 세션당 1회 | ✅ 최적 |
| **PreCompact** | 압축 시 1회 | ✅ 최적 |
| Stop | 매 응답마다 | ❌ 과도함 |
| PreToolUse | 매 도구마다 | ❌ 과도함 |

- **SessionStart**: 세션 시작 시 규칙 주입
- **PreCompact**: 컨텍스트 압축 후에도 규칙 유지

---

## CodeSyncer Hook 설정

`codesyncer init`에서 hooks "Yes" 선택 시:

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "echo '[CodeSyncer] 규칙: 1) 추론→@codesyncer-inference 2) 결정→@codesyncer-decision 3) 결제/보안/API는 반드시 질문'"
      }]
    }],
    "PreCompact": [{
      "hooks": [{
        "type": "command",
        "command": "echo '[CodeSyncer] 압축 후 기억: @codesyncer-* 태그 필수, 결제/보안/API는 사용자에게 질문'"
      }]
    }]
  }
}
```

**파일 위치**: `.claude/settings.json`

---

## 사용 가능한 Hook 이벤트

Claude Code가 지원하는 Hook 이벤트:

| 이벤트 | 트리거 시점 | 예시 용도 |
|--------|------------|-----------|
| **SessionStart** | 새 세션 시작 | 프로젝트 규칙 주입 |
| **PreCompact** | 컨텍스트 압축 전 | 중요 규칙 보존 |
| **PreToolUse** | 도구 실행 전 | 특정 파일 수정 차단 |
| **PostToolUse** | 도구 완료 후 | 파일 자동 포맷팅 |
| **Stop** | AI 응답 완료 | 최종 체크리스트 |
| **UserPromptSubmit** | 프롬프트 제출 | 입력 검증 |
| **PermissionRequest** | 권한 대화창 | 자동 승인/거부 |

---

## Hook 설정 구조

```json
{
  "hooks": {
    "이벤트명": [
      {
        "matcher": "도구패턴",  // PreToolUse, PostToolUse만
        "hooks": [
          {
            "type": "command",     // 또는 "prompt"
            "command": "실행할-명령어",
            "timeout": 60          // 초 (기본값: 60)
          }
        ]
      }
    ]
  }
}
```

### Hook 타입

**1. Command** - 셸 명령 실행
```json
{"type": "command", "command": "echo 'hello'"}
```

**2. Prompt** - LLM 평가 (Stop, SubagentStop만)
```json
{"type": "prompt", "prompt": "모든 작업이 완료됐는지 확인"}
```

### Exit Code

| 코드 | 의미 |
|------|------|
| 0 | 성공 (계속 진행) |
| 2 | **차단** (도구 실행 중단) |
| 기타 | 경고 (메시지와 함께 진행) |

---

## 커스텀 Hook 예시

### .env 파일 수정 차단

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | grep -q '\\.env' && echo '.env 파일 수정 불가' && exit 2 || exit 0"
      }]
    }]
  }
}
```

### TypeScript 파일 자동 포맷팅

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "file=$(jq -r '.tool_input.file_path'); [[ $file == *.ts ]] && npx prettier --write \"$file\""
      }]
    }]
  }
}
```

### 모든 bash 명령 로깅

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.command' >> ~/.claude/bash-log.txt"
      }]
    }]
  }
}
```

---

## Hooks 관리

```bash
# 활성화 (init 중)
codesyncer init  # Hooks에서 "Yes" 선택

# 비활성화
rm .claude/settings.json

# 커스터마이징
# .claude/settings.json 직접 편집

# 디버그
claude --debug  # hook 실행 로그 확인

# 인터랙티브 설정
claude
/hooks
```

---

## 설정 파일 위치

| 위치 | 적용 범위 |
|------|----------|
| `~/.claude/settings.json` | 모든 프로젝트 (사용자 레벨) |
| `.claude/settings.json` | 현재 프로젝트 (git 커밋) |
| `.claude/settings.local.json` | 현재 프로젝트 (gitignore) |

---

## 문제 해결

**Hook이 실행 안 됨?**
1. 파일 위치 확인
2. `claude --debug`로 로그 확인
3. JSON 문법 검증

**Hook이 예상치 못하게 차단?**
1. exit code 확인 (2 = 차단)
2. matcher 패턴 검토
3. 터미널에서 명령어 직접 테스트

---

[← README로 돌아가기](../../README.ko.md)
