# Changelog

All notable changes to CodeSyncer will be documented in this file.

## [2.7.0] - 2026-01-09

### Added

#### New Commands
- **`codesyncer validate`**: Validate CodeSyncer setup and report issues
  ```bash
  codesyncer validate         # Basic validation
  codesyncer validate -v      # Verbose output with file paths
  ```
  - Checks master setup existence
  - Validates all repository configurations
  - Detects unfilled placeholders
  - Reports missing files with fix suggestions
  - Bilingual output (Korean/English)

#### Improved Security
- **Path traversal protection**: Validates all file paths to prevent directory escape attacks
- **Input sanitization**: Sanitizes repository names and user inputs
- **Safe file operations**: New `safeReadFile` and `safeWriteFile` utilities with proper error handling

#### Comprehensive Error Handling
- **Custom error types**: `CodeSyncerError` with error codes for better debugging
- **User-friendly messages**: Bilingual error messages (Korean/English)
- **Proper Node.js error handling**: Handles ENOENT, EACCES, EPERM, EISDIR errors

#### Improved Language Detection
- **Multi-source detection**: Checks config.json, SETUP_GUIDE.md content, and system locale
- **Confidence scoring**: Returns detection confidence level
- **Hangul character detection**: Counts Korean Unicode characters for better accuracy
- **Config persistence**: Saves language preference to `.codesyncer/config.json`

#### Test Suite
- **71 unit tests** covering all new utilities
- **Jest configuration** with TypeScript support
- **Coverage reporting**: `npm run test:coverage`
- Test files:
  - `tag-parser.test.ts` - Tag parsing and deduplication
  - `security.test.ts` - Path validation and sanitization
  - `language.test.ts` - Language detection
  - `errors.test.ts` - Error handling utilities

### Fixed

#### Critical Bug Fixes
- **Tag duplicate detection**: Fixed substring matching bug where "mysql" would incorrectly match "mysql5"
  - Now uses word boundary matching for accurate detection
- **Watch mode monorepo support**: Fixed DECISIONS.md path resolution
  - Now finds the closest DECISIONS.md relative to the changed file
  - Walks up directory tree for proper monorepo support

#### Error Handling
- Template loading failures now have proper fallback handling
- File write operations report errors instead of failing silently
- Watch mode reports errors instead of ignoring them

### Changed
- **Test script**: Now runs Jest (`npm test`) instead of placeholder
- **Prepublish**: Runs tests before building (`npm run prepublishOnly`)
- **Error messages**: All error messages now available in Korean and English

### Technical

#### New Utilities
- `src/utils/errors.ts` - Error handling with CodeSyncerError class
- `src/utils/security.ts` - Path validation and sanitization
- `src/utils/language.ts` - Improved language detection

#### New Scripts
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Breaking Changes
- None - fully backward compatible

---

## [2.6.0] - 2026-01-06

### Added

#### Watch Mode (Major Feature)
- **Real-time file monitoring**: `codesyncer watch` command for live code tracking
  ```bash
  codesyncer watch        # Start watching
  codesyncer watch --log  # With file logging
  ```

- **Auto tag synchronization**: Automatically syncs `@codesyncer-*` tags to `DECISIONS.md`
  - Supports: `@codesyncer-decision`, `@codesyncer-rule`, `@codesyncer-todo`, `@codesyncer-inference`, `@codesyncer-context`
  - Legacy support: `@claude-*` tags also work

- **Beautiful UX**:
  - First-time welcome message with usage tips
  - Color-coded real-time change logs
  - Session summary on exit (duration, files watched, tags synced)
  - Korean/English auto-detection

- **Optional file logging**: `--log` flag saves session to `.codesyncer/watch-{date}.log`

#### Technical
- New utilities:
  - `src/utils/tag-parser.ts` - Parse @codesyncer-* tags from source files
  - `src/utils/watch-logger.ts` - Beautiful console output and file logging
  - `src/utils/watcher.ts` - Chokidar-based file watcher with debouncing
  - `src/commands/watch.ts` - Watch command handler

### Dependencies
- Added `chokidar@^3.6.0` for cross-platform file watching

---

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
