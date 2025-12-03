# Changelog

This project follows [Semantic Versioning](https://semver.org/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project is licensed under [ISC](LICENSE).

## [Unreleased]

## [0.4.2] - 2025-12-03

### Changed
- **Dependencies Updated**: Updated all dependencies to latest versions
  - `@types/node`: 20.19.25 → 24.10.1
  - `glob`: 10.5.0 → 13.0.0
  - `chalk`: 4.1.2 → 5.6.2
  - `ora`: 5.4.1 → 9.0.0
  - `zod`: 3.25.76 → 4.1.13
  - `vitest`: 1.6.1 → 4.0.15

### Notes
- All major version updates have been tested and verified
- No breaking changes detected in functionality
- All tests pass with updated dependencies

## [0.4.1] - 2025-12-03

### Added
- LICENSE file (ISC License)
- SECURITY.md with vulnerability reporting guidelines
- CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- GitHub issue templates (bug report, feature request, question)
- Pull Request template
- Dependabot configuration for automated dependency updates
- FUNDING.yml for GitHub Sponsors
- .npmignore to exclude development files from npm package
- examples/ directory with comprehensive usage examples:
  - Basic usage examples (validate repo, file, registry)
  - CI/CD integration examples (GitHub Actions, GitLab CI)
  - Advanced scenarios (custom error handling, error code checking)

### Changed
- Updated README.md with version 0.4.0 information and links to new files
- Expanded package.json keywords for better discoverability
- Added engines field to package.json (Node.js >=18.0.0)
- Updated ESLint config to ignore examples/ directory

### Fixed
- Fixed unused variable warning in validateRepo.ts

## [0.4.0] - 2025-12-03

### Added
- Comprehensive error code system with standardized error codes
- Four-level severity system: fatal, error, warning, info
- Error code categories: REGISTRY, PROMPT, PARTIAL, REPO, FILE, CLI
- `hint` field in error objects for helpful resolution guidance
- `meta` field in error objects for additional error metadata
- Summary statistics in `validatePromptRepo` result (fatal, error, warning, info counts)
- CLI `--severity` option for filtering errors by minimum severity level
- Fatal error handling that always causes CLI to exit with code 1
- Enhanced error formatting with color-coded severity levels (fatal uses red background)

### Changed
- **BREAKING**: `Severity` type changed from `'error' | 'warning' | 'info' | 'debug'` to `'fatal' | 'error' | 'warning' | 'info'`
- **BREAKING**: `ToolkitError` interface: `details` field renamed to `meta`, added `hint` field
- **BREAKING**: `validatePromptRepo` return type now includes `summary` field
- Error codes renamed for consistency:
  - `PARTIAL_MISSING` → `PARTIAL_NOT_FOUND`
  - `PARTIAL_CIRCULAR` → `PARTIAL_CIRCULAR_DEPENDENCY`
  - `PARTIALS_FOLDER_NOT_FOUND` → `PARTIAL_PATH_INVALID`
- All validators now return `ToolkitError[]` instead of throwing ZodError
- `loadYaml` now throws `ToolkitError` instead of raw errors
- CLI commands updated to support new severity system

### Fixed
- Improved error handling in file operations
- Better error messages with contextual hints
- Consistent error structure across all validators

## [0.3.1] - 2024-12-XX

### Added
- GitHub Actions CI workflow
- Release workflow automation
- Automated version synchronization

### Changed
- Updated workflow configurations to use English

## [0.3.0] - 2024-12-XX

### Added
- Comprehensive CLI tool with command-line interface
- Implemented validate commands (repo, registry, file, partials)
- Implemented check commands (partials usage)
- Implemented list commands (prompts, groups)
- Implemented stats command for repository statistics
- Support for both text and JSON output formats

---

## Version Notes

- **[Unreleased]**: Changes not yet released
- **[version]**: Released versions with date and change types

### Change Types

- **Added**: New features
- **Changed**: Changes to existing features
- **Deprecated**: Features soon to be removed
- **Removed**: Features removed
- **Fixed**: Bug fixes
- **Security**: Security-related changes

