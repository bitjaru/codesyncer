# 고급 사용법

> 파워 유저 기능 및 커스터마이징

한국어 | [English](../ADVANCED.md)

---

## Watch 모드

태그된 변경을 실시간 모니터링:

```bash
codesyncer watch         # 모니터링 시작
codesyncer watch --log   # 파일 로깅 포함
```

**출력:**
```
[14:32:10] 📝 변경됨: src/utils/api.ts
           └── 🎯 발견: @codesyncer-decision
               "SWR 대신 React Query 사용"
           └── ✅ DECISIONS.md에 추가됨
```

---

## 자동 의논 시스템

중요한 키워드 감지 시 AI가 자동으로 일시 정지:

### 필수 의논 키워드

| 카테고리 | 키워드 |
|----------|--------|
| **💰 결제** | 결제, 구매, 입금, 환불, 구독, 과금 |
| **🔐 보안** | 인증, 로그인, 권한, 암호화, 토큰, jwt |
| **🗑️ 데이터** | 삭제, 제거, 마이그레이션, 스키마 변경 |
| **📜 개인정보** | 개인정보, GDPR, 약관, 정책 |

### 작동 방식

1. AI가 키워드 감지 (예: "결제")
2. **자동으로 일시 정지**
3. 추천안 + 대안 제시
4. 사용자 결정 대기
5. `DECISIONS.md` + 코드 주석에 기록
6. 작업 재개

### 커스텀 키워드

```bash
codesyncer init --mode expert
```

중요도와 함께 커스텀 키워드 추가 가능.

---

## 컨텍스트 최적화

### 서브폴더별 CLAUDE.md

대규모 프로젝트에서는 특정 폴더에 CLAUDE.md 추가:

```
project/
├── CLAUDE.md                    # 전체 규칙
├── src/
│   ├── payment/
│   │   └── CLAUDE.md            # 결제 관련 규칙
│   └── auth/
│       └── CLAUDE.md            # 인증 관련 규칙
```

**템플릿**: `src/templates/subfolder-claude.md`

### Do Not Touch 영역

```markdown
## 🚫 Do Not Touch
- `src/generated/` - 자동 생성 파일
- `src/legacy/` - 마이그레이션 전까지 수정 금지
- `.env*` - 환경 변수
```

---

## 멀티 레포 작업 추적

### Git 브랜치 = 작업 ID

```
feature/AUTH-001-login
fix/PAY-002-webhook
```

### 크로스 레포 태그

```typescript
// frontend 레포
// @codesyncer-work:AUTH-001 로그인 폼

// backend 레포
// @codesyncer-work:AUTH-001 로그인 API
```

레포 전체 검색:
```bash
grep -r "@codesyncer-work:AUTH-001" ../
```

---

## 기술 스택 자동 감지

CodeSyncer가 감지하는 것:

| 스택 | 감지 방법 |
|------|-----------|
| Java (Spring Boot) | `pom.xml`, `build.gradle` |
| Python (Django, FastAPI) | `requirements.txt`, `pyproject.toml` |
| TypeScript/JavaScript | `package.json` |
| React/Next.js | `package.json` 의존성 |
| Node.js/Express | `package.json` 의존성 |
| React Native | `package.json` 의존성 |

---

## 환경 변수

환경 변수 불필요. CodeSyncer는 순수 로컬 도구입니다.

---

## 워크플로우 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│  1. 설정 (최초 1회)                                          │
│     $ codesyncer init                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. AI 학습 (세션마다 1회)                                   │
│     "CLAUDE.md 읽어줘"                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. 코딩 (watch 모드와 함께)                                 │
│     $ codesyncer watch                                      │
│     → 태그 자동 추가                                         │
│     → 누락 시 Watch가 알림                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. 다음 세션                                                │
│     Claude가 코드 읽음 → 태그 확인                           │
│     → 맥락 복구 완료!                                        │
└─────────────────────────────────────────────────────────────┘
```

---

[← README로 돌아가기](../../README.ko.md)
