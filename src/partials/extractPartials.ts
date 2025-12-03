export function extractPartials(template: string): string[] {
    const regex = /{{>\s*([a-zA-Z0-9/_-]+)\s*}}/g
    const results = new Set<string>()
  
    let match: RegExpExecArray | null
    while ((match = regex.exec(template)) !== null) {
      results.add(match[1])
    }
  
    return Array.from(results)
  }
  