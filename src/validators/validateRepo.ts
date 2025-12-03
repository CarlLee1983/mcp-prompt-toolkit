import fs from 'fs'
import path from 'path'
import type { Severity, ToolkitError } from '../types/errors'
import { createToolkitError, ERROR_CODE_CONSTANTS } from '../schema/errors'
import { validateRegistry } from './validateRegistry'
import { validatePromptFile } from './validatePromptFile'
import { validatePartialsUsage } from './validatePartialsUsage'

export interface ValidatePromptRepoOptions {
  minSeverity?: Severity
}

const SEVERITY_LEVELS: Record<Severity, number> = {
  fatal: -1,
  error: 0,
  warning: 1,
  info: 2
}

function filterBySeverity(errors: ToolkitError[], minSeverity: Severity = 'error'): ToolkitError[] {
  const minLevel = SEVERITY_LEVELS[minSeverity]
  return errors.filter(error => SEVERITY_LEVELS[error.severity] <= minLevel)
}

function calculateSummary(errors: ToolkitError[]): { fatal: number; error: number; warning: number; info: number } {
  return {
    fatal: errors.filter(e => e.severity === 'fatal').length,
    error: errors.filter(e => e.severity === 'error').length,
    warning: errors.filter(e => e.severity === 'warning').length,
    info: errors.filter(e => e.severity === 'info').length
  }
}

export interface ValidatePromptRepoResult {
  passed: boolean
  errors: ToolkitError[]
  summary: {
    fatal: number
    error: number
    warning: number
    info: number
  }
}

export function validatePromptRepo(
  repoRoot: string,
  options: ValidatePromptRepoOptions = {}
): ValidatePromptRepoResult {
  // Check if repo root exists
  if (!fs.existsSync(repoRoot)) {
    const error = createToolkitError(
      ERROR_CODE_CONSTANTS.REPO_ROOT_NOT_FOUND,
      `Repository root path not found: ${repoRoot}`,
      undefined,
      { expectedPath: repoRoot },
      'Ensure the repository path exists and is accessible'
    )
    const filtered = filterBySeverity([error], options.minSeverity)
    return {
      passed: filtered.length === 0,
      errors: filtered,
      summary: calculateSummary(filtered)
    }
  }

  const registryPath = path.join(repoRoot, 'registry.yaml')
  const allErrors: ToolkitError[] = []

  const registry = validateRegistry(registryPath, repoRoot)
  if (!registry.success) {
    const filtered = filterBySeverity(registry.errors || [], options.minSeverity)
    return {
      passed: filtered.length === 0,
      errors: filtered,
      summary: calculateSummary(filtered)
    }
  }

  // Add registry errors if any
  if (registry.errors) {
    allErrors.push(...registry.errors)
  }

  if (!registry.data) {
    const filtered = filterBySeverity(allErrors, options.minSeverity)
    return {
      passed: filtered.length === 0,
      errors: filtered,
      summary: calculateSummary(filtered)
    }
  }

  const partialRoot = registry.data.partials?.enabled
    ? path.join(repoRoot, registry.data.partials.path)
    : null

  for (const [_groupName, group] of Object.entries(registry.data.groups)) {
    if (!group.enabled) continue

    for (const file of group.prompts) {
      const full = path.join(repoRoot, group.path, file)
      const res = validatePromptFile(full)

      if (!res.success) {
        // Add file path to each error
        const fileErrors = (res.errors || []).map(err => ({
          ...err,
          file: full
        }))
        allErrors.push(...fileErrors)
        continue
      }

      if (partialRoot && res.data) {
        const usageErrors = validatePartialsUsage(
          res.data.template,
          partialRoot,
          {
            checkUnused: false, // Don't check unused in repo validation
            file: full
          }
        )
        allErrors.push(...usageErrors)
      }
    }
  }

  const filtered = filterBySeverity(allErrors, options.minSeverity)
  return {
    passed: filtered.length === 0,
    errors: filtered,
    summary: calculateSummary(filtered)
  }
}
