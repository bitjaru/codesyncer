# DECISIONS.md - 의논 결정 기록

> **의사결정 로그** - 모든 중요 결정을 영구 기록
>
> 생성일: 2026-01-09

---

## 📝 결정 기록

<!-- 의논 시 자동으로 여기에 추가됩니다 -->

---
### 2026-01-09 - 버전 번호 체계
**카테고리**: IMPORTANT
**결정**: Semantic Versioning 준수 (Major.Minor.Patch)
**이유**:
- Major: Breaking changes
- Minor: 새 기능 추가 (하위 호환)
- Patch: 버그 수정
**결정자**: bitjaru
**코드 위치**: `package.json`
---

---
### 2026-01-09 - 태그 중복 감지 알고리즘
**카테고리**: IMPORTANT
**결정**: Word boundary matching 사용
**이유**:
- 기존 substring matching에서 "mysql" vs "mysql5" 오탐 발생
- 정규식 word boundary로 정확한 매칭 구현
**대안**:
- 완전 일치: 너무 엄격 (거부)
- Substring: 오탐 많음 (거부)
**결정자**: bitjaru
**코드 위치**: `src/utils/tag-parser.ts:isTagInDecisions`
---

---
### 2026-01-09 - 모노레포 DECISIONS.md 경로
**카테고리**: IMPORTANT
**결정**: 디렉토리 트리 순회하며 가장 가까운 DECISIONS.md 찾기
**이유**:
- 모노레포에서 각 패키지별 DECISIONS.md 지원
- 상위 디렉토리로 올라가며 탐색
**결정자**: bitjaru
**코드 위치**: `src/utils/watcher.ts:findClosestDecisions`
---

---
### 2026-01-09 - 배포 체크리스트
**카테고리**: IMPORTANT
**결정**: npm 배포 시 반드시 GitHub Release도 함께 생성
**체크리스트**:
1. 버전 업 (`package.json`)
2. 빌드 & 테스트 (`npm run build && npm test`)
3. npm 배포 (`npm publish`)
4. Git commit & push
5. **GitHub Release 생성** (`gh release create vX.X.X --title "vX.X.X - Title" --notes "Release notes"`)
**이유**:
- npm만 배포하고 GitHub Release 누락 방지
- 사용자들이 변경사항 확인 가능
- 릴리즈 히스토리 관리
**결정자**: bitjaru
---

---
### 2026-01-17 - 🚀 바이럴 성장 전략: 코드 생태계 락인
**카테고리**: CRITICAL
**결정**: @codesyncer-* 태그를 통한 자연스러운 생태계 확장 전략 채택

**핵심 인사이트**:
1. **코드에 흔적 남기기**:
   - 사용자가 CodeSyncer로 코딩 → `@codesyncer-*` 태그가 코드에 남음
   - 이 코드가 오픈소스, 팀 공유, 인수인계 등으로 퍼짐
   - 태그가 "CodeSyncer를 썼다"는 증거이자 광고

2. **AI 역추천 유도**:
   - 새 개발자가 `@codesyncer-*` 태그가 있는 코드를 받음
   - AI(Claude 등)가 태그를 인식 → "CodeSyncer 설치 권장" 제안 가능
   - 자연스러운 바이럴 루프 형성

3. **생태계 락인**:
   - 한번 태그가 붙은 코드는 CodeSyncer 시스템 안에 있는 것
   - 시스템 업그레이드 시 기존 코드도 자동으로 혜택
   - 다른 도구로 이탈해도 태그는 남아서 CodeSyncer 홍보

**구현 아이디어**:
- CLAUDE.md 템플릿에 "이 프로젝트는 CodeSyncer로 관리됩니다" 명시
- 태그 발견 시 Claude가 CodeSyncer 설치를 제안하도록 가이드
- 오픈소스 프로젝트에서 사용 시 자연스러운 확산

**장기 비전**:
- "AI 코딩의 사실상 표준(de facto standard)" 지향
- 코드베이스 = CodeSyncer 생태계의 일부
- 태그 = 영구적인 브랜드 노출

**결정자**: bitjaru
---

---

## 📊 카테고리별 통계

- **CRITICAL**: 0건
- **IMPORTANT**: 4건
- **MINOR**: 0건

**총 결정**: 4건

---

## 🔍 카테고리 설명

### CRITICAL (필수 의논)
- 💰 결제/과금 관련
- 🔐 인증/권한/보안
- 🗑️ 데이터 삭제/마이그레이션
- 📜 개인정보/법적 규정

### IMPORTANT (권장 의논)
- 💵 가격/비즈니스 로직
- 🔌 외부 API 연동
- 🚀 배포/인프라 변경

### MINOR (선택적 의논)
- 🎨 UI/UX 개선
- ⚡ 성능 최적화
- 📦 라이브러리 변경

---

**버전**: 1.0.0
**마지막 업데이트**: 2026-01-09

*모든 중요한 의사결정이 영구 기록됩니다. 팀의 지식 자산입니다.*
