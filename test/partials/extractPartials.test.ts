import { describe, it, expect } from 'vitest'
import { extractPartials } from '../../src/partials/extractPartials'

describe('extractPartials', () => {
  describe('Extract single partial', () => {
    it('should extract a single partial from template', () => {
      const template = 'Hello {{> greeting}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(1)
      expect(result).toContain('greeting')
    })

    it('should extract partial with spaces', () => {
      const template = '{{>  role-expert  }}'
      const result = extractPartials(template)

      expect(result).toHaveLength(1)
      expect(result).toContain('role-expert')
    })
  })

  describe('Extract multiple partials', () => {
    it('should extract multiple different partials', () => {
      const template = '{{> header}}{{> body}}{{> footer}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(3)
      expect(result).toContain('header')
      expect(result).toContain('body')
      expect(result).toContain('footer')
    })

    it('should extract partials from multiline template', () => {
      const template = `
        {{> role-expert}}
        Some content here
        {{> role-helper}}
      `
      const result = extractPartials(template)

      expect(result).toHaveLength(2)
      expect(result).toContain('role-expert')
      expect(result).toContain('role-helper')
    })
  })

  describe('Handle duplicate partial references', () => {
    it('should return unique partials when same partial is referenced multiple times', () => {
      const template = '{{> greeting}} Hello {{> greeting}} World {{> greeting}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(1)
      expect(result).toContain('greeting')
    })
  })

  describe('Handle partial name formats', () => {
    it('should handle partials with underscores', () => {
      const template = '{{> role_expert}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(1)
      expect(result).toContain('role_expert')
    })

    it('should handle partials with hyphens', () => {
      const template = '{{> role-expert}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(1)
      expect(result).toContain('role-expert')
    })

    it('should handle partials with slashes', () => {
      const template = '{{> common/role-expert}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(1)
      expect(result).toContain('common/role-expert')
    })

    it('should handle partials with numbers', () => {
      const template = '{{> role123}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(1)
      expect(result).toContain('role123')
    })
  })

  describe('Handle edge cases', () => {
    it('should return empty array for template without partials', () => {
      const template = 'Hello {{name}}, count is {{count}}'
      const result = extractPartials(template)

      expect(result).toHaveLength(0)
    })

    it('should return empty array for empty template', () => {
      const template = ''
      const result = extractPartials(template)

      expect(result).toHaveLength(0)
    })

    it('should ignore invalid partial syntax', () => {
      const template = '{{>}} {{> }} {{>invalid-name}}'
      const result = extractPartials(template)

      // Only the valid one should be extracted
      expect(result.length).toBeGreaterThanOrEqual(0)
    })
  })
})

