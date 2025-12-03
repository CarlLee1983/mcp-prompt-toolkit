import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolvePartialPath } from '../../src/partials/resolvePartialPath'
import { TempDir } from '../helpers/tempDir'

describe('resolvePartialPath', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('resolvePartialPath-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Successfully resolve partial file path', () => {
    it('should resolve existing partial file path', () => {
      tempDir.mkdir('partials')
      const partialFile = tempDir.writeFile('partials/role-expert.hbs', 'content')

      const result = resolvePartialPath(tempDir.getPath() + '/partials', 'role-expert')

      expect(result).toBe(partialFile)
      expect(result).toContain('role-expert.hbs')
    })

    it('should resolve partial with underscores', () => {
      tempDir.mkdir('partials')
      const partialFile = tempDir.writeFile('partials/role_expert.hbs', 'content')

      const result = resolvePartialPath(tempDir.getPath() + '/partials', 'role_expert')

      expect(result).toBe(partialFile)
    })

    it('should resolve partial with numbers', () => {
      tempDir.mkdir('partials')
      const partialFile = tempDir.writeFile('partials/role123.hbs', 'content')

      const result = resolvePartialPath(tempDir.getPath() + '/partials', 'role123')

      expect(result).toBe(partialFile)
    })
  })

  describe('Return null when partial does not exist', () => {
    it('should return null when partial file does not exist', () => {
      tempDir.mkdir('partials')

      const result = resolvePartialPath(tempDir.getPath() + '/partials', 'non-existent')

      expect(result).toBeNull()
    })

    it('should return null when partials directory does not exist', () => {
      const result = resolvePartialPath(tempDir.getPath() + '/non-existent', 'role-expert')

      expect(result).toBeNull()
    })

    it('should return null when file exists but with different extension', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/role-expert.txt', 'content')

      const result = resolvePartialPath(tempDir.getPath() + '/partials', 'role-expert')

      expect(result).toBeNull()
    })
  })

  describe('Handle different partial name formats', () => {
    it('should handle partial names with slashes', () => {
      tempDir.mkdir('partials')
      tempDir.mkdir('partials/common')
      const partialFile = tempDir.writeFile('partials/common/role-expert.hbs', 'content')

      const result = resolvePartialPath(tempDir.getPath() + '/partials', 'common/role-expert')

      expect(result).toBe(partialFile)
    })

    it('should handle partial names without slashes in nested directories', () => {
      tempDir.mkdir('partials')
      tempDir.mkdir('partials/nested')
      tempDir.writeFile('partials/nested/helper.hbs', 'content')

      // Should not resolve if name doesn't include path
      const result = resolvePartialPath(tempDir.getPath() + '/partials', 'helper')

      expect(result).toBeNull()
    })
  })
})

