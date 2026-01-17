# CLAUDE.md - CodeSyncer 코딩 가이드 v3.0

> **Powered by CodeSyncer** - AI 협업 시스템

## 🚀 빠른 시작

### 이 문서를 AI에게 읽게 하세요
```
"CLAUDE.md 읽어줘"
```
→ AI가 자동으로 이 프로젝트의 규칙을 적용합니다.

---

## 🏗️ 프로젝트 정보
- **프로젝트명**: CodeSyncer
- **프로젝트 타입**: CLI Tool (Node.js)
- **기술 스택**: TypeScript, Node.js, Commander.js, Chalk, Inquirer, Chokidar, Jest
- **생성일**: 2026-01-09
- **버전**: 3.0.0

## 📁 프로젝트 구조
자세한 구조는 `.claude/ARCHITECTURE.md` 참조

## 🚨 절대 규칙
1. **TypeScript strict mode** 사용
2. **함수형 프로그래밍** 우선
3. **명시적 타입 정의** 필수
4. **모든 함수/컴포넌트에 주석** 작성
5. **에러 핸들링** 필수 (CodeSyncerError 클래스 사용)
6. **한국어/영어 이중 지원** 유지

## 🔴 추론 금지 영역 (반드시 사용자에게 확인)

다음은 **절대 추론하지 말고** 사용자에게 물어보세요:

- 💰 비즈니스 로직 수치 (가격, 수수료, 한도, 할인율)
- 🔌 API 엔드포인트 URL
- 🔐 보안 설정 (토큰 만료 시간, 암호화 방식)
- 🗄️ 데이터베이스 스키마
- 🌐 외부 서비스 연동 정보 (npm registry 등)

## 🤝 의논 필수 키워드

다음 키워드 감지 시 **자동으로 작업 중단** 후 사용자와 의논:

### 🔴 CRITICAL (항상 중단)
- 💰 결제/과금: npm publish, 버전 배포
- 🔐 보안: 경로 탐색, 파일 시스템 접근, 사용자 입력 검증
- 🗑️ 데이터 삭제: 파일 삭제, 설정 초기화

### 🟡 IMPORTANT (권장 중단)
- 🔌 외부 API: npm registry, GitHub API
- 📦 새 의존성: 패키지 추가/제거
- 🚀 배포: npm publish, 버전 업데이트

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

---

## 📋 CLI 도구 개발 가이드

### 명령어 구조
```
src/commands/
├── init.ts      # 초기화 명령어
├── update.ts    # 업데이트 명령어
├── watch.ts     # 파일 감시 명령어
├── validate.ts  # 설정 검증 명령어
└── add-repo.ts  # 레포 추가 명령어
```

### 새 명령어 추가 시
1. `src/commands/[name].ts` 생성
2. `src/index.ts`에 등록
3. 한국어/영어 메시지 지원
4. 에러 핸들링 필수

### 유틸리티
```
src/utils/
├── errors.ts        # CodeSyncerError 클래스
├── security.ts      # 경로 검증, 입력 sanitization
├── language.ts      # 언어 감지
├── tag-parser.ts    # @codesyncer-* 태그 파싱
├── watcher.ts       # 파일 감시
└── ...
```

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
6. 테스트 작성/실행
   ↓
7. 완료 보고
```

---

## 📚 관련 문서

- **주석 가이드**: `.claude/COMMENT_GUIDE.md`
- **프로젝트 구조**: `.claude/ARCHITECTURE.md`
- **의논 기록**: `.claude/DECISIONS.md`

---

**버전**: 3.0.0 (Powered by CodeSyncer)
**생성일**: 2026-01-09
**AI 도구**: Claude Code 지원 | 향후: Cursor, GitHub Copilot

---

*이 협업 시스템은 오픈소스입니다. 개선 아이디어는 [CodeSyncer GitHub](https://github.com/bitjaru/codesyncer)에서 제안해주세요!*
