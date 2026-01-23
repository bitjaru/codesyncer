# 설정 가이드

> 상세 설치 및 구성 방법

한국어 | [English](../SETUP.md)

---

## 설치

```bash
npm install -g codesyncer
```

---

## 빠른 시작

### 1단계: 프로젝트로 이동

```bash
cd /path/to/your/project
```

### 2단계: 초기화

```bash
codesyncer init
```

다음을 입력합니다:
- 언어 선택 (한글/English)
- 프로젝트 이름
- GitHub 사용자명
- Hooks 설정 (권장)

### 3단계: AI가 설정 완료

**단일 레포지토리:**
```
".claude/SETUP_GUIDE.md 읽고 지시사항대로 설정해줘"
```

**멀티 레포지토리:**
```
".codesyncer/SETUP_GUIDE.md 읽고 지시사항대로 설정해줘"
```

### 4단계: 코딩 시작

```
"CLAUDE.md 읽어줘"
```

---

## 프로젝트 감지

CodeSyncer가 프로젝트 타입을 자동 감지:

| 타입 | 감지 조건 | 생성 결과 |
|------|-----------|-----------|
| **단일 레포** | 현재 폴더에 `package.json`, `.git` | `.claude/SETUP_GUIDE.md` |
| **모노레포** | `turbo.json`, `pnpm-workspace.yaml`, `nx.json`, `lerna.json` | `.codesyncer/SETUP_GUIDE.md` |
| **멀티 레포** | 하위 폴더에 별도 레포들 | `.codesyncer/SETUP_GUIDE.md` |

---

## 생성되는 파일들

### 단일 레포지토리

```
my-project/
├── CLAUDE.md                 # Claude가 먼저 읽는 파일
└── .claude/
    ├── CLAUDE.md             # 코딩 가이드라인
    ├── COMMENT_GUIDE.md      # 태그 사용 가이드
    ├── ARCHITECTURE.md       # 프로젝트 구조
    ├── DECISIONS.md          # 의사결정 기록
    └── settings.json         # Hooks (선택)
```

### 멀티 레포지토리 / 모노레포

```
workspace/
├── CLAUDE.md                 # Claude가 먼저 읽는 파일
├── .codesyncer/
│   └── MASTER_CODESYNCER.md  # 멀티 레포 네비게이션
├── backend/
│   └── .claude/
│       └── (동일한 파일들)
└── frontend/
    └── .claude/
        └── (동일한 파일들)
```

---

## CodeSyncer 업데이트

### 버전 확인

```bash
codesyncer --version        # 현재 버전
npm view codesyncer version # 최신 버전
```

### 업데이트

```bash
npm install -g codesyncer@latest
```

### 업데이트 후

```bash
codesyncer validate  # 설정 검증
codesyncer update    # 최신 템플릿과 동기화
```

---

## 템플릿 업그레이드

CodeSyncer 업데이트 시 템플릿이 구버전일 수 있음:

```
📦 새 버전 감지: v3.2.0

  📁 my-project/
     • CLAUDE.md (v3.1.0 → v3.2.0)
     • COMMENT_GUIDE.md (버전 없음 → v3.2.0)

? 2개 템플릿을 업그레이드할까요?
  > 예 - 업그레이드 (기존 파일 백업)
    아니오 - 건너뛰기
    미리보기 - 변경 파일만 확인
```

**기능:**
- 구버전 템플릿 자동 감지
- 업그레이드 전 `.backup` 파일 생성
- 프로젝트 변수 보존

---

## 검증

```bash
codesyncer validate           # 기본 검사
codesyncer validate --verbose # 파일 경로 표시
```

**검사 항목:**
- 마스터 설정 존재
- 자동 로드용 루트 `CLAUDE.md`
- 모든 레포에 필수 파일 존재
- 미완성 플레이스홀더 없음

---

## 명령어 참조

| 명령어 | 설명 |
|--------|------|
| `codesyncer init` | 프로젝트 초기화 |
| `codesyncer update` | 템플릿 업데이트/동기화 |
| `codesyncer validate` | 설정 검증 |
| `codesyncer watch` | 실시간 모니터링 |
| `codesyncer add-repo` | 워크스페이스에 새 레포 추가 |

---

## 지원 모노레포 도구

- ✅ Turborepo (`turbo.json`)
- ✅ pnpm (`pnpm-workspace.yaml`)
- ✅ Nx (`nx.json`)
- ✅ Lerna (`lerna.json`)
- ✅ npm/Yarn workspaces
- ✅ Rush (`rush.json`)

---

[← README로 돌아가기](../../README.ko.md)
