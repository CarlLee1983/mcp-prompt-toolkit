# Contributing Guide

Thank you for contributing to the Prompt Tooling SDK! This guide explains how to contribute to the project.

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. **All commit messages must be in English.**

### Format

```
<type>[optional scope]: <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

```bash
# Feature
git commit -m "feat: add release workflow automation"

# Fix
git commit -m "fix: correct npm token configuration in release workflow"

# Documentation
git commit -m "docs: update release workflow documentation"

# Chore
git commit -m "chore: configure GitHub Actions for automated releases"

# With scope
git commit -m "feat(cli): add validate command for prompt files"
git commit -m "fix(validators): handle missing registry.yaml gracefully"
```

## Release Tag Convention

We use [Semantic Versioning](https://semver.org/) for release tags. **All release tags must follow the format `v{major}.{minor}.{patch}`.**

### Format

```
v{major}.{minor}.{patch}
```

### Examples

```bash
# Major version
v1.0.0

# Minor version
v0.4.0

# Patch version
v0.3.2

# Pre-release versions
v0.4.0-beta.1
v0.4.0-rc.1
```

### Creating a Release

The release process supports two approaches:

#### Approach 1: Automatic Version Sync (Recommended)

Simply create and push a version tag. The workflow will automatically update `package.json`:

```bash
# 1. Create and push the tag
git tag -a v0.3.2 -m "Release v0.3.2: Description of changes"
git push origin main
git push origin v0.3.2
```

**GitHub Actions will automatically**:
- Extract version from tag
- Update `package.json` version to match the tag
- Verify version consistency
- Build the project
- Run tests
- Commit version update back to repository
- Create a GitHub Release with release notes
- Publish to npm (if NPM_TOKEN is configured)

#### Approach 2: Manual Version Update (Optional)

If you prefer to update `package.json` before creating the tag:

```bash
# 1. Update version in package.json manually
# Edit package.json and set version to "0.3.2"

# 2. Commit the version change
git add package.json
git commit -m "chore: bump version to 0.3.2"
git push origin main

# 3. Create and push the tag (version should match package.json)
git tag -a v0.3.2 -m "Release v0.3.2: Description of changes"
git push origin v0.3.2
```

**Note**: If `package.json` version doesn't match the tag, the workflow will automatically update it and verify consistency before publishing.

## Release Notes

Release notes are automatically generated in English. The release workflow will:
- Extract the version from the tag
- Create a GitHub Release with the version number
- Link to CHANGELOG.md for detailed changes

## Code Style

- Use TypeScript for all source code
- Follow ESLint rules (run `pnpm lint` before committing)
- Write tests for new features
- Use English for all code comments and documentation

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with English commit messages
4. Ensure all tests pass (`pnpm test:run`)
5. Ensure linting passes (`pnpm lint`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with a clear description in English

Thank you for contributing! 🎉

