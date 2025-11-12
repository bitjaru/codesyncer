# 🤖 [PROJECT_NAME] 멀티 레포 자동 전환 시스템

> 기능 요청만 하면 AI 코딩 어시스턴트가 알아서 필요한 레포를 찾아가서 작업합니다.
>
> **Powered by CodeSyncer** - AI-agnostic multi-repository collaboration system

---

## 🎯 핵심 동작 원리

### 자동 레포 감지 및 전환
사용자가 기능을 요청하면 AI 어시스턴트가 자동으로:
1. 요청 분석 → 필요한 레포 파악
2. 해당 레포로 자동 이동
3. 각 레포의 CLAUDE.md 규칙 적용
4. 작업 수행

## 📁 프로젝트 레포 구성

| 레포 | 폴더명 | 역할 | 규칙 파일 위치 |
|------|--------|------|---------------|
[REPO_TABLE]

## 🧠 자동 레포 선택 규칙

### 키워드 기반 자동 판단
| 키워드 | 이동할 레포 | 자동 실행 명령 |
|--------|------------|---------------|
[KEYWORD_MAPPING]

### 작업 유형별 자동 판단
```javascript
function 레포_자동_선택(사용자_요청) {
  // API 수정 필요한가?
  if (요청.match(/API|데이터|서버|인증|DB/)) {
    작업_레포.push("백엔드 레포");
  }

  // UI 수정 필요한가?
  if (요청.match(/페이지|화면|버튼|폼|UI/)) {
    작업_레포.push("프론트 레포");
  }

  // 여러 레포 작업 필요한가?
  if (요청.includes("기능") && !특정_레포_명시) {
    // 백엔드 → 프론트 → 모바일 순서로
    return ["백엔드", "프론트", "모바일"];
  }

  return 작업_레포;
}
```

## 🔄 자동 전환 프로토콜

### 단일 레포 작업

```bash
User: "로그인 API 만들어줘"

AI 자동 동작:
1. 키워드 "API" 감지
2. cd [백엔드 폴더]
3. cat CLAUDE.md  # 백엔드 규칙 로드
4. [백엔드 규칙에 따라 API 생성]
5. "✅ [백엔드 레포]에 로그인 API 생성 완료"
```

### 멀티 레포 작업

```bash
User: "결제 기능 추가해줘"

AI 자동 동작:
1. "기능" 키워드 → 여러 레포 필요 판단
2. 작업 순서 결정:
   - 1단계: [백엔드] - API
   - 2단계: [프론트] - UI
   - 3단계: [모바일] - 앱화면

3. 순차 작업:
   cd [백엔드 폴더] && cat CLAUDE.md
   → 결제 API 생성

   cd ../[프론트 폴더] && cat CLAUDE.md
   → 결제 페이지 생성

   cd ../[모바일 폴더] && cat CLAUDE.md
   → 결제 화면 생성

4. "✅ 결제 기능 전체 구현 완료"
```

## ⚠️ 중요 규칙

### 레포 이동 시 반드시

1. 현재 위치 확인: `pwd`
2. 대상 레포로 이동: `cd ../[레포명]`
3. 규칙 파일 로드: `cat CLAUDE.md || cat .claude/CLAUDE.md`
4. 해당 규칙 적용 알림: "📁 [레포명] 규칙 적용됨"
5. 해당 레포 규칙으로 작업 수행

### 우선순위

1. 사용자가 명시한 레포 > 자동 판단
2. 각 레포의 CLAUDE.md > 이 마스터 문서
3. 백엔드 작업 > 프론트/모바일 작업 (순서)

## 🚀 사용법

### 세션 시작

```
"[PROJECT_NAME] 멀티 레포 모드 시작"
→ 이 문서 로드
→ 자동 전환 시스템 활성화
```

### 작업 요청 (사용자는 레포 몰라도 됨)

```
"사용자 관리 추가" → 자동으로 필요한 모든 레포 작업
"버그 수정" → 관련 레포 자동 탐색
"로그인 페이지만" → 프론트 레포만 작업
```

## 📊 작업 로그 형식

```yaml
요청: "[사용자 요청 내용]"
분석:
  필요_레포: [[레포1], [레포2]]
  작업_순서: [백엔드 → 프론트]
수행:
  [레포1]:
    이동: cd [폴더]
    규칙: CLAUDE.md 적용
    작업: [수행 내용]
    결과: ✅
  [레포2]:
    이동: cd [폴더]
    규칙: CLAUDE.md 적용
    작업: [수행 내용]
    결과: ✅
완료: "[요약]"
```

---

## 🏷️ 주석 태그 시스템

CodeSyncer는 두 가지 태그 형식을 모두 지원합니다:

- **`@codesyncer-*`** (권장): 새로운 표준, 모든 AI 도구 호환
- **`@claude-*`** (레거시): 기존 Claude Code 프로젝트 호환

### 사용 가능한 태그

```typescript
@codesyncer-rule        // 특별 규칙 (@claude-rule 호환)
@codesyncer-inference   // 추론 내용과 근거 (@claude-inference 호환)
@codesyncer-decision    // 의논 결정 사항 (@claude-decision 호환)
@codesyncer-todo        // 확인 필요 (@claude-todo 호환)
@codesyncer-context     // 비즈니스 맥락 (@claude-context 호환)
```

두 형식 모두 동일하게 작동하므로 편한 것을 사용하세요!

---

**GitHub**: https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME]
**버전**: 1.0.0 (Powered by CodeSyncer)
**생성일**: [TODAY]

---

*CodeSyncer - AI-powered multi-repository collaboration system*
*현재 지원: Claude Code | 향후 지원 예정: Cursor, GitHub Copilot, Continue.dev*
