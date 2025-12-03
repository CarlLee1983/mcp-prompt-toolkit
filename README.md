# @carllee1983/prompt-toolkit

<div align="center">

**Prompt repository governance toolkit for MCP**

[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](https://github.com/CarlLee1983/prompts-tooling-sdk)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## 📋 Introduction

`@carllee1983/prompt-toolkit` is a TypeScript toolkit designed for validating and managing prompt repositories used with Model Context Protocol (MCP). It provides comprehensive validation for registry files, prompt definitions, and partials directories, ensuring the integrity and correctness of prompt repositories.

## ✨ Features

- **Registry Validation**: Validate `registry.yaml` structure and ensure all referenced files exist
- **Prompt File Validation**: Validate individual prompt YAML files against schema definitions
- **Partials Validation**: Validate partials directory structure and file existence
- **Partials Usage Validation**: Detect missing partials and circular dependencies in templates
- **Repository Validation**: Complete repository validation workflow that validates all components
- **Type Safety**: Full TypeScript support with type definitions
- **Schema Validation**: Zod-based schema validation for robust type checking
- **Code Quality**: ESLint configuration with automatic formatting
- **Git Hooks**: Pre-commit hook for automatic lint fixes
- **Comprehensive Testing**: 88 unit tests with comprehensive coverage

## 🚀 Installation

```bash
# Using npm
npm install @carllee1983/prompt-toolkit

# Using pnpm
pnpm add @carllee1983/prompt-toolkit

# Using yarn
yarn add @carllee1983/prompt-toolkit
```

## 📖 Usage

### CLI Usage

The package includes a CLI tool for validating and managing prompt repositories from the command line.

#### Installation

After installing the package, the CLI is available as `prompt-toolkit`:

```bash
# Using npx (no installation needed)
npx @carllee1983/prompt-toolkit --help

# Or install globally
npm install -g @carllee1983/prompt-toolkit
prompt-toolkit --help
```

#### CLI Commands

**Validate Commands:**
```bash
# Validate entire repository
prompt-toolkit validate repo [path]

# Validate registry.yaml
prompt-toolkit validate registry [path] --repo-root <path>

# Validate a single prompt file
prompt-toolkit validate file <file-path>

# Validate partials directory
prompt-toolkit validate partials [path] --partials-path <path>
```

**Check Commands:**
```bash
# Check partials usage (missing partials and circular dependencies)
prompt-toolkit check partials [path]
```

**List Commands:**
```bash
# List all prompts
prompt-toolkit list prompts [path] [--group <name>] [--enabled-only]

# List all groups
prompt-toolkit list groups [path] [--enabled-only]
```

**Statistics:**
```bash
# Show repository statistics
prompt-toolkit stats [path]
```

**Output Options:**
- `--format <json|text>` - Output format (default: text)
- `--output <file>` - Write output to file
- `--exit-code` - Exit with non-zero code on validation failure
- `--severity <fatal|error|warning|info>` - Minimum severity level to display (default: error)

**Examples:**
```bash
# Validate repository with JSON output
prompt-toolkit validate repo --format json

# Validate with severity filtering (show warnings and errors)
prompt-toolkit validate repo --severity warning

# Check partials and save results to file
prompt-toolkit check partials --format json --output results.json

# List all enabled prompts
prompt-toolkit list prompts --enabled-only

# Show statistics in JSON format
prompt-toolkit stats --format json
```

### Programmatic Usage

### Basic Example

```typescript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

// Validate entire repository
const result = validatePromptRepo('/path/to/prompt-repo')

if (result.passed) {
  console.log('Repository validation passed!')
  console.log('Summary:', result.summary)
} else {
  console.error('Validation errors:', result.errors)
  console.error('Summary:', result.summary)
}
```

### Validate Registry

```typescript
import { validateRegistry } from '@carllee1983/prompt-toolkit'

const result = validateRegistry('/path/to/registry.yaml', '/path/to/repo-root')

if (result.success) {
  console.log('Registry is valid:', result.data)
} else {
  console.error('Registry validation failed:', result.error)
}
```

### Validate Prompt File

```typescript
import { validatePromptFile } from '@carllee1983/prompt-toolkit'

const result = validatePromptFile('/path/to/prompt.yaml')

if (result.success) {
  console.log('Prompt is valid:', result.data)
} else {
  console.error('Prompt validation failed:', result.error)
}
```

### Validate Partials

```typescript
import { validatePartials } from '@carllee1983/prompt-toolkit'

// Returns array of partial file paths, or empty array if partialPath is undefined
const partials = validatePartials('/path/to/repo-root', 'partials')

console.log('Found partials:', partials)
```

## 📚 API Reference

### `validatePromptRepo(repoRoot: string)`

Validates the entire prompt repository, including registry, all prompt files, and partials.

**Parameters:**
- `repoRoot`: Path to the repository root directory

**Returns:**
```typescript
{
  passed: boolean
  errors: ToolkitError[]
  summary: {
    fatal: number
    error: number
    warning: number
    info: number
  }
}
```

### `validateRegistry(registryPath: string, repoRoot: string)`

Validates the registry.yaml file structure and ensures all referenced groups and prompts exist.

**Parameters:**
- `registryPath`: Path to the registry.yaml file
- `repoRoot`: Path to the repository root directory

**Returns:**
```typescript
ZodSafeParseReturnType<RegistryDefinition>
```

**Throws:**
- `Error` if group folders or prompt files are missing

### `validatePromptFile(filePath: string)`

Validates a single prompt YAML file against the prompt schema.

**Parameters:**
- `filePath`: Path to the prompt YAML file

**Returns:**
```typescript
ZodSafeParseReturnType<PromptDefinition>
```

### `validatePartials(repoRoot: string, partialPath?: string)`

Validates and returns all partial files in the specified directory.

**Parameters:**
- `repoRoot`: Path to the repository root directory
- `partialPath`: Optional path to the partials directory (relative to repoRoot)

**Returns:**
```typescript
string[] // Array of file paths
```

**Throws:**
- `Error` if partials folder does not exist (when partialPath is provided)

## 🔍 Error Codes and Severity

### Severity Levels

The toolkit uses four severity levels to classify validation errors:

- **`fatal`**: Critical errors that prevent validation from continuing. CLI will exit with code 1.
- **`error`**: Validation failures that should be fixed. Default minimum severity level.
- **`warning`**: Non-critical issues that should be reviewed.
- **`info`**: Informational messages and status updates.

### Error Code Structure

All error codes follow the pattern: `MODULE_PROBLEM_DESCRIPTION` (e.g., `REGISTRY_FILE_NOT_FOUND`).

### Error Code Categories

#### Registry Errors (`REGISTRY_*`)
- `REGISTRY_FILE_NOT_FOUND` (fatal) - Registry file does not exist
- `REGISTRY_SCHEMA_INVALID` (error) - Registry schema validation failed
- `REGISTRY_GROUP_NOT_FOUND` (error) - Group folder not found
- `REGISTRY_PROMPT_NOT_FOUND` (error) - Prompt file not found
- `REGISTRY_DISABLED_GROUP` (info) - Group is disabled

#### Prompt Errors (`PROMPT_*`)
- `PROMPT_SCHEMA_INVALID` (error) - Prompt schema validation failed
- `PROMPT_ID_DUPLICATED` (error) - Prompt ID is duplicated
- `PROMPT_ARG_INVALID` (error) - Prompt argument validation failed
- `PROMPT_TEMPLATE_EMPTY` (error) - Prompt template is empty

#### Partial Errors (`PARTIAL_*`)
- `PARTIAL_NOT_FOUND` (error) - Partial file not found
- `PARTIAL_UNUSED` (warning) - Partial file is defined but not used
- `PARTIAL_CIRCULAR_DEPENDENCY` (error) - Circular dependency detected
- `PARTIAL_PATH_INVALID` (error) - Partials path is invalid

#### Repository Errors (`REPO_*`)
- `REPO_ROOT_NOT_FOUND` (fatal) - Repository root path not found
- `REPO_STRUCTURE_INVALID` (error) - Repository structure is invalid

#### File Errors (`FILE_*`)
- `FILE_READ_FAILED` (fatal) - Failed to read file
- `FILE_NOT_YAML` (error) - File is not a valid YAML file

#### CLI Errors (`CLI_*`)
- `CLI_INVALID_ARGUMENT` (fatal) - Invalid CLI argument
- `CLI_UNKNOWN_COMMAND` (fatal) - Unknown CLI command

### Error Object Structure

```typescript
interface ToolkitError {
  code: string           // Error code (e.g., 'REGISTRY_FILE_NOT_FOUND')
  severity: Severity     // 'fatal' | 'error' | 'warning' | 'info'
  message: string        // Human-readable error message
  file?: string          // File path where error occurred
  hint?: string          // Helpful hint for resolving the error
  meta?: Record<string, unknown>  // Additional error metadata
}
```

### JSON Output Example

```json
{
  "passed": false,
  "errors": [
    {
      "code": "REGISTRY_FILE_NOT_FOUND",
      "severity": "fatal",
      "message": "Registry file not found: /path/to/registry.yaml",
      "file": "/path/to/registry.yaml",
      "hint": "Ensure the registry.yaml file exists in the repository root",
      "meta": {
        "expectedPath": "/path/to/registry.yaml"
      }
    }
  ],
  "summary": {
    "fatal": 1,
    "error": 0,
    "warning": 0,
    "info": 0
  }
}
```

## 📝 Schema Definitions

### Registry Schema

```typescript
interface RegistryDefinition {
  version: number
  globals?: Record<string, string>
  partials?: {
    enabled: boolean
    path: string
  }
  groups: Record<string, RegistryGroup>
}

interface RegistryGroup {
  path: string
  enabled: boolean
  prompts: string[]
}
```

### Prompt Schema

```typescript
interface PromptDefinition {
  id: string
  title: string
  description: string
  args: Record<string, PromptArg>
  template: string
}

interface PromptArg {
  type: 'string' | 'number' | 'boolean' | 'object'
  description?: string
  required?: boolean
  default?: unknown
}
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Generate coverage report
pnpm test:coverage
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Build in watch mode
pnpm dev

# Run linter
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

## 🔧 Code Quality

This project uses ESLint for code quality and consistency:

- **ESLint Configuration**: Modern flat config format (ESLint 9+)
- **TypeScript Support**: Full TypeScript linting with `@typescript-eslint`
- **Code Style**: Enforces no semicolons, single quotes, and other project conventions
- **Pre-commit Hooks**: Automatically runs `lint:fix` before each commit using Husky

### Pre-commit Hook

The project includes a pre-commit hook that automatically:
- Runs ESLint fix on all files before commit
- Adds fixed files back to staging area
- Ensures code quality before commits

This is set up automatically when you run `pnpm install` (via the `prepare` script).

## 📦 Project Structure

```
prompts-tooling-sdk/
├── src/
│   ├── index.ts              # Main entry point
│   ├── validators/           # Validation functions
│   │   ├── validateRepo.ts
│   │   ├── validateRegistry.ts
│   │   ├── validatePromptFile.ts
│   │   ├── validatePartials.ts
│   │   └── validatePartialsUsage.ts
│   ├── partials/             # Partials utilities
│   │   ├── extractPartials.ts
│   │   ├── resolvePartialPath.ts
│   │   ├── buildPartialGraph.ts
│   │   └── detectCircular.ts
│   ├── schema/               # Zod schemas
│   │   ├── registry.schema.ts
│   │   └── prompt.schema.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── registry.ts
│   │   └── prompt.ts
│   └── utils/                # Utility functions
│       ├── loadYaml.ts
│       └── walkDir.ts
├── test/                     # Test files
├── .husky/                   # Git hooks (pre-commit)
├── dist/                     # Build output
├── eslint.config.mjs         # ESLint configuration
└── package.json
```

## 📄 License

ISC

## 👤 Author

CarlLee1983

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

- 📖 [Contributing Guide](CONTRIBUTING.md)
- 📋 [Code of Conduct](CODE_OF_CONDUCT.md)
- 🔒 [Security Policy](SECURITY.md)

## 📝 Changelog

### [0.4.0] - Error Code & Severity System

#### Added
- Comprehensive error code system with standardized error codes
- Four-level severity system: fatal, error, warning, info
- Error code categories: REGISTRY, PROMPT, PARTIAL, REPO, FILE, CLI
- `hint` field in error objects for helpful resolution guidance
- `meta` field in error objects for additional error metadata
- Summary statistics in `validatePromptRepo` result (fatal, error, warning, info counts)
- CLI `--severity` option for filtering errors by minimum severity level
- Fatal error handling that always causes CLI to exit with code 1
- Enhanced error formatting with color-coded severity levels (fatal uses red background)
- Error code constants (`ERROR_CODE_CONSTANTS`) for type safety

#### Changed
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

#### Fixed
- Improved error handling in file operations
- Better error messages with contextual hints
- Consistent error structure across all validators

### [0.3.1] - CI/CD Enhancement

- Add GitHub Actions CI workflow
- Automate lint, test, and build checks
- Improve development workflow reliability
- Ensure code quality before merge

### [0.3.0] - CLI Tool Release

- Added comprehensive CLI tool with command-line interface
- Implemented validate commands (repo, registry, file, partials)
- Implemented check commands (partials usage)
- Implemented list commands (prompts, groups)
- Implemented stats command for repository statistics
- Support for both text and JSON output formats
- Colorful terminal output with loading animations
- Support for output to file and exit code control
- Added CLI documentation and usage examples

### [0.2.0] - Code Quality & Partials Enhancement

- Added ESLint configuration with TypeScript support
- Added pre-commit hooks with Husky for automatic lint fixes
- Added partials usage validation (missing partials and circular dependencies)
- Enhanced repository validation with partials usage checking
- Improved type safety with explicit error types
- Added comprehensive unit tests for partials functionality (82 total tests)
- Added CLI tool with validate, check, list, and stats commands
- Support for both text and JSON output formats
- Updated package name to `@carllee1983/prompt-toolkit`

### [0.1.0] - Initial Release

- Initial release of prompts-tooling-sdk
- Registry validation functionality
- Prompt file validation functionality
- Partials directory validation functionality
- Complete repository validation workflow
- YAML loading and directory scanning utilities
- Comprehensive unit test suite (28 test cases)
- TypeScript project configuration and build setup

