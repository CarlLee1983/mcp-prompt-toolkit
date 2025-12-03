# Security Policy

## Supported Versions

We actively support the following versions of `@carllee1983/prompt-toolkit`:

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | :white_check_mark: |
| < 0.4   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** open a public issue

Please do not report security vulnerabilities through public GitHub issues.

### 2. Report privately

Please report security vulnerabilities by:
- Opening a private security advisory on GitHub: https://github.com/CarlLee1983/prompts-tooling-sdk/security/advisories/new
- Or emailing: [Add your security contact email here]
- **Subject**: `[SECURITY] @carllee1983/prompt-toolkit - [Brief Description]`

### 3. Include details

Please include the following information in your report:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the vulnerability
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### 4. Response timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity, but we aim to address critical vulnerabilities as quickly as possible

### 5. Disclosure policy

- We will acknowledge receipt of your vulnerability report
- We will keep you informed of the progress towards resolving the issue
- We will notify you when the vulnerability has been fixed
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using this toolkit:

1. **Keep dependencies updated**: Regularly update `@carllee1983/prompt-toolkit` to the latest version
2. **Validate inputs**: Always validate YAML files before processing
3. **Use trusted sources**: Only use prompt repositories from trusted sources
4. **Review permissions**: Ensure file system permissions are properly configured
5. **Monitor for updates**: Subscribe to security advisories

## Known Security Considerations

- This toolkit reads and validates YAML files from the file system
- Ensure proper file permissions are set on prompt repositories
- Be cautious when validating untrusted YAML files
- The toolkit does not execute any code from prompt files, only validates structure

## Security Updates

Security updates will be released as patch versions (e.g., 0.4.0 → 0.4.1) and will be documented in:
- GitHub Security Advisories
- CHANGELOG.md
- Release notes

Thank you for helping keep `@carllee1983/prompt-toolkit` and its users safe!

