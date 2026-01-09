# MASTER_CODESYNCER.md - CodeSyncer

> **Powered by CodeSyncer** - AI 협업 시스템
> **모드**: 단일 레포지토리

## 📋 프로젝트 정보

- **프로젝트명**: CodeSyncer
- **GitHub**: https://github.com/bitjaru/codesyncer
- **버전**: 2.7.1
- **생성일**: 2026-01-09

## 🗂️ 레포지토리 구조

### 단일 레포지토리
```
codesyncer/
├── CLAUDE.md              # 루트 진입점
├── .claude/               # 상세 문서
│   ├── CLAUDE.md          # 코딩 규칙
│   ├── ARCHITECTURE.md    # 프로젝트 구조
│   ├── COMMENT_GUIDE.md   # 주석 가이드
│   └── DECISIONS.md       # 결정 로그
└── .codesyncer/
    └── MASTER_CODESYNCER.md  # 이 파일
```

## 🔗 문서 링크

| 문서 | 경로 | 설명 |
|------|------|------|
| 코딩 규칙 | `.claude/CLAUDE.md` | 프로젝트 규칙 및 가이드라인 |
| 프로젝트 구조 | `.claude/ARCHITECTURE.md` | 폴더 구조 및 통계 |
| 주석 가이드 | `.claude/COMMENT_GUIDE.md` | @codesyncer-* 태그 사용법 |
| 결정 로그 | `.claude/DECISIONS.md` | 의사결정 기록 |

## 🚀 빠른 시작

```bash
# 설정 검증
codesyncer validate

# 문서 업데이트
codesyncer update

# 파일 감시 시작
codesyncer watch
```

---

**버전**: 2.7.1
**마지막 업데이트**: 2026-01-09
**Powered by**: CodeSyncer
