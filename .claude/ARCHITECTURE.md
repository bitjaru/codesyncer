# ARCHITECTURE.md

> **자동 생성 문서** - 프로젝트 구조 및 통계
>
> 생성일: 2026-01-09

---

## 📁 프로젝트 구조

```
codesyncer/
├── src/
│   ├── commands/
│   │   ├── init.ts          # 초기화 명령어
│   │   ├── update.ts        # 업데이트 명령어
│   │   ├── watch.ts         # 파일 감시 명령어
│   │   ├── validate.ts      # 설정 검증 명령어
│   │   └── add-repo.ts      # 레포 추가 명령어
│   ├── utils/
│   │   ├── errors.ts        # 에러 핸들링 (CodeSyncerError)
│   │   ├── security.ts      # 보안 유틸리티 (경로 검증)
│   │   ├── language.ts      # 언어 감지
│   │   ├── tag-parser.ts    # @codesyncer-* 태그 파싱
│   │   ├── watcher.ts       # 파일 감시 (Chokidar)
│   │   ├── watch-logger.ts  # 로깅 유틸리티
│   │   ├── scanner.ts       # 레포지토리 스캔
│   │   ├── template-loader.ts # 템플릿 로드
│   │   ├── messages.ts      # 다국어 메시지
│   │   ├── progress.ts      # 진행률 표시
│   │   ├── git-helpers.ts   # Git 유틸리티
│   │   ├── setup-state.ts   # 설정 상태 관리
│   │   └── monorepo-helpers.ts # 모노레포 유틸리티
│   ├── constants/
│   │   └── keywords.ts      # 의논 키워드 정의
│   ├── init/
│   │   ├── types.ts         # 초기화 타입
│   │   └── steps/
│   │       └── language.ts  # 언어 선택 단계
│   ├── templates/
│   │   ├── en/              # 영문 템플릿
│   │   └── ko/              # 한글 템플릿
│   ├── __tests__/
│   │   ├── setup.ts
│   │   ├── errors.test.ts
│   │   ├── security.test.ts
│   │   ├── language.test.ts
│   │   └── tag-parser.test.ts
│   ├── types.ts             # 공통 타입
│   └── index.ts             # CLI 진입점
├── bin/
│   └── codesyncer.js        # 실행 파일
├── dist/                    # 빌드 결과물
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 📊 프로젝트 통계

- **총 파일**: 28개 (TypeScript)
- **총 라인**: ~5,988줄
- **테스트**: 71개
- **테스트 파일**: 4개

---

## 🔍 주석 태그 통계

- `@codesyncer-inference`: 0개
- `@codesyncer-decision`: 0개
- `@codesyncer-todo`: 0개
- `@codesyncer-rule`: 0개
- `@codesyncer-context`: 0개

**레거시 태그 (`@claude-*`)**: 0개

---

## 📦 Dependencies

### Production
```json
{
  "chalk": "^4.1.2",
  "chokidar": "^3.6.0",
  "commander": "^11.1.0",
  "fs-extra": "^11.2.0",
  "inquirer": "^8.2.6",
  "js-yaml": "^4.1.1",
  "ora": "^5.4.1"
}
```

### Development
```json
{
  "@types/fs-extra": "^11.0.4",
  "@types/inquirer": "^9.0.7",
  "@types/jest": "^29.5.11",
  "@types/js-yaml": "^4.0.9",
  "@types/node": "^20.10.0",
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "typescript": "^5.3.2"
}
```

---

## 🎨 기술 스택

- **언어**: TypeScript (strict mode)
- **런타임**: Node.js >= 14.0.0
- **CLI 프레임워크**: Commander.js
- **터미널 UI**: Chalk, Ora, Inquirer
- **파일 감시**: Chokidar
- **테스팅**: Jest, ts-jest

---

## 🔄 업데이트 히스토리

### 2026-01-09
- v2.7.1 배포
- validate 명령어 추가
- 보안 유틸리티 추가
- 71개 테스트 추가

---

*이 문서는 CodeSyncer에 의해 자동 생성 및 관리됩니다.*
