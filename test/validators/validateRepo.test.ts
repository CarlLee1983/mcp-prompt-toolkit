import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validatePromptRepo } from '../../src/validators/validateRepo'
import { TempDir } from '../helpers/tempDir'
import {
  validRegistryYaml,
  validPromptYaml,
  invalidPromptYamlMissingId,
  promptYamlWithPartials,
  promptYamlWithMissingPartial
} from '../helpers/fixtures'

describe('validatePromptRepo', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('validateRepo-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Complete valid repository', () => {
    it('should be able to validate a complete valid repository', () => {
      // Create registry.yaml
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      // Create common group
      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', validPromptYaml)
      tempDir.writeFile('common/code-review.yaml', validPromptYaml)

      // Create laravel group
      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Registry validation failure', () => {
    it('should return an error when registry validation fails', () => {
      const invalidRegistry = `
version: 1
groups:
  common:
    path: common
    enabled: true
    # Missing prompts field
`
      tempDir.writeFile('registry.yaml', invalidRegistry)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Partial prompt file validation failure', () => {
    it('should collect all failed prompt file validations', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', validPromptYaml)
      tempDir.writeFile('common/code-review.yaml', invalidPromptYamlMissingId)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].file).toBe('code-review.yaml')
      expect(result.errors[0].errors).toBeDefined()
    })

    it('should collect all errors when there are multiple validation failures', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', invalidPromptYamlMissingId)
      tempDir.writeFile('common/code-review.yaml', invalidPromptYamlMissingId)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Skipping disabled groups', () => {
    it('should skip disabled groups', () => {
      const registryWithDisabledGroup = `
version: 1
groups:
  common:
    path: common
    enabled: true
    prompts:
      - api-design.yaml
  disabled:
    path: disabled
    enabled: false
    prompts:
      - test.yaml
`
      tempDir.writeFile('registry.yaml', registryWithDisabledGroup)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', validPromptYaml)

      // Need to create disabled group directory and files (validateRegistry checks all groups)
      // But validatePromptRepo will skip prompt content validation for disabled groups
      tempDir.mkdir('disabled')
      tempDir.writeFile('disabled/test.yaml', 'invalid content')

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Partials usage validation', () => {
    it('should validate repository with valid partials usage', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', promptYamlWithPartials)
      tempDir.writeFile('common/code-review.yaml', validPromptYaml)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      // Create partials
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/role-expert.hbs', 'You are an expert')
      tempDir.writeFile('partials/role-helper.hbs', 'Helper content')

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing partials in prompt templates', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', promptYamlWithMissingPartial)
      tempDir.writeFile('common/code-review.yaml', validPromptYaml)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      // Create partials directory but missing the referenced partial
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/role-expert.hbs', 'Expert content')
      // missing-partial.hbs is missing

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const missingPartialError = result.errors.find(
        e => e.type === 'missing-partial' && e.file === 'api-design.yaml'
      )
      expect(missingPartialError).toBeDefined()
      if (missingPartialError && missingPartialError.type === 'missing-partial') {
        expect(missingPartialError.partial).toBe('missing-partial')
      }
    })

    it('should detect circular dependencies in partials', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      const promptWithCircular = `
id: test-circular
title: Test Circular
description: Test
args:
  name:
    type: string
template: |
  {{> A}}
`
      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', promptWithCircular)
      tempDir.writeFile('common/code-review.yaml', validPromptYaml)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      // Create circular dependency: A -> B -> A
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/A.hbs', '{{> B}}')
      tempDir.writeFile('partials/B.hbs', '{{> A}}')

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const circularError = result.errors.find(
        e => e.type === 'circular-partial' && e.file === 'api-design.yaml'
      )
      expect(circularError).toBeDefined()
    })

    it('should skip partials validation when partials are disabled', () => {
      const registryWithoutPartials = `
version: 1
groups:
  common:
    path: common
    enabled: true
    prompts:
      - api-design.yaml
`
      tempDir.writeFile('registry.yaml', registryWithoutPartials)

      tempDir.mkdir('common')
      // This prompt references partials but partials are disabled
      tempDir.writeFile('common/api-design.yaml', promptYamlWithPartials)

      const result = validatePromptRepo(tempDir.getPath())

      // Should pass because partials validation is skipped when disabled
      expect(result.passed).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect both missing partials and circular dependencies', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      const promptWithBothIssues = `
id: test-both
title: Test Both Issues
description: Test
args:
  name:
    type: string
template: |
  {{> A}}
  {{> missing}}
`
      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', promptWithBothIssues)
      tempDir.writeFile('common/code-review.yaml', validPromptYaml)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      // Create circular dependency
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/A.hbs', '{{> B}}')
      tempDir.writeFile('partials/B.hbs', '{{> A}}')
      // missing.hbs is missing

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
      const missingError = result.errors.find(e => e.type === 'missing-partial')
      const circularError = result.errors.find(e => e.type === 'circular-partial')
      expect(missingError).toBeDefined()
      expect(circularError).toBeDefined()
    })
  })
})

