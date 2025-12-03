import { extractPartials } from '../partials/extractPartials'
import { resolvePartialPath } from '../partials/resolvePartialPath'
import { buildPartialGraph } from '../partials/buildPartialGraph'
import { detectCircular } from '../partials/detectCircular'

type PartialError = 
  | { type: 'missing-partial'; partial: string }
  | { type: 'circular-partial'; chain: string[] }

export function validatePartialsUsage(
  template: string,
  partialRoot: string
) {
  const used = extractPartials(template)
  const errors: PartialError[] = []
  const graph = new Map<string, string[]>()

  function buildGraphRecursive(partialName: string) {
    const file = resolvePartialPath(partialRoot, partialName)
    if (!file) {
      return
    }

    if (graph.has(file)) {
      return
    }

    buildPartialGraph(file, graph)

    // Recursively build graph for dependencies
    const deps = graph.get(file) || []
    for (const dep of deps) {
      buildGraphRecursive(dep)
    }
  }

  for (const name of used) {
    const file = resolvePartialPath(partialRoot, name)
    if (!file) {
      errors.push({
        type: 'missing-partial',
        partial: name
      })
      continue
    }

    buildGraphRecursive(name)
  }

  // Convert graph to use file paths consistently for cycle detection
  const fileGraph = new Map<string, string[]>()
  for (const [filePath, depNames] of graph.entries()) {
    const fileDeps = depNames
      .map(name => resolvePartialPath(partialRoot, name))
      .filter((f): f is string => f !== null)
    fileGraph.set(filePath, fileDeps)
  }

  const cycles = detectCircular(fileGraph)
  for (const c of cycles) {
    // Convert file paths back to partial names for error reporting
    const partialNames = c.map(filePath => {
      const name = filePath.replace(partialRoot + '/', '').replace('.hbs', '')
      return name
    })
    errors.push({
      type: 'circular-partial',
      chain: partialNames
    })
  }

  return errors
}
