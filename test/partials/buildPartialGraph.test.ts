import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildPartialGraph } from '../../src/partials/buildPartialGraph'
import { TempDir } from '../helpers/tempDir'

describe('buildPartialGraph', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('buildPartialGraph-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Build simple dependency graph', () => {
    it('should build graph for partial without dependencies', () => {
      const partialFile = tempDir.writeFile('partial.hbs', 'Simple content')
      const graph = new Map<string, string[]>()

      buildPartialGraph(partialFile, graph)

      expect(graph.has(partialFile)).toBe(true)
      expect(graph.get(partialFile)).toEqual([])
    })

    it('should build graph for partial with single dependency', () => {
      const partialFile = tempDir.writeFile('partial.hbs', '{{> helper}}')
      const graph = new Map<string, string[]>()

      buildPartialGraph(partialFile, graph)

      expect(graph.has(partialFile)).toBe(true)
      expect(graph.get(partialFile)).toEqual(['helper'])
    })

    it('should build graph for partial with multiple dependencies', () => {
      const partialFile = tempDir.writeFile('partial.hbs', '{{> header}}{{> body}}{{> footer}}')
      const graph = new Map<string, string[]>()

      buildPartialGraph(partialFile, graph)

      expect(graph.has(partialFile)).toBe(true)
      const deps = graph.get(partialFile) || []
      expect(deps).toContain('header')
      expect(deps).toContain('body')
      expect(deps).toContain('footer')
      expect(deps).toHaveLength(3)
    })
  })

  describe('Handle nested partial dependencies', () => {
    it('should build graph for nested dependencies', () => {
      const partialFile = tempDir.writeFile('parent.hbs', '{{> child}}')
      tempDir.writeFile('child.hbs', '{{> grandchild}}')
      tempDir.writeFile('grandchild.hbs', 'Content')
      const graph = new Map<string, string[]>()

      buildPartialGraph(partialFile, graph)

      expect(graph.has(partialFile)).toBe(true)
      expect(graph.get(partialFile)).toEqual(['child'])
      // Note: buildPartialGraph only processes one level, nested deps need recursive calls
    })
  })

  describe('Avoid duplicate processing', () => {
    it('should not process the same file twice', () => {
      const partialFile = tempDir.writeFile('partial.hbs', '{{> helper}}')
      const graph = new Map<string, string[]>()

      buildPartialGraph(partialFile, graph)
      buildPartialGraph(partialFile, graph)

      expect(graph.size).toBe(1)
      expect(graph.has(partialFile)).toBe(true)
    })

    it('should not overwrite existing graph entry', () => {
      const partialFile = tempDir.writeFile('partial.hbs', '{{> helper}}')
      const graph = new Map<string, string[]>()

      // First call
      buildPartialGraph(partialFile, graph)
      const firstDeps = graph.get(partialFile)

      // Second call should not change it
      buildPartialGraph(partialFile, graph)
      const secondDeps = graph.get(partialFile)

      expect(firstDeps).toEqual(secondDeps)
    })
  })

  describe('Handle empty files', () => {
    it('should handle empty partial file', () => {
      const partialFile = tempDir.writeFile('empty.hbs', '')
      const graph = new Map<string, string[]>()

      buildPartialGraph(partialFile, graph)

      expect(graph.has(partialFile)).toBe(true)
      expect(graph.get(partialFile)).toEqual([])
    })

    it('should handle file with only whitespace', () => {
      const partialFile = tempDir.writeFile('whitespace.hbs', '   \n\t  ')
      const graph = new Map<string, string[]>()

      buildPartialGraph(partialFile, graph)

      expect(graph.has(partialFile)).toBe(true)
      expect(graph.get(partialFile)).toEqual([])
    })
  })
})

