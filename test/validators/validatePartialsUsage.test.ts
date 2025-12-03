import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validatePartialsUsage } from '../../src/validators/validatePartialsUsage'
import { TempDir } from '../helpers/tempDir'

describe('validatePartialsUsage', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('validatePartialsUsage-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Valid partials usage', () => {
    it('should return empty array for valid partials usage', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/role-expert.hbs', 'Expert content')
      tempDir.writeFile('partials/role-helper.hbs', 'Helper content')

      const template = '{{> role-expert}} Some content {{> role-helper}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result).toEqual([])
    })

    it('should handle template without partials', () => {
      tempDir.mkdir('partials')

      const template = 'Simple template without partials'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result).toEqual([])
    })

    it('should handle empty template', () => {
      tempDir.mkdir('partials')

      const template = ''
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result).toEqual([])
    })
  })

  describe('Detect missing partials', () => {
    it('should detect single missing partial', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/role-expert.hbs', 'Expert content')

      const template = '{{> role-expert}}{{> missing-partial}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('missing-partial')
      if (result[0].type === 'missing-partial') {
        expect(result[0].partial).toBe('missing-partial')
      }
    })

    it('should detect multiple missing partials', () => {
      tempDir.mkdir('partials')

      const template = '{{> missing1}}{{> missing2}}{{> missing3}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result.length).toBeGreaterThanOrEqual(3)
      const missingPartials = result.filter(e => e.type === 'missing-partial')
      expect(missingPartials.length).toBeGreaterThanOrEqual(3)
    })

    it('should detect missing partial even when some exist', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/existing.hbs', 'Content')

      const template = '{{> existing}}{{> missing}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result.length).toBeGreaterThanOrEqual(1)
      const missing = result.find(e => e.type === 'missing-partial')
      expect(missing).toBeDefined()
      if (missing && missing.type === 'missing-partial') {
        expect(missing.partial).toBe('missing')
      }
    })
  })

  describe('Detect circular dependencies', () => {
    it('should detect simple circular dependency', () => {
      tempDir.mkdir('partials')
      // A depends on B, B depends on A
      tempDir.writeFile('partials/A.hbs', '{{> B}}')
      tempDir.writeFile('partials/B.hbs', '{{> A}}')

      const template = '{{> A}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result.length).toBeGreaterThan(0)
      const circular = result.find(e => e.type === 'circular-partial')
      expect(circular).toBeDefined()
    })

    it('should detect complex circular dependency', () => {
      tempDir.mkdir('partials')
      // A -> B -> C -> A
      tempDir.writeFile('partials/A.hbs', '{{> B}}')
      tempDir.writeFile('partials/B.hbs', '{{> C}}')
      tempDir.writeFile('partials/C.hbs', '{{> A}}')

      const template = '{{> A}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result.length).toBeGreaterThan(0)
      const circular = result.find(e => e.type === 'circular-partial')
      expect(circular).toBeDefined()
    })

    it('should detect self-referencing partial', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/self.hbs', '{{> self}}')

      const template = '{{> self}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result.length).toBeGreaterThan(0)
      const circular = result.find(e => e.type === 'circular-partial')
      expect(circular).toBeDefined()
    })
  })

  describe('Detect both missing partials and circular dependencies', () => {
    it('should detect both missing partials and circular dependencies', () => {
      tempDir.mkdir('partials')
      // Create circular dependency
      tempDir.writeFile('partials/A.hbs', '{{> B}}')
      tempDir.writeFile('partials/B.hbs', '{{> A}}')

      const template = '{{> A}}{{> missing}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result.length).toBeGreaterThanOrEqual(2)
      const missing = result.find(e => e.type === 'missing-partial')
      const circular = result.find(e => e.type === 'circular-partial')
      expect(missing).toBeDefined()
      expect(circular).toBeDefined()
    })
  })

  describe('Handle nested partial dependencies', () => {
    it('should build graph for nested dependencies', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/parent.hbs', '{{> child}}')
      tempDir.writeFile('partials/child.hbs', '{{> grandchild}}')
      tempDir.writeFile('partials/grandchild.hbs', 'Content')

      const template = '{{> parent}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result).toEqual([])
    })

    it('should detect cycle in nested dependencies', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/parent.hbs', '{{> child}}')
      tempDir.writeFile('partials/child.hbs', '{{> parent}}')

      const template = '{{> parent}}'
      const result = validatePartialsUsage(template, tempDir.getPath() + '/partials')

      expect(result.length).toBeGreaterThan(0)
      const circular = result.find(e => e.type === 'circular-partial')
      expect(circular).toBeDefined()
    })
  })
})

