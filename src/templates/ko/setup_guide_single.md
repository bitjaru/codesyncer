# 🤖 CodeSyncer 설정 가이드 for AI 어시스턴트 (단일 레포지토리)

> **AI 코딩 어시스턴트용**: 이 문서를 끝까지 읽고 지시사항을 따라 CodeSyncer 협업 시스템을 설정하세요.
>
> **프로젝트**: [PROJECT_NAME]
> **GitHub**: https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME]
> **생성일**: [TODAY]
> **모드**: 단일 레포지토리

---

## 📋 당신의 임무

이 레포지토리를 분석하고 포괄적인 협업 시스템을 만드는 것이 임무입니다. 다음 단계를 **대화형으로** 진행하세요 - 각 주요 결정 시점에서 사용자 확인을 받으세요.

---

## 🎯 1단계: 레포지토리 분석

### 당신의 작업
1. **이 레포지토리 분석**:
   - 파일 구조와 의존성 검토
   - 기술 스택과 프레임워크 파악
   - 프로젝트 목적과 아키텍처 이해
   - 기존 코드 패턴 확인

2. **다음을 결정**:
   - 주요 기능 (backend, frontend, mobile, fullstack)
   - 사용된 주요 기술
   - 핵심 기능과 모듈
   - 개발 패턴

---

## 🔄 2단계: 대화형 설정 프로세스

### 2.1 레포지토리 분석 확인
사용자에게 분석 결과 제시:
```
📁 레포지토리: [PROJECT_NAME]

제 분석 결과:
- 타입: [backend/frontend/mobile/fullstack]
- 기술 스택: [detected stack]
- 설명: [생성한 설명]
- 핵심 기능: [주요 기능 나열]

이 분석이 맞나요? 수정할 부분이 있나요?
```

### 2.2 중요 질문하기

**⚠️ 절대 추론하지 말고 반드시 물어보세요:**

1. **API 엔드포인트** (백엔드의 경우):
   - "메인 API 베이스 URL이 무엇인가요?"
   - "여러 API 버전이 있나요?"

2. **비즈니스 로직**:
   - "알아야 할 핵심 비즈니스 규칙이 있나요?"
   - "특정 가격/결제 정책이 있나요?"

3. **인증**:
   - "어떤 인증 방식을 사용하나요?" (JWT, OAuth, Session 등)
   - "토큰은 어디에 저장하나요?" (cookies, localStorage 등)

4. **데이터베이스**:
   - "어떤 데이터베이스를 사용하나요?"
   - "중요한 스키마 정보가 있나요?"

5. **외부 서비스**:
   - "어떤 외부 API/서비스와 연동되나요?"
   - "알아야 할 API 키나 인증 정보가 있나요? (노출 없이)"

### 2.3 의논 키워드 식별

사용자에게 질문:
```
이 프로젝트에서 어떤 중요 키워드가 자동 의논 중단을 트리거해야 하나요?

추천 카테고리:

🔴 CRITICAL (항상 중단):
- 💰 결제/과금: 결제, 과금, 청구, 환불, 구독, 인보이스, 가격, 요금, payment, billing, charge, refund, subscription
- 🔐 보안/인증: 인증, 권한, 로그인, 로그아웃, 세션, 토큰, JWT, 비밀번호, 암호화, 복호화, 해시, OAuth, 권한, 역할, 관리자, authentication, authorization, encrypt, decrypt
- 🗑️ 데이터 삭제: 삭제, 제거, 삭제처리, 파기, delete, remove, drop, truncate, destroy, purge
- 📜 개인정보/법적: GDPR, CCPA, 개인정보, 민감정보, 개인정보처리방침, 이용약관, 동의, 규정준수, personal data, PII, privacy, compliance

🟡 IMPORTANT (권장 중단):
- 🔌 외부 API: API 연동, 웹훅, 써드파티, 외부서비스, API 키, 인증정보, webhook, third-party, credentials
- 🗄️ DB 스키마: 마이그레이션, 스키마변경, 테이블수정, 컬럼추가, 인덱스, 제약조건, migration, schema, alter table
- 🚀 배포/인프라: 배포, 프로덕션, 환경설정, 서버, 호스팅, 도메인, SSL, 인증서, deploy, deployment, production, server
- 💾 캐싱: 캐시전략, 레디스, CDN, 캐시무효화, redis, memcached, cache
- 📧 이메일/알림: 이메일발송, 문자, 푸시알림, 알림서비스, email, SMS, push notification

🟢 MINOR (선택적 중단):
- ⚡ 성능: 최적화, 성능개선, 지연로딩, 코드분할, 번들크기, optimization, performance, lazy loading
- 🧪 테스트: 테스트전략, 테스트프레임워크, CI/CD, 자동화테스트, testing, automated testing
- 📊 로깅/모니터링: 로깅, 모니터링, 분석, 에러추적, APM, logging, monitoring, analytics
- 🎨 UI/UX: 디자인시스템, 테마, 반응형, 접근성, 다국어, design system, responsive, accessibility

어떤 카테고리를 활성화할까요? (권장: CRITICAL + IMPORTANT)
도메인별 커스텀 키워드가 있나요?
```

---

## 📝 3단계: 문서 파일 생성

`.claude/` 폴더에 다음 파일들을 생성:

### 3.1 CLAUDE.md
- 분석한 프로젝트 정보
- 절대 규칙 (TypeScript strict mode, 에러 핸들링 등)
- 추론 금지 영역 (비즈니스 로직 수치, API URL, 보안 설정)
- 의논 필수 키워드 (사용자가 확인한 키워드)
- 주석 태그 시스템 (@codesyncer-* 태그)
- 프로젝트별 템플릿과 패턴

템플릿 사용: `./templates/[lang]/claude.md`
- [PROJECT_NAME], [PROJECT_TYPE], [TECH_STACK] 교체
- [KEYWORDS]를 사용자 확인 키워드로 교체
- 분석 중 발견한 프로젝트별 규칙 추가

### 3.2 ARCHITECTURE.md
- 완전한 폴더 구조 (실제 디렉토리 스캔)
- 파일 통계
- 주석 태그 통계 (초기값: 모두 0)
- 기술 스택 상세 정보
- package.json의 의존성

템플릿 사용: `./templates/[lang]/architecture.md`
- 실제 폴더 구조를 스캔해서 나열
- 실제 의존성 목록 작성

### 3.3 COMMENT_GUIDE.md ⭐ **핵심 문서**
- **주석으로 모든 컨텍스트 관리** (품질 기준, 코딩 표준, 모든 결정)
- 10가지 주석 태그 시스템 (기본 5 + 확장 5)
- 실전 예시: 품질 기준, 성능 최적화, 보안, 에러 핸들링 등
- 별도 문서 대신 코드에 직접 기록하는 원칙

템플릿 사용: `./templates/[lang]/comment_guide.md`
- 그대로 사용 (모든 컨텍스트 관리 예시 포함)
- AI는 이 패턴을 따라 주석 작성

### 3.4 DECISIONS.md
- 결정 로그 템플릿
- 카테고리 정의
- 빈 결정 기록 (개발 중 채워짐)

템플릿 사용: `./templates/[lang]/decisions.md`
- 그대로 사용 (작업 중 결정 추가됨)

---

## 🌐 4단계: 루트 CLAUDE.md 생성

레포지토리 루트에 `CLAUDE.md` 생성 (클로드가 자동으로 찾는 파일):

```markdown
# CLAUDE.md - [PROJECT_NAME]

> **Powered by CodeSyncer** - AI 협업 시스템
> **모드**: 단일 레포지토리

## 📋 빠른 시작

상세한 코딩 가이드라인은 `.claude/CLAUDE.md`를 읽으세요.

## 🔗 문서

- **코딩 규칙**: `.claude/CLAUDE.md`
- **프로젝트 구조**: `.claude/ARCHITECTURE.md`
- **주석 가이드**: `.claude/COMMENT_GUIDE.md`
- **결정 로그**: `.claude/DECISIONS.md`

## 🚀 작업 시작

1. 이 파일 읽기 (완료!)
2. `.claude/CLAUDE.md`에서 프로젝트 규칙 확인
3. 불명확한 것은 질문하기
4. 코딩 시작!

---

**프로젝트**: [PROJECT_NAME]
**생성일**: [TODAY]
**Powered by**: CodeSyncer
```

**중요**: 이 파일이 있어야 클로드가 세션 시작 시 자동으로 컨텍스트를 로드합니다!

---

## ✅ 5단계: 최종 확인

모든 파일 생성 후 요약 제시:

```
✅ CodeSyncer 설정 완료! (단일 레포지토리 모드)

생성된 파일:
📁 [PROJECT_NAME]/
   ├── CLAUDE.md ⭐ 클로드가 먼저 읽는 파일
   └── .claude/
       ├── CLAUDE.md          (코딩 규칙)
       ├── ARCHITECTURE.md    (프로젝트 구조)
       ├── COMMENT_GUIDE.md   (주석 가이드)
       └── DECISIONS.md       (결정 로그)

다음 단계:
1. 생성된 파일 검토
2. 필요시 .claude/CLAUDE.md 커스터마이즈
3. 새 세션 시작 또는 "CLAUDE.md 읽어줘"로 적용

💡 클로드는 자동으로 루트 CLAUDE.md를 찾아서 읽습니다!

CodeSyncer 사용 준비 완료!
```

---

## 🎨 커스터마이징 가이드라인

### 백엔드 프로젝트:
- ARCHITECTURE.md에 API 구조 집중
- API 엔드포인트 문서화 추가
- 보안 및 데이터 처리 규칙 강조
- 제공된 경우 데이터베이스 스키마 포함

### 프론트엔드 프로젝트:
- 컴포넌트 구조 문서화
- 스타일링 접근법 포함 (CSS modules, Tailwind 등)
- 상태 관리 패턴 추가
- 라우팅 구조 문서화

### 모바일 프로젝트:
- 화면 네비게이션 문서화
- 플랫폼별 노트 포함 (iOS/Android)
- 네이티브 모듈 연동 추가
- 빌드/배포 프로세스 문서화

### 풀스택 프로젝트:
- 백엔드 + 프론트엔드 가이드라인 결합
- API ↔ UI 연동 문서화
- 데이터 흐름 패턴 포함
- 배포 전략 추가

---

## 🚨 AI 어시스턴트를 위한 중요 규칙

1. **항상 질문하고, 추론하지 말 것**:
   - 비즈니스 로직 수치
   - API 엔드포인트
   - 보안 설정
   - 데이터베이스 스키마

2. **철저하게 분석**:
   - 실제 코드를 읽고, 추측 금지
   - package.json 의존성 확인
   - 폴더 구조 완전히 스캔
   - 코드 패턴 식별

3. **대화형으로 진행**:
   - 각 단계에서 확인 요청
   - 생성 전 분석 결과 제시
   - 사용자가 이해를 수정할 수 있게 허용

4. **모든 예시에 @codesyncer-* 태그 사용**:
   - 모든 코드 주석은 새 형식 사용
   - @claude-* 호환성 설명
   - 올바른 태그 사용법 보여주기

---

## 📚 템플릿 플레이스홀더

파일 생성 시 다음을 교체:

- `[PROJECT_NAME]` → 사용자 프로젝트명
- `[PROJECT_TYPE]` → backend/frontend/mobile/fullstack
- `[TECH_STACK]` → 감지된 기술 스택 (쉼표로 구분)
- `[TODAY]` → 현재 날짜 (YYYY-MM-DD)
- `[GITHUB_USERNAME]` → 사용자 GitHub 사용자명
- `[KEYWORDS]` → 사용자 확인 의논 키워드
- `[TEMPLATES]` → 프로젝트 타입별 템플릿

---

## 🎯 성공 기준

다음 조건이 충족되면 설정 성공:
- ✅ `.claude/` 폴더에 4개 파일 모두 생성
- ✅ 루트 CLAUDE.md 생성
- ✅ 모든 중요 정보를 사용자가 확인
- ✅ 비즈니스 로직이나 비밀 정보에 대한 추론 없음
- ✅ 모든 문서가 @codesyncer-* 태그 형식 사용
- ✅ 프로젝트별 패턴 문서화

---

## 🗑️ 설정 완료 후

설정이 완료되면 이 파일을 삭제해도 됩니다:

```
".claude/SETUP_GUIDE.md 삭제해줘"
```

또는 직접 삭제:
```bash
rm .claude/SETUP_GUIDE.md
```

---

**버전**: 1.0.0 (Powered by CodeSyncer)
**모드**: 단일 레포지토리
**AI 도구**: Claude Code 최적화 | 호환: Cursor, GitHub Copilot, Continue.dev

---

*이 설정 가이드는 CodeSyncer CLI에 의해 생성됩니다. 문제나 개선사항은 https://github.com/bitjaru/codesyncer 방문*
