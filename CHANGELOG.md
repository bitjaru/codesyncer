# Changelog

All notable changes to CodeSyncer will be documented in this file.

## [2.5.0] - 2025-12-15

### Added

#### UX Improvements
- **Progress Visualization**: `init` command now shows real-time progress bar with step indicators
  ```
  [████████████░░░░░░░░] 60%
  ✓ 언어 선택 → ✓ 프로젝트 정보 → ✓ 스캔 → ● 레포 선택 → ○ 파일 생성
  ```

- **GitHub Auto-Detection**: Automatically detects GitHub username and repository name from `.git/config`
  - Supports GitHub, GitLab, Bitbucket remote URLs
  - Pre-fills project name and username fields

- **Setup Recovery**: Interrupted setup can now be resumed
  - Saves progress to `.codesyncer/.setup-state.json`
  - Prompts to resume previous setup on next `init`

- **Dry Run Mode**: `update --dry-run` flag to preview changes without modifying files
  ```bash
  codesyncer update --dry-run
  ```

#### CLI Improvements
- **Enhanced `--version` output**: Now shows Node.js version, platform, and supported AI tools
  ```
  CodeSyncer v2.5.0
  Node.js:  v20.18.1
  Platform: darwin arm64
  Supported AI Tools:
    ✓ Claude Code
    ○ Cursor (coming soon)
  ```

### Changed
- Refactored duplicate `getMonorepoToolName()` into shared `utils/monorepo-helpers.ts`

### Technical
- New utilities:
  - `src/utils/progress.ts` - Progress bar visualization
  - `src/utils/git-helpers.ts` - Git remote URL parsing
  - `src/utils/setup-state.ts` - Setup state persistence
  - `src/utils/monorepo-helpers.ts` - Shared monorepo utilities

---

## [2.4.0] - 2025-12-11

### Added

#### Monorepo Support (Major Feature)
- **Auto-detection** of monorepo configurations:
  - Turborepo (`turbo.json`)
  - pnpm (`pnpm-workspace.yaml`)
  - Nx (`nx.json`)
  - Lerna (`lerna.json`)
  - Rush (`rush.json`)
  - npm/Yarn workspaces (`package.json` with `workspaces` field)

- **Package scanning**: Automatically discovers all packages within workspace patterns (e.g., `packages/*`, `apps/*`, `libs/*`)

- **Monorepo-specific templates**: New `setup_guide_monorepo.md` template in English and Korean with:
  - Package dependency documentation
  - Inter-package import patterns
  - Build order documentation
  - Cross-package workflow examples

#### Technical Improvements
- New types: `WorkspaceMode`, `MonorepoTool`, `MonorepoInfo`
- New scanner functions: `detectMonorepo()`, `scanMonorepoPackages()`
- Updated `isCurrentDirRepository()` to properly distinguish monorepos from single repos
- Added `js-yaml` dependency for parsing `pnpm-workspace.yaml`

### Changed
- `codesyncer init` now has three modes: Single Repo, Monorepo, Multi-Repo
- `codesyncer update` properly scans monorepo packages
- README.md and README.ko.md updated with monorepo documentation

### Fixed
- Monorepos with root `package.json` are no longer incorrectly detected as single repos

---

## [2.3.1] - 2024-12-XX

### Added
- Single repository mode support
- Improved update command UX with English messages

### Fixed
- Hard update mode now performs deep scan and content review

---

## [2.3.0] - 2024-XX-XX

### Added
- Initial multi-repository support
- Comment tag system (`@codesyncer-*` tags)
- Auto-discussion system for critical keywords
- Korean and English language support

---

*For full history, see [GitHub Releases](https://github.com/bitjaru/codesyncer/releases)*
