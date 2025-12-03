export function detectCircular(
    graph: Map<string, string[]>
  ): string[][] {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const cycles: string[][] = []
  
    function dfs(node: string, path: string[]) {
      if (stack.has(node)) {
        cycles.push([...path, node])
        return
      }
  
      if (visited.has(node)) return
  
      visited.add(node)
      stack.add(node)
  
      const deps = graph.get(node) ?? []
      for (const dep of deps) {
        dfs(dep, [...path, dep])
      }
  
      stack.delete(node)
    }
  
    for (const node of graph.keys()) {
      dfs(node, [node])
    }
  
    return cycles
  }
  