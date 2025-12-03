import fs from 'fs'
import { extractPartials } from './extractPartials'

export function buildPartialGraph(
  partialFile: string,
  graph: Map<string, string[]>
) {
  if (graph.has(partialFile)) return

  const content = fs.readFileSync(partialFile, 'utf8')
  const dependencies = extractPartials(content)

  graph.set(partialFile, dependencies)
}
