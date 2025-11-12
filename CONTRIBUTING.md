# Contributing to CodeSyncer CLI

First off, thank you for considering contributing to CodeSyncer! 🎉

CodeSyncer는 커뮤니티 기여로 성장하는 오픈소스 프로젝트입니다. 모든 기여를 환영합니다!

## 📋 Code of Conduct

이 프로젝트는 [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md)를 따릅니다. 참여함으로써 여러분은 이 규칙을 준수하는 데 동의합니다.

## 🤝 기여 방법

### 버그 리포트 🐛

버그를 발견하셨나요? [Issue](https://github.com/bitjaru/codesyncer-cli/issues)를 열어주세요!

**좋은 버그 리포트에 포함될 내용:**
- 명확하고 구체적인 제목
- 버그 재현 단계
- 예상 동작 vs 실제 동작
- 스크린샷 (가능하면)
- 환경 정보 (OS, Node 버전, npm 버전)

### 기능 제안 💡

새로운 기능 아이디어가 있으신가요? [Issue](https://github.com/bitjaru/codesyncer-cli/issues)를 열어주세요!

**좋은 기능 제안에 포함될 내용:**
- 기능이 해결하는 문제
- 제안하는 해결 방법
- 대안들
- 사용 예시

### Pull Request 제출 🚀

1. **Fork** 레포지토리
2. **Clone** 본인의 fork
   ```bash
   git clone https://github.com/bitjaru/codesyncer-cli.git
   cd codesyncer-cli
   ```
3. **Branch** 생성
   ```bash
   git checkout -b feature/amazing-feature
   # 또는
   git checkout -b fix/bug-fix
   ```
4. **개발 환경** 설정
   ```bash
   npm install
   npm run build
   npm link  # 로컬 테스트용
   ```
5. **변경사항** 작성
   - 코드 스타일 준수
   - 타입 정의 추가 (TypeScript)
   - 주석 작성
6. **테스트**
   ```bash
   npm run build
   codesyncer --version
   ```
7. **Commit**
   ```bash
   git add .
   git commit -m "feat: Add amazing feature"
   ```

   **Commit 메시지 규칙:**
   - `feat:` 새 기능
   - `fix:` 버그 수정
   - `docs:` 문서 변경
   - `style:` 코드 포맷팅
   - `refactor:` 리팩토링
   - `test:` 테스트 추가
   - `chore:` 빌드, 설정 변경

8. **Push**
   ```bash
   git push origin feature/amazing-feature
   ```
9. **Pull Request** 생성
   - GitHub에서 본인의 fork로 이동
   - "Compare & pull request" 클릭
   - 변경사항 설명 작성

## 🎯 우선순위 높은 기여 분야

### 🔥 가장 필요한 것들

1. **AI 도구 지원 추가**
   - Cursor 지원
   - GitHub Copilot 지원
   - Continue.dev 지원
   - Codeium 지원

2. **다국어 지원**
   - 일본어 번역
   - 중국어 번역
   - 스페인어 번역

3. **기술 스택 템플릿**
   - Go 언어 지원
   - Rust 언어 지원
   - Ruby on Rails 지원
   - PHP/Laravel 지원

4. **문서 개선**
   - 튜토리얼 영상
   - 상세 가이드
   - 예제 프로젝트

### 🌟 환영하는 기여

- 버그 수정
- 성능 개선
- 문서 오타 수정
- 코드 리팩토링
- 테스트 추가

## 📝 코딩 스타일

### TypeScript

```typescript
// ✅ Good
export async function generateMasterDoc(config: MasterDocConfig): Promise<string> {
  // 명확한 타입 정의
  const template = await loadTemplate('master', config.language);
  return replaceTemplateVars(template, vars);
}

// ❌ Bad
export async function generateMasterDoc(config: any) {
  const template = await loadTemplate('master', config.language);
  return replaceTemplateVars(template, vars);
}
```

### 주석

```typescript
/**
 * Load template file from templates directory
 *
 * @param templateName - Name of the template (without .md extension)
 * @param lang - Language code (ko or en)
 * @returns Template content as string
 */
export async function loadTemplate(templateName: string, lang: Language): Promise<string> {
  // ...
}
```

### 파일 구조

```
src/
├── commands/      # CLI 명령어
├── constants/     # 상수 정의
├── templates/     # 템플릿 파일
├── utils/         # 유틸리티 함수
└── types.ts       # 타입 정의
```

## 🧪 테스트

현재 테스트 프레임워크를 설정 중입니다. 기여하실 수 있습니다!

```bash
npm test
```

## 📦 빌드

```bash
npm run build
```

## 🚀 릴리즈 프로세스

메인테이너만 실행합니다:

1. 버전 업데이트
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```
2. CHANGELOG.md 업데이트
3. npm 배포
   ```bash
   npm publish
   ```

## 💬 질문이 있으신가요?

- [GitHub Discussions](https://github.com/bitjaru/codesyncer-cli/discussions)
- [Issue 생성](https://github.com/bitjaru/codesyncer-cli/issues)

## 🙏 감사합니다!

여러분의 기여가 CodeSyncer를 더 나은 도구로 만듭니다. 🎉

---

**Remember:**
- 즐겁게 코딩하세요! 😊
- 질문을 두려워하지 마세요
- 작은 기여도 큰 도움이 됩니다
