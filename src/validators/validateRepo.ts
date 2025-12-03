import path from 'path'
import { validateRegistry } from './validateRegistry'
import { validatePromptFile } from './validatePromptFile'
import { validatePartialsUsage } from './validatePartialsUsage'
import { ZodError } from 'zod'

type ValidationError = 
  | { type: 'schema'; file: string; errors: ZodError['errors'] }
  | { type: 'missing-partial'; file: string; partial: string }
  | { type: 'circular-partial'; file: string; chain: string[] }

export function validatePromptRepo(repoRoot: string) {
  const registryPath = path.join(repoRoot, 'registry.yaml')

  const registry = validateRegistry(registryPath, repoRoot)
  if (!registry.success) {
    return { passed: false, errors: registry.error.errors }
  }

  const errors: ValidationError[] = []
  const partialRoot = registry.data.partials?.enabled
    ? path.join(repoRoot, registry.data.partials.path)
    : null

  for (const group of Object.values(registry.data.groups)) {
    if (!group.enabled) continue

    for (const file of group.prompts) {
      const full = path.join(repoRoot, group.path, file)
      const res = validatePromptFile(full)

      if (!res.success) {
        errors.push({ type: 'schema', file, errors: res.error.errors })
        continue
      }

      if (partialRoot) {
        const usageErrors = validatePartialsUsage(
          res.data.template,
          partialRoot
        )

        for (const e of usageErrors) {
          errors.push({
            ...e,
            file
          })
        }
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors
  }
}
