# Changelog

All notable changes to CodeSyncer will be documented in this file.

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
