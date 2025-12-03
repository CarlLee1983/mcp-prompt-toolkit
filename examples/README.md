# Examples

This directory contains example code demonstrating how to use `@carllee1983/prompt-toolkit` in various scenarios.

## Basic Usage

### `validate-repo.js`
Complete example of validating an entire prompt repository with error handling and severity-based reporting.

```bash
node examples/basic-usage/validate-repo.js
```

### `validate-single-file.js`
Example of validating a single prompt YAML file.

```bash
node examples/basic-usage/validate-single-file.js
```

### `validate-registry.js`
Example of validating a registry.yaml file and checking referenced files.

```bash
node examples/basic-usage/validate-registry.js
```

## CI/CD Integration

### `github-actions.yml`
Complete GitHub Actions workflow for validating prompts in CI/CD pipeline.

**Usage:**
1. Copy to `.github/workflows/validate-prompts.yml`
2. Customize the workflow as needed
3. Push to your repository

### `gitlab-ci.yml`
GitLab CI pipeline configuration for prompt validation.

**Usage:**
1. Copy to `.gitlab-ci.yml` in your repository root
2. Customize the pipeline as needed
3. Commit and push

## Advanced Scenarios

### `custom-error-handler.js`
Demonstrates custom error handling with severity filtering and callbacks.

```bash
node examples/advanced-scenarios/custom-error-handler.js
```

### `error-code-checker.js`
Shows how to check for specific error codes and handle them programmatically.

```bash
node examples/advanced-scenarios/error-code-checker.js
```

## Running Examples

All examples use ES modules. Make sure your `package.json` has:

```json
{
  "type": "module"
}
```

Or use a tool like `tsx`:

```bash
npx tsx examples/basic-usage/validate-repo.js
```

## Requirements

- Node.js 18 or higher
- `@carllee1983/prompt-toolkit` installed

```bash
npm install @carllee1983/prompt-toolkit
# or
pnpm add @carllee1983/prompt-toolkit
# or
yarn add @carllee1983/prompt-toolkit
```

