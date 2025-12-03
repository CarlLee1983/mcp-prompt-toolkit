import { describe, it, expect } from 'vitest'
import { detectCircular } from '../../src/partials/detectCircular'

describe('detectCircular', () => {
  describe('Detect simple circular dependency', () => {
    it('should detect simple cycle (A -> B -> A)', () => {
      const graph = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A']]
      ])

      const cycles = detectCircular(graph)

      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles.some(cycle => cycle.includes('A') && cycle.includes('B'))).toBe(true)
    })

    it('should detect self-referencing cycle (A -> A)', () => {
      const graph = new Map<string, string[]>([
        ['A', ['A']]
      ])

      const cycles = detectCircular(graph)

      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles.some(cycle => cycle.includes('A'))).toBe(true)
    })
  })

  describe('Detect complex circular dependency', () => {
    it('should detect complex cycle (A -> B -> C -> A)', () => {
      const graph = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['C']],
        ['C', ['A']]
      ])

      const cycles = detectCircular(graph)

      expect(cycles.length).toBeGreaterThan(0)
      const hasCycle = cycles.some(cycle => 
        cycle.includes('A') && cycle.includes('B') && cycle.includes('C')
      )
      expect(hasCycle).toBe(true)
    })

    it('should detect multiple cycles in same graph', () => {
      const graph = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A']],
        ['C', ['D']],
        ['D', ['C']]
      ])

      const cycles = detectCircular(graph)

      expect(cycles.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Handle graphs without cycles', () => {
    it('should return empty array for linear dependency graph', () => {
      const graph = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['C']],
        ['C', []]
      ])

      const cycles = detectCircular(graph)

      expect(cycles).toEqual([])
    })

    it('should return empty array for independent nodes', () => {
      const graph = new Map<string, string[]>([
        ['A', []],
        ['B', []],
        ['C', []]
      ])

      const cycles = detectCircular(graph)

      expect(cycles).toEqual([])
    })

    it('should return empty array for empty graph', () => {
      const graph = new Map<string, string[]>()

      const cycles = detectCircular(graph)

      expect(cycles).toEqual([])
    })
  })

  describe('Handle multiple cycles', () => {
    it('should detect all cycles in complex graph', () => {
      const graph = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A']],
        ['C', ['D', 'E']],
        ['D', ['C']],
        ['E', ['F']],
        ['F', ['E']]
      ])

      const cycles = detectCircular(graph)

      expect(cycles.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Handle partial cycles', () => {
    it('should detect cycle even when some nodes have no dependencies', () => {
      const graph = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A']],
        ['C', []]
      ])

      const cycles = detectCircular(graph)

      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles.some(cycle => cycle.includes('A') && cycle.includes('B'))).toBe(true)
    })
  })
})

